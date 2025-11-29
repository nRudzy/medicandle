/**
 * Statistics and analytics calculation functions
 */

import { prisma } from "@/lib/prisma"
import { CommandeStatut } from "@prisma/client"
import { calculateTotalMaterialCost } from "./materials"
import { calculateProductionCost } from "./production"

export interface StatistiquesFilters {
    dateFrom?: Date
    dateTo?: Date
    periode?: string
    scope?: string
    scopeValue?: string
}

export interface CAPrevisionnel {
    caRealiseAnnee: number
    caMoyenMensuel: number
    moisRestants: number
    caAttendu: number
    totalPrevisionnel: number
}

export interface TopBougie {
    bougieId: string
    bougieName: string
    collection?: string | null
    quantiteVendue: number
    caGenere: number
    coutRevientGlobal: number
    margeTotale: number
    margeMoyenne: number
}

export interface TopClient {
    clientId: string
    nom: string
    prenom?: string | null
    raisonSociale?: string | null
    nbCommandes: number
    caCumule: number
    dateDerniereCommande: Date | null
    quantiteTotaleBougies: number
}

export interface ClientStats {
    clientsUniques: number
    clientsMultiCommandes: number
    clientsInactifs: number
}

export interface StatutRepartition {
    statut: CommandeStatut
    nombre: number
    ca?: number
}

export interface CAByTime {
    date: string
    ca: number
}

export interface StatsCounts {
    nbCommandes: number
    nbBougies: number
}

/**
 * Calculate period dates based on periode string
 */
function calculatePeriodDates(periode: string): { dateFrom: Date; dateTo: Date } {
    const now = new Date()
    let dateFrom: Date
    let dateTo: Date

    switch (periode) {
        case "ce-mois":
            dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
            dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
            break
        case "mois-dernier":
            dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            dateTo = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
            break
        case "cette-annee":
            dateFrom = new Date(now.getFullYear(), 0, 1)
            dateTo = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
            break
        case "annee-derniere":
            dateFrom = new Date(now.getFullYear() - 1, 0, 1)
            dateTo = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59)
            break
        default:
            dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
            dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    }

    return { dateFrom, dateTo }
}

/**
 * Build where clause for commandes based on filters
 */
function buildCommandeWhere(filters: StatistiquesFilters, statuts: CommandeStatut[]) {
    const { dateFrom, dateTo, periode, scope, scopeValue } = filters

    let periodDates = { dateFrom, dateTo }
    if (!dateFrom && !dateTo && periode) {
        periodDates = calculatePeriodDates(periode)
    }

    const where: any = {
        statut: { in: statuts },
    }

    if (periodDates.dateFrom || periodDates.dateTo) {
        where.dateCommande = {}
        if (periodDates.dateFrom) {
            where.dateCommande.gte = periodDates.dateFrom
        }
        if (periodDates.dateTo) {
            where.dateCommande.lte = periodDates.dateTo
        }
    }

    if (scope === "client" && scopeValue) {
        where.clientId = scopeValue
    }

    if (scope === "bougie" && scopeValue) {
        where.lignes = {
            some: {
                bougieId: scopeValue,
            },
        }
    }

    if (scope === "collection" && scopeValue) {
        where.lignes = {
            some: {
                bougie: {
                    category: scopeValue,
                },
            },
        }
    }

    return where
}

/**
 * Calculate montant for a commande ligne
 */
function calculateLigneMontant(ligne: any, bougie: any): number {
    if (ligne.montantLigne) {
        return ligne.montantLigne
    }

    const prixUnitaire = ligne.prixUnitaireUtilise || bougie.currentPrice || 0
    const remisePourcentage = ligne.remisePourcentage || 0
    const remiseMontant = ligne.remiseMontant || 0

    const prixApresRemisePourcentage = prixUnitaire * (1 - remisePourcentage / 100)
    const prixFinal = prixApresRemisePourcentage - remiseMontant

    return prixFinal * ligne.quantite
}

/**
 * Calculate CA réalisé (commandes TERMINEE ou LIVREE)
 */
export async function calculateCARealise(filters: StatistiquesFilters): Promise<number> {
    const where = buildCommandeWhere(filters, [CommandeStatut.TERMINEE, CommandeStatut.LIVREE])

    const commandes = await prisma.commande.findMany({
        where,
        include: {
            lignes: {
                include: {
                    bougie: true,
                },
            },
        },
    })

    let total = 0
    for (const commande of commandes) {
        for (const ligne of commande.lignes) {
            total += calculateLigneMontant(ligne, ligne.bougie)
        }
    }

    return total
}

/**
 * Calculate CA pipeline (commandes en cours)
 */
export async function calculateCAPipeline(filters: StatistiquesFilters): Promise<number> {
    const where = buildCommandeWhere(filters, [
        CommandeStatut.EN_ATTENTE_STOCK,
        CommandeStatut.EN_COURS_COMMANDE,
        CommandeStatut.EN_COURS_FABRICATION,
    ])

    const commandes = await prisma.commande.findMany({
        where,
        include: {
            lignes: {
                include: {
                    bougie: true,
                },
            },
        },
    })

    let total = 0
    for (const commande of commandes) {
        for (const ligne of commande.lignes) {
            total += calculateLigneMontant(ligne, ligne.bougie)
        }
    }

    return total
}

/**
 * Calculate CA prévisionnel fin d'année
 */
export async function calculateCAPrevisionnel(): Promise<CAPrevisionnel> {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59)

    // Get CA réalisé cette année
    const caRealiseAnnee = await calculateCARealise({
        dateFrom: startOfYear,
        dateTo: endOfYear,
    })

    // Get last 6 months of realized CA
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)
    const caSixMois = await calculateCARealise({
        dateFrom: sixMonthsAgo,
        dateTo: now,
    })

    // Calculate average monthly CA
    const moisEcoules = Math.max(1, Math.ceil((now.getTime() - sixMonthsAgo.getTime()) / (1000 * 60 * 60 * 24 * 30)))
    const caMoyenMensuel = caSixMois / moisEcoules

    // Calculate remaining months
    const moisRestants = 12 - now.getMonth()
    const caAttendu = caMoyenMensuel * moisRestants
    const totalPrevisionnel = caRealiseAnnee + caAttendu

    return {
        caRealiseAnnee,
        caMoyenMensuel,
        moisRestants,
        caAttendu,
        totalPrevisionnel,
    }
}

/**
 * Calculate realized margin
 */
export async function calculateMargeRealisee(filters: StatistiquesFilters): Promise<number> {
    const where = buildCommandeWhere(filters, [CommandeStatut.TERMINEE, CommandeStatut.LIVREE])

    const commandes = await prisma.commande.findMany({
        where,
        include: {
            lignes: {
                include: {
                    bougie: {
                        include: {
                            materials: {
                                include: {
                                    material: true,
                                },
                            },
                            productionParams: true,
                        },
                    },
                },
            },
        },
    })

    // Get production settings
    const productionSettings = await prisma.productionSettings.findFirst({
        orderBy: { validFrom: "desc" },
    })

    if (!productionSettings) {
        return 0
    }

    let totalCA = 0
    let totalCout = 0

    for (const commande of commandes) {
        for (const ligne of commande.lignes) {
            const ca = calculateLigneMontant(ligne, ligne.bougie)
            totalCA += ca

            // Calculate cost per candle
            const materialCost = calculateTotalMaterialCost(
                ligne.bougie.materials.map((cm: any) => ({
                    material: {
                        id: cm.material.id,
                        costPerUnit: cm.material.costPerUnit,
                        unit: cm.material.unit,
                    },
                    quantity: cm.quantity,
                    unit: cm.unit || cm.material.unit,
                }))
            )

            const productionCost = ligne.bougie.productionParams
                ? calculateProductionCost(
                      {
                          prepTimeMinutes: ligne.bougie.productionParams.prepTimeMinutes,
                          heatingTimeMinutes: ligne.bougie.productionParams.heatingTimeMinutes || undefined,
                      },
                      {
                          laborRate: productionSettings.laborRate,
                          electricityCost: productionSettings.electricityCost,
                          amortizationCost: productionSettings.amortizationCost,
                      }
                  )
                : 0

            const coutParBougie = materialCost + productionCost
            totalCout += coutParBougie * ligne.quantite
        }
    }

    return totalCA - totalCout
}

/**
 * Get top bougies by volume
 */
export async function getTopBougiesByVolume(filters: StatistiquesFilters): Promise<TopBougie[]> {
    const where = buildCommandeWhere(filters, [CommandeStatut.TERMINEE, CommandeStatut.LIVREE])

    const commandes = await prisma.commande.findMany({
        where,
        include: {
            lignes: {
                include: {
                    bougie: {
                        include: {
                            materials: {
                                include: {
                                    material: true,
                                },
                            },
                            productionParams: true,
                        },
                    },
                },
            },
        },
    })

    const bougiesMap = new Map<string, TopBougie>()

    const productionSettings = await prisma.productionSettings.findFirst({
        orderBy: { validFrom: "desc" },
    })

    for (const commande of commandes) {
        for (const ligne of commande.lignes) {
            const bougieId = ligne.bougie.id
            if (!bougiesMap.has(bougieId)) {
                bougiesMap.set(bougieId, {
                    bougieId,
                    bougieName: ligne.bougie.name,
                    collection: ligne.bougie.category,
                    quantiteVendue: 0,
                    caGenere: 0,
                    coutRevientGlobal: 0,
                    margeTotale: 0,
                    margeMoyenne: 0,
                })
            }

            const bougie = bougiesMap.get(bougieId)!
            bougie.quantiteVendue += ligne.quantite

            const ca = calculateLigneMontant(ligne, ligne.bougie)
            bougie.caGenere += ca

            // Calculate cost
            const materialCost = calculateTotalMaterialCost(
                ligne.bougie.materials.map((cm: any) => ({
                    material: {
                        id: cm.material.id,
                        costPerUnit: cm.material.costPerUnit,
                        unit: cm.material.unit,
                    },
                    quantity: cm.quantity,
                    unit: cm.unit || cm.material.unit,
                }))
            )

            const productionCost = ligne.bougie.productionParams && productionSettings
                ? calculateProductionCost(
                      {
                          prepTimeMinutes: ligne.bougie.productionParams.prepTimeMinutes,
                          heatingTimeMinutes: ligne.bougie.productionParams.heatingTimeMinutes || undefined,
                      },
                      {
                          laborRate: productionSettings.laborRate,
                          electricityCost: productionSettings.electricityCost,
                          amortizationCost: productionSettings.amortizationCost,
                      }
                  )
                : 0

            const coutParBougie = materialCost + productionCost
            bougie.coutRevientGlobal += coutParBougie * ligne.quantite
        }
    }

    // Calculate margins
    for (const bougie of bougiesMap.values()) {
        bougie.margeTotale = bougie.caGenere - bougie.coutRevientGlobal
        bougie.margeMoyenne = bougie.caGenere > 0 ? (bougie.margeTotale / bougie.caGenere) * 100 : 0
    }

    return Array.from(bougiesMap.values()).sort((a, b) => b.quantiteVendue - a.quantiteVendue)
}

/**
 * Get top bougies by margin
 */
export async function getTopBougiesByMarge(filters: StatistiquesFilters): Promise<TopBougie[]> {
    const topByVolume = await getTopBougiesByVolume(filters)
    return topByVolume.sort((a, b) => b.margeTotale - a.margeTotale)
}

/**
 * Get weak bougies (low volume and low margin)
 */
export async function getBougiesFaibles(filters: StatistiquesFilters): Promise<TopBougie[]> {
    const allBougies = await getTopBougiesByVolume(filters)
    
    // Filter: low volume (below median) AND low margin (below median)
    const volumes = allBougies.map(b => b.quantiteVendue).sort((a, b) => a - b)
    const marges = allBougies.map(b => b.margeTotale).sort((a, b) => a - b)
    
    const medianVolume = volumes[Math.floor(volumes.length / 2)] || 0
    const medianMarge = marges[Math.floor(marges.length / 2)] || 0
    
    return allBougies.filter(
        b => b.quantiteVendue < medianVolume && b.margeTotale < medianMarge
    ).sort((a, b) => a.quantiteVendue - b.quantiteVendue)
}

/**
 * Get top clients
 */
export async function getTopClients(filters: StatistiquesFilters): Promise<TopClient[]> {
    const where = buildCommandeWhere(filters, [CommandeStatut.TERMINEE, CommandeStatut.LIVREE])

    const commandes = await prisma.commande.findMany({
        where,
        include: {
            client: true,
            lignes: {
                include: {
                    bougie: true,
                },
            },
        },
    })

    const clientsMap = new Map<string, TopClient>()

    for (const commande of commandes) {
        if (!commande.clientId) continue

        const clientId = commande.clientId
        if (!clientsMap.has(clientId)) {
            clientsMap.set(clientId, {
                clientId,
                nom: commande.client.nom,
                prenom: commande.client.prenom,
                raisonSociale: commande.client.raisonSociale,
                nbCommandes: 0,
                caCumule: 0,
                dateDerniereCommande: null,
                quantiteTotaleBougies: 0,
            })
        }

        const client = clientsMap.get(clientId)!
        client.nbCommandes += 1

        if (!client.dateDerniereCommande || commande.dateCommande > client.dateDerniereCommande) {
            client.dateDerniereCommande = commande.dateCommande
        }

        for (const ligne of commande.lignes) {
            client.caCumule += calculateLigneMontant(ligne, ligne.bougie)
            client.quantiteTotaleBougies += ligne.quantite
        }
    }

    return Array.from(clientsMap.values()).sort((a, b) => b.caCumule - a.caCumule)
}

/**
 * Get client statistics
 */
export async function getClientStats(filters: StatistiquesFilters): Promise<ClientStats> {
    const where = buildCommandeWhere(filters, [CommandeStatut.TERMINEE, CommandeStatut.LIVREE])

    const commandes = await prisma.commande.findMany({
        where,
        select: {
            clientId: true,
            dateCommande: true,
        },
    })

    const clientsUniques = new Set(commandes.map(c => c.clientId).filter(Boolean))
    const clientsCommandes = new Map<string, number>()

    for (const commande of commandes) {
        if (!commande.clientId) continue
        clientsCommandes.set(commande.clientId, (clientsCommandes.get(commande.clientId) || 0) + 1)
    }

    const clientsMultiCommandes = Array.from(clientsCommandes.values()).filter(count => count > 1).length

    // Clients inactifs (no command in last 3 months)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    
    const recentCommandes = commandes.filter(c => c.dateCommande >= threeMonthsAgo)
    const recentClients = new Set(recentCommandes.map(c => c.clientId).filter(Boolean))
    const allClients = await prisma.client.findMany({ select: { id: true } })
    const clientsInactifs = allClients.filter(c => !recentClients.has(c.id)).length

    return {
        clientsUniques: clientsUniques.size,
        clientsMultiCommandes,
        clientsInactifs,
    }
}

/**
 * Get statuts répartition
 */
export async function getStatutsRepartition(filters: StatistiquesFilters): Promise<StatutRepartition[]> {
    const { dateFrom, dateTo, periode, scope, scopeValue } = filters

    let periodDates = { dateFrom, dateTo }
    if (!dateFrom && !dateTo && periode) {
        periodDates = calculatePeriodDates(periode)
    }

    const where: any = {}

    if (periodDates.dateFrom || periodDates.dateTo) {
        where.dateCommande = {}
        if (periodDates.dateFrom) {
            where.dateCommande.gte = periodDates.dateFrom
        }
        if (periodDates.dateTo) {
            where.dateCommande.lte = periodDates.dateTo
        }
    }

    if (scope === "client" && scopeValue) {
        where.clientId = scopeValue
    }

    if (scope === "bougie" && scopeValue) {
        where.lignes = {
            some: {
                bougieId: scopeValue,
            },
        }
    }

    if (scope === "collection" && scopeValue) {
        where.lignes = {
            some: {
                bougie: {
                    category: scopeValue,
                },
            },
        }
    }

    const repartition = await prisma.commande.groupBy({
        by: ["statut"],
        where,
        _count: {
            id: true,
        },
    })

    // Get CA for each statut
    const repartitionWithCA = await Promise.all(
        repartition.map(async (item) => {
            const commandes = await prisma.commande.findMany({
                where: {
                    ...where,
                    statut: item.statut,
                },
                include: {
                    lignes: {
                        include: {
                            bougie: true,
                        },
                    },
                },
            })

            let ca = 0
            for (const commande of commandes) {
                for (const ligne of commande.lignes) {
                    ca += calculateLigneMontant(ligne, ligne.bougie)
                }
            }

            return {
                statut: item.statut,
                nombre: item._count.id,
                ca,
            }
        })
    )

    return repartitionWithCA
}

/**
 * Calculate CA by time unit
 */
export async function calculateCAByTimeUnit(
    filters: StatistiquesFilters,
    timeUnit: string,
    type: "realise" | "pipeline"
): Promise<CAByTime[]> {
    const statuts =
        type === "realise"
            ? [CommandeStatut.TERMINEE, CommandeStatut.LIVREE]
            : [CommandeStatut.EN_ATTENTE_STOCK, CommandeStatut.EN_COURS_COMMANDE, CommandeStatut.EN_COURS_FABRICATION]

    const where = buildCommandeWhere(filters, statuts)

    const commandes = await prisma.commande.findMany({
        where,
        include: {
            lignes: {
                include: {
                    bougie: true,
                },
            },
        },
    })

    const caMap = new Map<string, number>()

    for (const commande of commandes) {
        let dateKey: string

        switch (timeUnit) {
            case "jour":
                dateKey = commande.dateCommande.toISOString().split("T")[0]
                break
            case "semaine":
                const weekStart = new Date(commande.dateCommande)
                weekStart.setDate(weekStart.getDate() - weekStart.getDay())
                dateKey = weekStart.toISOString().split("T")[0]
                break
            case "mois":
            default:
                dateKey = `${commande.dateCommande.getFullYear()}-${String(commande.dateCommande.getMonth() + 1).padStart(2, "0")}`
                break
        }

        if (!caMap.has(dateKey)) {
            caMap.set(dateKey, 0)
        }

        for (const ligne of commande.lignes) {
            const ca = calculateLigneMontant(ligne, ligne.bougie)
            caMap.set(dateKey, caMap.get(dateKey)! + ca)
        }
    }

    return Array.from(caMap.entries())
        .map(([date, ca]) => ({ date, ca }))
        .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get counts (commandes and bougies)
 */
export async function getStatsCounts(filters: StatistiquesFilters): Promise<StatsCounts> {
    const where = buildCommandeWhere(filters, [CommandeStatut.TERMINEE, CommandeStatut.LIVREE])

    const [nbCommandes, commandes] = await Promise.all([
        prisma.commande.count({ where }),
        prisma.commande.findMany({
            where,
            include: {
                lignes: true,
            },
        }),
    ])

    const nbBougies = commandes.reduce((total, commande) => {
        return total + commande.lignes.reduce((sum, ligne) => sum + ligne.quantite, 0)
    }, 0)

    return {
        nbCommandes,
        nbBougies,
    }
}

