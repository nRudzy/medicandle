import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CommandeStatutSelector } from "@/components/admin/commandes/commande-statut-selector"
import { CommandeLignesEditor } from "@/components/admin/commandes/commande-lignes-editor"
import { CommandeFeasibilityAnalysis } from "@/components/admin/commandes/commande-feasibility-analysis"
import { analyzeCommandeFeasibility, generateBonDeCommandeMatieres } from "@/components/admin/actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"

async function GenerateBonDeCommandeButton({ commandeId }: { commandeId: string }) {
    async function handleGenerate() {
        "use server"
        const result = await generateBonDeCommandeMatieres([commandeId])
        if (result.bonId) {
            redirect(`/bo/bons-de-commande/${result.bonId}`)
        }
    }

    return (
        <form action={handleGenerate}>
            <Button type="submit">
                Générer un bon de commande matières premières
            </Button>
        </form>
    )
}

export default async function CommandeDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const commande = await prisma.commande.findUnique({
        where: { id },
        include: {
            client: true,
            lignes: {
                include: {
                    bougie: true,
                    supplements: {
                        include: {
                            matierePremiere: true
                        }
                    }
                },
            },
        },
    })

    if (!commande) {
        notFound()
    }

    const candles = await prisma.candle.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
    })

    const feasibility = await analyzeCommandeFeasibility(id)

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("fr-FR")
    }

    const formatEuro = (amount: number | null) => {
        if (amount === null) return "—"
        return `${amount.toFixed(2)} €`
    }

    const materials = await prisma.material.findMany({
        orderBy: { name: "asc" },
    })

    const isCompleted = commande.statut === "TERMINEE"

    return (
        <div className="max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{commande.reference}</h1>
                    <p className="text-muted-foreground mt-1">
                        {commande.client
                            ? commande.client.prenom
                                ? `${commande.client.prenom} ${commande.client.nom}`
                                : commande.client.raisonSociale || commande.client.nom
                            : "Sans client"}
                    </p>
                </div>
                <div className="flex gap-2">
                    {!isCompleted && (
                        <Button variant="outline" asChild>
                            <Link href={`/bo/commandes/${commande.id}/modifier`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                            </Link>
                        </Button>
                    )}
                    <Button variant="outline" asChild>
                        <Link href="/bo/commandes">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="infos" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="infos">Informations</TabsTrigger>
                    <TabsTrigger value="lignes">Lignes de commande</TabsTrigger>
                    <TabsTrigger value="analyse">Analyse stock</TabsTrigger>
                </TabsList>

                <TabsContent value="infos" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations générales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Statut
                                    </p>
                                    <div className="mt-1">
                                        <CommandeStatutSelector
                                            commandeId={commande.id}
                                            currentStatut={commande.statut}
                                            isFeasible={feasibility.isFeasible}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Date de commande
                                    </p>
                                    <p className="text-sm">{formatDate(commande.dateCommande)}</p>
                                </div>
                            </div>

                            {commande.dateLivraisonSouhaitee && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Date de livraison souhaitée
                                    </p>
                                    <p className="text-sm">
                                        {formatDate(commande.dateLivraisonSouhaitee)}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Montant total estimé
                                </p>
                                <p className="text-sm font-medium">
                                    {formatEuro(commande.montantTotalEstime)}
                                </p>
                            </div>

                            {commande.commentaireInterne && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Commentaire interne
                                    </p>
                                    <p className="text-sm">{commande.commentaireInterne}</p>
                                </div>
                            )}

                            {commande.commentaireClient && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Commentaire client
                                    </p>
                                    <p className="text-sm">{commande.commentaireClient}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="lignes" className="space-y-4">
                    <CommandeLignesEditor
                        commandeId={commande.id}
                        lignes={commande.lignes}
                        candles={candles}
                        materials={materials}
                    />
                </TabsContent>

                <TabsContent value="analyse" className="space-y-4">
                    <CommandeFeasibilityAnalysis
                        isFeasible={feasibility.isFeasible}
                        materials={feasibility.materials}
                        missingMaterials={feasibility.missingMaterials}
                    />

                    {!feasibility.isFeasible && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <GenerateBonDeCommandeButton commandeId={id} />
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
