"use client"

import { Commande, CommandeStatut } from "@prisma/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Edit } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

type CommandeWithClient = Commande & {
    client: {
        nom: string
        prenom?: string | null
        raisonSociale?: string | null
    } | null
    _count: {
        lignes: number
    }
}

const statutLabels: Record<CommandeStatut, string> = {
    BROUILLON: "Brouillon",
    EN_ATTENTE_STOCK: "En attente de stock",
    EN_COURS_COMMANDE: "En cours de commande",
    EN_COURS_FABRICATION: "En cours de fabrication",
    TERMINEE: "Terminée",
    LIVREE: "Livrée",
    ANNULEE: "Annulée",
}

const statutColors: Record<CommandeStatut, string> = {
    BROUILLON: "bg-gray-100 text-gray-800",
    EN_ATTENTE_STOCK: "bg-yellow-100 text-yellow-800",
    EN_COURS_COMMANDE: "bg-blue-100 text-blue-800",
    EN_COURS_FABRICATION: "bg-purple-100 text-purple-800",
    TERMINEE: "bg-green-100 text-green-800",
    LIVREE: "bg-emerald-100 text-emerald-800",
    ANNULEE: "bg-red-100 text-red-800",
}

export function CommandesTable({ commandes }: { commandes: CommandeWithClient[] }) {
    const formatEuro = (amount: number | null) => {
        if (amount === null) return "—"
        return `${amount.toFixed(2)} €`
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("fr-FR")
    }

    const getClientName = (commande: CommandeWithClient) => {
        if (!commande.client) return "Sans client"
        if (commande.client.prenom) {
            return `${commande.client.prenom} ${commande.client.nom}`
        }
        return commande.client.raisonSociale || commande.client.nom
    }

    return (
        <div className="rounded-md border border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)]">
            <Table>
                <TableHeader>
                    <TableRow className="bg-[var(--medicandle-beige)]/50">
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Référence</TableHead>
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Client</TableHead>
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Date commande</TableHead>
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Statut</TableHead>
                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Nb bougies</TableHead>
                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Montant estimé</TableHead>
                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {commandes.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                Aucune commande enregistrée
                            </TableCell>
                        </TableRow>
                    ) : (
                        commandes.map((commande) => (
                            <TableRow key={commande.id} className="hover:bg-[var(--medicandle-beige)]/30">
                                <TableCell className="font-medium">{commande.reference}</TableCell>
                                <TableCell>{getClientName(commande)}</TableCell>
                                <TableCell>{formatDate(commande.dateCommande)}</TableCell>
                                <TableCell>
                                    <Badge className={statutColors[commande.statut]}>
                                        {statutLabels[commande.statut]}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {commande._count.lignes}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatEuro(commande.montantTotalEstime)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/bo/commandes/${commande.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/bo/commandes/${commande.id}/modifier`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
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

