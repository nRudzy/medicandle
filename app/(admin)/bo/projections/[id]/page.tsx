import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { RevenueChart } from "@/components/admin/projections/revenue-chart"

export default async function ScenarioDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const scenario = await prisma.projectionScenario.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    candle: true,
                },
            },
        },
    })

    if (!scenario) {
        notFound()
    }

    const totalRevenue = scenario.items.reduce(
        (sum, item) => sum + (item.usedPrice || item.candle.currentPrice || 0) * item.estimatedQty,
        0
    )

    const totalQuantity = scenario.items.reduce((sum, item) => sum + item.estimatedQty, 0)

    const formatEuro = (amount: number) => `${amount.toFixed(2)} €`

    return (
        <div className="max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{scenario.name}</h1>
                    {scenario.description && (
                        <p className="text-muted-foreground mt-1">{scenario.description}</p>
                    )}
                    {scenario.startDate && scenario.endDate && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {new Date(scenario.startDate).toLocaleDateString()} -{" "}
                            {new Date(scenario.endDate).toLocaleDateString()}
                        </p>
                    )}
                </div>
                <Button variant="outline" asChild>
                    <Link href="/bo/projections">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                    </Link>
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Produits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{scenario.items.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Volume total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalQuantity} unités</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">CA projeté</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{formatEuro(totalRevenue)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Chart */}
            <RevenueChart items={scenario.items} />

            {/* Items Detail */}
            <Card>
                <CardHeader>
                    <CardTitle>Détail par produit</CardTitle>
                    <CardDescription>
                        Répartition des volumes et revenus
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {scenario.items.map((item) => {
                            const price = item.usedPrice || item.candle.currentPrice || 0
                            const revenue = price * item.estimatedQty

                            return (
                                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <div className="font-medium">{item.candle.name}</div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {item.estimatedQty} unités × {formatEuro(price)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold">{formatEuro(revenue)}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {((revenue / totalRevenue) * 100).toFixed(1)}% du total
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
