"use client"

import { useState } from "react"
import { Client, ClientType } from "@/lib/types"
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
import { deleteClient } from "../actions"
import { useRouter } from "next/navigation"

const clientTypeLabels: Record<ClientType, string> = {
    PARTICULIER: "Particulier",
    PROFESSIONNEL: "Professionnel",
}

export function ClientsTable({ clients }: { clients: Client[] }) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
            return
        }

        setDeletingId(id)
        try {
            await deleteClient(id)
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
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Email</TableHead>
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Téléphone</TableHead>
                        <TableHead className="text-[var(--medicandle-dark-brown)]">Ville</TableHead>
                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                Aucun client enregistré
                            </TableCell>
                        </TableRow>
                    ) : (
                        clients.map((client) => (
                            <TableRow key={client.id} className="hover:bg-[var(--medicandle-beige)]/30">
                                <TableCell className="font-medium">
                                    {client.prenom ? `${client.prenom} ${client.nom}` : client.nom}
                                    {client.raisonSociale && (
                                        <div className="text-xs text-muted-foreground">
                                            {client.raisonSociale}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {client.typeClient ? clientTypeLabels[client.typeClient] : "—"}
                                </TableCell>
                                <TableCell>{client.email || "—"}</TableCell>
                                <TableCell>{client.telephone || "—"}</TableCell>
                                <TableCell>{client.ville || "—"}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/bo/clients/${client.id}`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(client.id)}
                                            disabled={deletingId === client.id}
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

