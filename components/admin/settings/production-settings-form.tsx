"use client"

import { ProductionSettings } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateProductionSettings } from "../actions"
import { Save } from "lucide-react"

export function ProductionSettingsForm({
    settings,
}: {
    settings: ProductionSettings | null
}) {
    return (
        <form action={updateProductionSettings}>
            <Card>
                <CardHeader>
                    <CardTitle>Paramètres de production</CardTitle>
                    <CardDescription>
                        Configurez les coûts de production par défaut
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="laborRate">
                                Taux horaire main-d'œuvre (€/h) *
                            </Label>
                            <Input
                                id="laborRate"
                                name="laborRate"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={settings?.laborRate ?? 25}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Coût de la main-d'œuvre par heure
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="electricityCost">
                                Coût électricité (€)
                            </Label>
                            <Input
                                id="electricityCost"
                                name="electricityCost"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={settings?.electricityCost ?? 0.5}
                            />
                            <p className="text-xs text-muted-foreground">
                                Coût par session ou par heure
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amortizationCost">
                            Amortissement matériel (€/bougie)
                        </Label>
                        <Input
                            id="amortizationCost"
                            name="amortizationCost"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={settings?.amortizationCost ?? 0.2}
                            className="max-w-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Coût fixe par bougie pour amortir le matériel
                        </p>
                    </div>

                    <div className="pt-4">
                        <Button type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer les paramètres
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
