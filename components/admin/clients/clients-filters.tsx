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
import { ClientType } from "@prisma/client"
import { X } from "lucide-react"

const clientTypeLabels: Record<ClientType, string> = {
    PARTICULIER: "Particulier",
    PROFESSIONNEL: "Professionnel",
}

export function ClientsFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const [typeClient, setTypeClient] = useState<string>(
        searchParams.get("typeClient") || "all"
    )
    const [nom, setNom] = useState(searchParams.get("nom") || "")
    const [email, setEmail] = useState(searchParams.get("email") || "")
    const [ville, setVille] = useState(searchParams.get("ville") || "")

    const applyFilters = () => {
        startTransition(() => {
            const params = new URLSearchParams()
            if (typeClient && typeClient !== "all") {
                params.set("typeClient", typeClient)
            }
            if (nom) {
                params.set("nom", nom)
            }
            if (email) {
                params.set("email", email)
            }
            if (ville) {
                params.set("ville", ville)
            }
            router.push(`/bo/clients?${params.toString()}`)
        })
    }

    const clearFilters = () => {
        setTypeClient("all")
        setNom("")
        setEmail("")
        setVille("")
        startTransition(() => {
            router.push("/bo/clients")
        })
    }

    const hasActiveFilters = (typeClient && typeClient !== "all") || nom || email || ville

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
                        <Label htmlFor="typeClient">Type de client</Label>
                        <Select value={typeClient} onValueChange={setTypeClient} disabled={isPending}>
                            <SelectTrigger id="typeClient">
                                <SelectValue placeholder="Tous les types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les types</SelectItem>
                                {Object.entries(clientTypeLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
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
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Rechercher par email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ville">Ville</Label>
                        <Input
                            id="ville"
                            type="text"
                            placeholder="Rechercher par ville..."
                            value={ville}
                            onChange={(e) => setVille(e.target.value)}
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

