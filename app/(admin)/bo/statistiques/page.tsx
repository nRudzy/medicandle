import { prisma } from "@/lib/prisma"
import { StatistiquesFilters } from "@/components/admin/statistiques/statistiques-filters"
import { KPICards } from "@/components/admin/statistiques/kpi-cards"
import { CACharts } from "@/components/admin/statistiques/ca-charts"
import { TopBougies } from "@/components/admin/statistiques/top-bougies"
import { TopClients } from "@/components/admin/statistiques/top-clients"
import { StatutsRepartition } from "@/components/admin/statistiques/statuts-repartition"
import { VueCustom } from "@/components/admin/statistiques/vue-custom"
import {
    calculateCARealise,
    calculateCAPipeline,
    calculateCAPrevisionnel,
    calculateMargeRealisee,
    getTopBougiesByVolume,
    getTopBougiesByMarge,
    getBougiesFaibles,
    getTopClients,
    getClientStats,
    getStatutsRepartition,
    calculateCAByTimeUnit,
    getStatsCounts,
} from "@/lib/business/statistiques"

export default async function StatistiquesPage({
    searchParams,
}: {
    searchParams: Promise<{
        periode?: string
        dateFrom?: string
        dateTo?: string
        type?: string
        timeUnit?: string
        scope?: string
        scopeValue?: string
    }>
}) {
    const params = await searchParams

    // Parse period filters
    const periode = params.periode || "ce-mois"
    const dateFrom = params.dateFrom ? new Date(params.dateFrom) : undefined
    const dateTo = params.dateTo ? new Date(params.dateTo) : undefined

    // Parse other filters
    const type = params.type || "realise"
    const timeUnit = params.timeUnit || "mois"
    const scope = params.scope || "all"
    const scopeValue = params.scopeValue

    // Build filters object
    const filters = {
        dateFrom,
        dateTo,
        periode,
        scope,
        scopeValue,
    }

    // Calculate all statistics in parallel
    const [
        caRealise,
        caPipeline,
        caPrevisionnel,
        margeRealisee,
        counts,
        topBougiesVolume,
        topBougiesMarge,
        bougiesFaibles,
        topClients,
        clientStats,
        statutsRepartition,
        caByTimeRealise,
        caByTimePipeline,
    ] = await Promise.all([
        calculateCARealise(filters),
        calculateCAPipeline(filters),
        calculateCAPrevisionnel(),
        calculateMargeRealisee(filters),
        getStatsCounts(filters),
        getTopBougiesByVolume(filters),
        getTopBougiesByMarge(filters),
        getBougiesFaibles(filters),
        getTopClients(filters),
        getClientStats(filters),
        getStatutsRepartition(filters),
        calculateCAByTimeUnit(filters, timeUnit, "realise"),
        calculateCAByTimeUnit(filters, timeUnit, "pipeline"),
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
                <p className="text-muted-foreground mt-1">
                    Vision chiffrée de votre activité
                </p>
            </div>

            <StatistiquesFilters />

            <KPICards
                caRealise={caRealise}
                caPipeline={caPipeline}
                caPrevisionnel={caPrevisionnel}
                margeRealisee={margeRealisee}
                counts={counts}
                filters={filters}
            />

            <CACharts
                caByTimeRealise={caByTimeRealise}
                caByTimePipeline={caByTimePipeline}
                caPrevisionnel={caPrevisionnel}
                timeUnit={timeUnit}
            />

            <TopBougies
                topByVolume={topBougiesVolume}
                topByMarge={topBougiesMarge}
                faibles={bougiesFaibles}
            />

            <TopClients topClients={topClients} clientStats={clientStats} />

            <StatutsRepartition repartition={statutsRepartition} />

            <VueCustom filters={filters} />
        </div>
    )
}

