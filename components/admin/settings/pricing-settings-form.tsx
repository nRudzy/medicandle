"use client"

import { PricingSettings } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updatePricingSettings } from "../actions"
import { Save } from "lucide-react"

export function PricingSettingsForm({
    settings,
}: {
    settings: PricingSettings | null
}) {
    return (
        <form action={updatePricingSettings}>
            <Card>
                <CardHeader>
                    <CardTitle>Paramètres de prix</CardTitle>
                    <CardDescription>
                        Configurez les multiplicateurs de prix par positionnement
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="targetMargin">
                            Marge cible (%)
                        </Label>
                        <Input
                            id="targetMargin"
                            name="targetMargin"
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            defaultValue={settings?.targetMargin ?? 50}
                            className="max-w-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Objectif de marge globale en pourcentage
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="multiplierEntry">
                                Multiplicateur Entrée de gamme *
                            </Label>
                            <Input
                                id="multiplierEntry"
                                name="multiplierEntry"
                                type="number"
                                step="0.1"
                                min="1"
                                defaultValue={settings?.multiplierEntry ?? 2.5}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Ex: 2.5 → Prix = Coût × 2.5
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="multiplierPremium">
                                Multiplicateur Premium *
                            </Label>
                            <Input
                                id="multiplierPremium"
                                name="multiplierPremium"
                                type="number"
                                step="0.1"
                                min="1"
                                defaultValue={settings?.multiplierPremium ?? 3.0}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Positionnement moyen-haut
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="multiplierLuxury">
                                Multiplicateur Luxe *
                            </Label>
                            <Input
                                id="multiplierLuxury"
                                name="multiplierLuxury"
                                type="number"
                                step="0.1"
                                min="1"
                                defaultValue={settings?.multiplierLuxury ?? 4.0}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Haut de gamme
                            </p>
                        </div>
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
