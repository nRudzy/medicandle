"use client"

import { BonDeCommandeMatieres, BonDeCommandeMatieresStatut } from "@/lib/types"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { BonDeCommandeStatutSelector } from "./bon-de-commande-statut-selector"

const statutLabels: Record<BonDeCommandeMatieresStatut, string> = {
    BROUILLON: "Brouillon",
    ENVOYE_FOURNISSEUR: "Envoyé au fournisseur",
    RECU_PARTIEL: "Reçu partiellement",
    RECU_TOTAL: "Reçu totalement",
}

const statutColors: Record<BonDeCommandeMatieresStatut, string> = {
    BROUILLON: "bg-gray-100 text-gray-800",
    ENVOYE_FOURNISSEUR: "bg-blue-100 text-blue-800",
    RECU_PARTIEL: "bg-yellow-100 text-yellow-800",
    RECU_TOTAL: "bg-green-100 text-green-800",
}

export function BonsDeCommandeTable({
    bons,
}: {
    bons: BonDeCommandeMatieres[]
}) {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("fr-FR")
    }

    return (
        <div className="rounded-md border border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)]">
            <Table>
                <TableHeader>
                    <TableRow className="bg-[var(--medicandle-beige)]/50">
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Référence</TableHead>
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Date création</TableHead>
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Description</TableHead>
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Statut</TableHead>
                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bons.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                Aucun bon de commande matières enregistré
                            </TableCell>
                        </TableRow>
                    ) : (
                        bons.map((bon) => (
                            <TableRow key={bon.id} className="hover:bg-[var(--medicandle-beige)]/30">
                                <TableCell className="font-medium">{bon.reference}</TableCell>
                                <TableCell>{formatDate(bon.dateCreation)}</TableCell>
                                <TableCell>{bon.description || "—"}</TableCell>
                                <TableCell>
                                    <BonDeCommandeStatutSelector
                                        bonId={bon.id}
                                        currentStatut={bon.statut}
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/bo/bons-de-commande/${bon.id}`}>
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

