"use client"

import { useState } from "react"
import { Material, MaterialType, Unit } from "@prisma/client"
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
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Prix d'achat</TableHead>
                        <TableHead>Unité</TableHead>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {materials.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                Aucune matière première enregistrée
                            </TableCell>
                        </TableRow>
                    ) : (
                        materials.map((material) => (
                            <TableRow key={material.id}>
                                <TableCell className="font-medium">{material.name}</TableCell>
                                <TableCell>{materialTypeLabels[material.type]}</TableCell>
                                <TableCell>{material.costPerUnit.toFixed(2)} €</TableCell>
                                <TableCell>{unitLabels[material.unit]}</TableCell>
                                <TableCell>{material.supplier || "—"}</TableCell>
                                <TableCell>
                                    {material.currentStock != null
                                        ? `${material.currentStock} ${unitLabels[material.unit]}`
                                        : "—"}
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
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
