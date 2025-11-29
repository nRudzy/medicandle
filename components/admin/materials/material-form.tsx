"use client"

import { useActionState } from "react"
import { Material, MaterialType, Unit } from "@prisma/client"
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
import { Card, CardContent } from "@/components/ui/card"
import { createMaterial, updateMaterial } from "../actions"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

const materialTypes: { value: MaterialType; label: string }[] = [
    { value: "WAX", label: "Cire" },
    { value: "SCENT", label: "Parfum" },
    { value: "WICK", label: "Mèche" },
    { value: "CONTAINER", label: "Contenant" },
    { value: "DYE", label: "Colorant" },
    { value: "ACCESSORY", label: "Accessoire" },
    { value: "PACKAGING", label: "Emballage" },
    { value: "OTHER", label: "Autre" },
]

const units: { value: Unit; label: string }[] = [
    { value: "G", label: "Grammes (g)" },
    { value: "KG", label: "Kilogrammes (kg)" },
    { value: "ML", label: "Millilitres (ml)" },
    { value: "L", label: "Litres (L)" },
    { value: "PIECE", label: "Pièce" },
]

export function MaterialForm({ material }: { material?: Material }) {
    const createAction = (prevState: { error?: string } | null, formData: FormData) =>
        createMaterial(prevState, formData)
    const updateAction = (prevState: { error?: string } | null, formData: FormData) =>
        updateMaterial(material!.id, prevState, formData)

    const [state, formAction, isPending] = useActionState(
        material ? updateAction : createAction,
        null
    )

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
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom *</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={material?.name}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Type *</Label>
                            <Select name="type" defaultValue={material?.type} required>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {materialTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="costPerUnit">Prix d'achat (€) *</Label>
                            <Input
                                id="costPerUnit"
                                name="costPerUnit"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={material?.costPerUnit}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unit">Unité de référence *</Label>
                            <Select name="unit" defaultValue={material?.unit} required>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionner une unité" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map((unit) => (
                                        <SelectItem key={unit.value} value={unit.value}>
                                            {unit.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="supplier">Fournisseur</Label>
                            <Input
                                id="supplier"
                                name="supplier"
                                defaultValue={material?.supplier || ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stockPhysique">Stock physique</Label>
                            <Input
                                id="stockPhysique"
                                name="stockPhysique"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={material?.stockPhysique || ""}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            defaultValue={material?.notes || ""}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Enregistrement..." : material ? "Enregistrer" : "Créer"}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/bo/matieres">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
