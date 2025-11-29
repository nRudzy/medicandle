/**
 * Pricing and margin calculation functions
 */

export interface PricingSettings {
    multiplierEntry: number
    multiplierPremium: number
    multiplierLuxury: number
    targetMargin?: number
}

export type Positioning = "ENTRY" | "PREMIUM" | "LUXURY"

/**
 * Calculate suggested price based on positioning
 */
export function calculateSuggestedPrice(
    totalCost: number,
    positioning: Positioning,
    settings: PricingSettings
): number {
    let multiplier: number

    switch (positioning) {
        case "ENTRY":
            multiplier = settings.multiplierEntry
            break
        case "PREMIUM":
            multiplier = settings.multiplierPremium
            break
        case "LUXURY":
            multiplier = settings.multiplierLuxury
            break
    }

    return totalCost * multiplier
}

/**
 * Calculate margin in euros
 */
export function calculateMargin(salePrice: number, totalCost: number): number {
    return salePrice - totalCost
}

/**
 * Calculate margin percentage
 */
export function calculateMarginPercentage(
    salePrice: number,
    totalCost: number
): number {
    if (salePrice === 0) return 0
    return ((salePrice - totalCost) / salePrice) * 100
}

/**
 * Calculate all pricing suggestions for a candle
 */
export function calculatePricingSuggestions(
    totalCost: number,
    settings: PricingSettings
) {
    const entry = calculateSuggestedPrice(totalCost, "ENTRY", settings)
    const premium = calculateSuggestedPrice(totalCost, "PREMIUM", settings)
    const luxury = calculateSuggestedPrice(totalCost, "LUXURY", settings)

    return {
        entry: {
            price: entry,
            margin: calculateMargin(entry, totalCost),
            marginPercent: calculateMarginPercentage(entry, totalCost),
        },
        premium: {
            price: premium,
            margin: calculateMargin(premium, totalCost),
            marginPercent: calculateMarginPercentage(premium, totalCost),
        },
        luxury: {
            price: luxury,
            margin: calculateMargin(luxury, totalCost),
            marginPercent: calculateMarginPercentage(luxury, totalCost),
        },
    }
}
