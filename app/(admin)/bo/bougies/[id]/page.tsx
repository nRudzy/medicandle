import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"
import { calculateTotalMaterialCost } from "@/lib/business/materials"
import { calculateProductionCost } from "@/lib/business/production"
import { calculatePricingSuggestions, calculateMargin, calculateMarginPercentage } from "@/lib/business/pricing"
import { ExportPDFButton } from "@/components/admin/candles/export-pdf-button"

const positioningLabels = {
    ENTRY: "Entrée de gamme",
    PREMIUM: "Premium",
    LUXURY: "Luxe",
}

const unitLabels = {
    G: "g",
    KG: "kg",
    ML: "ml",
    L: "L",
    PIECE: "pièce",
}

export default async function CandleDetailPage({
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

    // Get settings
    const [productionSettings, pricingSettings] = await Promise.all([
        prisma.productionSettings.findFirst({
            where: {
                OR: [{ validTo: null }, { validTo: { gte: new Date() } }]
            },
            orderBy: { validFrom: 'desc' }
        }),
        prisma.pricingSettings.findFirst({
            where: {
                OR: [{ validTo: null }, { validTo: { gte: new Date() } }]
            },
            orderBy: { validFrom: 'desc' }
        }),
    ])

    // Calculate costs
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

    // Calculate pricing suggestions
    const suggestions = pricingSettings
        ? calculatePricingSuggestions(totalCost, {
            multiplierEntry: pricingSettings.multiplierEntry,
            multiplierPremium: pricingSettings.multiplierPremium,
            multiplierLuxury: pricingSettings.multiplierLuxury,
            targetMargin: pricingSettings.targetMargin || undefined,
        })
        : null

    const currentMargin = candle.currentPrice ? calculateMargin(candle.currentPrice, totalCost) : null
    const currentMarginPercent = candle.currentPrice ? calculateMarginPercentage(candle.currentPrice, totalCost) : null

    const formatEuro = (amount: number) => `${amount.toFixed(2)} €`

    return (
        <div className="max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{candle.name}</h1>
                    <p className="text-muted-foreground mt-1">
                        {candle.category && `${candle.category} • `}
                        {candle.format || "Format non spécifié"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <ExportPDFButton
                        candle={{
                            name: candle.name,
                            format: candle.format,
                            category: candle.category,
                            shortDesc: candle.shortDesc,
                            longDesc: candle.longDesc,
                            materials: candle.materials.map((cm) => ({
                                material: { name: cm.material.name },
                                quantity: cm.quantity,
                                unit: cm.unit || cm.material.unit,
                            })),
                            materialCost,
                            productionCost,
                            totalCost,
                            currentPrice: candle.currentPrice,
                            prepTimeMinutes: candle.productionParams?.prepTimeMinutes,
                        }}
                    />
                    <Button variant="outline" asChild>
                        <Link href={`/bo/bougies/${candle.id}/modifier`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/bo/bougies">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Cost Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Coût matières</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatEuro(materialCost)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Coût production</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatEuro(productionCost)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Coût total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{formatEuro(totalCost)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Description */}
            {(candle.shortDesc || candle.longDesc) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {candle.shortDesc && <p className="font-medium">{candle.shortDesc}</p>}
                        {candle.longDesc && <p className="text-muted-foreground">{candle.longDesc}</p>}
                        {candle.positioning && (
                            <div>
                                <Badge variant="outline">
                                    {positioningLabels[candle.positioning as keyof typeof positioningLabels]}
                                </Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Recipe */}
            <Card>
                <CardHeader>
                    <CardTitle>Recette</CardTitle>
                    <CardDescription>Matières premières utilisées</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {candle.materials.map((cm) => (
                            <div key={cm.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div>
                                    <div className="font-medium">{cm.material.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {cm.quantity} {unitLabels[cm.unit || cm.material.unit as keyof typeof unitLabels]}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">
                                        {formatEuro(
                                            (cm.quantity /
                                                (cm.material.unit === 'KG' ? 1000 : cm.material.unit === 'L' ? 1000 : 1)) *
                                            cm.material.costPerUnit
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {formatEuro(cm.material.costPerUnit)} / {unitLabels[cm.material.unit as keyof typeof unitLabels]}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center justify-between pt-3 font-bold border-t">
                            <div>Total matières</div>
                            <div>{formatEuro(materialCost)}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Production */}
            {candle.productionParams && (
                <Card>
                    <CardHeader>
                        <CardTitle>Production</CardTitle>
                        <CardDescription>Paramètres de fabrication</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <div className="text-sm text-muted-foreground">Temps de préparation</div>
                                <div className="text-lg font-medium">{candle.productionParams.prepTimeMinutes} min</div>
                            </div>
                            {candle.productionParams.heatingTimeMinutes && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Temps de chauffe</div>
                                    <div className="text-lg font-medium">{candle.productionParams.heatingTimeMinutes} min</div>
                                </div>
                            )}
                            <div>
                                <div className="text-sm text-muted-foreground">Coût production</div>
                                <div className="text-lg font-medium">{formatEuro(productionCost)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Pricing */}
            <Card>
                <CardHeader>
                    <CardTitle>Prix & Marges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {candle.currentPrice && (
                        <div className="pb-4 border-b">
                            <div className="text-sm text-muted-foreground mb-2">Prix de vente actuel</div>
                            <div className="flex items-baseline gap-4">
                                <div className="text-3xl font-bold">{formatEuro(candle.currentPrice)}</div>
                                {currentMargin !== null && currentMarginPercent !== null && (
                                    <div>
                                        <span className="text-lg font-semibold text-green-600">
                                            +{formatEuro(currentMargin)}
                                        </span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            ({currentMarginPercent.toFixed(1)}%)
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {suggestions && (
                        <div>
                            <div className="text-sm font-medium mb-3">Prix suggérés</div>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="p-3 rounded-lg border">
                                    <div className="text-xs text-muted-foreground mb-1">Entrée de gamme</div>
                                    <div className="text-lg font-bold">{formatEuro(suggestions.entry.price)}</div>
                                    <div className="text-xs text-green-600">
                                        +{formatEuro(suggestions.entry.margin)} ({suggestions.entry.marginPercent.toFixed(1)}%)
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg border bg-primary/5">
                                    <div className="text-xs text-muted-foreground mb-1">Premium</div>
                                    <div className="text-lg font-bold">{formatEuro(suggestions.premium.price)}</div>
                                    <div className="text-xs text-green-600">
                                        +{formatEuro(suggestions.premium.margin)} ({suggestions.premium.marginPercent.toFixed(1)}%)
                                    </div>
                                </div>
                                <div className="p-3 rounded-lg border">
                                    <div className="text-xs text-muted-foreground mb-1">Luxe</div>
                                    <div className="text-lg font-bold">{formatEuro(suggestions.luxury.price)}</div>
                                    <div className="text-xs text-green-600">
                                        +{formatEuro(suggestions.luxury.margin)} ({suggestions.luxury.marginPercent.toFixed(1)}%)
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
