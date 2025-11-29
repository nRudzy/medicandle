"use client"

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
import { ArrowLeft } from "lucide-react"
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
    const action = material
        ? updateMaterial.bind(null, material.id)
        : createMaterial

    return (
        <form action={action}>
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
                                <SelectTrigger>
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
                                <SelectTrigger>
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
                            <Label htmlFor="currentStock">Stock actuel</Label>
                            <Input
                                id="currentStock"
                                name="currentStock"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={material?.currentStock || ""}
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
                        <Button type="submit">
                            {material ? "Enregistrer" : "Créer"}
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
