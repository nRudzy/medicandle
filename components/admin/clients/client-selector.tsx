"use client"

import { useState } from "react"
import { Client } from "@prisma/client"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export function ClientSelector({
    clients,
    value,
    onValueChange,
}: {
    clients: Client[]
    value?: string
    onValueChange: (value: string) => void
}) {
    return (
        <div className="flex gap-2">
            <Select value={value || "none"} onValueChange={onValueChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">Aucun client</SelectItem>
                    {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                            {client.prenom
                                ? `${client.prenom} ${client.nom}`
                                : client.nom}
                            {client.raisonSociale && ` - ${client.raisonSociale}`}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button type="button" variant="outline" size="icon" asChild>
                <Link href="/bo/clients/nouveau">
                    <Plus className="h-4 w-4" />
                </Link>
            </Button>
        </div>
    )
}

