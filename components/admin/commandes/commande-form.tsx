"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createCommande, updateCommande } from "../actions"
import { ArrowLeft, AlertCircle, Plus } from "lucide-react"
import Link from "next/link"
import { Commande, Client } from "@prisma/client"

export function CommandeForm({
    commande,
    clients,
}: {
    commande?: Commande
    clients: Client[]
}) {
    const isEditMode = !!commande
    const [clientId, setClientId] = useState(commande?.clientId || "none")
    const [state, formAction] = useActionState(
        isEditMode
            ? (prevState: { error?: string } | null, formData: FormData) =>
                  updateCommande(commande.id, prevState, formData)
            : createCommande,
        null
    )

    return (
        <form action={formAction}>
            <input type="hidden" name="clientId" value={clientId === "none" ? "" : clientId} />
            {state?.error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                        <p className="text-sm text-red-700 mt-1">{state.error}</p>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>
                        {isEditMode ? "Modifier la commande" : "Nouvelle commande"}
                    </CardTitle>
                    <CardDescription>
                        {isEditMode
                            ? "Modifiez les informations de la commande"
                            : "Créez une nouvelle commande"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="clientId">Client</Label>
                        <div className="flex gap-2">
                            <Select value={clientId} onValueChange={setClientId}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Sélectionner un client" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Aucun client</SelectItem>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.prenom
                                                ? `${client.prenom} ${client.nom}`
                                                : client.nom}
                                            {client.raisonSociale && ` - ${client.raisonSociale}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="button" variant="outline" size="icon" asChild>
                                <Link href="/bo/clients/nouveau">
                                    <Plus className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="dateCommande">Date de commande</Label>
                            <Input
                                id="dateCommande"
                                name="dateCommande"
                                type="date"
                                defaultValue={
                                    commande?.dateCommande
                                        ? new Date(commande.dateCommande).toISOString().split("T")[0]
                                        : new Date().toISOString().split("T")[0]
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateLivraisonSouhaitee">Date de livraison souhaitée</Label>
                            <Input
                                id="dateLivraisonSouhaitee"
                                name="dateLivraisonSouhaitee"
                                type="date"
                                defaultValue={
                                    commande?.dateLivraisonSouhaitee
                                        ? new Date(commande.dateLivraisonSouhaitee)
                                              .toISOString()
                                              .split("T")[0]
                                        : ""
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="commentaireInterne">Commentaire interne</Label>
                        <Textarea
                            id="commentaireInterne"
                            name="commentaireInterne"
                            rows={3}
                            defaultValue={commande?.commentaireInterne || ""}
                            placeholder="Notes internes pour cette commande"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="commentaireClient">Commentaire client</Label>
                        <Textarea
                            id="commentaireClient"
                            name="commentaireClient"
                            rows={3}
                            defaultValue={commande?.commentaireClient || ""}
                            placeholder="Commentaires du client"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit">{isEditMode ? "Modifier" : "Créer"}</Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/bo/commandes">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}

