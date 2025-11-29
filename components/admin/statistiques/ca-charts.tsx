"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ComposedChart,
} from "recharts"
import { CAByTime, CAPrevisionnel } from "@/lib/business/statistiques"

interface CAChartsProps {
    caByTimeRealise: CAByTime[]
    caByTimePipeline: CAByTime[]
    caPrevisionnel: CAPrevisionnel
    timeUnit: string
}

export function CACharts({
    caByTimeRealise,
    caByTimePipeline,
    caPrevisionnel,
    timeUnit,
}: CAChartsProps) {
    const formatEuro = (value: number) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    const formatDate = (dateStr: string, unit: string) => {
        if (unit === "mois") {
            const [year, month] = dateStr.split("-")
            const monthNames = [
                "Jan",
                "Fév",
                "Mar",
                "Avr",
                "Mai",
                "Jun",
                "Jul",
                "Aoû",
                "Sep",
                "Oct",
                "Nov",
                "Déc",
            ]
            return `${monthNames[parseInt(month) - 1]} ${year}`
        }
        if (unit === "semaine") {
            const date = new Date(dateStr)
            return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
        }
        // jour
        const date = new Date(dateStr)
        return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
    }

    // Combine réalisé and pipeline data
    const combinedData = caByTimeRealise.map((item) => {
        const pipelineItem = caByTimePipeline.find((p) => p.date === item.date)
        return {
            date: formatDate(item.date, timeUnit),
            realise: item.ca,
            pipeline: pipelineItem?.ca || 0,
        }
    })

    // Prévisionnel chart data
    const previsionnelData = [
        {
            name: "Réalisé",
            value: caPrevisionnel.caRealiseAnnee,
        },
        {
            name: "Attendu",
            value: caPrevisionnel.caAttendu,
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>CA Réalisé</CardTitle>
                    <CardDescription>Chiffre d'affaires réalisé dans le temps</CardDescription>
                </CardHeader>
                <CardContent>
                    {caByTimeRealise.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={caByTimeRealise.map((item) => ({
                                date: formatDate(item.date, timeUnit),
                                ca: item.ca,
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--medicandle-beige)" />
                                <XAxis
                                    dataKey="date"
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                    fontSize={12}
                                    stroke="var(--medicandle-dark-brown)"
                                />
                                <YAxis
                                    tickFormatter={formatEuro}
                                    stroke="var(--medicandle-dark-brown)"
                                />
                                <Tooltip
                                    formatter={(value: number) => formatEuro(value)}
                                    labelStyle={{ color: "var(--medicandle-dark-brown)" }}
                                    contentStyle={{
                                        backgroundColor: "var(--medicandle-ivory)",
                                        border: "1px solid var(--medicandle-beige)",
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="ca"
                                    stroke="var(--medicandle-sage)"
                                    strokeWidth={2}
                                    name="CA"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                            Aucune donnée disponible
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>CA Pipeline</CardTitle>
                    <CardDescription>Chiffre d'affaires en cours (non réalisé)</CardDescription>
                </CardHeader>
                <CardContent>
                    {caByTimePipeline.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={caByTimePipeline.map((item) => ({
                                date: formatDate(item.date, timeUnit),
                                ca: item.ca,
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--medicandle-beige)" />
                                <XAxis
                                    dataKey="date"
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                    fontSize={12}
                                    stroke="var(--medicandle-dark-brown)"
                                />
                                <YAxis
                                    tickFormatter={formatEuro}
                                    stroke="var(--medicandle-dark-brown)"
                                />
                                <Tooltip
                                    formatter={(value: number) => formatEuro(value)}
                                    labelStyle={{ color: "var(--medicandle-dark-brown)" }}
                                    contentStyle={{
                                        backgroundColor: "var(--medicandle-ivory)",
                                        border: "1px solid var(--medicandle-beige)",
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="ca"
                                    stroke="var(--medicandle-rose)"
                                    strokeWidth={2}
                                    name="CA Pipeline"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                            Aucune donnée disponible
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>CA Prévisionnel fin d'année</CardTitle>
                    <CardDescription>
                        Projection basée sur l'historique des {Math.ceil(
                            (new Date().getTime() - new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1).getTime()) /
                                (1000 * 60 * 60 * 24 * 30)
                        )} derniers mois
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={previsionnelData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--medicandle-beige)" />
                                <XAxis
                                    dataKey="name"
                                    stroke="var(--medicandle-dark-brown)"
                                />
                                <YAxis
                                    tickFormatter={formatEuro}
                                    stroke="var(--medicandle-dark-brown)"
                                />
                                <Tooltip
                                    formatter={(value: number) => formatEuro(value)}
                                    labelStyle={{ color: "var(--medicandle-dark-brown)" }}
                                    contentStyle={{
                                        backgroundColor: "var(--medicandle-ivory)",
                                        border: "1px solid var(--medicandle-beige)",
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    name="CA"
                                    fill="var(--medicandle-honey)"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="grid gap-4 md:grid-cols-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">CA déjà réalisé</p>
                                <p className="text-lg font-semibold text-[var(--medicandle-dark-brown)]">
                                    {formatEuro(caPrevisionnel.caRealiseAnnee)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">CA moyen mensuel</p>
                                <p className="text-lg font-semibold text-[var(--medicandle-dark-brown)]">
                                    {formatEuro(caPrevisionnel.caMoyenMensuel)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Mois restants</p>
                                <p className="text-lg font-semibold text-[var(--medicandle-dark-brown)]">
                                    {caPrevisionnel.moisRestants}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Total prévisionnel</p>
                                <p className="text-lg font-semibold text-[var(--medicandle-dark-brown)]">
                                    {formatEuro(caPrevisionnel.totalPrevisionnel)}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

