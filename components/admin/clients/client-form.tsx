"use client"

import { useActionState } from "react"
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
import { createClient, updateClient } from "../actions"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Client, ClientType } from "@prisma/client"

export function ClientForm({ client }: { client?: Client }) {
    const isEditMode = !!client
    const [state, formAction] = useActionState(
        isEditMode
            ? (prevState: { error?: string } | null, formData: FormData) =>
                  updateClient(client.id, prevState, formData)
            : createClient,
        null
    )

    return (
        <form action={formAction}>
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
                    <CardTitle>{isEditMode ? "Modifier le client" : "Nouveau client"}</CardTitle>
                    <CardDescription>
                        {isEditMode
                            ? "Modifiez les informations du client"
                            : "Ajoutez un nouveau client à votre base de données"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="typeClient">Type de client</Label>
                            <Select name="typeClient" defaultValue={client?.typeClient || "none"}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Non spécifié</SelectItem>
                                    <SelectItem value="PARTICULIER">Particulier</SelectItem>
                                    <SelectItem value="PROFESSIONNEL">Professionnel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nom">
                                Nom <span className="text-red-500">*</span>
                            </Label>
                            <Input id="nom" name="nom" defaultValue={client?.nom || ""} required />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="prenom">Prénom</Label>
                            <Input id="prenom" name="prenom" defaultValue={client?.prenom || ""} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="raisonSociale">Raison sociale</Label>
                            <Input
                                id="raisonSociale"
                                name="raisonSociale"
                                defaultValue={client?.raisonSociale || ""}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={client?.email || ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="telephone">Téléphone</Label>
                            <Input
                                id="telephone"
                                name="telephone"
                                defaultValue={client?.telephone || ""}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="adresseLigne1">Adresse (ligne 1)</Label>
                        <Input
                            id="adresseLigne1"
                            name="adresseLigne1"
                            defaultValue={client?.adresseLigne1 || ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="adresseLigne2">Adresse (ligne 2)</Label>
                        <Input
                            id="adresseLigne2"
                            name="adresseLigne2"
                            defaultValue={client?.adresseLigne2 || ""}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="codePostal">Code postal</Label>
                            <Input
                                id="codePostal"
                                name="codePostal"
                                defaultValue={client?.codePostal || ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ville">Ville</Label>
                            <Input id="ville" name="ville" defaultValue={client?.ville || ""} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pays">Pays</Label>
                            <Input id="pays" name="pays" defaultValue={client?.pays || "France"} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            defaultValue={client?.notes || ""}
                            placeholder="Préférences parfums, conditions particulières, etc."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit">{isEditMode ? "Modifier" : "Créer"}</Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/bo/clients">
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

