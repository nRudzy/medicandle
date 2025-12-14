import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { BonDeCommandeManualForm } from "@/components/admin/bons-de-commande/bon-de-commande-manual-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function NouveauBonDeCommandePage() {
    const materials = await prisma.material.findMany({
        orderBy: { name: "asc" },
    })

    return (
        <div className="max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Nouveau bon de commande</h1>
                    <p className="text-muted-foreground mt-1">
                        Sélectionnez manuellement les matières premières à approvisionner.
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/bo/bons-de-commande">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                    </Link>
                </Button>
            </div>

            <BonDeCommandeManualForm materials={materials} />
        </div>
    )
}
