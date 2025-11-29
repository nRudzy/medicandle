/**
 * Production cost calculation functions
 */

export interface ProductionSettings {
    laborRate: number // €/hour
    electricityCost: number | null // €/hour or per session
    amortizationCost: number | null // € per candle
}

export interface ProductionParams {
    prepTimeMinutes: number
    heatingTimeMinutes?: number
}

/**
 * Calculate labor cost for a candle
 */
export function calculateLaborCost(
    prepTimeMinutes: number,
    laborRate: number
): number {
    return (prepTimeMinutes / 60) * laborRate
}

/**
 * Calculate total production cost
 */
export function calculateProductionCost(
    params: ProductionParams,
    settings: ProductionSettings
): number {
    const laborCost = calculateLaborCost(params.prepTimeMinutes, settings.laborRate)
    const electricityCost = settings.electricityCost || 0
    const amortization = settings.amortizationCost || 0

    return laborCost + electricityCost + amortization
}
