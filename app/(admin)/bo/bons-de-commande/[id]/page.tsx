import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BonDeCommandeDetail } from "@/components/admin/bons-de-commande/bon-de-commande-detail"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function BonDeCommandeDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const bon = await prisma.bonDeCommandeMatieres.findUnique({
        where: { id },
        include: {
            lignes: {
                include: {
                    matierePremiere: true,
                },
            },
            commandes: {
                include: {
                    commande: {
                        select: {
                            id: true,
                            reference: true,
                        },
                    },
                },
            },
        },
    })

    if (!bon) {
        notFound()
    }

    return (
        <div className="max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bon de commande matières premières</h1>
                    <p className="text-muted-foreground mt-1">
                        Référence: {bon.reference}
                    </p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/bo/bons-de-commande">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                    </Link>
                </Button>
            </div>

            <BonDeCommandeDetail bon={bon} />
        </div>
    )
}

