import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { CommandeStatut } from "@prisma/client"
import { calculateTotalMaterialCost } from "@/lib/business/materials"
import { calculateProductionCost } from "@/lib/business/production"

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

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const dimension = searchParams.get("dimension") || "bougie"
        const indicateur = searchParams.get("indicateur") || "ca"
        const periode = searchParams.get("periode") || "ce-mois"
        const dateFrom = searchParams.get("dateFrom")
        const dateTo = searchParams.get("dateTo")

        // Calculate period dates
        let periodDates = { dateFrom: undefined as Date | undefined, dateTo: undefined as Date | undefined }
        if (dateFrom && dateTo) {
            periodDates.dateFrom = new Date(dateFrom)
            periodDates.dateTo = new Date(dateTo)
        } else {
            const now = new Date()
            switch (periode) {
                case "ce-mois":
                    periodDates.dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
                    periodDates.dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
                    break
                case "mois-dernier":
                    periodDates.dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                    periodDates.dateTo = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
                    break
                case "cette-annee":
                    periodDates.dateFrom = new Date(now.getFullYear(), 0, 1)
                    periodDates.dateTo = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
                    break
                case "annee-derniere":
                    periodDates.dateFrom = new Date(now.getFullYear() - 1, 0, 1)
                    periodDates.dateTo = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59)
                    break
            }
        }

        const where: any = {
            statut: { in: [CommandeStatut.TERMINEE, CommandeStatut.LIVREE] },
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

        const productionSettings = await prisma.productionSettings.findFirst({
            orderBy: { validFrom: "desc" },
        })

        const dataMap = new Map<string, any>()

        for (const commande of commandes) {
            for (const ligne of commande.lignes) {
                let key: string
                let name: string

                switch (dimension) {
                    case "bougie":
                        key = ligne.bougie.id
                        name = ligne.bougie.name
                        break
                    case "client":
                        key = commande.clientId || "sans-client"
                        name = commande.clientId
                            ? commande.client?.prenom
                                ? `${commande.client.prenom} ${commande.client.nom}`
                                : commande.client?.raisonSociale || commande.client?.nom || "Client"
                            : "Sans client"
                        break
                    case "collection":
                        key = ligne.bougie.category || "sans-collection"
                        name = ligne.bougie.category || "Sans collection"
                        break
                    case "statut":
                        key = commande.statut
                        name = commande.statut
                        break
                    default:
                        continue
                }

                if (!dataMap.has(key)) {
                    dataMap.set(key, {
                        name,
                        ca: 0,
                        quantite: 0,
                        nbCommandes: 0,
                        margeTotale: 0,
                        coutTotal: 0,
                    })
                }

                const item = dataMap.get(key)!
                const ca = calculateLigneMontant(ligne, ligne.bougie)
                item.ca += ca
                item.quantite += ligne.quantite
                item.nbCommandes += 1

                // Calculate cost and margin
                if (productionSettings) {
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
                    const coutTotal = coutParBougie * ligne.quantite
                    item.coutTotal += coutTotal
                    item.margeTotale += ca - coutTotal
                }
            }
        }

        // Convert to array and calculate values
        const data = Array.from(dataMap.values()).map((item) => {
            const margeMoyenne = item.ca > 0 ? (item.margeTotale / item.ca) * 100 : 0

            let value: number
            switch (indicateur) {
                case "ca":
                    value = item.ca
                    break
                case "quantite":
                    value = item.quantite
                    break
                case "nbCommandes":
                    value = item.nbCommandes
                    break
                case "margeTotale":
                    value = item.margeTotale
                    break
                case "margeMoyenne":
                    value = margeMoyenne
                    break
                default:
                    value = item.ca
            }

            return {
                ...item,
                value,
                margeMoyenne,
            }
        })

        // Sort by value descending
        data.sort((a, b) => b.value - a.value)

        return NextResponse.json({ data })
    } catch (error: any) {
        console.error("Error in custom statistics API:", error)
        return NextResponse.json({ error: error.message || "Une erreur s'est produite" }, { status: 500 })
    }
}

