import { prisma } from "@/lib/prisma"
import { CandlesTable } from "@/components/admin/candles/candles-table"
import { CandlesFilters } from "@/components/admin/candles/candles-filters"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { calculateTotalMaterialCost } from "@/lib/business/materials"
import { calculateProductionCost } from "@/lib/business/production"
import { Positioning } from "@prisma/client"

export default async function CandlesPage({
    searchParams,
}: {
    searchParams: Promise<{ nom?: string; category?: string; positioning?: string }>
}) {
    const params = await searchParams
    const where: any = { active: true }
    
    if (params.nom) {
        where.name = { contains: params.nom, mode: "insensitive" }
    }
    if (params.category) {
        where.category = { contains: params.category, mode: "insensitive" }
    }
    if (params.positioning) {
        where.positioning = params.positioning as Positioning
    }

    const candles = await prisma.candle.findMany({
        where,
        include: {
            materials: {
                include: {
                    material: true,
                },
            },
            productionParams: true,
        },
        orderBy: { createdAt: "desc" },
    })

    // Get active production settings
    const productionSettings = await prisma.productionSettings.findFirst({
        where: {
            OR: [
                { validTo: null },
                { validTo: { gte: new Date() } }
            ]
        },
        orderBy: { validFrom: 'desc' }
    })

    // Calculate costs for each candle
    const candlesWithCosts = candles.map((candle) => {
        const materialCost = calculateTotalMaterialCost(
            candle.materials.map((cm) => ({
                material: {
                    id: cm.material.id,
                    costPerUnit: cm.material.costPerUnit,
                    unit: cm.material.unit,
                },
                quantity: cm.quantity,
                unit: cm.unit || cm.material.unit,
            }))
        )

        const productionCost = candle.productionParams && productionSettings
            ? calculateProductionCost(
                {
                    prepTimeMinutes: candle.productionParams.prepTimeMinutes,
                    heatingTimeMinutes: candle.productionParams.heatingTimeMinutes || undefined,
                },
                {
                    laborRate: productionSettings.laborRate,
                    electricityCost: productionSettings.electricityCost,
                    amortizationCost: productionSettings.amortizationCost,
                }
            )
            : 0

        const totalCost = materialCost + productionCost

        return {
            ...candle,
            materialCost,
            productionCost,
            totalCost,
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bougies</h1>
                    <p className="text-muted-foreground mt-1">
                        Gérez vos produits et leurs coûts
                    </p>
                </div>
                <Button asChild>
                    <Link href="/bo/bougies/nouveau">
                        <Plus className="mr-2 h-4 w-4" />
                        Créer une bougie
                    </Link>
                </Button>
            </div>

            <CandlesFilters />
            <CandlesTable candles={candlesWithCosts} />
        </div>
    )
}
