import { prisma } from "@/lib/prisma"

/**
 * Generate a unique command reference in format CMD-YYYY-NNNN
 * Example: CMD-2025-0012
 */
export async function generateCommandeReference(): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `CMD-${year}-`

    // Find the highest number for this year
    const lastCommande = await prisma.commande.findFirst({
        where: {
            reference: {
                startsWith: prefix,
            },
        },
        orderBy: {
            reference: "desc",
        },
    })

    let nextNumber = 1
    if (lastCommande) {
        // Extract the number from the reference (e.g., "CMD-2025-0012" -> 12)
        const match = lastCommande.reference.match(/-(\d+)$/)
        if (match) {
            nextNumber = parseInt(match[1], 10) + 1
        }
    }

    // Format with leading zeros (4 digits)
    const formattedNumber = nextNumber.toString().padStart(4, "0")
    return `${prefix}${formattedNumber}`
}

/**
 * Generate a unique bon de commande matières reference in format BCM-YYYY-NNNN
 * Example: BCM-2025-0003
 */
export async function generateBonDeCommandeMatieresReference(): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `BCM-${year}-`

    // Find the highest number for this year
    const lastBon = await prisma.bonDeCommandeMatieres.findFirst({
        where: {
            reference: {
                startsWith: prefix,
            },
        },
        orderBy: {
            reference: "desc",
        },
    })

    let nextNumber = 1
    if (lastBon) {
        // Extract the number from the reference (e.g., "BCM-2025-0003" -> 3)
        const match = lastBon.reference.match(/-(\d+)$/)
        if (match) {
            nextNumber = parseInt(match[1], 10) + 1
        }
    }

    // Format with leading zeros (4 digits)
    const formattedNumber = nextNumber.toString().padStart(4, "0")
    return `${prefix}${formattedNumber}`
}

