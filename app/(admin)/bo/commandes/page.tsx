import { prisma } from "@/lib/prisma"
import { CommandesTable } from "@/components/admin/commandes/commandes-table"
import { CommandesFilters } from "@/components/admin/commandes/commandes-filters"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { CommandeStatut } from "@prisma/client"
import { checkCommandeFeasibility } from "@/lib/business/commandes"

export default async function CommandesPage({
    searchParams,
}: {
    searchParams: Promise<{ statut?: string; dateFrom?: string; dateTo?: string; faisable?: string }>
}) {
    const params = await searchParams
    const statutFilter = params.statut ? (params.statut.split(",") as any[]) : undefined
    const dateFrom = params.dateFrom ? new Date(params.dateFrom) : undefined
    const dateTo = params.dateTo ? new Date(params.dateTo) : undefined

    const where: any = {}
    if (statutFilter && statutFilter.length > 0) {
        where.statut = { in: statutFilter }
    }
    if (dateFrom || dateTo) {
        where.dateCommande = {}
        if (dateFrom) {
            where.dateCommande.gte = dateFrom
        }
        if (dateTo) {
            // Set to end of day
            const endOfDay = new Date(dateTo)
            endOfDay.setHours(23, 59, 59, 999)
            where.dateCommande.lte = endOfDay
        }
    }

    const commandes = await prisma.commande.findMany({
        where,
        include: {
            client: {
                select: {
                    nom: true,
                    prenom: true,
                    raisonSociale: true,
                },
            },
            lignes: {
                include: {
                    bougie: {
                        include: {
                            materials: {
                                include: {
                                    material: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    })

    // Calculate feasibility for each commande
    const commandesWithFeasibility = await Promise.all(
        commandes.map(async (commande) => {
            // Only calculate if commande has lignes
            if (commande.lignes.length === 0) {
                return {
                    ...commande,
                    isFeasible: null, // No lignes = can't determine
                }
            }

            try {
                const feasibility = await checkCommandeFeasibility(commande.id)
                return {
                    ...commande,
                    isFeasible: feasibility.isFeasible,
                }
            } catch (error) {
                console.error(`Error checking feasibility for commande ${commande.id}:`, error)
                return {
                    ...commande,
                    isFeasible: null,
                }
            }
        })
    )

    // Filter by feasibility if requested
    let filteredCommandes = commandesWithFeasibility
    if (params.faisable === "true") {
        filteredCommandes = commandesWithFeasibility.filter((c) => c.isFeasible === true)
    } else if (params.faisable === "false") {
        filteredCommandes = commandesWithFeasibility.filter((c) => c.isFeasible === false)
    }

    // Transform back to the format expected by the table (with lignes.quantite only)
    const commandesForTable = filteredCommandes.map((commande) => ({
        ...commande,
        lignes: commande.lignes.map((ligne) => ({
            quantite: ligne.quantite,
        })),
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
                    <p className="text-muted-foreground mt-1">
                        Gérez vos commandes clients
                    </p>
                </div>
                <Button asChild>
                    <Link href="/bo/commandes/nouveau">
                        <Plus className="mr-2 h-4 w-4" />
                        Créer une commande
                    </Link>
                </Button>
            </div>

            <CommandesFilters />
            <CommandesTable commandes={commandesForTable} feasibilityMap={new Map(filteredCommandes.map(c => [c.id, c.isFeasible]))} />
        </div>
    )
}

