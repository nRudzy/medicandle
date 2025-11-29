import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Flame, TrendingUp, AlertCircle } from "lucide-react"

export default async function BackOfficePage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    // Fetch stats
    const [materialsCount, candlesCount, lowStockMaterials] = await Promise.all([
        prisma.material.count(),
        prisma.candle.count({ where: { active: true } }),
        prisma.material.findMany({
            where: {
                AND: [
                    { currentStock: { not: null } },
                    { currentStock: { lt: 5 } }
                ]
            },
            take: 5,
            orderBy: { currentStock: 'asc' }
        })
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                <p className="text-muted-foreground mt-1">
                    Bienvenue, {session.user?.name || session.user?.email}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Matières premières
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{materialsCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Matières en inventaire
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Bougies actives
                        </CardTitle>
                        <Flame className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{candlesCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Produits disponibles
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Performance
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">—</div>
                        <p className="text-xs text-muted-foreground">
                            Marge moyenne
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts */}
            {lowStockMaterials.length > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-900">
                            <AlertCircle className="h-5 w-5" />
                            Alertes stock
                        </CardTitle>
                        <CardDescription className="text-amber-700">
                            Matières premières avec stock faible
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {lowStockMaterials.map((material) => (
                                <li key={material.id} className="text-sm text-amber-900">
                                    <span className="font-medium">{material.name}</span>
                                    {" — "}
                                    <span className="text-amber-700">
                                        Stock: {material.currentStock} {material.unit.toLowerCase()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Démarrage rapide</CardTitle>
                    <CardDescription>
                        Commencez par ces actions courantes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <a
                            href="/bo/matieres/nouveau"
                            className="flex items-center gap-3 rounded-lg border p-4 hover:bg-stone-50 transition"
                        >
                            <Package className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <div className="font-medium">Ajouter une matière</div>
                                <div className="text-sm text-muted-foreground">
                                    Nouvelle matière première
                                </div>
                            </div>
                        </a>
                        <a
                            href="/bo/bougies/nouveau"
                            className="flex items-center gap-3 rounded-lg border p-4 hover:bg-stone-50 transition"
                        >
                            <Flame className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <div className="font-medium">Créer une bougie</div>
                                <div className="text-sm text-muted-foreground">
                                    Nouveau produit
                                </div>
                            </div>
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
