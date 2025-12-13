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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X } from "lucide-react"

export function StatistiquesFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [periode, setPeriode] = useState<string>(
        searchParams.get("periode") || "ce-mois"
    )
    const [dateFrom, setDateFrom] = useState(
        searchParams.get("dateFrom") || ""
    )
    const [dateTo, setDateTo] = useState(
        searchParams.get("dateTo") || ""
    )
    const [type, setType] = useState<string>(
        searchParams.get("type") || "realise"
    )
    const [timeUnit, setTimeUnit] = useState<string>(
        searchParams.get("timeUnit") || "mois"
    )
    const [scope, setScope] = useState<string>(
        searchParams.get("scope") || "all"
    )
    const [scopeValue, setScopeValue] = useState(
        searchParams.get("scopeValue") || ""
    )

    const applyFilters = () => {
        startTransition(() => {
            const params = new URLSearchParams()
            if (periode && periode !== "personnalisee") {
                params.set("periode", periode)
            }
            if (periode === "personnalisee") {
                if (dateFrom) {
                    params.set("dateFrom", dateFrom)
                }
                if (dateTo) {
                    params.set("dateTo", dateTo)
                }
            }
            if (type) {
                params.set("type", type)
            }
            if (timeUnit) {
                params.set("timeUnit", timeUnit)
            }
            if (scope && scope !== "all") {
                params.set("scope", scope)
                if (scopeValue) {
                    params.set("scopeValue", scopeValue)
                }
            }
            router.push(`/bo/statistiques?${params.toString()}`)
        })
    }

    const clearFilters = () => {
        setPeriode("ce-mois")
        setDateFrom("")
        setDateTo("")
        setType("realise")
        setTimeUnit("mois")
        setScope("all")
        setScopeValue("")
        startTransition(() => {
            router.push("/bo/statistiques")
        })
    }

    const hasActiveFilters =
        periode !== "ce-mois" ||
        dateFrom ||
        dateTo ||
        type !== "realise" ||
        timeUnit !== "mois" ||
        (scope && scope !== "all")

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
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="periode">Période</Label>
                        <Select value={periode} onValueChange={setPeriode} disabled={isPending}>
                            <SelectTrigger id="periode" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ce-mois">Ce mois-ci</SelectItem>
                                <SelectItem value="mois-dernier">Mois dernier</SelectItem>
                                <SelectItem value="cette-annee">Cette année</SelectItem>
                                <SelectItem value="annee-derniere">Année dernière</SelectItem>
                                <SelectItem value="personnalisee">Personnalisée</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {periode === "personnalisee" && (
                        <>
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
                        </>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="timeUnit">Unité temporelle</Label>
                        <Select value={timeUnit} onValueChange={setTimeUnit} disabled={isPending}>
                            <SelectTrigger id="timeUnit" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="jour">Par jour</SelectItem>
                                <SelectItem value="semaine">Par semaine</SelectItem>
                                <SelectItem value="mois">Par mois</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Type de chiffre</Label>
                    <Tabs value={type} onValueChange={setType}>
                        <TabsList className="w-full grid grid-cols-3 h-auto">
                            <TabsTrigger value="realise" disabled={isPending}>Réalisé</TabsTrigger>
                            <TabsTrigger value="pipeline" disabled={isPending}>Pipeline</TabsTrigger>
                            <TabsTrigger value="previsionnel" disabled={isPending}>Prévisionnel</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="scope">Portée</Label>
                        <Select value={scope} onValueChange={setScope} disabled={isPending}>
                            <SelectTrigger id="scope" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les commandes</SelectItem>
                                <SelectItem value="client">Un client spécifique</SelectItem>
                                <SelectItem value="bougie">Une bougie spécifique</SelectItem>
                                <SelectItem value="collection">Une collection</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {scope !== "all" && (
                        <div className="space-y-2">
                            <Label htmlFor="scopeValue">
                                {scope === "client"
                                    ? "Client"
                                    : scope === "bougie"
                                        ? "Bougie"
                                        : "Collection"}
                            </Label>
                            <Input
                                id="scopeValue"
                                type="text"
                                value={scopeValue}
                                onChange={(e) => setScopeValue(e.target.value)}
                                placeholder={
                                    scope === "client"
                                        ? "ID ou nom du client"
                                        : scope === "bougie"
                                            ? "ID ou nom de la bougie"
                                            : "Nom de la collection"
                                }
                                disabled={isPending}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <Button onClick={applyFilters} disabled={isPending}>
                        Appliquer les filtres
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

