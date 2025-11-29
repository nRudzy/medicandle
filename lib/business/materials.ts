/**
 * Material cost calculation functions
 */

import { Unit } from "@prisma/client"

export interface MaterialWithCost {
    id: string
    costPerUnit: number
    unit: Unit
}

export interface CandleMaterial {
    material: MaterialWithCost
    quantity: number
    unit?: Unit
}

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
 * Calculate cost for a single material in a candle recipe
 */
export function calculateMaterialCost(
    quantity: number,
    unit: Unit,
    materialCostPerUnit: number,
    materialUnit: Unit
): number {
    // Convert recipe quantity to base unit
    const baseQuantity = convertToBaseUnit(quantity, unit)

    // Convert material reference to base unit
    const baseMaterialQuantity = convertToBaseUnit(1, materialUnit)

    // Calculate cost
    return (baseQuantity / baseMaterialQuantity) * materialCostPerUnit
}

/**
 * Calculate total material cost for all materials in a candle
 */
export function calculateTotalMaterialCost(materials: CandleMaterial[]): number {
    return materials.reduce((total, item) => {
        const itemUnit = item.unit || item.material.unit
        const itemCost = calculateMaterialCost(
            item.quantity,
            itemUnit,
            item.material.costPerUnit,
            item.material.unit
        )
        return total + itemCost
    }, 0)
}
