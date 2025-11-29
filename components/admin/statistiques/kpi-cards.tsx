"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Euro, TrendingUp, Package, ShoppingCart, BarChart3 } from "lucide-react"
import { StatistiquesFilters, CAPrevisionnel, StatsCounts } from "@/lib/business/statistiques"

interface KPICardsProps {
    caRealise: number
    caPipeline: number
    caPrevisionnel: CAPrevisionnel
    margeRealisee: number
    counts: StatsCounts
    filters: StatistiquesFilters
}

export function KPICards({
    caRealise,
    caPipeline,
    caPrevisionnel,
    margeRealisee,
    counts,
    filters,
}: KPICardsProps) {
    const formatEuro = (amount: number) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
        }).format(amount)
    }

    // Calculate evolution vs previous period (simplified - would need previous period data)
    const calculateEvolution = (current: number, previous: number) => {
        if (previous === 0) return null
        const evolution = ((current - previous) / previous) * 100
        return evolution
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-[var(--medicandle-sage)]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">CA Réalisé</CardTitle>
                    <Euro className="h-4 w-4 text-[var(--medicandle-sage)]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--medicandle-dark-brown)]">
                        {formatEuro(caRealise)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Commandes terminées ou livrées
                    </p>
                </CardContent>
            </Card>

            <Card className="border-[var(--medicandle-rose)]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">CA Pipeline</CardTitle>
                    <TrendingUp className="h-4 w-4 text-[var(--medicandle-rose)]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--medicandle-dark-brown)]">
                        {formatEuro(caPipeline)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Commandes en cours
                    </p>
                </CardContent>
            </Card>

            <Card className="border-[var(--medicandle-honey)]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">CA Prévisionnel</CardTitle>
                    <BarChart3 className="h-4 w-4 text-[var(--medicandle-honey)]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--medicandle-dark-brown)]">
                        {formatEuro(caPrevisionnel.totalPrevisionnel)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Fin d'année estimé
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Moyenne mensuelle: {formatEuro(caPrevisionnel.caMoyenMensuel)}
                    </p>
                </CardContent>
            </Card>

            <Card className="border-[var(--medicandle-brown)]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Marge Réalisée</CardTitle>
                    <TrendingUp className="h-4 w-4 text-[var(--medicandle-brown)]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--medicandle-dark-brown)]">
                        {formatEuro(margeRealisee)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        CA - Coût de revient
                    </p>
                    {caRealise > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Marge: {((margeRealisee / caRealise) * 100).toFixed(1)}%
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nombre de commandes</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{counts.nbCommandes}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Sur la période sélectionnée
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bougies vendues</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{counts.nbBougies}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Quantité totale vendue
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

