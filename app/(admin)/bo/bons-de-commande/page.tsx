import { prisma } from "@/lib/prisma"
import { BonsDeCommandeTable } from "@/components/admin/bons-de-commande/bons-de-commande-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function BonsDeCommandePage() {
    const bons = await prisma.bonDeCommandeMatieres.findMany({
        orderBy: { createdAt: "desc" },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bons de commande matières premières</h1>
                    <p className="text-muted-foreground mt-1">
                        Gérez vos bons de commande pour l'approvisionnement
                    </p>
                </div>
                <Button asChild>
                    <Link href="/bo/bons-de-commande/nouveau">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau
                    </Link>
                </Button>
            </div>

            <BonsDeCommandeTable bons={bons} />
        </div>
    )
}
