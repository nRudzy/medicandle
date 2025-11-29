import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CandleFormStepper } from "@/components/admin/candles/candle-form-stepper"

export default async function EditCandlePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const candle = await prisma.candle.findUnique({
        where: { id },
        include: {
            materials: {
                include: {
                    material: true,
                },
            },
            productionParams: true,
        },
    })

    if (!candle) {
        notFound()
    }

    const materials = await prisma.material.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Modifier la bougie</h1>
                <p className="text-muted-foreground mt-1">
                    Modifiez les informations de {candle.name}
                </p>
            </div>

            <CandleFormStepper materials={materials} candle={candle} />
        </div>
    )
}

