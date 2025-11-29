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
import { Positioning } from "@prisma/client"
import { X } from "lucide-react"

const positioningLabels: Record<Positioning, string> = {
    ENTRY: "Entrée",
    PREMIUM: "Premium",
    LUXURY: "Luxe",
}

export function CandlesFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [nom, setNom] = useState(searchParams.get("nom") || "")
    const [category, setCategory] = useState(searchParams.get("category") || "")
    const [positioning, setPositioning] = useState<string>(
        searchParams.get("positioning") || "all"
    )

    const applyFilters = () => {
        startTransition(() => {
            const params = new URLSearchParams()
            if (nom) {
                params.set("nom", nom)
            }
            if (category) {
                params.set("category", category)
            }
            if (positioning && positioning !== "all") {
                params.set("positioning", positioning)
            }
            router.push(`/bo/bougies?${params.toString()}`)
        })
    }

    const clearFilters = () => {
        setNom("")
        setCategory("")
        setPositioning("all")
        startTransition(() => {
            router.push("/bo/bougies")
        })
    }

    const hasActiveFilters = nom || category || (positioning && positioning !== "all")

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
                        <Label htmlFor="category">Collection</Label>
                        <Input
                            id="category"
                            type="text"
                            placeholder="Rechercher par collection..."
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="positioning">Positionnement</Label>
                        <Select value={positioning} onValueChange={setPositioning} disabled={isPending}>
                            <SelectTrigger id="positioning">
                                <SelectValue placeholder="Tous les positionnements" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les positionnements</SelectItem>
                                {Object.entries(positioningLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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

