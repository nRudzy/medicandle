"use client"

import { ProjectionScenario, ScenarioItem, Candle } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Eye, BarChart3 } from "lucide-react"

type ScenarioWithItems = ProjectionScenario & {
    items: (ScenarioItem & {
        candle: Candle
    })[]
}

export function ProjectionScenarioList({
    scenarios,
}: {
    scenarios: ScenarioWithItems[]
}) {
    const formatEuro = (amount: number) => `${amount.toFixed(2)} €`

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Scénarios enregistrés</h2>

            {scenarios.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-8 text-muted-foreground">
                        Aucun scénario enregistré. Créez-en un pour projeter vos revenus.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {scenarios.map((scenario) => {
                        const totalRevenue = scenario.items.reduce(
                            (sum, item) => sum + (item.usedPrice || item.candle.currentPrice || 0) * item.estimatedQty,
                            0
                        )
                        const candleCount = scenario.items.length

                        return (
                            <Card key={scenario.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{scenario.name}</CardTitle>
                                            {scenario.description && (
                                                <CardDescription className="mt-1">
                                                    {scenario.description}
                                                </CardDescription>
                                            )}
                                        </div>
                                        <Badge variant="outline">
                                            <BarChart3 className="h-3 w-3 mr-1" />
                                            {candleCount} {candleCount > 1 ? "produits" : "produit"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {scenario.startDate && scenario.endDate && (
                                            <div className="text-sm text-muted-foreground">
                                                Période: {new Date(scenario.startDate).toLocaleDateString()} -{" "}
                                                {new Date(scenario.endDate).toLocaleDateString()}
                                            </div>
                                        )}

                                        <div className="p-3 bg-primary/5 rounded-lg">
                                            <div className="text-sm text-muted-foreground">CA projeté</div>
                                            <div className="text-2xl font-bold text-primary">
                                                {formatEuro(totalRevenue)}
                                            </div>
                                        </div>

                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={`/bo/projections/${scenario.id}`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Voir les détails
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
