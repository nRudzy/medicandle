"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MaterialType } from "@prisma/client"
import { X } from "lucide-react"

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

export function MaterialsFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [nom, setNom] = useState(searchParams.get("nom") || "")
    const [type, setType] = useState<string>(searchParams.get("type") || "all")
    const [fournisseur, setFournisseur] = useState(searchParams.get("fournisseur") || "")

    const applyFilters = () => {
        startTransition(() => {
            const params = new URLSearchParams()
            if (nom) {
                params.set("nom", nom)
            }
            if (type && type !== "all") {
                params.set("type", type)
            }
            if (fournisseur) {
                params.set("fournisseur", fournisseur)
            }
            router.push(`/bo/matieres?${params.toString()}`)
        })
    }

    const clearFilters = () => {
        setNom("")
        setType("all")
        setFournisseur("")
        startTransition(() => {
            router.push("/bo/matieres")
        })
    }

    const hasActiveFilters = nom || (type && type !== "all") || fournisseur

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Filtres</CardTitle>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            disabled={isPending}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Réinitialiser
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="nom">Nom</Label>
                        <Input
                            id="nom"
                            type="text"
                            placeholder="Rechercher par nom..."
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select value={type} onValueChange={setType} disabled={isPending}>
                            <SelectTrigger id="type" className="w-full">
                                <SelectValue placeholder="Tous les types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les types</SelectItem>
                                {Object.entries(materialTypeLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fournisseur">Fournisseur</Label>
                        <Input
                            id="fournisseur"
                            type="text"
                            placeholder="Rechercher par fournisseur..."
                            value={fournisseur}
                            onChange={(e) => setFournisseur(e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <Button onClick={applyFilters} disabled={isPending}>
                        Appliquer les filtres
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

