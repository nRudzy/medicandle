import { prisma } from "@/lib/prisma"
import { BonsDeCommandeTable } from "@/components/admin/bons-de-commande/bons-de-commande-table"

export default async function BonsDeCommandePage() {
    const bons = await prisma.bonDeCommandeMatieres.findMany({
        orderBy: { createdAt: "desc" },
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bons de commande matières premières</h1>
                <p className="text-muted-foreground mt-1">
                    Gérez vos bons de commande pour l'approvisionnement
                </p>
            </div>

            <BonsDeCommandeTable bons={bons} />
        </div>
    )
}

