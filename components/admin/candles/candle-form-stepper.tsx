"use client"

import { useState, useActionState, useTransition } from "react"
import { Material, MaterialType, Unit, Positioning } from "@prisma/client"
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
import { createCandle, updateCandle } from "../actions"
import { ArrowLeft, Plus, Trash2, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const positioningOptions: { value: Positioning; label: string }[] = [
    { value: "ENTRY", label: "Entrée de gamme" },
    { value: "PREMIUM", label: "Premium" },
    { value: "LUXURY", label: "Luxe" },
]

const materialTypeLabels: Record<MaterialType, string> = {
    WAX: "Cire",
    SCENT: "Parfum",
    WICK: "Mèche",
    CONTAINER: "Contenant",
    DYE: "Colorant",
    ACCESSORY: "Accessoire",
    PACKAGING: "Emballage",
    OTHER: "Autre",
}

const unitLabels: Record<Unit, string> = {
    G: "g",
    KG: "kg",
    ML: "ml",
    L: "L",
    PIECE: "pièce",
}

type RecipeMaterial = {
    materialId: string
    quantity: number
    unit: Unit
}

type CandleFormData = {
    // Step 1: Informations
    name: string
    format: string
    category: string
    positioning: Positioning | ""
    shortDesc: string
    longDesc: string
    
    // Step 2: Recette
    materials: RecipeMaterial[]
    
    // Step 3: Production
    prepTimeMinutes: number | ""
    heatingTimeMinutes: number | ""
    
    // Step 4: Prix
    currentPrice: number | ""
}

const STEPS = [
    { id: 1, title: "Informations", description: "Détails de base" },
    { id: 2, title: "Recette", description: "Matières premières" },
    { id: 3, title: "Production", description: "Temps de production" },
    { id: 4, title: "Prix", description: "Prix de vente" },
] as const

type CandleWithRelations = {
    id: string
    name: string
    format: string | null
    category: string | null
    positioning: Positioning | null
    shortDesc: string | null
    longDesc: string | null
    currentPrice: number | null
    materials: Array<{
        materialId: string
        quantity: number
        unit: Unit
        material: {
            id: string
        }
    }>
    productionParams: {
        prepTimeMinutes: number
        heatingTimeMinutes: number | null
    } | null
}

export function CandleFormStepper({
    materials,
    candle,
}: {
    materials: Material[]
    candle?: CandleWithRelations
}) {
    const isEditMode = !!candle
    const [state, formAction] = useActionState(
        isEditMode 
            ? (prevState: { error?: string } | null, formData: FormData) => updateCandle(candle.id, prevState, formData)
            : createCandle,
        null
    )
    const [isPending, startTransition] = useTransition()
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<CandleFormData>({
        name: candle?.name || "",
        format: candle?.format || "",
        category: candle?.category || "",
        positioning: candle?.positioning || "",
        shortDesc: candle?.shortDesc || "",
        longDesc: candle?.longDesc || "",
        materials: candle?.materials?.map((cm) => ({
            materialId: cm.materialId,
            quantity: cm.quantity,
            unit: cm.unit,
        })) || [],
        prepTimeMinutes: candle?.productionParams?.prepTimeMinutes || "",
        heatingTimeMinutes: candle?.productionParams?.heatingTimeMinutes || "",
        currentPrice: candle?.currentPrice || "",
    })

    const updateField = <K extends keyof CandleFormData>(
        field: K,
        value: CandleFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const addMaterial = () => {
        setFormData((prev) => ({
            ...prev,
            materials: [...prev.materials, { materialId: "", quantity: 0, unit: "G" }],
        }))
    }

    const removeMaterial = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            materials: prev.materials.filter((_, i) => i !== index),
        }))
    }

    const updateMaterial = (index: number, field: keyof RecipeMaterial, value: any) => {
        setFormData((prev) => {
            const updated = [...prev.materials]
            updated[index] = { ...updated[index], [field]: value }
            return { ...prev, materials: updated }
        })
    }

    const validateStep = (step: number): string | null => {
        switch (step) {
            case 1:
                if (!formData.name.trim()) {
                    return "Le nom de la bougie est requis"
                }
                return null
            case 2:
                if (formData.materials.length === 0) {
                    return "Au moins une matière première est requise"
                }
                for (let i = 0; i < formData.materials.length; i++) {
                    const m = formData.materials[i]
                    if (!m.materialId) {
                        return `La matière ${i + 1} doit être sélectionnée`
                    }
                    if (!m.quantity || m.quantity <= 0) {
                        return `La quantité pour la matière ${i + 1} doit être positive`
                    }
                }
                return null
            case 3:
                if (formData.prepTimeMinutes === "" || formData.prepTimeMinutes <= 0) {
                    return "Le temps de préparation est requis et doit être positif"
                }
                return null
            case 4:
                // Prix est optionnel, pas de validation
                return null
            default:
                return null
        }
    }

    const handleNext = () => {
        const error = validateStep(currentStep)
        if (error) {
            alert(error)
            return
        }
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validate all steps
        for (let step = 1; step <= STEPS.length; step++) {
            const error = validateStep(step)
            if (error) {
                alert(`Erreur à l'étape ${step}: ${error}`)
                setCurrentStep(step)
                return
            }
        }

        // Create FormData with all merged data
        const submitFormData = new FormData()
        submitFormData.append("name", formData.name)
        submitFormData.append("format", formData.format)
        submitFormData.append("category", formData.category)
        if (formData.positioning) {
            submitFormData.append("positioning", formData.positioning)
        }
        submitFormData.append("shortDesc", formData.shortDesc)
        submitFormData.append("longDesc", formData.longDesc)
        submitFormData.append("prepTimeMinutes", String(formData.prepTimeMinutes))
        if (formData.heatingTimeMinutes) {
            submitFormData.append("heatingTimeMinutes", String(formData.heatingTimeMinutes))
        }
        if (formData.currentPrice) {
            submitFormData.append("currentPrice", String(formData.currentPrice))
        }

        // Add materials
        formData.materials.forEach((m, index) => {
            submitFormData.append(`materials[${index}].materialId`, m.materialId)
            submitFormData.append(`materials[${index}].quantity`, String(m.quantity))
            submitFormData.append(`materials[${index}].unit`, m.unit)
        })

        // Submit using startTransition to avoid NEXT_REDIRECT error
        startTransition(() => {
            formAction(submitFormData)
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
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nom *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => updateField("name", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="format">Format</Label>
                                        <Input
                                            id="format"
                                            value={formData.format}
                                            onChange={(e) => updateField("format", e.target.value)}
                                            placeholder="Ex: 180g, 250g 3 mèches"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Collection / Catégorie</Label>
                                        <Input
                                            id="category"
                                            value={formData.category}
                                            onChange={(e) => updateField("category", e.target.value)}
                                            placeholder="Ex: Florale, Boisée, Gourmande"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="positioning">Positionnement</Label>
                                        <Select
                                            value={formData.positioning}
                                            onValueChange={(value) =>
                                                updateField("positioning", value as Positioning)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Sélectionner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {positioningOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shortDesc">Description courte</Label>
                                    <Input
                                        id="shortDesc"
                                        value={formData.shortDesc}
                                        onChange={(e) => updateField("shortDesc", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longDesc">Description détaillée</Label>
                                    <Textarea
                                        id="longDesc"
                                        value={formData.longDesc}
                                        onChange={(e) => updateField("longDesc", e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </>
                        )}

                        {/* Step 2: Recette */}
                        {currentStep === 2 && (
                            <>
                                {formData.materials.map((rm, index) => (
                                    <div key={index} className="grid gap-3 sm:grid-cols-12 items-end">
                                        <div className="sm:col-span-5 space-y-2">
                                            <Label>Matière *</Label>
                                            <Select
                                                value={rm.materialId}
                                                onValueChange={(value) =>
                                                    updateMaterial(index, "materialId", value)
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Sélectionner" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {materials.map((material) => (
                                                        <SelectItem key={material.id} value={material.id}>
                                                            {material.name} ({materialTypeLabels[material.type]})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="sm:col-span-3 space-y-2">
                                            <Label>Quantité *</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={rm.quantity}
                                                onChange={(e) =>
                                                    updateMaterial(
                                                        index,
                                                        "quantity",
                                                        parseFloat(e.target.value) || 0
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="sm:col-span-3 space-y-2">
                                            <Label>Unité</Label>
                                            <Select
                                                value={rm.unit}
                                                onValueChange={(value) =>
                                                    updateMaterial(index, "unit", value as Unit)
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(unitLabels).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeMaterial(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={addMaterial}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter une matière
                                </Button>
                            </>
                        )}

                        {/* Step 3: Production */}
                        {currentStep === 3 && (
                            <>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="prepTimeMinutes">
                                            Temps de préparation (minutes) *
                                        </Label>
                                        <Input
                                            id="prepTimeMinutes"
                                            type="number"
                                            min="0"
                                            value={formData.prepTimeMinutes}
                                            onChange={(e) =>
                                                updateField(
                                                    "prepTimeMinutes",
                                                    e.target.value ? parseInt(e.target.value) : ""
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="heatingTimeMinutes">
                                            Temps de chauffe (minutes)
                                        </Label>
                                        <Input
                                            id="heatingTimeMinutes"
                                            type="number"
                                            min="0"
                                            value={formData.heatingTimeMinutes}
                                            onChange={(e) =>
                                                updateField(
                                                    "heatingTimeMinutes",
                                                    e.target.value ? parseInt(e.target.value) : ""
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Step 4: Prix */}
                        {currentStep === 4 && (
                            <>
                                <div className="space-y-2 max-w-sm">
                                    <Label htmlFor="currentPrice">Prix de vente (€)</Label>
                                    <Input
                                        id="currentPrice"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.currentPrice}
                                        onChange={(e) =>
                                            updateField(
                                                "currentPrice",
                                                e.target.value ? parseFloat(e.target.value) : ""
                                            )
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Le prix conseillé sera calculé en fonction du coût et du positionnement
                                    </p>
                                </div>
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
                                {isPending 
                                    ? (isEditMode ? "Modification en cours..." : "Création en cours...")
                                    : (isEditMode ? "Modifier la bougie" : "Créer la bougie")
                                }
                            </Button>
                        )}
                        <Button type="button" variant="outline" asChild>
                            <Link href="/bo/bougies">
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

