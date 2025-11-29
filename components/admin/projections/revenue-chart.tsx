"use client"

import { ScenarioItem, Candle } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

type ItemWithCandle = ScenarioItem & {
    candle: Candle
}

const COLORS = ["#78716c", "#a8a29e", "#d6d3d1", "#e7e5e4", "#f5f5f4"]

export function RevenueChart({ items }: { items: ItemWithCandle[] }) {
    const chartData = items.map((item, index) => {
        const price = item.usedPrice || item.candle.currentPrice || 0
        const revenue = price * item.estimatedQty

        return {
            name: item.candle.name,
            revenue: revenue,
            quantity: item.estimatedQty,
            fill: COLORS[index % COLORS.length],
        }
    })

    const formatEuro = (value: number) => `${value.toFixed(0)} €`

    return (
        <Card>
            <CardHeader>
                <CardTitle>Répartition du CA</CardTitle>
                <CardDescription>Chiffre d'affaires par produit</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            fontSize={12}
                        />
                        <YAxis tickFormatter={formatEuro} />
                        <Tooltip
                            formatter={(value: number) => formatEuro(value)}
                            labelStyle={{ color: '#000' }}
                        />
                        <Bar dataKey="revenue" name="CA">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
