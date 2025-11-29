"use client"

import { Candle, Positioning } from "@prisma/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Eye } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

type CandleWithCosts = Candle & {
    materialCost: number
    productionCost: number
    totalCost: number
}

const positioningLabels: Record<Positioning, string> = {
    ENTRY: "Entrée",
    PREMIUM: "Premium",
    LUXURY: "Luxe",
}

export function CandlesTable({ candles }: { candles: CandleWithCosts[] }) {
    const formatEuro = (amount: number) => `${amount.toFixed(2)} €`

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Collection</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Positionnement</TableHead>
                        <TableHead className="text-right">Coût matières</TableHead>
                        <TableHead className="text-right">Coût production</TableHead>
                        <TableHead className="text-right">Coût total</TableHead>
                        <TableHead className="text-right">Prix vente</TableHead>
                        <TableHead className="text-right">Marge %</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {candles.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                                Aucune bougie enregistrée
                            </TableCell>
                        </TableRow>
                    ) : (
                        candles.map((candle) => {
                            const margin = candle.currentPrice
                                ? candle.currentPrice - candle.totalCost
                                : null
                            const marginPercent =
                                candle.currentPrice && candle.currentPrice > 0
                                    ? ((candle.currentPrice - candle.totalCost) / candle.currentPrice) * 100
                                    : null

                            return (
                                <TableRow key={candle.id}>
                                    <TableCell className="font-medium">{candle.name}</TableCell>
                                    <TableCell>{candle.category || "—"}</TableCell>
                                    <TableCell>{candle.format || "—"}</TableCell>
                                    <TableCell>
                                        {candle.positioning ? (
                                            <Badge variant="outline">
                                                {positioningLabels[candle.positioning]}
                                            </Badge>
                                        ) : (
                                            "—"
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right text-sm">
                                        {formatEuro(candle.materialCost)}
                                    </TableCell>
                                    <TableCell className="text-right text-sm">
                                        {formatEuro(candle.productionCost)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatEuro(candle.totalCost)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {candle.currentPrice ? formatEuro(candle.currentPrice) : "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {marginPercent !== null ? (
                                            <span
                                                className={
                                                    marginPercent >= 50
                                                        ? "text-green-600"
                                                        : marginPercent >= 30
                                                            ? "text-amber-600"
                                                            : "text-red-600"
                                                }
                                            >
                                                {marginPercent.toFixed(1)}%
                                            </span>
                                        ) : (
                                            "—"
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/bo/bougies/${candle.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/bo/bougies/${candle.id}/modifier`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
