import { prisma } from "@/lib/prisma"
import { ProductionSettingsForm } from "@/components/admin/settings/production-settings-form"
import { PricingSettingsForm } from "@/components/admin/settings/pricing-settings-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function SettingsPage() {
    // Get the most recent active settings
    const productionSettings = await prisma.productionSettings.findFirst({
        where: {
            OR: [
                { validTo: null },
                { validTo: { gte: new Date() } }
            ]
        },
        orderBy: { validFrom: 'desc' }
    })

    const pricingSettings = await prisma.pricingSettings.findFirst({
        where: {
            OR: [
                { validTo: null },
                { validTo: { gte: new Date() } }
            ]
        },
        orderBy: { validFrom: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
                <p className="text-muted-foreground mt-1">
                    Configurez les paramètres globaux de production et de prix
                </p>
            </div>

            <Tabs defaultValue="production" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="production">Production</TabsTrigger>
                    <TabsTrigger value="pricing">Prix & Marges</TabsTrigger>
                </TabsList>

                <TabsContent value="production" className="space-y-4">
                    <ProductionSettingsForm settings={productionSettings} />
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                    <PricingSettingsForm settings={pricingSettings} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
