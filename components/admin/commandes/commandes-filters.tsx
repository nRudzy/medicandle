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
import { CommandeStatut } from "@prisma/client"
import { X } from "lucide-react"

const statutLabels: Record<CommandeStatut, string> = {
    BROUILLON: "Brouillon",
    EN_ATTENTE_STOCK: "En attente de stock",
    EN_COURS_COMMANDE: "En cours de commande",
    EN_COURS_FABRICATION: "En cours de fabrication",
    TERMINEE: "Terminée",
    LIVREE: "Livrée",
    ANNULEE: "Annulée",
}

export function CommandesFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [statut, setStatut] = useState<string[]>(
        searchParams.get("statut")?.split(",").filter(Boolean) || []
    )
    const [dateFrom, setDateFrom] = useState(
        searchParams.get("dateFrom") || ""
    )
    const [dateTo, setDateTo] = useState(
        searchParams.get("dateTo") || ""
    )
    const [faisable, setFaisable] = useState<string>(
        searchParams.get("faisable") || "all"
    )

    const applyFilters = () => {
        startTransition(() => {
            const params = new URLSearchParams()
            if (statut.length > 0) {
                params.set("statut", statut.join(","))
            }
            if (dateFrom) {
                params.set("dateFrom", dateFrom)
            }
            if (dateTo) {
                params.set("dateTo", dateTo)
            }
            if (faisable && faisable !== "all") {
                params.set("faisable", faisable)
            }
            router.push(`/bo/commandes?${params.toString()}`)
        })
    }

    const clearFilters = () => {
        setStatut([])
        setDateFrom("")
        setDateTo("")
        setFaisable("all")
        startTransition(() => {
            router.push("/bo/commandes")
        })
    }

    const toggleStatut = (value: CommandeStatut) => {
        setStatut((prev) =>
            prev.includes(value)
                ? prev.filter((s) => s !== value)
                : [...prev, value]
        )
    }

    const hasActiveFilters = statut.length > 0 || dateFrom || dateTo || (faisable && faisable !== "all")

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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                        <Label>Statut</Label>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(statutLabels).map(([value, label]) => (
                                <Button
                                    key={value}
                                    type="button"
                                    variant={statut.includes(value) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleStatut(value as CommandeStatut)}
                                    disabled={isPending}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="faisable">Faisabilité</Label>
                        <Select value={faisable} onValueChange={setFaisable} disabled={isPending}>
                            <SelectTrigger id="faisable">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes</SelectItem>
                                <SelectItem value="true">Réalisables</SelectItem>
                                <SelectItem value="false">Non réalisables</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dateFrom">Date de début</Label>
                        <Input
                            id="dateFrom"
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dateTo">Date de fin</Label>
                        <Input
                            id="dateTo"
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
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

