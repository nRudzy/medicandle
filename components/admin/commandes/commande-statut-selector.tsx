"use client"

import { CommandeStatut } from "@prisma/client"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { changeCommandeStatut } from "../actions"
import { useTransition } from "react"

const statutLabels: Record<CommandeStatut, string> = {
    BROUILLON: "Brouillon",
    EN_ATTENTE_STOCK: "En attente de stock",
    EN_COURS_COMMANDE: "En cours de commande",
    EN_COURS_FABRICATION: "En cours de fabrication",
    TERMINEE: "Terminée",
    LIVREE: "Livrée",
    ANNULEE: "Annulée",
}

export function CommandeStatutSelector({
    commandeId,
    currentStatut,
}: {
    commandeId: string
    currentStatut: CommandeStatut
}) {
    const [isPending, startTransition] = useTransition()

    const handleChange = (value: string) => {
        startTransition(async () => {
            await changeCommandeStatut(commandeId, value as CommandeStatut)
        })
    }

    return (
        <Select value={currentStatut} onValueChange={handleChange} disabled={isPending}>
            <SelectTrigger className="w-[250px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {Object.entries(statutLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                        {label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

