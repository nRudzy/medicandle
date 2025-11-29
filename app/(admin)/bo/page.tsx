import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Flame, TrendingUp, AlertCircle, ShoppingCart, Users, Euro, Clock, CheckCircle2, FileText } from "lucide-react"
import Link from "next/link"
import { CommandeStatut } from "@prisma/client"
import { calculateTotalMaterialCost } from "@/lib/business/materials"
import { calculateProductionCost } from "@/lib/business/production"

export default async function BackOfficePage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // Fetch materials first to filter low stock
    const allMaterials = await prisma.material.findMany({
        where: {
            stockPhysique: { not: null }
        },
        orderBy: { stockPhysique: 'asc' }
    })

    // Filter materials with low stock (below minimum or below 5 if no minimum)
    const lowStockMaterials = allMaterials.filter(m => {
        if (m.stockMinimal !== null) {
            return (m.stockPhysique || 0) <= m.stockMinimal
        }
        return (m.stockPhysique || 0) < 5
    }).slice(0, 5)

    // Fetch comprehensive stats
    const [
        materialsCount,
        candlesCount,
        clientsCount,
        commandesEnCours,
        commandesEnAttenteStock,
        commandesTermineesCeMois,
        commandesDuMois,
        recentCommandes,
        productionSettings,
    ] = await Promise.all([
        prisma.material.count(),
        prisma.candle.count({ where: { active: true } }),
        prisma.client.count(),
        prisma.commande.count({
            where: {
                statut: {
                    in: [CommandeStatut.EN_COURS_COMMANDE, CommandeStatut.EN_COURS_FABRICATION]
                }
            }
        }),
        prisma.commande.count({
            where: {
                statut: CommandeStatut.EN_ATTENTE_STOCK
            }
        }),
        prisma.commande.count({
            where: {
                statut: CommandeStatut.TERMINEE,
                updatedAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        }),
        prisma.commande.findMany({
            where: {
                dateCommande: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            },
            include: {
                lignes: true
            }
        }),
        prisma.commande.findMany({
            where: {
                statut: {
                    in: [CommandeStatut.BROUILLON, CommandeStatut.EN_ATTENTE_STOCK, CommandeStatut.EN_COURS_COMMANDE, CommandeStatut.EN_COURS_FABRICATION]
                }
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                client: {
                    select: {
                        nom: true,
                        prenom: true,
                        raisonSociale: true
                    }
                },
                _count: {
                    select: {
                        lignes: true
                    }
                }
            }
        }),
        prisma.productionSettings.findFirst({
            where: {
                OR: [
                    { validTo: null },
                    { validTo: { gte: new Date() } }
                ]
            },
            orderBy: { validFrom: 'desc' }
        })
    ])

    // Calculate CA du mois en cours
    const caMoisEnCours = commandesDuMois.reduce((total, commande) => {
        return total + (commande.montantTotalEstime || 0)
    }, 0)

    // Calculate dépenses (coût des matières premières en stock)

    const depensesStock = allMaterials.reduce((total, material) => {
        const stockValue = (material.stockPhysique || 0) * material.costPerUnit
        return total + stockValue
    }, 0)

    // Calculate dépenses de production estimées pour les commandes en cours
    const commandesAvecDetails = await prisma.commande.findMany({
        where: {
            statut: {
                in: [CommandeStatut.EN_COURS_COMMANDE, CommandeStatut.EN_COURS_FABRICATION]
            }
        },
        include: {
            lignes: {
                include: {
                    bougie: {
                        include: {
                            materials: {
                                include: {
                                    material: true
                                }
                            },
                            productionParams: true
                        }
                    }
                }
            }
        }
    })

    let depensesProductionEstimees = 0
    for (const commande of commandesAvecDetails) {
        for (const ligne of commande.lignes) {
            // Material costs
            const materialCost = calculateTotalMaterialCost(
                ligne.bougie.materials.map((cm) => ({
                    material: {
                        id: cm.material.id,
                        costPerUnit: cm.material.costPerUnit,
                        unit: cm.material.unit,
                    },
                    quantity: cm.quantity,
                    unit: cm.unit || cm.material.unit,
                }))
            ) * ligne.quantite

            // Production costs
            let productionCost = 0
            if (ligne.bougie.productionParams && productionSettings) {
                productionCost = calculateProductionCost(
                    {
                        prepTimeMinutes: ligne.bougie.productionParams.prepTimeMinutes,
                        heatingTimeMinutes: ligne.bougie.productionParams.heatingTimeMinutes || undefined,
                    },
                    {
                        laborRate: productionSettings.laborRate,
                        electricityCost: productionSettings.electricityCost,
                        amortizationCost: productionSettings.amortizationCost,
                    }
                ) * ligne.quantite
            }

            depensesProductionEstimees += materialCost + productionCost
        }
    }

    const formatEuro = (amount: number) => `${amount.toFixed(2)} €`

    const getClientName = (commande: typeof recentCommandes[0]) => {
        if (!commande.client) return "Sans client"
        if (commande.client.prenom) {
            return `${commande.client.prenom} ${commande.client.nom}`
        }
        return commande.client.raisonSociale || commande.client.nom
    }

    const statutLabels: Record<CommandeStatut, string> = {
        BROUILLON: "Brouillon",
        EN_ATTENTE_STOCK: "En attente",
        EN_COURS_COMMANDE: "En commande",
        EN_COURS_FABRICATION: "En fabrication",
        TERMINEE: "Terminée",
        LIVREE: "Livrée",
        ANNULEE: "Annulée",
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                <p className="text-muted-foreground mt-1">
                    Bienvenue, {session.user?.name || session.user?.email}
                </p>
            </div>

            {/* KPI Cards - Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Matières premières
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{materialsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Matières en inventaire
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Bougies actives
                        </CardTitle>
                        <Flame className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{candlesCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Produits disponibles
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Clients
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clientsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Clients enregistrés
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Commandes terminées
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{commandesTermineesCeMois}</div>
                        <p className="text-xs text-muted-foreground">
                            Ce mois
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Commandes & CA */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-[var(--medicandle-sage)]/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Commandes en cours
                        </CardTitle>
                        <Clock className="h-4 w-4 text-[var(--medicandle-sage)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[var(--medicandle-dark-brown)]">
                            {commandesEnCours}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            En cours de commande ou fabrication
                        </p>
                        <Link
                            href="/bo/commandes?statut=EN_COURS_COMMANDE,EN_COURS_FABRICATION"
                            className="text-xs text-[var(--medicandle-sage)] hover:underline mt-2 inline-block"
                        >
                            Voir les commandes →
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-[var(--medicandle-sage)]/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            En attente de stock
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[var(--medicandle-dark-brown)]">
                            {commandesEnAttenteStock}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Commandes en attente
                        </p>
                        <Link
                            href="/bo/bons-de-commande"
                            className="text-xs text-[var(--medicandle-sage)] hover:underline mt-2 inline-block"
                        >
                            Voir les commandes →
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-[var(--medicandle-sage)]/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            CA du mois
                        </CardTitle>
                        <Euro className="h-4 w-4 text-[var(--medicandle-sage)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[var(--medicandle-dark-brown)]">
                            {formatEuro(caMoisEnCours)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Chiffre d'affaires estimé
                        </p>
                        <Link
                            href="/bo/commandes"
                            className="text-xs text-[var(--medicandle-sage)] hover:underline mt-2 inline-block"
                        >
                            Voir toutes les commandes →
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Dépenses */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-[var(--medicandle-brown)]/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Valeur du stock
                        </CardTitle>
                        <Package className="h-4 w-4 text-[var(--medicandle-brown)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[var(--medicandle-dark-brown)]">
                            {formatEuro(depensesStock)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Valeur des matières premières en stock
                        </p>
                        <Link
                            href="/bo/matieres"
                            className="text-xs text-[var(--medicandle-brown)] hover:underline mt-2 inline-block"
                        >
                            Gérer le stock →
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-[var(--medicandle-brown)]/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Coûts production estimés
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-[var(--medicandle-brown)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[var(--medicandle-dark-brown)]">
                            {formatEuro(depensesProductionEstimees)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Pour les commandes en cours
                        </p>
                        <Link
                            href="/bo/commandes?statut=EN_COURS_COMMANDE,EN_COURS_FABRICATION"
                            className="text-xs text-[var(--medicandle-brown)] hover:underline mt-2 inline-block"
                        >
                            Voir les commandes →
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts */}
            {lowStockMaterials.length > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-900">
                            <AlertCircle className="h-5 w-5" />
                            Alertes stock
                        </CardTitle>
                        <CardDescription className="text-amber-700">
                            Matières premières avec stock faible
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {lowStockMaterials.map((material) => (
                                <li key={material.id} className="text-sm text-amber-900">
                                    <span className="font-medium">{material.name}</span>
                                    {" — "}
                                    <span className="text-amber-700">
                                        Stock: {material.stockPhysique || 0} {material.unit.toLowerCase()}
                                        {material.stockMinimal && ` (min: ${material.stockMinimal})`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/bo/matieres"
                            className="text-xs text-amber-700 hover:underline mt-3 inline-block"
                        >
                            Gérer les matières premières →
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Recent Commandes */}
            {recentCommandes.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Commandes récentes</CardTitle>
                                <CardDescription>
                                    Dernières commandes en cours
                                </CardDescription>
                            </div>
                            <Link
                                href="/bo/commandes"
                                className="text-sm text-[var(--medicandle-sage)] hover:underline"
                            >
                                Voir tout →
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentCommandes.map((commande) => (
                                <Link
                                    key={commande.id}
                                    href={`/bo/commandes/${commande.id}`}
                                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--medicandle-beige)] hover:bg-[var(--medicandle-beige)]/30 transition"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-[var(--medicandle-dark-brown)]">
                                                {commande.reference}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded bg-[var(--medicandle-beige)] text-[var(--medicandle-brown)]">
                                                {statutLabels[commande.statut]}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {getClientName(commande)} • {commande._count.lignes} bougie(s)
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {commande.montantTotalEstime && (
                                            <div className="font-medium text-[var(--medicandle-dark-brown)]">
                                                {formatEuro(commande.montantTotalEstime)}
                                            </div>
                                        )}
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(commande.createdAt).toLocaleDateString("fr-FR")}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Démarrage rapide</CardTitle>
                    <CardDescription>
                        Commencez par ces actions courantes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <a
                            href="/bo/matieres/nouveau"
                            className="flex items-center gap-3 rounded-lg border p-4 hover:bg-medicandle-beige transition"
                        >
                            <Package className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <div className="font-medium">Ajouter une matière</div>
                                <div className="text-sm text-muted-foreground">
                                    Nouvelle matière première
                                </div>
                            </div>
                        </a>
                        <a
                            href="/bo/bougies/nouveau"
                            className="flex items-center gap-3 rounded-lg border p-4 hover:bg-medicandle-beige transition"
                        >
                            <Flame className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <div className="font-medium">Créer une bougie</div>
                                <div className="text-sm text-muted-foreground">
                                    Nouveau produit
                                </div>
                            </div>
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
