"use client"

import { CommandeStatut } from "@/lib/types"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { changeCommandeStatut } from "../actions"
import { useTransition } from "react"
import { useRouter } from "next/navigation"

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
    isFeasible,
}: {
    commandeId: string
    currentStatut: CommandeStatut
    isFeasible?: boolean | null
}) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleChange = (value: string) => {
        startTransition(async () => {
            await changeCommandeStatut(commandeId, value as CommandeStatut)
            router.refresh()
        })
    }

    // Disable if commande is not feasible (unless it's already ANNULEE or LIVREE)
    const isDisabled = isPending || (isFeasible === false && currentStatut !== CommandeStatut.ANNULEE && currentStatut !== CommandeStatut.LIVREE)

    return (
        <div className="space-y-1">
            <Select value={currentStatut} onValueChange={handleChange} disabled={isDisabled}>
                <SelectTrigger className="w-full">
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
        </div>
    )
}

