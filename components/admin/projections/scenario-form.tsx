"use client"

import { useState } from "react"
import { Candle } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createScenario } from "../actions"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

type ScenarioCandle = {
    candleId: string
    estimatedQty: number
    usedPrice: number
}

export function ScenarioForm({ candles }: { candles: Candle[] }) {
    const [scenarioCandles, setScenarioCandles] = useState<ScenarioCandle[]>([])

    const addCandle = () => {
        setScenarioCandles([
            ...scenarioCandles,
            { candleId: "", estimatedQty: 0, usedPrice: 0 },
        ])
    }

    const removeCandle = (index: number) => {
        setScenarioCandles(scenarioCandles.filter((_, i) => i !== index))
    }

    const updateCandle = (index: number, field: string, value: any) => {
        const updated = [...scenarioCandles]
        updated[index] = { ...updated[index], [field]: value }

        // Auto-fill price when candle is selected
        if (field === "candleId") {
            const selectedCandle = candles.find((c) => c.id === value)
            if (selectedCandle?.currentPrice) {
                updated[index].usedPrice = selectedCandle.currentPrice
            }
        }

        setScenarioCandles(updated)
    }

    const totalRevenue = scenarioCandles.reduce(
        (sum, sc) => sum + sc.usedPrice * sc.estimatedQty,
        0
    )

    return (
        <form action={createScenario}>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Informations du scénario</CardTitle>
                        <CardDescription>
                            Donnez un nom et une période à votre scénario
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom du scénario *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Ex: Noël 2025, Été 2026"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                rows={2}
                                placeholder="Hypothèses et notes sur ce scénario"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Date de début</Label>
                                <Input id="startDate" name="startDate" type="date" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">Date de fin</Label>
                                <Input id="endDate" name="endDate" type="date" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Produits et volumes</CardTitle>
                        <CardDescription>
                            Ajoutez les bougies et estimez les quantités
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {scenarioCandles.map((sc, index) => (
                            <div key={index} className="grid gap-3 sm:grid-cols-12 items-end p-4 border rounded-lg">
                                <div className="sm:col-span-5 space-y-2">
                                    <Label>Bougie</Label>
                                    <Select
                                        name={`candles[${index}].candleId`}
                                        value={sc.candleId}
                                        onValueChange={(value) => updateCandle(index, "candleId", value)}
                                        required
                                    >
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

                                <div className="sm:col-span-3 space-y-2">
                                    <Label>Quantité estimée</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        name={`candles[${index}].estimatedQty`}
                                        value={sc.estimatedQty}
                                        onChange={(e) =>
                                            updateCandle(index, "estimatedQty", parseInt(e.target.value) || 0)
                                        }
                                        required
                                    />
                                </div>

                                <div className="sm:col-span-3 space-y-2">
                                    <Label>Prix unitaire (€)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        name={`candles[${index}].usedPrice`}
                                        value={sc.usedPrice}
                                        onChange={(e) =>
                                            updateCandle(index, "usedPrice", parseFloat(e.target.value) || 0)
                                        }
                                    />
                                </div>

                                <div className="sm:col-span-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeCandle(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {sc.candleId && sc.estimatedQty > 0 && sc.usedPrice > 0 && (
                                    <div className="sm:col-span-12 text-sm text-muted-foreground bg-stone-50 p-2 rounded">
                                        CA partiel: {(sc.usedPrice * sc.estimatedQty).toFixed(2)} €
                                    </div>
                                )}
                            </div>
                        ))}

                        <Button type="button" variant="outline" onClick={addCandle}>
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter un produit
                        </Button>

                        {scenarioCandles.length > 0 && totalRevenue > 0 && (
                            <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-medium">CA total projeté</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {totalRevenue.toFixed(2)} €
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex gap-3">
                    <Button type="submit">Créer le scénario</Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/bo/projections">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour
                        </Link>
                    </Button>
                </div>
            </div>
        </form>
    )
}
