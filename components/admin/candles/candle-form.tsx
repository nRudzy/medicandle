"use client"

import { useState, useActionState } from "react"
import { Material, MaterialType, Unit, Positioning } from "@prisma/client"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createCandle } from "../actions"
import { ArrowLeft, Plus, Trash2, AlertCircle } from "lucide-react"
import Link from "next/link"

const positioningOptions: { value: Positioning; label: string }[] = [
    { value: "ENTRY", label: "Entrée de gamme" },
    { value: "PREMIUM", label: "Premium" },
    { value: "LUXURY", label: "Luxe" },
]

const materialTypeLabels: Record<MaterialType, string> = {
    WAX: "Cire",
    SCENT: "Parfum",
    WICK: "Mèche",
    CONTAINER: "Contenant",
    DYE: "Colorant",
    ACCESSORY: "Accessoire",
    PACKAGING: "Emballage",
    OTHER: "Autre",
}

const unitLabels: Record<Unit, string> = {
    G: "g",
    KG: "kg",
    ML: "ml",
    L: "L",
    PIECE: "pièce",
}

type RecipeMaterial = {
    materialId: string
    quantity: number
    unit: Unit
}

export function CandleForm({
    materials,
    candle,
}: {
    materials: Material[]
    candle?: any
}) {
    const [state, formAction, isPending] = useActionState(createCandle, null)
    const [recipeMaterials, setRecipeMaterials] = useState<RecipeMaterial[]>(
        candle?.materials?.map((cm: any) => ({
            materialId: cm.materialId,
            quantity: cm.quantity,
            unit: cm.unit || cm.material.unit,
        })) || []
    )

    const addMaterial = () => {
        setRecipeMaterials([
            ...recipeMaterials,
            { materialId: "", quantity: 0, unit: "G" },
        ])
    }

    const removeMaterial = (index: number) => {
        setRecipeMaterials(recipeMaterials.filter((_, i) => i !== index))
    }

    const updateMaterial = (index: number, field: string, value: any) => {
        const updated = [...recipeMaterials]
        updated[index] = { ...updated[index], [field]: value }
        setRecipeMaterials(updated)
    }

    return (
        <form action={formAction}>
            {state?.error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                        <p className="text-sm text-red-700 mt-1">{state.error}</p>
                    </div>
                </div>
            )}
            <Tabs defaultValue="info" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="info">Informations</TabsTrigger>
                    <TabsTrigger value="recipe">Recette</TabsTrigger>
                    <TabsTrigger value="production">Production</TabsTrigger>
                    <TabsTrigger value="pricing">Prix</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations générales</CardTitle>
                            <CardDescription>
                                Détails de base du produit
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={candle?.name}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="format">Format</Label>
                                    <Input
                                        id="format"
                                        name="format"
                                        placeholder="Ex: 180g, 250g 3 mèches"
                                        defaultValue={candle?.format || ""}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Collection / Catégorie</Label>
                                    <Input
                                        id="category"
                                        name="category"
                                        placeholder="Ex: Florale, Boisée, Gourmande"
                                        defaultValue={candle?.category || ""}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="positioning">Positionnement</Label>
                                    <Select
                                        name="positioning"
                                        defaultValue={candle?.positioning || ""}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {positioningOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="shortDesc">Description courte</Label>
                                <Input
                                    id="shortDesc"
                                    name="shortDesc"
                                    defaultValue={candle?.shortDesc || ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="longDesc">Description détaillée</Label>
                                <Textarea
                                    id="longDesc"
                                    name="longDesc"
                                    rows={3}
                                    defaultValue={candle?.longDesc || ""}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="recipe" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recette</CardTitle>
                            <CardDescription>
                                Matières premières nécessaires pour une bougie
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recipeMaterials.map((rm, index) => (
                                <div key={index} className="grid gap-3 sm:grid-cols-12 items-end">
                                    <div className="sm:col-span-5 space-y-2">
                                        <Label>Matière</Label>
                                        <Select
                                            name={`materials[${index}].materialId`}
                                            value={rm.materialId}
                                            onValueChange={(value) =>
                                                updateMaterial(index, "materialId", value)
                                            }
                                            required
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Sélectionner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {materials.map((material) => (
                                                    <SelectItem key={material.id} value={material.id}>
                                                        {material.name} ({materialTypeLabels[material.type]})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="sm:col-span-3 space-y-2">
                                        <Label>Quantité</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            name={`materials[${index}].quantity`}
                                            value={rm.quantity}
                                            onChange={(e) =>
                                                updateMaterial(index, "quantity", parseFloat(e.target.value))
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-3 space-y-2">
                                        <Label>Unité</Label>
                                        <Select
                                            name={`materials[${index}].unit`}
                                            value={rm.unit}
                                            onValueChange={(value) =>
                                                updateMaterial(index, "unit", value as Unit)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(unitLabels).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="sm:col-span-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeMaterial(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <Button type="button" variant="outline" onClick={addMaterial}>
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter une matière
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="production" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Paramètres de production</CardTitle>
                            <CardDescription>
                                Temps nécessaire pour produire une bougie
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="prepTimeMinutes">
                                        Temps de préparation (minutes) *
                                    </Label>
                                    <Input
                                        id="prepTimeMinutes"
                                        name="prepTimeMinutes"
                                        type="number"
                                        min="0"
                                        defaultValue={candle?.productionParams?.prepTimeMinutes ?? 30}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="heatingTimeMinutes">
                                        Temps de chauffe (minutes)
                                    </Label>
                                    <Input
                                        id="heatingTimeMinutes"
                                        name="heatingTimeMinutes"
                                        type="number"
                                        min="0"
                                        defaultValue={candle?.productionParams?.heatingTimeMinutes || ""}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Prix de vente</CardTitle>
                            <CardDescription>
                                Définissez le prix de vente actuel
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 max-w-sm">
                                <Label htmlFor="currentPrice">Prix de vente (€)</Label>
                                <Input
                                    id="currentPrice"
                                    name="currentPrice"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    defaultValue={candle?.currentPrice || ""}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Le prix conseillé sera calculé en fonction du coût et du positionnement
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Création en cours..." : candle ? "Enregistrer" : "Créer la bougie"}
                </Button>
                <Button type="button" variant="outline" asChild>
                    <Link href="/bo/bougies">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                    </Link>
                </Button>
            </div>
        </form>
    )
}
