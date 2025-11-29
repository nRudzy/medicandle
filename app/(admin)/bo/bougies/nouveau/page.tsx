import { CandleForm } from "@/components/admin/candles/candle-form"
import { prisma } from "@/lib/prisma"

export default async function NewCandlePage() {
    const materials = await prisma.material.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nouvelle bougie</h1>
                <p className="text-muted-foreground mt-1">
                    Créez un nouveau produit avec sa recette et ses paramètres
                </p>
            </div>

            <CandleForm materials={materials} />
        </div>
    )
}
