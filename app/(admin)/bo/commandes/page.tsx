import { prisma } from "@/lib/prisma"
import { CommandesTable } from "@/components/admin/commandes/commandes-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function CommandesPage() {
    const commandes = await prisma.commande.findMany({
        include: {
            client: {
                select: {
                    nom: true,
                    prenom: true,
                    raisonSociale: true,
                },
            },
            _count: {
                select: {
                    lignes: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    })

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

            <CommandesTable commandes={commandes} />
        </div>
    )
}

