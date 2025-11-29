import { prisma } from "@/lib/prisma"
import { ProjectionScenarioList } from "@/components/admin/projections/scenario-list"
import { QuickSimulation } from "@/components/admin/projections/quick-simulation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function ProjectionsPage() {
    const scenarios = await prisma.projectionScenario.findMany({
        include: {
            items: {
                include: {
                    candle: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    })

    const candles = await prisma.candle.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projections</h1>
                    <p className="text-muted-foreground mt-1">
                        Simulez vos revenus et marges prévisionnels
                    </p>
                </div>
                <Button asChild>
                    <Link href="/bo/projections/nouveau">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau scénario
                    </Link>
                </Button>
            </div>

            <QuickSimulation candles={candles} />

            <ProjectionScenarioList scenarios={scenarios} />
        </div>
    )
}
