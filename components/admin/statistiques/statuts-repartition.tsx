"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { StatutRepartition, CommandeStatut } from "@/lib/business/statistiques"

interface StatutsRepartitionProps {
    repartition: StatutRepartition[]
}

const statutLabels: Record<CommandeStatut, string> = {
    BROUILLON: "Brouillon",
    EN_ATTENTE_STOCK: "En attente de stock",
    EN_COURS_COMMANDE: "En cours de commande",
    EN_COURS_FABRICATION: "En cours de fabrication",
    TERMINEE: "Terminée",
    LIVREE: "Livrée",
    ANNULEE: "Annulée",
}

const COLORS = [
    "var(--medicandle-beige)",
    "var(--medicandle-rose)",
    "var(--medicandle-sage)",
    "var(--medicandle-honey)",
    "var(--medicandle-brown)",
    "#C7DCC5",
    "#E8C896",
]

export function StatutsRepartition({ repartition }: StatutsRepartitionProps) {
    const formatEuro = (amount: number) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)
    }

    const chartData = repartition.map((item, index) => ({
        name: statutLabels[item.statut],
        value: item.nombre,
        ca: item.ca || 0,
        fill: COLORS[index % COLORS.length],
    }))

    const totalCommandes = repartition.reduce((sum, item) => sum + item.nombre, 0)
    const totalCA = repartition.reduce((sum, item) => sum + (item.ca || 0), 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Répartition des statuts</CardTitle>
                <CardDescription>Distribution des commandes par statut</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name}: ${(percent * 100).toFixed(0)}%`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => `${value} commandes`}
                                        contentStyle={{
                                            backgroundColor: "var(--medicandle-ivory)",
                                            border: "1px solid var(--medicandle-beige)",
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                Aucune donnée disponible
                            </div>
                        )}
                    </div>

                    <div className="rounded-md border border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)]">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[var(--medicandle-beige)]/50">
                                    <TableHead className="text-[var(--medicandle-dark-brown)]">Statut</TableHead>
                                    <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Nombre</TableHead>
                                    <TableHead className="text-right text-[var(--medicandle-dark-brown)]">CA</TableHead>
                                    <TableHead className="text-right text-[var(--medicandle-dark-brown)]">%</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {repartition.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center text-muted-foreground py-8"
                                        >
                                            Aucune donnée disponible
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    repartition
                                        .sort((a, b) => b.nombre - a.nombre)
                                        .map((item) => {
                                            const percentage =
                                                totalCommandes > 0
                                                    ? ((item.nombre / totalCommandes) * 100).toFixed(1)
                                                    : "0"
                                            return (
                                                <TableRow
                                                    key={item.statut}
                                                    className="hover:bg-[var(--medicandle-beige)]/30"
                                                >
                                                    <TableCell className="font-medium">
                                                        {statutLabels[item.statut]}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {item.nombre}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {item.ca ? formatEuro(item.ca) : "—"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {percentage}%
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                )}
                            </TableBody>
                        </Table>
                        {totalCommandes > 0 && (
                            <div className="p-4 border-t border-[var(--medicandle-beige)] bg-[var(--medicandle-beige)]/20">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-[var(--medicandle-dark-brown)]">Total</span>
                                    <span className="text-[var(--medicandle-dark-brown)]">
                                        {totalCommandes} commandes
                                    </span>
                                    <span className="text-[var(--medicandle-dark-brown)]">
                                        {formatEuro(totalCA)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

