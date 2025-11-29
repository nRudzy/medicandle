"use client"

import { useState } from "react"
import { Candle } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calculator } from "lucide-react"

export function QuickSimulation({ candles }: { candles: Candle[] }) {
    const [selectedCandleId, setSelectedCandleId] = useState("")
    const [quantity, setQuantity] = useState(50)

    const selectedCandle = candles.find((c) => c.id === selectedCandleId)

    const revenue = selectedCandle?.currentPrice
        ? selectedCandle.currentPrice * quantity
        : 0

    const formatEuro = (amount: number) => `${amount.toFixed(2)} €`

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Simulation rapide
                </CardTitle>
                <CardDescription>
                    Calculez rapidement le CA potentiel d'un produit
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label>Bougie</Label>
                        <Select value={selectedCandleId} onValueChange={setSelectedCandleId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                                {candles.map((candle) => (
                                    <SelectItem key={candle.id} value={candle.id}>
                                        {candle.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Quantité estimée</Label>
                        <Input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>CA projeté</Label>
                        <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                            <span className="text-lg font-bold">
                                {selectedCandle ? formatEuro(revenue) : "—"}
                            </span>
                        </div>
                    </div>
                </div>

                {selectedCandle && selectedCandle.currentPrice && (
                    <div className="mt-4 p-3 bg-medicandle-beige rounded-lg border text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Prix unitaire:</span>
                            <span className="font-medium">{formatEuro(selectedCandle.currentPrice)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-muted-foreground">Quantité:</span>
                            <span className="font-medium">{quantity} unités</span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t">
                            <span className="font-medium">Chiffre d'affaires:</span>
                            <span className="text-lg font-bold text-primary">
                                {formatEuro(revenue)}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
