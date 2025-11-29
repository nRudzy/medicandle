/**
 * Projection and revenue calculation functions
 */

export interface ProjectionInput {
    candleName: string
    salePrice: number
    totalCost: number
    marginPerUnit: number
    estimatedQuantity: number
}

export interface ProjectionResult {
    candleName: string
    estimatedQuantity: number
    salePrice: number
    totalCost: number
    marginPerUnit: number
    projectedRevenue: number
    projectedTotalCost: number
    projectedMargin: number
    marginPercentage: number
}

/**
 * Calculate projection for a single candle
 */
export function calculateCandleProjection(
    input: ProjectionInput
): ProjectionResult {
    const projectedRevenue = input.salePrice * input.estimatedQuantity
    const projectedTotalCost = input.totalCost * input.estimatedQuantity
    const projectedMargin = input.marginPerUnit * input.estimatedQuantity
    const marginPercentage =
        input.salePrice > 0
            ? (input.marginPerUnit / input.salePrice) * 100
            : 0

    return {
        candleName: input.candleName,
        estimatedQuantity: input.estimatedQuantity,
        salePrice: input.salePrice,
        totalCost: input.totalCost,
        marginPerUnit: input.marginPerUnit,
        projectedRevenue,
        projectedTotalCost,
        projectedMargin,
        marginPercentage,
    }
}

/**
 * Calculate total projections for multiple candles
 */
export function calculateTotalProjection(projections: ProjectionResult[]) {
    const totalRevenue = projections.reduce(
        (sum, p) => sum + p.projectedRevenue,
        0
    )
    const totalCost = projections.reduce((sum, p) => sum + p.projectedTotalCost, 0)
    const totalMargin = projections.reduce((sum, p) => sum + p.projectedMargin, 0)
    const averageMarginPercentage =
        totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0

    return {
        totalRevenue,
        totalCost,
        totalMargin,
        averageMarginPercentage,
        candleCount: projections.length,
    }
}
