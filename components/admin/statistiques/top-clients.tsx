"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { TopClient, ClientStats } from "@/lib/business/statistiques"

interface TopClientsProps {
    topClients: TopClient[]
    clientStats: ClientStats
}

export function TopClients({ topClients, clientStats }: TopClientsProps) {
    const formatEuro = (amount: number) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)
    }

    const formatDate = (date: Date | null) => {
        if (!date) return "—"
        return new Date(date).toLocaleDateString("fr-FR")
    }

    const getClientName = (client: TopClient) => {
        if (client.prenom) {
            return `${client.prenom} ${client.nom}`
        }
        return client.raisonSociale || client.nom
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Top clients par CA</CardTitle>
                    <CardDescription>Clients ayant généré le plus de chiffre d'affaires</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)]">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[var(--medicandle-beige)]/50">
                                    <TableHead className="text-[var(--medicandle-dark-brown)]">Client</TableHead>
                                    <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Nb commandes</TableHead>
                                    <TableHead className="text-right text-[var(--medicandle-dark-brown)]">CA cumulé</TableHead>
                                    <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Nb bougies</TableHead>
                                    <TableHead className="text-[var(--medicandle-dark-brown)]">Dernière commande</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topClients.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-muted-foreground py-8"
                                        >
                                            Aucune donnée disponible
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    topClients.slice(0, 10).map((client) => (
                                        <TableRow
                                            key={client.clientId}
                                            className="hover:bg-[var(--medicandle-beige)]/30"
                                        >
                                            <TableCell className="font-medium">
                                                {getClientName(client)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {client.nbCommandes}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatEuro(client.caCumule)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {client.quantiteTotaleBougies}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(client.dateDerniereCommande)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Statistiques clients</CardTitle>
                    <CardDescription>Fidélité et fréquence d'achat</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)]">
                            <div>
                                <p className="text-sm font-medium text-[var(--medicandle-dark-brown)]">
                                    Clients uniques
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Nombre de clients distincts
                                </p>
                            </div>
                            <div className="text-2xl font-bold text-[var(--medicandle-dark-brown)]">
                                {clientStats.clientsUniques}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)]">
                            <div>
                                <p className="text-sm font-medium text-[var(--medicandle-dark-brown)]">
                                    Clients multi-commandes
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Plus d'une commande
                                </p>
                            </div>
                            <div className="text-2xl font-bold text-[var(--medicandle-dark-brown)]">
                                {clientStats.clientsMultiCommandes}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)]">
                            <div>
                                <p className="text-sm font-medium text-[var(--medicandle-dark-brown)]">
                                    Clients inactifs
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Pas de commande depuis 3 mois
                                </p>
                            </div>
                            <div className="text-2xl font-bold text-[var(--medicandle-dark-brown)]">
                                {clientStats.clientsInactifs}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

