"use client"

import { BonDeCommandeMatieres, Material, Unit } from "@prisma/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type BonDeCommandeMatieresWithLignes = BonDeCommandeMatieres & {
    lignes: Array<{
        id: string
        quantiteACommander: number
        fournisseur: string | null
        notes: string | null
        matierePremiere: Material
    }>
    commandes: Array<{
        commande: {
            id: string
            reference: string
        }
    }>
}

const unitLabels: Record<Unit, string> = {
    G: "g",
    KG: "kg",
    ML: "ml",
    L: "L",
    PIECE: "pièce",
}

export function BonDeCommandeDetail({
    bon,
}: {
    bon: BonDeCommandeMatieresWithLignes
}) {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Bon de commande matières premières</CardTitle>
                    <CardDescription>Référence: {bon.reference}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Date de création
                            </p>
                            <p className="text-sm">{formatDate(bon.dateCreation)}</p>
                        </div>
                        {bon.statut && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Statut</p>
                                <Badge>{bon.statut}</Badge>
                            </div>
                        )}
                    </div>

                    {bon.description && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Description
                            </p>
                            <p className="text-sm">{bon.description}</p>
                        </div>
                    )}

                    {bon.notes && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Notes</p>
                            <p className="text-sm">{bon.notes}</p>
                        </div>
                    )}

                    {bon.commandes.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                Commandes liées
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {bon.commandes.map(({ commande }) => (
                                    <Badge key={commande.id} variant="outline">
                                        {commande.reference}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lignes de commande</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)]">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[var(--medicandle-beige)]/50">
                                    <TableHead className="text-[var(--medicandle-dark-brown)]">Matière première</TableHead>
                                    <TableHead className="text-[var(--medicandle-dark-brown)]">Type</TableHead>
                                    <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Quantité à commander</TableHead>
                                    <TableHead className="text-[var(--medicandle-dark-brown)]">Fournisseur</TableHead>
                                    <TableHead className="text-[var(--medicandle-dark-brown)]">Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bon.lignes.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-muted-foreground py-8"
                                        >
                                            Aucune ligne
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bon.lignes.map((ligne) => (
                                        <TableRow key={ligne.id} className="hover:bg-[var(--medicandle-beige)]/30">
                                            <TableCell className="font-medium">
                                                {ligne.matierePremiere.name}
                                            </TableCell>
                                            <TableCell>{ligne.matierePremiere.type}</TableCell>
                                            <TableCell className="text-right">
                                                {ligne.quantiteACommander.toFixed(2)}{" "}
                                                {unitLabels[ligne.matierePremiere.unit]}
                                            </TableCell>
                                            <TableCell>
                                                {ligne.fournisseur || ligne.matierePremiere.supplier || "—"}
                                            </TableCell>
                                            <TableCell>{ligne.notes || "—"}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

