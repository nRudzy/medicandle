/**
 * Order and stock management functions
 */

import { prisma } from "@/lib/prisma"
import { Unit } from "@prisma/client"

/**
 * Convert quantity to base unit (grams or milliliters)
 */
function convertToBaseUnit(quantity: number, unit: Unit): number {
    switch (unit) {
        case "KG":
            return quantity * 1000 // to grams
        case "L":
            return quantity * 1000 // to milliliters
        case "G":
        case "ML":
        case "PIECE":
        default:
            return quantity
    }
}

/**
 * Convert from base unit to target unit
 */
function convertFromBaseUnit(quantity: number, targetUnit: Unit): number {
    switch (targetUnit) {
        case "KG":
            return quantity / 1000 // from grams
        case "L":
            return quantity / 1000 // from milliliters
        case "G":
        case "ML":
        case "PIECE":
        default:
            return quantity
    }
}

export interface MaterialNeeded {
    materialId: string
    materialName: string
    materialType: string
    materialUnit: Unit
    quantiteNecessaire: number // in material's unit
    stockPhysique: number
    stockReserve: number
    stockDisponible: number
    manque: number
}

/**
 * Calculate materials needed for a commande
 */
export async function calculateMaterialsNeededForCommande(
    commandeId: string
): Promise<MaterialNeeded[]> {
    const commande = await prisma.commande.findUnique({
        where: { id: commandeId },
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
                        },
                    },
                    supplements: {
                        include: {
                            matierePremiere: true
                        }
                    }
                },
            },
        },
    })

    if (!commande) {
        throw new Error("Commande not found")
    }

    // Aggregate materials needed
    const materialsMap = new Map<string, {
        materialId: string
        materialName: string
        materialType: string
        materialUnit: Unit
        totalNeededBase: number // in base unit
    }>()

    for (const ligne of commande.lignes) {
        const quantiteBougies = ligne.quantite

        // 1. Matériaux de la recette (Bougie)
        for (const candleMaterial of ligne.bougie.materials) {
            const material = candleMaterial.material
            const recipeUnit = candleMaterial.unit || material.unit
            const recipeQuantity = candleMaterial.quantity

            // Convert recipe quantity to base unit
            const quantityBase = convertToBaseUnit(recipeQuantity, recipeUnit)
            const totalQuantityBase = quantityBase * quantiteBougies

            const existing = materialsMap.get(material.id)
            if (existing) {
                existing.totalNeededBase += totalQuantityBase
            } else {
                materialsMap.set(material.id, {
                    materialId: material.id,
                    materialName: material.name,
                    materialType: material.type,
                    materialUnit: material.unit,
                    totalNeededBase: totalQuantityBase,
                })
            }
        }

        // 2. Suppléments (Nouveau)
        for (const supplement of ligne.supplements) {
            const material = supplement.matierePremiere
            const suppUnit = supplement.unite || material.unit // Default to material unit if not specified
            const suppQuantity = supplement.quantite // Quantity per Unit or per Line

            let totalSupplementQuantity = 0
            if (supplement.modeQuantite === "PAR_BOUGIE") {
                totalSupplementQuantity = suppQuantity * quantiteBougies
            } else { // PAR_LIGNE
                totalSupplementQuantity = suppQuantity
            }

            // Convert to base unit
            const quantityBase = convertToBaseUnit(totalSupplementQuantity, suppUnit)

            const existing = materialsMap.get(material.id)
            if (existing) {
                existing.totalNeededBase += quantityBase
            } else {
                materialsMap.set(material.id, {
                    materialId: material.id,
                    materialName: material.name,
                    materialType: material.type,
                    materialUnit: material.unit,
                    totalNeededBase: quantityBase,
                })
            }
        }
    }

    // Get current stock for each material
    const materialIds = Array.from(materialsMap.keys())
    const materials = await prisma.material.findMany({
        where: { id: { in: materialIds } },
    })

    const result: MaterialNeeded[] = []

    for (const [materialId, needed] of materialsMap.entries()) {
        const material = materials.find((m) => m.id === materialId)
        if (!material) continue

        const stockPhysique = material.stockPhysique || 0
        const stockReserve = material.stockReserve || 0
        const stockDisponible = stockPhysique - stockReserve

        // Convert needed quantity from base unit to material's unit
        const quantiteNecessaire = convertFromBaseUnit(needed.totalNeededBase, material.unit)

        const manque = Math.max(0, quantiteNecessaire - stockDisponible)

        result.push({
            materialId: material.id,
            materialName: needed.materialName,
            materialType: needed.materialType,
            materialUnit: material.unit,
            quantiteNecessaire,
            stockPhysique,
            stockReserve,
            stockDisponible,
            manque,
        })
    }

    return result
}

/**
 * Check if a commande is feasible with current stock
 */
export async function checkCommandeFeasibility(commandeId: string): Promise<{
    isFeasible: boolean
    materials: MaterialNeeded[]
    missingMaterials: MaterialNeeded[]
}> {
    const materials = await calculateMaterialsNeededForCommande(commandeId)
    const missingMaterials = materials.filter((m) => m.manque > 0)
    const isFeasible = missingMaterials.length === 0

    return {
        isFeasible,
        materials,
        missingMaterials,
    }
}

/**
 * Reserve stock for a commande
 */
export async function reserveStockForCommande(commandeId: string): Promise<void> {
    const materials = await calculateMaterialsNeededForCommande(commandeId)

    for (const material of materials) {
        // Convert needed quantity to base unit for calculation
        const neededBase = convertToBaseUnit(material.quantiteNecessaire, material.materialUnit)

        // Get current material to check stock
        const currentMaterial = await prisma.material.findUnique({
            where: { id: material.materialId },
        })

        if (!currentMaterial) continue

        const stockDisponible = (currentMaterial.stockPhysique || 0) - (currentMaterial.stockReserve || 0)

        if (stockDisponible < material.quantiteNecessaire) {
            throw new Error(
                `Stock insuffisant pour ${material.materialName}. Disponible: ${stockDisponible}, Nécessaire: ${material.quantiteNecessaire}`
            )
        }

        // Update stockReserve
        await prisma.material.update({
            where: { id: material.materialId },
            data: {
                stockReserve: {
                    increment: material.quantiteNecessaire,
                },
            },
        })
    }
}

/**
 * Release reserved stock for a commande
 */
export async function releaseStockForCommande(commandeId: string): Promise<void> {
    const materials = await calculateMaterialsNeededForCommande(commandeId)

    for (const material of materials) {
        await prisma.material.update({
            where: { id: material.materialId },
            data: {
                stockReserve: {
                    decrement: material.quantiteNecessaire,
                },
            },
        })
    }
}

/**
 * Consume stock for a commande (when production is finished)
 */
/**
 * Consume stock for a commande (when production is finished)
 */
import { createStockMovement } from "./stock"
import { StockMovementType, StockMovementSourceType } from "@prisma/client"

export async function consumeStockForCommande(commandeId: string): Promise<void> {
    const materials = await calculateMaterialsNeededForCommande(commandeId)

    for (const material of materials) {
        // Create movement (updates stockPhysique)
        await createStockMovement({
            matierePremiereId: material.materialId,
            type: "CONSOMMATION_COMMANDE",
            quantiteDelta: -material.quantiteNecessaire,
            unite: material.materialUnit,
            sourceType: "COMMANDE",
            sourceId: commandeId
        })

        // Decrement reserve
        await prisma.material.update({
            where: { id: material.materialId },
            data: {
                stockReserve: {
                    decrement: material.quantiteNecessaire,
                },
            },
        })
    }
}

