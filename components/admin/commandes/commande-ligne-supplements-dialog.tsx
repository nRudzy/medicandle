"use client"

import { useState } from "react"
import { CommandeLigne, Material } from "@/lib/types"
import { CommandeLigneMatiereSupplementaire } from "@prisma/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, PackagePlus, Edit2, Check, X } from "lucide-react"
import { addSupplementToLigne, deleteSupplement, updateSupplement } from "@/components/admin/actions"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

// Extended type for line with supplements
type CommandeLigneWithSupplements = CommandeLigne & {
    supplements: (CommandeLigneMatiereSupplementaire & {
        matierePremiere: Material
    })[]
    bougie: { name: string }
}

export function CommandeLigneSupplementsDialog({
    ligne,
    materials
}: {
    ligne: CommandeLigneWithSupplements
    materials: Material[]
}) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [supplementForm, setSupplementForm] = useState({
        matierePremiereId: "",
        quantite: 1,
        prixUnitaireOverride: "",
        commentaire: ""
    })
    const SUPPLEMENT_MODE: "PAR_LIGNE" = "PAR_LIGNE"

    const resetForm = () => {
        setEditingId(null)
        setSupplementForm({
            matierePremiereId: "",
            quantite: 1,
            prixUnitaireOverride: "",
            commentaire: ""
        })
    }

    const handleEditClick = (supp: CommandeLigneMatiereSupplementaire) => {
        setEditingId(supp.id)
        setSupplementForm({
            matierePremiereId: supp.matierePremiereId,
            quantite: supp.quantite,
            prixUnitaireOverride: supp.prixUnitaireOverride?.toString() || "",
            commentaire: supp.commentaire || ""
        })
    }

    const handleSubmit = async () => {
        if (!supplementForm.matierePremiereId) return

        const formData = new FormData()
        formData.append("matierePremiereId", supplementForm.matierePremiereId)
        formData.append("modeQuantite", SUPPLEMENT_MODE)
        formData.append("quantite", supplementForm.quantite.toString())
        if (supplementForm.prixUnitaireOverride) {
            formData.append("prixUnitaireOverride", supplementForm.prixUnitaireOverride)
        }
        if (supplementForm.commentaire) {
            formData.append("commentaire", supplementForm.commentaire)
        }

        let result
        if (editingId) {
            result = await updateSupplement(editingId, formData)
        } else {
            result = await addSupplementToLigne(ligne.id, formData)
        }

        if (!result?.error) {
            resetForm()
            router.refresh()
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer ce supplément ?")) {
            await deleteSupplement(id)
            router.refresh()
        }
    }

    const selectedMaterial = materials.find(m => m.id === supplementForm.matierePremiereId)
    const selectedUnit = selectedMaterial?.unit
    const stepValue = selectedUnit === "PIECE" ? "1" : "0.1"
    const isEditing = !!editingId

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) resetForm()
        }}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <PackagePlus className="h-4 w-4 mr-2" />
                    Suppléments
                    {ligne.supplements?.length > 0 && (
                        <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                            {ligne.supplements.length}
                        </Badge>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Suppléments pour {ligne.bougie.name}</DialogTitle>
                    <DialogDescription>
                        Ajoutez des matériaux spécifiques pour cette ligne de commande (emballage, décoration, etc.)
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* List existing supplements */}
                    {ligne.supplements && ligne.supplements.length > 0 ? (
                        <div className="rounded-md border max-h-[200px] overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Matière</TableHead>
                                        <TableHead>Mode</TableHead>
                                        <TableHead className="text-right">Quantité</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ligne.supplements.map((supp) => (
                                        <TableRow key={supp.id} className={editingId === supp.id ? "bg-muted/50" : ""}>
                                            <TableCell className="font-medium">{supp.matierePremiere.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">
                                                    {supp.modeQuantite === 'PAR_BOUGIE' ? 'Par bougie' : 'Total ligne'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {supp.quantite} {supp.unite}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEditClick(supp)}
                                                        disabled={isEditing && editingId !== supp.id}
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600"
                                                        onClick={() => handleDelete(supp.id)}
                                                        disabled={isEditing}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground bg-slate-50 rounded-lg text-sm">
                            Aucun supplément ajouté
                        </div>
                    )}

                    {/* Add/Edit supplement form */}
                    <div className="grid gap-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="uppercase text-xs font-bold text-muted-foreground">
                                {isEditing ? "Modifier le supplément" : "Ajouter un supplément"}
                            </Label>
                            {isEditing && (
                                <Button variant="ghost" size="sm" onClick={resetForm} className="h-6 text-xs">
                                    <X className="w-3 h-3 mr-1" /> Annuler modification
                                </Button>
                            )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Matière Première</Label>
                                <Select
                                    value={supplementForm.matierePremiereId}
                                    onValueChange={(v) => setSupplementForm({ ...supplementForm, matierePremiereId: v })}
                                    disabled={isEditing} // Prevent changing material in edit mode for simplicity
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choisir..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {materials.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>
                                                {m.name} ({m.unit})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Mode de calcul</Label>
                                <p className="text-sm text-muted-foreground">
                                    Appliqué au total de la ligne
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs">
                                    Quantité
                                    {selectedMaterial && <span className="text-muted-foreground ml-1">({selectedMaterial.unit})</span>}
                                </Label>
                                <Input
                                    type="number"
                                    step={stepValue}
                                    min="0"
                                    value={supplementForm.quantite}
                                    onChange={(e) => setSupplementForm({ ...supplementForm, quantite: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs">Commentaire (Optionnel)</Label>
                                <Input
                                    value={supplementForm.commentaire}
                                    onChange={(e) => setSupplementForm({ ...supplementForm, commentaire: e.target.value })}
                                    placeholder="Ex: Emballage cadeau"
                                />
                            </div>
                        </div>
                        <Button onClick={handleSubmit} disabled={!supplementForm.matierePremiereId}>
                            {isEditing ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" /> Mettre à jour
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" /> Ajouter
                                </>
                            )}
                        </Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
