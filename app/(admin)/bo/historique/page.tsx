import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function HistoriquePage() {
    const session = await auth()
    if (!session) redirect("/login")

    const movements = await prisma.stockMovement.findMany({
        orderBy: { date: 'desc' },
        include: { matierePremiere: true },
        take: 100
    })

    const transactions = await prisma.financialTransaction.findMany({
        orderBy: { date: 'desc' },
        take: 100
    })

    const formatEuro = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Historique</h1>
                <p className="text-muted-foreground mt-1">
                    Journal des mouvements de stock et transactions financières
                </p>
            </div>

            <Tabs defaultValue="stock" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="stock">Mouvements de Stock</TabsTrigger>
                    <TabsTrigger value="finance">Journal Financier</TabsTrigger>
                </TabsList>

                <TabsContent value="stock" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Derniers mouvements de stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Matière</TableHead>
                                        <TableHead>Quantité</TableHead>
                                        <TableHead>Coût Est.</TableHead>
                                        <TableHead>Source</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {movements.map(m => (
                                        <TableRow key={m.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(m.date, "dd/MM/yyyy HH:mm", { locale: fr })}
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                    {m.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-medium">{m.matierePremiere.name}</TableCell>
                                            <TableCell className={m.quantiteDelta > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                                {m.quantiteDelta > 0 ? "+" : ""}{m.quantiteDelta} {m.unite}
                                            </TableCell>
                                            <TableCell>
                                                {m.valeurDelta ? formatEuro(Math.abs(m.valeurDelta)) : "-"}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {m.sourceType}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {movements.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                                Aucun mouvement enregistré
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="finance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Journal Financier</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Montant</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Catégorie</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(t.date, "dd/MM/yyyy HH:mm", { locale: fr })}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${t.montant > 0
                                                        ? "bg-green-50 text-green-700 ring-green-600/20"
                                                        : "bg-red-50 text-red-700 ring-red-600/20"
                                                    }`}>
                                                    {t.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className={t.montant > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                                {t.montant > 0 ? "+" : ""}{formatEuro(t.montant)}
                                            </TableCell>
                                            <TableCell>{t.description}</TableCell>
                                            <TableCell>{t.categorie}</TableCell>
                                        </TableRow>
                                    ))}
                                    {transactions.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                                Aucune transaction enregistrée
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
