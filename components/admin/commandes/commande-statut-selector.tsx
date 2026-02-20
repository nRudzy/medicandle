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
    EN_COURS_FABRICATION: "En cours",
    TERMINEE: "Terminée",
    ANNULEE: "Annulée",
}

export function CommandeStatutSelector({
    commandeId,
    currentStatut,
    disableEditing,
}: {
    commandeId: string
    currentStatut: CommandeStatut
    disableEditing?: boolean
}) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleChange = (value: string) => {
        startTransition(async () => {
            await changeCommandeStatut(commandeId, value as CommandeStatut)
            router.refresh()
        })
    }

    const isDisabled = disableEditing || isPending || currentStatut === CommandeStatut.TERMINEE

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
