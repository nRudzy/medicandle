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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TopBougie } from "@/lib/business/statistiques"

interface TopBougiesProps {
    topByVolume: TopBougie[]
    topByMarge: TopBougie[]
    faibles: TopBougie[]
}

export function TopBougies({ topByVolume, topByMarge, faibles }: TopBougiesProps) {
    const formatEuro = (amount: number) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance des bougies</CardTitle>
                <CardDescription>Analyse des ventes et marges par produit</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="volume" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="volume">Top par volume</TabsTrigger>
                        <TabsTrigger value="marge">Top par marge</TabsTrigger>
                        <TabsTrigger value="faibles">Bougies à surveiller</TabsTrigger>
                    </TabsList>

                    <TabsContent value="volume" className="space-y-4">
                        <div className="rounded-md border border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)]">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-[var(--medicandle-beige)]/50">
                                        <TableHead className="text-[var(--medicandle-dark-brown)]">Nom</TableHead>
                                        <TableHead className="text-[var(--medicandle-dark-brown)]">Collection</TableHead>
                                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Quantité vendue</TableHead>
                                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">CA généré</TableHead>
                                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Marge totale</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topByVolume.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="text-center text-muted-foreground py-8"
                                            >
                                                Aucune donnée disponible
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        topByVolume.slice(0, 10).map((bougie) => (
                                            <TableRow
                                                key={bougie.bougieId}
                                                className="hover:bg-[var(--medicandle-beige)]/30"
                                            >
                                                <TableCell className="font-medium">
                                                    {bougie.bougieName}
                                                </TableCell>
                                                <TableCell>{bougie.collection || "—"}</TableCell>
                                                <TableCell className="text-right">
                                                    {bougie.quantiteVendue}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatEuro(bougie.caGenere)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatEuro(bougie.margeTotale)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="marge" className="space-y-4">
                        <div className="rounded-md border border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)]">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-[var(--medicandle-beige)]/50">
                                        <TableHead className="text-[var(--medicandle-dark-brown)]">Nom</TableHead>
                                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">CA généré</TableHead>
                                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Coût revient global</TableHead>
                                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Marge totale</TableHead>
                                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Marge moyenne %</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topByMarge.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="text-center text-muted-foreground py-8"
                                            >
                                                Aucune donnée disponible
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        topByMarge.slice(0, 10).map((bougie) => (
                                            <TableRow
                                                key={bougie.bougieId}
                                                className="hover:bg-[var(--medicandle-beige)]/30"
                                            >
                                                <TableCell className="font-medium">
                                                    {bougie.bougieName}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatEuro(bougie.caGenere)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatEuro(bougie.coutRevientGlobal)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatEuro(bougie.margeTotale)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {bougie.margeMoyenne.toFixed(1)}%
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="faibles" className="space-y-4">
                        <div className="rounded-md border border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)]">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-[var(--medicandle-beige)]/50">
                                        <TableHead className="text-[var(--medicandle-dark-brown)]">Nom</TableHead>
                                        <TableHead className="text-[var(--medicandle-dark-brown)]">Collection</TableHead>
                                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Quantité vendue</TableHead>
                                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">CA généré</TableHead>
                                        <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Marge totale</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {faibles.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="text-center text-muted-foreground py-8"
                                            >
                                                Aucune bougie faible identifiée
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        faibles.map((bougie) => (
                                            <TableRow
                                                key={bougie.bougieId}
                                                className="hover:bg-[var(--medicandle-beige)]/30"
                                            >
                                                <TableCell className="font-medium">
                                                    {bougie.bougieName}
                                                </TableCell>
                                                <TableCell>{bougie.collection || "—"}</TableCell>
                                                <TableCell className="text-right">
                                                    {bougie.quantiteVendue}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatEuro(bougie.caGenere)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatEuro(bougie.margeTotale)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

