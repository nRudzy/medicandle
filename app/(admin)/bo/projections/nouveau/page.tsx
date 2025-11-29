import { ScenarioForm } from "@/components/admin/projections/scenario-form"
import { prisma } from "@/lib/prisma"

export default async function NewScenarioPage() {
    const candles = await prisma.candle.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
    })

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nouveau scénario</h1>
                <p className="text-muted-foreground mt-1">
                    Créez un scénario de projection de revenus
                </p>
            </div>

            <ScenarioForm candles={candles} />
        </div>
    )
}
