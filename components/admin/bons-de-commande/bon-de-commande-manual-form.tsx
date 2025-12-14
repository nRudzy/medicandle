"use client"

import { useActionState, useState } from "react"
import { Material, MaterialType, Unit } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import { createBonDeCommandeMatieresManuel } from "../actions"
import { MaterialCombobox } from "@/components/admin/candles/material-combobox"

const materialTypeLabels: Record<MaterialType, string> = {
    WAX: "Cire",
    SCENT: "Parfum",
    WICK: "Mèche",
    CONTAINER: "Contenant",
    DYE: "Colorant",
    ACCESSORY: "Accessoire",
    PACKAGING: "Emballage",
    OTHER: "Autre",
}

const unitLabels: Record<Unit, string> = {
    G: "g",
    KG: "kg",
    ML: "ml",
    L: "L",
    PIECE: "pièce",
}

type BonLine = {
    matierePremiereId: string
    quantite: number
    prixUnitaireAchat: number | ""
    fournisseur: string
    notes: string
}

export function BonDeCommandeManualForm({ materials }: { materials: Material[] }) {
    const actionWrapper = async (
        prevState: void | { error?: string } | null,
        formData: FormData
    ) => {
        const state = prevState === undefined ? null : prevState
        return createBonDeCommandeMatieresManuel(state, formData)
    }

    const [state, formAction, isPending] = useActionState(actionWrapper, null)
    const [lines, setLines] = useState<BonLine[]>([
        {
            matierePremiereId: "",
            quantite: 1,
            prixUnitaireAchat: "",
            fournisseur: "",
            notes: "",
        },
    ])
    const [localError, setLocalError] = useState<string | null>(null)

    const addLine = () => {
        setLines((prev) => [
            ...prev,
            {
                matierePremiereId: "",
                quantite: 1,
                prixUnitaireAchat: "",
                fournisseur: "",
                notes: "",
            },
        ])
    }

    const removeLine = (index: number) => {
        setLines((prev) => prev.filter((_, i) => i !== index))
    }

    const updateLine = <K extends keyof BonLine>(index: number, field: K, value: BonLine[K]) => {
        setLines((prev) => {
            const updated = [...prev]
            updated[index] = { ...updated[index], [field]: value }
            return updated
        })
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        if (lines.length === 0) {
            event.preventDefault()
            setLocalError("Ajoutez au moins une matière première.")
            return
        }

        for (const line of lines) {
            if (!line.matierePremiereId) {
                event.preventDefault()
                setLocalError("Chaque ligne doit avoir une matière première sélectionnée.")
                return
            }
            if (!line.quantite || line.quantite <= 0) {
                event.preventDefault()
                setLocalError("Chaque ligne doit avoir une quantité positive.")
                return
            }
        }

        setLocalError(null)
    }

    return (
        <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
            {state?.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                        <p className="text-sm text-red-700 mt-1">{state.error}</p>
                    </div>
                </div>
            )}

            {localError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Validation</h3>
                        <p className="text-sm text-red-700 mt-1">{localError}</p>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Nouveau bon de commande</CardTitle>
                    <CardDescription>Renseignez les matières premières à approvisionner.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="Ex: Approvisionnement printemps"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                rows={1}
                                placeholder="Informations complémentaires"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>Matières à commander</CardTitle>
                        <CardDescription>Ajoutez chaque matière première avec la quantité souhaitée.</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addLine}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter une ligne
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {lines.map((line, index) => {
                        const selectedMaterial = materials.find((m) => m.id === line.matierePremiereId)
                        return (
                            <div key={index} className="border rounded-lg p-4 space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Matière *</Label>
                                        <MaterialCombobox
                                            materials={materials}
                                            value={line.matierePremiereId}
                                            onChange={(value) => updateLine(index, "matierePremiereId", value)}
                                            materialTypeLabels={materialTypeLabels}
                                            unitLabels={unitLabels}
                                            name={`lignes[${index}].matierePremiereId`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            Quantité *
                                            {selectedMaterial && (
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    en {unitLabels[selectedMaterial.unit]}
                                                </span>
                                            )}
                                        </Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            name={`lignes[${index}].quantite`}
                                            value={line.quantite}
                                            onChange={(e) =>
                                                updateLine(
                                                    index,
                                                    "quantite",
                                                    e.target.value ? parseFloat(e.target.value) : 0
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label>Prix unitaire (€)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            name={`lignes[${index}].prix`}
                                            value={line.prixUnitaireAchat}
                                            onChange={(e) =>
                                                updateLine(
                                                    index,
                                                    "prixUnitaireAchat",
                                                    e.target.value ? parseFloat(e.target.value) : ""
                                                )
                                            }
                                            placeholder="Optionnel"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Fournisseur</Label>
                                        <Input
                                            name={`lignes[${index}].fournisseur`}
                                            value={line.fournisseur}
                                            onChange={(e) => updateLine(index, "fournisseur", e.target.value)}
                                            placeholder="Optionnel"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Notes</Label>
                                        <Input
                                            name={`lignes[${index}].notes`}
                                            value={line.notes}
                                            onChange={(e) => updateLine(index, "notes", e.target.value)}
                                            placeholder="Optionnel"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeLine(index)}
                                        disabled={lines.length === 1}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Supprimer la ligne
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Création..." : "Créer le bon"}
                </Button>
            </div>
        </form>
    )
}
