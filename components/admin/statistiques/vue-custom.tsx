"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { StatistiquesFilters } from "@/lib/business/statistiques"

interface VueCustomProps {
    filters: StatistiquesFilters
}

type Dimension = "bougie" | "client" | "collection" | "statut"
type Indicateur = "ca" | "quantite" | "nbCommandes" | "margeTotale" | "margeMoyenne"

export function VueCustom({ filters }: VueCustomProps) {
    const [dimension, setDimension] = useState<Dimension>("bougie")
    const [indicateur, setIndicateur] = useState<Indicateur>("ca")
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filters.dateFrom) {
                params.set("dateFrom", filters.dateFrom.toISOString().split("T")[0])
            }
            if (filters.dateTo) {
                params.set("dateTo", filters.dateTo.toISOString().split("T")[0])
            }
            if (filters.periode) {
                params.set("periode", filters.periode)
            }
            params.set("dimension", dimension)
            params.set("indicateur", indicateur)

            const response = await fetch(`/api/statistiques/custom?${params.toString()}`)
            const result = await response.json()
            setData(result.data || [])
        } catch (error) {
            console.error("Error generating custom view:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleExportCSV = () => {
        if (data.length === 0) return

        const headers = Object.keys(data[0])
        const csvContent = [
            headers.join(","),
            ...data.map((row) =>
                headers
                    .map((header) => {
                        const value = row[header]
                        return typeof value === "string" && value.includes(",")
                            ? `"${value}"`
                            : value
                    })
                    .join(",")
            ),
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `statistiques-${dimension}-${indicateur}-${new Date().toISOString().split("T")[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const formatEuro = (amount: number) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)
    }

    const formatValue = (value: number, type: Indicateur) => {
        if (type === "ca" || type === "margeTotale") {
            return formatEuro(value)
        }
        if (type === "margeMoyenne") {
            return `${value.toFixed(1)}%`
        }
        return value.toString()
    }

    const getIndicateurLabel = (ind: Indicateur) => {
        const labels: Record<Indicateur, string> = {
            ca: "CA",
            quantite: "Quantité de bougies",
            nbCommandes: "Nombre de commandes",
            margeTotale: "Marge totale",
            margeMoyenne: "Marge moyenne %",
        }
        return labels[ind]
    }

    const getDimensionLabel = (dim: Dimension) => {
        const labels: Record<Dimension, string> = {
            bougie: "Bougie",
            client: "Client",
            collection: "Collection",
            statut: "Statut",
        }
        return labels[dim]
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vue personnalisée</CardTitle>
                <CardDescription>
                    Explorez vos données selon différentes dimensions et indicateurs
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="dimension">Dimension</Label>
                        <Select value={dimension} onValueChange={(v) => setDimension(v as Dimension)}>
                            <SelectTrigger id="dimension" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bougie">Bougie</SelectItem>
                                <SelectItem value="client">Client</SelectItem>
                                <SelectItem value="collection">Collection</SelectItem>
                                <SelectItem value="statut">Statut de commande</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="indicateur">Indicateur</Label>
                        <Select
                            value={indicateur}
                            onValueChange={(v) => setIndicateur(v as Indicateur)}
                        >
                            <SelectTrigger id="indicateur" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ca">CA</SelectItem>
                                <SelectItem value="quantite">Quantité de bougies</SelectItem>
                                <SelectItem value="nbCommandes">Nombre de commandes</SelectItem>
                                <SelectItem value="margeTotale">Marge totale</SelectItem>
                                <SelectItem value="margeMoyenne">Marge moyenne %</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>&nbsp;</Label>
                        <div className="flex gap-2">
                            <Button onClick={handleGenerate} disabled={loading}>
                                Générer
                            </Button>
                            {data.length > 0 && (
                                <Button variant="outline" onClick={handleExportCSV}>
                                    <Download className="h-4 w-4 mr-2" />
                                    CSV
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {data.length > 0 && (
                    <div className="rounded-md border border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)]">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[var(--medicandle-beige)]/50">
                                    <TableHead className="text-[var(--medicandle-dark-brown)]">
                                        {getDimensionLabel(dimension)}
                                    </TableHead>
                                    <TableHead className="text-right text-[var(--medicandle-dark-brown)]">
                                        {getIndicateurLabel(indicateur)}
                                    </TableHead>
                                    {indicateur !== "ca" && (
                                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">
                                            CA
                                        </TableHead>
                                    )}
                                    {indicateur !== "quantite" && (
                                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">
                                            Quantité
                                        </TableHead>
                                    )}
                                    {indicateur !== "margeTotale" && indicateur !== "margeMoyenne" && (
                                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">
                                            Marge
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row, index) => (
                                    <TableRow
                                        key={index}
                                        className="hover:bg-[var(--medicandle-beige)]/30"
                                    >
                                        <TableCell className="font-medium">
                                            {row.name || row[dimension] || "—"}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatValue(row.value || row[indicateur] || 0, indicateur)}
                                        </TableCell>
                                        {indicateur !== "ca" && (
                                            <TableCell className="text-right">
                                                {row.ca ? formatEuro(row.ca) : "—"}
                                            </TableCell>
                                        )}
                                        {indicateur !== "quantite" && (
                                            <TableCell className="text-right">
                                                {row.quantite || "—"}
                                            </TableCell>
                                        )}
                                        {indicateur !== "margeTotale" && indicateur !== "margeMoyenne" && (
                                            <TableCell className="text-right">
                                                {row.marge ? formatEuro(row.marge) : "—"}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {data.length === 0 && !loading && (
                    <div className="text-center text-muted-foreground py-8">
                        Sélectionnez une dimension et un indicateur, puis cliquez sur "Générer"
                    </div>
                )}

                {loading && (
                    <div className="text-center text-muted-foreground py-8">
                        Chargement...
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

