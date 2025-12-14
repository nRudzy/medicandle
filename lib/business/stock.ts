import { prisma } from "@/lib/prisma"
import { StockMovementType, StockMovementSourceType, FinancialTransactionType, FinancialTransactionSourceType, Unit } from "@prisma/client"

export async function createStockMovement(data: {
    matierePremiereId: string
    type: StockMovementType
    quantiteDelta: number
    unite: Unit
    prixUnitaire?: number
    sourceType?: StockMovementSourceType
    sourceId?: string
    commentaire?: string
    createdByUserId?: string
}) {
    // 1. Create the movement
    // We calculate valueDelta if prixUnitaire is provided
    const valeurDelta = data.prixUnitaire ? data.quantiteDelta * data.prixUnitaire : null

    const movement = await prisma.stockMovement.create({
        data: {
            matierePremiereId: data.matierePremiereId,
            type: data.type,
            quantiteDelta: data.quantiteDelta,
            unite: data.unite,
            prixUnitaire: data.prixUnitaire,
            valeurDelta: valeurDelta,
            sourceType: data.sourceType,
            sourceId: data.sourceId,
            commentaire: data.commentaire,
            createdByUserId: data.createdByUserId,
        }
    })

    // 2. Update the physical stock of the material
    // We handle the case where stockPhysique might be null by coalescing in application logic if needed,
    // but Prisma increment on null might result in null or error. 
    // Best effort: set to delta if null (requires two steps or raw query), or just use increment and hope seed ensures non-null.
    // Seed DOES ensure stockPhysique is set for initial items.

    // However, for robustness:
    const material = await prisma.material.findUnique({
        where: { id: data.matierePremiereId },
        select: { stockPhysique: true }
    })

    const currentStock = material?.stockPhysique ?? 0
    const newStock = currentStock + data.quantiteDelta

    await prisma.material.update({
        where: { id: data.matierePremiereId },
        data: {
            stockPhysique: newStock
        }
    })

    return movement
}

export async function createFinancialTransaction(data: {
    type: FinancialTransactionType
    montant: number
    description?: string
    categorie?: string
    sourceType?: FinancialTransactionSourceType
    sourceId?: string
    createdByUserId?: string
}) {
    return await prisma.financialTransaction.create({
        data: {
            type: data.type,
            montant: data.montant,
            description: data.description,
            categorie: data.categorie,
            sourceType: data.sourceType,
            sourceId: data.sourceId,
            createdByUserId: data.createdByUserId,
        }
    })
}
