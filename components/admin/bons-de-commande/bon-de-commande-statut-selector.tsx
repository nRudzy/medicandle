"use client"

import { BonDeCommandeMatieresStatut } from "@/lib/types"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { changeBonDeCommandeStatut } from "@/components/admin/actions"
import { useTransition } from "react"
import { useRouter } from "next/navigation"

const statutLabels: Record<BonDeCommandeMatieresStatut, string> = {
    BROUILLON: "Brouillon",
    ENVOYE: "Envoyé au fournisseur",
    RECU_PARTIEL: "Reçu partiellement",
    RECU_TOTAL: "Reçu totalement",
    ANNULE: "Annulé",
}

export function BonDeCommandeStatutSelector({
    bonId,
    currentStatut,
}: {
    bonId: string
    currentStatut: BonDeCommandeMatieresStatut | null
}) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleChange = (value: string) => {
        startTransition(async () => {
            await changeBonDeCommandeStatut(bonId, value as BonDeCommandeMatieresStatut)
            router.refresh()
        })
    }

    return (
        <Select
            value={currentStatut || ""}
            onValueChange={handleChange}
            disabled={isPending}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un statut" />
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

