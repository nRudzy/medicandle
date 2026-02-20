"use client"

import { useState } from "react"
import { Material, MaterialType, Unit } from "@/lib/types"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Merge } from "lucide-react"
import Link from "next/link"
import { deleteMaterial } from "../actions"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

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

export function MaterialsTable({ materials }: { materials: Material[] }) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false)
    const [isMerging, setIsMerging] = useState(false)

    const handleDelete = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette matière première ?")) {
            return
        }

        setDeletingId(id)
        try {
            await deleteMaterial(id)
            router.refresh()
        } catch (error) {
            alert("Erreur lors de la suppression")
        } finally {
            setDeletingId(null)
        }
    }

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    // Use the first selected ID to find the target material
    // We search in the full materials list if possible, but here we only have the current page's materials
    const firstSelectedId = Array.from(selectedIds)[0]
    const firstSelectedMaterial = materials.find((m) => m.id === firstSelectedId)

    const handleMerge = async () => {
        if (selectedIds.size < 2 || !firstSelectedMaterial) return

        setIsMerging(true)
        try {
            const targetId = firstSelectedId
            const sourceIds = Array.from(selectedIds).filter(id => id !== targetId)

            const res = await fetch("/api/bo/matieres/merge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetId, sourceIds }),
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || "Erreur lors de la fusion")
            }

            setIsMergeModalOpen(false)
            setSelectedIds(new Set())
            router.refresh()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsMerging(false)
        }
    }

    const targetMaterial = firstSelectedMaterial

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-3 rounded-md border border-[var(--medicandle-beige)] shadow-sm min-h-[60px]">
                <div className="text-sm">
                    {selectedIds.size > 0 ? (
                        <span className="font-medium text-[var(--medicandle-dark-brown)]">
                            {selectedIds.size} matière(s) sélectionnée(s)
                        </span>
                    ) : (
                        <span className="text-muted-foreground">Sélectionnez des matières pour les fusionner</span>
                    )}
                </div>
                <Button
                    onClick={() => setIsMergeModalOpen(true)}
                    disabled={selectedIds.size < 2}
                    className="bg-[var(--medicandle-sage)] hover:bg-[var(--medicandle-sage)]/90"
                >
                    <Merge className="mr-2 h-4 w-4" />
                    Fusionner
                </Button>
            </div>

            <div className="rounded-md border border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)]">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[var(--medicandle-beige)]/50">
                            <TableHead className="w-12 text-center"></TableHead>
                            <TableHead className="text-[var(--medicandle-dark-brown)]">Nom</TableHead>
                            <TableHead className="text-[var(--medicandle-dark-brown)]">Type</TableHead>
                            <TableHead className="text-[var(--medicandle-dark-brown)]">Prix d'achat</TableHead>
                            <TableHead className="text-[var(--medicandle-dark-brown)]">Unité</TableHead>
                            <TableHead className="text-[var(--medicandle-dark-brown)]">Fournisseur</TableHead>
                            <TableHead className="text-[var(--medicandle-dark-brown)]">Stock physique</TableHead>
                            <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {materials.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                    Aucune matière première enregistrée
                                </TableCell>
                            </TableRow>
                        ) : (
                            materials.map((material) => {
                                const stockPhysique = material.stockPhysique ?? 0
                                const isSelected = selectedIds.has(material.id)

                                // Constraint: only Allow same type according to requirements
                                const isDisabled =
                                    selectedIds.size > 0 &&
                                    !isSelected &&
                                    firstSelectedMaterial &&
                                    material.type !== firstSelectedMaterial.type

                                return (
                                    <TableRow
                                        key={material.id}
                                        className={`hover:bg-[var(--medicandle-beige)]/30 ${isSelected ? "bg-[var(--medicandle-beige)]/20" : ""}`}
                                    >
                                        <TableCell className="text-center">
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={() => toggleSelection(material.id)}
                                                disabled={!!isDisabled}
                                                title={isDisabled ? "Le type doit être identique à la matière cible" : ""}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {material.name}
                                            {isSelected && firstSelectedId === material.id && (
                                                <span className="ml-2 inline-flex items-center rounded-full bg-[var(--medicandle-dark-brown)] px-2 py-0.5 text-xs font-medium text-white">
                                                    Cible
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{materialTypeLabels[material.type]}</TableCell>
                                        <TableCell>{material.costPerUnit.toFixed(2)} €</TableCell>
                                        <TableCell>{unitLabels[material.unit]}</TableCell>
                                        <TableCell>{material.supplier || "—"}</TableCell>
                                        <TableCell>
                                            {stockPhysique.toFixed(2)} {unitLabels[material.unit]}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/bo/matieres/${material.id}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(material.id)}
                                                    disabled={deletingId === material.id}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isMergeModalOpen} onOpenChange={setIsMergeModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Fusionner les matières premières</DialogTitle>
                        <DialogDescription>
                            Vous êtes sur le point de fusionner {selectedIds.size} matières premières.
                        </DialogDescription>
                    </DialogHeader>

                    {targetMaterial && (
                        <div className="space-y-4 py-4">
                            <div className="rounded-md bg-muted p-4">
                                <p className="text-sm font-medium mb-2">Matière cible (conservée) :</p>
                                <p className="font-bold text-[var(--medicandle-dark-brown)]">{targetMaterial.name}</p>
                                <p className="text-sm mt-1">Fournisseur : {targetMaterial.supplier || "—"}</p>
                            </div>

                            <div className="text-sm space-y-2">
                                <p><strong>Règles de fusion appliquées :</strong></p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Le prix d'achat final sera la <strong>moyenne simple</strong> de toutes les matières fusionnées.</li>
                                    <li>Les stocks (physique et réservé) seront <strong>additionnés</strong>.</li>
                                    <li>Toutes les matières sources seront <strong>supprimées</strong>.</li>
                                    <li>L'historique et les références seront transférés sur la cible.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMergeModalOpen(false)} disabled={isMerging}>
                            Annuler
                        </Button>
                        <Button onClick={handleMerge} disabled={isMerging} className="bg-[var(--medicandle-sage)] hover:bg-[var(--medicandle-sage)]/90">
                            {isMerging ? "Fusion en cours..." : "Confirmer la fusion"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
