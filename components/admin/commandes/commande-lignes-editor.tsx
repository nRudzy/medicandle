"use client"

import { useState } from "react"
import { CommandeLigne, Candle } from "@/lib/types"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
import { Plus, Trash2 } from "lucide-react"
import { addCommandeLigne, updateCommandeLigne, deleteCommandeLigne } from "../actions"
import { useRouter } from "next/navigation"

type CommandeLigneWithBougie = CommandeLigne & {
    bougie: Candle
}

export function CommandeLignesEditor({
    commandeId,
    lignes: initialLignes,
    candles,
}: {
    commandeId: string
    lignes: CommandeLigneWithBougie[]
    candles: Candle[]
}) {
    const router = useRouter()
    const [lignes, setLignes] = useState(initialLignes)
    const [isAdding, setIsAdding] = useState(false)
    const [newLigne, setNewLigne] = useState({
        bougieId: "",
        quantite: 1,
        prixUnitaireUtilise: "",
        remisePourcentage: "",
        remiseMontant: "",
        notes: "",
    })

    const handleAddLigne = async () => {
        if (!newLigne.bougieId) return

        const formData = new FormData()
        formData.append("bougieId", newLigne.bougieId)
        formData.append("quantite", newLigne.quantite.toString())
        if (newLigne.prixUnitaireUtilise) {
            formData.append("prixUnitaireUtilise", newLigne.prixUnitaireUtilise)
        }
        if (newLigne.remisePourcentage) {
            formData.append("remisePourcentage", newLigne.remisePourcentage)
        }
        if (newLigne.remiseMontant) {
            formData.append("remiseMontant", newLigne.remiseMontant)
        }
        if (newLigne.notes) {
            formData.append("notes", newLigne.notes)
        }

        const result = await addCommandeLigne(commandeId, formData)
        if (!result?.error) {
            router.refresh()
            setIsAdding(false)
            setNewLigne({
                bougieId: "",
                quantite: 1,
                prixUnitaireUtilise: "",
                remisePourcentage: "",
                remiseMontant: "",
                notes: "",
            })
        }
    }

    const handleDeleteLigne = async (ligneId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette ligne ?")) {
            return
        }
        await deleteCommandeLigne(ligneId)
        router.refresh()
    }

    const formatEuro = (amount: number | null) => {
        if (amount === null) return "—"
        return `${amount.toFixed(2)} €`
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)]">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[var(--medicandle-beige)]/50">
                            <TableHead className="text-[var(--medicandle-dark-brown)]">Bougie</TableHead>
                            <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Quantité</TableHead>
                            <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Prix unitaire</TableHead>
                            <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Remise</TableHead>
                            <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Montant ligne</TableHead>
                            <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lignes.map((ligne) => (
                            <TableRow key={ligne.id} className="hover:bg-[var(--medicandle-beige)]/30">
                                <TableCell className="font-medium">
                                    {ligne.bougie.name}
                                </TableCell>
                                <TableCell className="text-right">{ligne.quantite}</TableCell>
                                <TableCell className="text-right">
                                    {formatEuro(ligne.prixUnitaireUtilise)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {ligne.remisePourcentage
                                        ? `${ligne.remisePourcentage}%`
                                        : ligne.remiseMontant
                                            ? formatEuro(ligne.remiseMontant)
                                            : "—"}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatEuro(ligne.montantLigne)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteLigne(ligne.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {isAdding && (
                            <TableRow>
                                <TableCell>
                                    <Select
                                        value={newLigne.bougieId}
                                        onValueChange={(value) =>
                                            setNewLigne({ ...newLigne, bougieId: value })
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Sélectionner une bougie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {candles.map((candle) => (
                                                <SelectItem key={candle.id} value={candle.id}>
                                                    {candle.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={newLigne.quantite}
                                        onChange={(e) =>
                                            setNewLigne({
                                                ...newLigne,
                                                quantite: parseInt(e.target.value) || 1,
                                            })
                                        }
                                        className="w-20"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={newLigne.prixUnitaireUtilise}
                                        onChange={(e) =>
                                            setNewLigne({
                                                ...newLigne,
                                                prixUnitaireUtilise: e.target.value,
                                            })
                                        }
                                        placeholder="Prix"
                                        className="w-24"
                                    />
                                </TableCell>
                                <TableCell>—</TableCell>
                                <TableCell>—</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={handleAddLigne}
                                            disabled={!newLigne.bougieId}
                                        >
                                            Ajouter
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setIsAdding(false)}
                                        >
                                            Annuler
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {!isAdding && (
                <Button variant="outline" onClick={() => setIsAdding(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une ligne
                </Button>
            )}
        </div>
    )
}

