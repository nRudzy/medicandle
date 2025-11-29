"use client"

import { useState, useActionState, useTransition } from "react"
import { Client, Candle, CommandeStatut } from "@prisma/client"
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
import { createCommande, addCommandeLigne } from "../actions"
import { ArrowLeft, Plus, Trash2, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

type CommandeLigneData = {
    bougieId: string
    quantite: number
    prixUnitaireUtilise: number | ""
    remisePourcentage: number | ""
    remiseMontant: number | ""
    notes: string
}

type CommandeFormData = {
    // Step 1: Informations générales
    clientId: string
    dateCommande: string
    dateLivraisonSouhaitee: string
    commentaireInterne: string
    commentaireClient: string
    
    // Step 2: Lignes de commande
    lignes: CommandeLigneData[]
}

const STEPS = [
    { id: 1, title: "Informations", description: "Client et dates" },
    { id: 2, title: "Lignes de commande", description: "Bougies commandées" },
] as const

export function CommandeFormStepper({
    clients,
    candles,
}: {
    clients: Client[]
    candles: Candle[]
}) {
    const router = useRouter()
    const [state, formAction] = useActionState(createCommande, null)
    const [isPending, startTransition] = useTransition()
    const [currentStep, setCurrentStep] = useState(1)
    const [commandeId, setCommandeId] = useState<string | null>(null)
    const [formData, setFormData] = useState<CommandeFormData>({
        clientId: "none",
        dateCommande: new Date().toISOString().split("T")[0],
        dateLivraisonSouhaitee: "",
        commentaireInterne: "",
        commentaireClient: "",
        lignes: [],
    })

    const updateField = <K extends keyof CommandeFormData>(
        field: K,
        value: CommandeFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const addLigne = () => {
        setFormData((prev) => ({
            ...prev,
            lignes: [
                ...prev.lignes,
                {
                    bougieId: "",
                    quantite: 1,
                    prixUnitaireUtilise: "",
                    remisePourcentage: "",
                    remiseMontant: "",
                    notes: "",
                },
            ],
        }))
    }

    const removeLigne = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            lignes: prev.lignes.filter((_, i) => i !== index),
        }))
    }

    const updateLigne = (index: number, field: keyof CommandeLigneData, value: any) => {
        setFormData((prev) => {
            const updated = [...prev.lignes]
            updated[index] = { ...updated[index], [field]: value }
            return { ...prev, lignes: updated }
        })
    }

    const handleNext = () => {
        if (currentStep === 1) {
            // Validate step 1
            if (!formData.dateCommande) {
                return
            }
        } else if (currentStep === 2) {
            // Validate step 2
            if (formData.lignes.length === 0) {
                return
            }
            for (const ligne of formData.lignes) {
                if (!ligne.bougieId || ligne.quantite <= 0) {
                    return
                }
            }
        }
        setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
    }

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (currentStep < STEPS.length) {
            handleNext()
            return
        }

        // Step 2: Create commande with all lignes in one go
        const submitFormData = new FormData()
        submitFormData.append("clientId", formData.clientId === "none" ? "" : formData.clientId)
        submitFormData.append("dateCommande", formData.dateCommande)
        if (formData.dateLivraisonSouhaitee) {
            submitFormData.append("dateLivraisonSouhaitee", formData.dateLivraisonSouhaitee)
        }
        if (formData.commentaireInterne) {
            submitFormData.append("commentaireInterne", formData.commentaireInterne)
        }
        if (formData.commentaireClient) {
            submitFormData.append("commentaireClient", formData.commentaireClient)
        }

        // Add lignes to form data
        formData.lignes.forEach((ligne, index) => {
            submitFormData.append(`lignes[${index}].bougieId`, ligne.bougieId)
            submitFormData.append(`lignes[${index}].quantite`, ligne.quantite.toString())
            if (ligne.prixUnitaireUtilise) {
                submitFormData.append(`lignes[${index}].prixUnitaireUtilise`, ligne.prixUnitaireUtilise.toString())
            }
            if (ligne.remisePourcentage) {
                submitFormData.append(`lignes[${index}].remisePourcentage`, ligne.remisePourcentage.toString())
            }
            if (ligne.remiseMontant) {
                submitFormData.append(`lignes[${index}].remiseMontant`, ligne.remiseMontant.toString())
            }
            if (ligne.notes) {
                submitFormData.append(`lignes[${index}].notes`, ligne.notes)
            }
        })

        startTransition(async () => {
            await formAction(submitFormData)
        })
    }

    return (
        <div className="space-y-6">
            {state?.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                        <p className="text-sm text-red-700 mt-1">{state.error}</p>
                    </div>
                </div>
            )}

            {/* Stepper Header */}
            <div className="flex items-center justify-between">
                {STEPS.map((step, index) => (
                    <div key={step.id} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                                    currentStep > step.id
                                        ? "bg-green-500 border-green-500 text-white"
                                        : currentStep === step.id
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : "bg-background border-muted text-muted-foreground"
                                )}
                            >
                                {currentStep > step.id ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                    <span>{step.id}</span>
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <p
                                    className={cn(
                                        "text-sm font-medium",
                                        currentStep >= step.id
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {step.title}
                                </p>
                                <p className="text-xs text-muted-foreground">{step.description}</p>
                            </div>
                        </div>
                        {index < STEPS.length - 1 && (
                            <div
                                className={cn(
                                    "h-0.5 flex-1 mx-2",
                                    currentStep > step.id ? "bg-green-500" : "bg-muted-foreground"
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Étape {currentStep} : {STEPS[currentStep - 1].title}</CardTitle>
                        <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Step 1: Informations */}
                        {currentStep === 1 && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="clientId">Client</Label>
                                    <div className="flex gap-2">
                                        <Select
                                            value={formData.clientId}
                                            onValueChange={(value) => updateField("clientId", value)}
                                        >
                                            <SelectTrigger className="w-full">
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
                                        <Label htmlFor="dateCommande">Date de commande *</Label>
                                        <Input
                                            id="dateCommande"
                                            name="dateCommande"
                                            type="date"
                                            value={formData.dateCommande}
                                            onChange={(e) => updateField("dateCommande", e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dateLivraisonSouhaitee">Date de livraison souhaitée</Label>
                                        <Input
                                            id="dateLivraisonSouhaitee"
                                            name="dateLivraisonSouhaitee"
                                            type="date"
                                            value={formData.dateLivraisonSouhaitee}
                                            onChange={(e) => updateField("dateLivraisonSouhaitee", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="commentaireInterne">Commentaire interne</Label>
                                    <Textarea
                                        id="commentaireInterne"
                                        name="commentaireInterne"
                                        rows={3}
                                        value={formData.commentaireInterne}
                                        onChange={(e) => updateField("commentaireInterne", e.target.value)}
                                        placeholder="Notes internes pour cette commande"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="commentaireClient">Commentaire client</Label>
                                    <Textarea
                                        id="commentaireClient"
                                        name="commentaireClient"
                                        rows={3}
                                        value={formData.commentaireClient}
                                        onChange={(e) => updateField("commentaireClient", e.target.value)}
                                        placeholder="Commentaires du client"
                                    />
                                </div>
                            </>
                        )}

                        {/* Step 2: Lignes de commande */}
                        {currentStep === 2 && (
                            <>
                                {formData.lignes.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Aucune ligne de commande. Cliquez sur "Ajouter une ligne" pour commencer.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {formData.lignes.map((ligne, index) => (
                                            <Card key={index}>
                                                <CardContent className="pt-6">
                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label>Bougie *</Label>
                                                            <Select
                                                                value={ligne.bougieId}
                                                                onValueChange={(value) =>
                                                                    updateLigne(index, "bougieId", value)
                                                                }
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Sélectionner une bougie" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {candles.map((candle) => (
                                                                        <SelectItem key={candle.id} value={candle.id}>
                                                                            {candle.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Quantité *</Label>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                value={ligne.quantite}
                                                                onChange={(e) =>
                                                                    updateLigne(
                                                                        index,
                                                                        "quantite",
                                                                        parseInt(e.target.value) || 1
                                                                    )
                                                                }
                                                                required
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Prix unitaire (€)</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={ligne.prixUnitaireUtilise}
                                                                onChange={(e) =>
                                                                    updateLigne(
                                                                        index,
                                                                        "prixUnitaireUtilise",
                                                                        e.target.value ? parseFloat(e.target.value) : ""
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Remise (%)</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={ligne.remisePourcentage}
                                                                onChange={(e) =>
                                                                    updateLigne(
                                                                        index,
                                                                        "remisePourcentage",
                                                                        e.target.value ? parseFloat(e.target.value) : ""
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex justify-end">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeLigne(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                <Button type="button" variant="outline" onClick={addLigne}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter une ligne
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4 justify-between">
                    <div className="flex gap-3">
                        {currentStep > 1 && (
                            <Button type="button" variant="outline" onClick={handlePrevious}>
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Précédent
                            </Button>
                        )}
                        {currentStep < STEPS.length && (
                            <Button type="button" onClick={handleNext}>
                                Suivant
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        {currentStep === STEPS.length && (
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Création en cours..." : "Créer la commande"}
                            </Button>
                        )}
                        <Button type="button" variant="outline" asChild>
                            <Link href="/bo/commandes">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour
                            </Link>
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

