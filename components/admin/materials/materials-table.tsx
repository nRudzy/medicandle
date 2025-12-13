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
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteMaterial } from "../actions"
import { useRouter } from "next/navigation"

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

    return (
        <div className="rounded-md border border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)]">
            <Table>
                <TableHeader>
                    <TableRow className="bg-[var(--medicandle-beige)]/50">
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Nom</TableHead>
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Type</TableHead>
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Prix d'achat</TableHead>
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Unité</TableHead>
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Fournisseur</TableHead>
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Stock physique</TableHead>
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Stock réservé</TableHead>
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Stock disponible</TableHead>
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
                            const stockReserve = material.stockReserve ?? 0
                            const stockDisponible = stockPhysique - stockReserve

                            return (
                                <TableRow key={material.id} className="hover:bg-[var(--medicandle-beige)]/30">
                                    <TableCell className="font-medium">{material.name}</TableCell>
                                    <TableCell>{materialTypeLabels[material.type]}</TableCell>
                                    <TableCell>{material.costPerUnit.toFixed(2)} €</TableCell>
                                    <TableCell>{unitLabels[material.unit]}</TableCell>
                                    <TableCell>{material.supplier || "—"}</TableCell>
                                    <TableCell>
                                        {stockPhysique.toFixed(2)} {unitLabels[material.unit]}
                                    </TableCell>
                                    <TableCell>
                                        {stockReserve.toFixed(2)} {unitLabels[material.unit]}
                                    </TableCell>
                                    <TableCell className={stockDisponible < 0 ? "text-red-600 font-medium" : ""}>
                                        {stockDisponible.toFixed(2)} {unitLabels[material.unit]}
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
    )
}
