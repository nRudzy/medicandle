"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { MaterialType, Unit, ClientType, CommandeStatut } from "@prisma/client"
import { generateCommandeReference } from "@/lib/utils/references"
import {
    reserveStockForCommande,
    releaseStockForCommande,
    consumeStockForCommande,
    calculateMaterialsNeededForCommande,
} from "@/lib/business/commandes"
import { createStockMovement, createFinancialTransaction } from "@/lib/business/stock"

// Helper to check if error is a redirect (should not be caught)
function isRedirectError(error: any): boolean {
    return error?.digest?.startsWith('NEXT_REDIRECT') || error?.message === 'NEXT_REDIRECT'
}

export async function createMaterial(
    prevState: { error?: string } | null,
    formData: FormData
): Promise<{ error?: string } | void> {
    try {
        const name = formData.get("name") as string
        const type = formData.get("type") as MaterialType
        const costPerUnit = parseFloat(formData.get("costPerUnit") as string)
        const unit = formData.get("unit") as Unit
        const supplier = formData.get("supplier") as string
        const stockPhysique = formData.get("stockPhysique") as string
        const notes = formData.get("notes") as string

        if (!name || !name.trim()) {
            return { error: "Le nom de la matière est requis" }
        }

        if (isNaN(costPerUnit) || costPerUnit < 0) {
            return { error: "Le prix d'achat doit être un nombre positif" }
        }

        const material = await prisma.material.create({
            data: {
                name,
                type,
                costPerUnit,
                unit,
                supplier: supplier || null,
                stockPhysique: stockPhysique && parseFloat(stockPhysique) > 0 ? 0 : (stockPhysique ? parseFloat(stockPhysique) : null), // Initialize to 0 if we have stock to add via movement, else null or 0.
                // Actually if I set it to 0, then add X, it becomes X. Correct.
                notes: notes || null,
            },
        })

        // If initial stock provided, create movement
        if (stockPhysique && parseFloat(stockPhysique) > 0) {
            const quantity = parseFloat(stockPhysique)

            await createStockMovement({
                matierePremiereId: material.id,
                type: "AJUSTEMENT_MANUEL",
                quantiteDelta: quantity,
                unite: unit,
                prixUnitaire: costPerUnit,
                sourceType: "MANUEL",
                commentaire: "Stock initial à la création"
            })

            // Generate expense for initial stock if cost is defined
            if (costPerUnit > 0) {
                await createFinancialTransaction({
                    type: "DEPENSE_AUTRE",
                    montant: -(quantity * costPerUnit), // Expense is negative
                    description: `Achat initial: ${name} (${quantity} ${unit})`,
                    categorie: "Achat Matière",
                    sourceType: "MANUEL",
                    sourceId: material.id
                })
            }
        }

        revalidatePath("/bo/matieres")
        redirect("/bo/matieres")
    } catch (error: any) {
        // Don't catch redirect errors
        if (isRedirectError(error)) {
            throw error
        }
        console.error("Error creating material:", error)
        return {
            error: error?.message || "Une erreur s'est produite lors de la création de la matière. Veuillez réessayer.",
        }
    }
}

export async function updateMaterial(
    id: string,
    prevState: { error?: string } | null,
    formData: FormData
): Promise<{ error?: string } | void> {
    try {
        const name = formData.get("name") as string
        const type = formData.get("type") as MaterialType
        const costPerUnit = parseFloat(formData.get("costPerUnit") as string)
        const unit = formData.get("unit") as Unit
        const supplier = formData.get("supplier") as string
        const stockPhysique = formData.get("stockPhysique") as string
        const notes = formData.get("notes") as string

        if (!name || !name.trim()) {
            return { error: "Le nom de la matière est requis" }
        }

        if (isNaN(costPerUnit) || costPerUnit < 0) {
            return { error: "Le prix d'achat doit être un nombre positif" }
        }

        // Create transaction to get current stock and update
        // Actually update action might not be atomic here with finding old one unless transaction.
        // But for simplicity, we find first.
        const currentMaterial = await prisma.material.findUnique({ where: { id } })
        const oldStock = currentMaterial?.stockPhysique || 0
        const newStockVal = stockPhysique ? parseFloat(stockPhysique) : 0

        const motif = formData.get("motif") as string | null

        // Update all fields EXCEPT stockPhysique (which is handled via movement if changed)
        // Wait, if I don't update it, but there is NO change, then it remains.
        // If there IS change, I call movement, which updates it.
        // So I should just NOT include stockPhysique in the data object here?
        // But what if I want to set it to null explicitly? (Not currently supported by UI).
        // Safest: Exclude stockPhysique from this update.

        await prisma.material.update({
            where: { id },
            data: {
                name,
                type,
                costPerUnit,
                unit,
                supplier: supplier || null,
                // stockPhysique: OMITTED to avoid double update
                notes: notes || null,
            },
        })

        // Check for stock change
        const delta = newStockVal - oldStock
        if (Math.abs(delta) > 0.0001) {
            // Create Stock Movement (This will update stockPhysique in DB)
            await createStockMovement({
                matierePremiereId: id,
                type: "AJUSTEMENT_MANUEL",
                quantiteDelta: delta,
                unite: unit,
                prixUnitaire: costPerUnit,
                sourceType: "MANUEL",
                commentaire: "Modification manuelle de la fiche"
            })
        }

        revalidatePath("/bo/matieres")
        redirect("/bo/matieres")
    } catch (error: any) {
        // Don't catch redirect errors
        if (isRedirectError(error)) {
            throw error
        }
        console.error("Error updating material:", error)
        return {
            error: error?.message || "Une erreur s'est produite lors de la mise à jour de la matière. Veuillez réessayer.",
        }
    }
}

export async function deleteMaterial(id: string) {
    await prisma.financialTransaction.deleteMany({
        where: {
            sourceId: id,
        }
    })

    await prisma.material.delete({
        where: { id },
    })

    revalidatePath("/bo/matieres")
}

export async function updateProductionSettings(formData: FormData) {
    const laborRate = parseFloat(formData.get("laborRate") as string)
    const electricityCost = formData.get("electricityCost") as string
    const amortizationCost = formData.get("amortizationCost") as string

    await prisma.productionSettings.create({
        data: {
            laborRate,
            electricityCost: electricityCost ? parseFloat(electricityCost) : null,
            amortizationCost: amortizationCost ? parseFloat(amortizationCost) : null,
        },
    })

    revalidatePath("/bo/parametres")
    redirect("/bo/parametres")
}

export async function updatePricingSettings(formData: FormData) {
    const targetMargin = formData.get("targetMargin") as string
    const multiplierEntry = parseFloat(formData.get("multiplierEntry") as string)
    const multiplierPremium = parseFloat(formData.get("multiplierPremium") as string)
    const multiplierLuxury = parseFloat(formData.get("multiplierLuxury") as string)

    await prisma.pricingSettings.create({
        data: {
            targetMargin: targetMargin ? parseFloat(targetMargin) : null,
            multiplierEntry,
            multiplierPremium,
            multiplierLuxury,
        },
    })

    revalidatePath("/bo/parametres")
    redirect("/bo/parametres")
}

export async function createCandle(
    prevState: { error?: string } | null,
    formData: FormData
): Promise<{ error?: string } | void> {
    try {
        const name = formData.get("name") as string
        const format = formData.get("format") as string
        const category = formData.get("category") as string
        const positioning = formData.get("positioning") as string
        const shortDesc = formData.get("shortDesc") as string
        const longDesc = formData.get("longDesc") as string
        const prepTimeMinutesStr = formData.get("prepTimeMinutes") as string
        const heatingTimeMinutes = formData.get("heatingTimeMinutes") as string
        const currentPrice = formData.get("currentPrice") as string

        // Validate required fields
        if (!name || !name.trim()) {
            return { error: "Le nom de la bougie est requis" }
        }

        if (!prepTimeMinutesStr || isNaN(parseInt(prepTimeMinutesStr))) {
            return { error: "Le temps de préparation est requis et doit être un nombre valide" }
        }

        const prepTimeMinutes = parseInt(prepTimeMinutesStr)
        if (prepTimeMinutes < 0) {
            return { error: "Le temps de préparation doit être positif" }
        }

        // Parse materials from form data
        const materials: { materialId: string; quantity: number; unit: string }[] = []
        let index = 0
        while (formData.get(`materials[${index}].materialId`)) {
            const materialId = formData.get(`materials[${index}].materialId`) as string
            const quantityStr = formData.get(`materials[${index}].quantity`) as string
            const unit = formData.get(`materials[${index}].unit`) as string

            if (!materialId) {
                index++
                continue
            }

            const quantity = parseFloat(quantityStr)
            if (isNaN(quantity) || quantity <= 0) {
                return { error: `La quantité pour le matériau ${index + 1} doit être un nombre positif` }
            }

            materials.push({
                materialId,
                quantity,
                unit: unit || "G",
            })
            index++
        }

        // Create candle with related data
        await prisma.candle.create({
            data: {
                name,
                format: format || null,
                category: category || null,
                positioning: positioning as any || null,
                shortDesc: shortDesc || null,
                longDesc: longDesc || null,
                currentPrice: currentPrice ? parseFloat(currentPrice) : null,
                materials: {
                    create: materials.map((m) => ({
                        materialId: m.materialId,
                        quantity: m.quantity,
                        unit: m.unit as any,
                    })),
                },
                productionParams: {
                    create: {
                        prepTimeMinutes,
                        heatingTimeMinutes: heatingTimeMinutes ? parseInt(heatingTimeMinutes) : null,
                    },
                },
            },
        })

        revalidatePath("/bo/bougies")
        redirect("/bo/bougies")
    } catch (error: any) {
        // Don't catch redirect errors
        if (isRedirectError(error)) {
            throw error
        }
        console.error("Error creating candle:", error)
        return {
            error: error?.message || "Une erreur s'est produite lors de la création de la bougie. Veuillez réessayer.",
        }
    }
}

export async function updateCandle(
    id: string,
    prevState: { error?: string } | null,
    formData: FormData
): Promise<{ error?: string } | void> {
    try {
        const name = formData.get("name") as string
        const format = formData.get("format") as string
        const category = formData.get("category") as string
        const positioning = formData.get("positioning") as string
        const shortDesc = formData.get("shortDesc") as string
        const longDesc = formData.get("longDesc") as string
        const prepTimeMinutesStr = formData.get("prepTimeMinutes") as string
        const heatingTimeMinutes = formData.get("heatingTimeMinutes") as string
        const currentPrice = formData.get("currentPrice") as string

        // Validate required fields
        if (!name || !name.trim()) {
            return { error: "Le nom de la bougie est requis" }
        }

        if (!prepTimeMinutesStr || isNaN(parseInt(prepTimeMinutesStr))) {
            return { error: "Le temps de préparation est requis et doit être un nombre valide" }
        }

        const prepTimeMinutes = parseInt(prepTimeMinutesStr)
        if (prepTimeMinutes < 0) {
            return { error: "Le temps de préparation doit être positif" }
        }

        // Parse materials from form data
        const materials: { materialId: string; quantity: number; unit: string }[] = []
        let index = 0
        while (formData.get(`materials[${index}].materialId`)) {
            const materialId = formData.get(`materials[${index}].materialId`) as string
            const quantityStr = formData.get(`materials[${index}].quantity`) as string
            const unit = formData.get(`materials[${index}].unit`) as string

            if (!materialId) {
                index++
                continue
            }

            const quantity = parseFloat(quantityStr)
            if (isNaN(quantity) || quantity <= 0) {
                return { error: `La quantité pour le matériau ${index + 1} doit être un nombre positif` }
            }

            materials.push({
                materialId,
                quantity,
                unit: unit || "G",
            })
            index++
        }

        // Delete existing materials and production params
        await prisma.candleMaterial.deleteMany({
            where: { candleId: id },
        })
        await prisma.candleProductionParams.deleteMany({
            where: { candleId: id },
        })

        // Update candle with related data
        await prisma.candle.update({
            where: { id },
            data: {
                name,
                format: format || null,
                category: category || null,
                positioning: positioning as any || null,
                shortDesc: shortDesc || null,
                longDesc: longDesc || null,
                currentPrice: currentPrice ? parseFloat(currentPrice) : null,
                materials: {
                    create: materials.map((m) => ({
                        materialId: m.materialId,
                        quantity: m.quantity,
                        unit: m.unit as any,
                    })),
                },
                productionParams: {
                    create: {
                        prepTimeMinutes,
                        heatingTimeMinutes: heatingTimeMinutes ? parseInt(heatingTimeMinutes) : null,
                    },
                },
            },
        })

        revalidatePath("/bo/bougies")
        revalidatePath(`/bo/bougies/${id}`)
        redirect(`/bo/bougies/${id}`)
    } catch (error: any) {
        // Don't catch redirect errors
        if (isRedirectError(error)) {
            throw error
        }
        console.error("Error updating candle:", error)
        return {
            error: error?.message || "Une erreur s'est produite lors de la mise à jour de la bougie. Veuillez réessayer.",
        }
    }
}

export async function deleteCandle(id: string) {
    try {
        // Soft delete by setting active to false
        await prisma.candle.update({
            where: { id },
            data: { active: false },
        })

        revalidatePath("/bo/bougies")
    } catch (error: any) {
        console.error("Error deleting candle:", error)
        throw error
    }
}

export async function createScenario(formData: FormData) {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string

    // Parse candles from form data
    const candles: { candleId: string; estimatedQty: number; usedPrice: number }[] = []
    let index = 0
    while (formData.get(`candles[${index}].candleId`)) {
        candles.push({
            candleId: formData.get(`candles[${index}].candleId`) as string,
            estimatedQty: parseInt(formData.get(`candles[${index}].estimatedQty`) as string),
            usedPrice: parseFloat(formData.get(`candles[${index}].usedPrice`) as string || "0"),
        })
        index++
    }

    await prisma.projectionScenario.create({
        data: {
            name,
            description: description || null,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            items: {
                create: candles.map((c) => ({
                    candleId: c.candleId,
                    estimatedQty: c.estimatedQty,
                    usedPrice: c.usedPrice || null,
                })),
            },
        },
    })

    revalidatePath("/bo/projections")
    redirect("/bo/projections")
}

// ==================== CLIENTS ====================

export async function createClient(
    prevState: { error?: string } | null,
    formData: FormData
): Promise<{ error?: string } | void> {
    try {
        const typeClient = formData.get("typeClient") as string
        const nom = formData.get("nom") as string
        const prenom = formData.get("prenom") as string
        const raisonSociale = formData.get("raisonSociale") as string
        const email = formData.get("email") as string
        const telephone = formData.get("telephone") as string
        const adresseLigne1 = formData.get("adresseLigne1") as string
        const adresseLigne2 = formData.get("adresseLigne2") as string
        const codePostal = formData.get("codePostal") as string
        const ville = formData.get("ville") as string
        const pays = formData.get("pays") as string
        const notes = formData.get("notes") as string

        if (!nom || !nom.trim()) {
            return { error: "Le nom est requis" }
        }

        await prisma.client.create({
            data: {
                typeClient: typeClient && typeClient !== "none" ? (typeClient as ClientType) : null,
                nom,
                prenom: prenom || null,
                raisonSociale: raisonSociale || null,
                email: email || null,
                telephone: telephone || null,
                adresseLigne1: adresseLigne1 || null,
                adresseLigne2: adresseLigne2 || null,
                codePostal: codePostal || null,
                ville: ville || null,
                pays: pays || null,
                notes: notes || null,
            },
        })

        revalidatePath("/bo/clients")
        redirect("/bo/clients")
    } catch (error: any) {
        // Don't catch redirect errors
        if (isRedirectError(error)) {
            throw error
        }
        console.error("Error creating client:", error)
        return {
            error: error?.message || "Une erreur s'est produite lors de la création du client. Veuillez réessayer.",
        }
    }
}

export async function updateClient(
    id: string,
    prevState: { error?: string } | null,
    formData: FormData
): Promise<{ error?: string } | void> {
    try {
        const typeClient = formData.get("typeClient") as string
        const nom = formData.get("nom") as string
        const prenom = formData.get("prenom") as string
        const raisonSociale = formData.get("raisonSociale") as string
        const email = formData.get("email") as string
        const telephone = formData.get("telephone") as string
        const adresseLigne1 = formData.get("adresseLigne1") as string
        const adresseLigne2 = formData.get("adresseLigne2") as string
        const codePostal = formData.get("codePostal") as string
        const ville = formData.get("ville") as string
        const pays = formData.get("pays") as string
        const notes = formData.get("notes") as string

        if (!nom || !nom.trim()) {
            return { error: "Le nom est requis" }
        }

        await prisma.client.update({
            where: { id },
            data: {
                typeClient: typeClient && typeClient !== "none" ? (typeClient as ClientType) : null,
                nom,
                prenom: prenom || null,
                raisonSociale: raisonSociale || null,
                email: email || null,
                telephone: telephone || null,
                adresseLigne1: adresseLigne1 || null,
                adresseLigne2: adresseLigne2 || null,
                codePostal: codePostal || null,
                ville: ville || null,
                pays: pays || null,
                notes: notes || null,
            },
        })

        revalidatePath("/bo/clients")
        redirect("/bo/clients")
    } catch (error: any) {
        // Don't catch redirect errors
        if (isRedirectError(error)) {
            throw error
        }
        console.error("Error updating client:", error)
        return {
            error: error?.message || "Une erreur s'est produite lors de la mise à jour du client. Veuillez réessayer.",
        }
    }
}

export async function deleteClient(id: string) {
    try {
        await prisma.client.delete({
            where: { id },
        })
        revalidatePath("/bo/clients")
    } catch (error: any) {
        console.error("Error deleting client:", error)
        throw error
    }
}

// ==================== COMMANDES ====================

export async function createCommande(
    prevState: { error?: string; commandeId?: string } | null,
    formData: FormData
): Promise<{ error?: string; commandeId?: string } | void> {
    try {
        const clientId = formData.get("clientId") as string
        const dateCommande = formData.get("dateCommande") as string
        const dateLivraisonSouhaitee = formData.get("dateLivraisonSouhaitee") as string
        const commentaireInterne = formData.get("commentaireInterne") as string
        const commentaireClient = formData.get("commentaireClient") as string

        const reference = await generateCommandeReference()

        const commande = await prisma.commande.create({
            data: {
                reference,
                clientId: clientId && clientId !== "none" ? clientId : null,
                dateCommande: dateCommande ? new Date(dateCommande) : new Date(),
                dateLivraisonSouhaitee: dateLivraisonSouhaitee ? new Date(dateLivraisonSouhaitee) : null,
                statut: CommandeStatut.BROUILLON,
                commentaireInterne: commentaireInterne || null,
                commentaireClient: commentaireClient || null,
            },
        })

        // Parse lignes from form data if present
        const lignes: { bougieId: string; quantite: number; prixUnitaireUtilise?: number; remisePourcentage?: number; remiseMontant?: number; notes?: string }[] = []
        let index = 0
        while (formData.get(`lignes[${index}].bougieId`)) {
            const bougieId = formData.get(`lignes[${index}].bougieId`) as string
            const quantiteStr = formData.get(`lignes[${index}].quantite`) as string
            const prixUnitaireUtiliseStr = formData.get(`lignes[${index}].prixUnitaireUtilise`) as string
            const remisePourcentageStr = formData.get(`lignes[${index}].remisePourcentage`) as string
            const remiseMontantStr = formData.get(`lignes[${index}].remiseMontant`) as string
            const notes = formData.get(`lignes[${index}].notes`) as string

            if (!bougieId) {
                index++
                continue
            }

            const quantite = parseInt(quantiteStr)
            if (isNaN(quantite) || quantite <= 0) {
                return { error: `La quantité pour la ligne ${index + 1} doit être un nombre positif` }
            }

            const prixUnitaireUtilise = prixUnitaireUtiliseStr ? parseFloat(prixUnitaireUtiliseStr) : undefined
            const remisePourcentage = remisePourcentageStr ? parseFloat(remisePourcentageStr) : undefined
            const remiseMontant = remiseMontantStr ? parseFloat(remiseMontantStr) : undefined

            let montantLigne = prixUnitaireUtilise ? prixUnitaireUtilise * quantite : null
            if (montantLigne && remisePourcentage) {
                montantLigne = montantLigne * (1 - remisePourcentage / 100)
            }
            if (montantLigne && remiseMontant) {
                montantLigne = montantLigne - remiseMontant
            }

            lignes.push({
                bougieId,
                quantite,
                prixUnitaireUtilise,
                remisePourcentage,
                remiseMontant,
                notes: notes || undefined,
            })
            index++
        }

        // Create lignes if any
        if (lignes.length > 0) {
            await prisma.commandeLigne.createMany({
                data: lignes.map((l) => ({
                    commandeId: commande.id,
                    bougieId: l.bougieId,
                    quantite: l.quantite,
                    prixUnitaireUtilise: l.prixUnitaireUtilise || null,
                    remisePourcentage: l.remisePourcentage || null,
                    remiseMontant: l.remiseMontant || null,
                    montantLigne: l.prixUnitaireUtilise
                        ? (l.prixUnitaireUtilise * l.quantite * (1 - (l.remisePourcentage || 0) / 100) - (l.remiseMontant || 0))
                        : null,
                    notes: l.notes || null,
                })),
            })

            // Recalculate total
            await recalculateCommandeTotal(commande.id)
        }

        revalidatePath("/bo/commandes")
        redirect(`/bo/commandes/${commande.id}`)
    } catch (error: any) {
        // Don't catch redirect errors
        if (isRedirectError(error)) {
            throw error
        }
        console.error("Error creating commande:", error)
        return {
            error: error?.message || "Une erreur s'est produite lors de la création de la commande. Veuillez réessayer.",
        }
    }
}

export async function updateCommande(
    id: string,
    prevState: { error?: string } | null,
    formData: FormData
): Promise<{ error?: string } | void> {
    try {
        const clientId = formData.get("clientId") as string
        const dateCommande = formData.get("dateCommande") as string
        const dateLivraisonSouhaitee = formData.get("dateLivraisonSouhaitee") as string
        const commentaireInterne = formData.get("commentaireInterne") as string
        const commentaireClient = formData.get("commentaireClient") as string

        await prisma.commande.update({
            where: { id },
            data: {
                clientId: clientId || null,
                dateCommande: dateCommande ? new Date(dateCommande) : undefined,
                dateLivraisonSouhaitee: dateLivraisonSouhaitee ? new Date(dateLivraisonSouhaitee) : null,
                commentaireInterne: commentaireInterne || null,
                commentaireClient: commentaireClient || null,
            },
        })

        revalidatePath("/bo/commandes")
        revalidatePath(`/bo/commandes/${id}`)
    } catch (error: any) {
        console.error("Error updating commande:", error)
        return {
            error: error?.message || "Une erreur s'est produite lors de la mise à jour de la commande. Veuillez réessayer.",
        }
    }
}

export async function deleteCommande(id: string) {
    try {
        // Check if commande has reserved stock and release it
        const commande = await prisma.commande.findUnique({
            where: { id },
        })

        if (commande && commande.statut === CommandeStatut.EN_COURS_FABRICATION) {
            await releaseStockForCommande(id)
        }

        await prisma.commande.delete({
            where: { id },
        })
        revalidatePath("/bo/commandes")
    } catch (error: any) {
        console.error("Error deleting commande:", error)
        throw error
    }
}

export async function addCommandeLigne(
    commandeId: string,
    formData: FormData
): Promise<{ error?: string } | void> {
    try {
        const bougieId = formData.get("bougieId") as string
        const quantite = parseInt(formData.get("quantite") as string)
        const prixUnitaireUtilise = formData.get("prixUnitaireUtilise") as string
        const remisePourcentage = formData.get("remisePourcentage") as string
        const remiseMontant = formData.get("remiseMontant") as string
        const notes = formData.get("notes") as string

        if (!bougieId) {
            return { error: "La bougie est requise" }
        }

        if (isNaN(quantite) || quantite <= 0) {
            return { error: "La quantité doit être un nombre positif" }
        }

        const prixUnitaire = prixUnitaireUtilise ? parseFloat(prixUnitaireUtilise) : null
        const remisePct = remisePourcentage ? parseFloat(remisePourcentage) : null
        const remiseMont = remiseMontant ? parseFloat(remiseMontant) : null

        let montantLigne = prixUnitaire ? prixUnitaire * quantite : null
        if (montantLigne && remisePct) {
            montantLigne = montantLigne * (1 - remisePct / 100)
        }
        if (montantLigne && remiseMont) {
            montantLigne = montantLigne - remiseMont
        }

        await prisma.commandeLigne.create({
            data: {
                commandeId,
                bougieId,
                quantite,
                prixUnitaireUtilise: prixUnitaire,
                remisePourcentage: remisePct,
                remiseMontant: remiseMont,
                montantLigne,
                notes: notes || null,
            },
        })

        // Recalculate total
        await recalculateCommandeTotal(commandeId)

        revalidatePath(`/bo/commandes/${commandeId}`)
    } catch (error: any) {
        console.error("Error adding commande ligne:", error)
        return {
            error: error?.message || "Une erreur s'est produite lors de l'ajout de la ligne. Veuillez réessayer.",
        }
    }
}

export async function updateCommandeLigne(
    id: string,
    formData: FormData
): Promise<{ error?: string } | void> {
    try {
        const quantite = parseInt(formData.get("quantite") as string)
        const prixUnitaireUtilise = formData.get("prixUnitaireUtilise") as string
        const remisePourcentage = formData.get("remisePourcentage") as string
        const remiseMontant = formData.get("remiseMontant") as string
        const notes = formData.get("notes") as string

        if (isNaN(quantite) || quantite <= 0) {
            return { error: "La quantité doit être un nombre positif" }
        }

        const prixUnitaire = prixUnitaireUtilise ? parseFloat(prixUnitaireUtilise) : null
        const remisePct = remisePourcentage ? parseFloat(remisePourcentage) : null
        const remiseMont = remiseMontant ? parseFloat(remiseMontant) : null

        let montantLigne = prixUnitaire ? prixUnitaire * quantite : null
        if (montantLigne && remisePct) {
            montantLigne = montantLigne * (1 - remisePct / 100)
        }
        if (montantLigne && remiseMont) {
            montantLigne = montantLigne - remiseMont
        }

        const ligne = await prisma.commandeLigne.update({
            where: { id },
            data: {
                quantite,
                prixUnitaireUtilise: prixUnitaire,
                remisePourcentage: remisePct,
                remiseMontant: remiseMont,
                montantLigne,
                notes: notes || null,
            },
        })

        // Recalculate total
        await recalculateCommandeTotal(ligne.commandeId)

        revalidatePath(`/bo/commandes/${ligne.commandeId}`)
    } catch (error: any) {
        console.error("Error updating commande ligne:", error)
        return {
            error: error?.message || "Une erreur s'est produite lors de la mise à jour de la ligne. Veuillez réessayer.",
        }
    }
}

export async function deleteCommandeLigne(id: string) {
    try {
        const ligne = await prisma.commandeLigne.findUnique({
            where: { id },
        })

        if (!ligne) {
            throw new Error("Ligne not found")
        }

        await prisma.commandeLigne.delete({
            where: { id },
        })

        // Recalculate total
        await recalculateCommandeTotal(ligne.commandeId)

        revalidatePath(`/bo/commandes/${ligne.commandeId}`)
    } catch (error: any) {
        console.error("Error deleting commande ligne:", error)
        throw error
    }
}

async function recalculateCommandeTotal(commandeId: string) {
    const lignes = await prisma.commandeLigne.findMany({
        where: { commandeId },
    })

    const montantTotal = lignes.reduce((sum, ligne) => {
        return sum + (ligne.montantLigne || 0)
    }, 0)

    await prisma.commande.update({
        where: { id: commandeId },
        data: {
            montantTotalEstime: montantTotal > 0 ? montantTotal : null,
        },
    })
}


export async function changeCommandeStatut(
    commandeId: string,
    nouveauStatut: CommandeStatut
): Promise<{ error?: string } | void> {
    try {
        const commande = await prisma.commande.findUnique({
            where: { id: commandeId },
        })

        if (!commande) {
            return { error: "Commande non trouvée" }
        }

        const ancienStatut = commande.statut

        // Workflow logic
        if (nouveauStatut === CommandeStatut.ANNULEE) {
            // Release reserved stock if it was in EN_COURS_FABRICATION
            if (ancienStatut === CommandeStatut.EN_COURS_FABRICATION) {
                await releaseStockForCommande(commandeId)
            }
        } else if (nouveauStatut === CommandeStatut.EN_COURS_FABRICATION) {
            // Reserve stock when moving to EN_COURS_FABRICATION
            if (ancienStatut === CommandeStatut.BROUILLON) {
                await reserveStockForCommande(commandeId)
            } else if (ancienStatut === CommandeStatut.ANNULEE) {
                // If it was cancelled, we re-reserve
                await reserveStockForCommande(commandeId)
            }
        } else if (nouveauStatut === CommandeStatut.TERMINEE) {
            // Consume stock when moving to TERMINEE
            if (ancienStatut === CommandeStatut.EN_COURS_FABRICATION) {
                // Was reserved, so decrement reserve
                await consumeStockForCommande(commandeId, { shouldDecrementReserve: true })
            } else if (ancienStatut === CommandeStatut.BROUILLON || ancienStatut === CommandeStatut.ANNULEE) {
                // Was not reserved, so don't decrement reserve
                await consumeStockForCommande(commandeId, { shouldDecrementReserve: false })
            }

            // Create Revenue Transaction
            if (commande.montantTotalEstime && commande.montantTotalEstime > 0) {
                await createFinancialTransaction({
                    type: "RECETTE_COMMANDE",
                    montant: commande.montantTotalEstime,
                    description: `Commande ${commande.reference}`,
                    categorie: "Ventes",
                    sourceType: "COMMANDE",
                    sourceId: commande.id
                })
            }
        }

        await prisma.commande.update({
            where: { id: commandeId },
            data: {
                statut: nouveauStatut,
            },
        })

        revalidatePath("/bo/commandes")
        revalidatePath(`/bo/commandes/${commandeId}`)
    } catch (error: any) {
        console.error("Error changing commande statut:", error)
        return {
            error: error?.message || "Une erreur s'est produite lors du changement de statut. Veuillez réessayer.",
        }
    }
}



// ==================== MATIERES SUPPLEMENTAIRES ====================

export async function addSupplementToLigne(
    commandeLigneId: string,
    formData: FormData
) {
    try {
        const matierePremiereId = formData.get("matierePremiereId") as string
        const modeQuantite = formData.get("modeQuantite") as "PAR_BOUGIE" | "PAR_LIGNE"
        const quantite = parseFloat(formData.get("quantite") as string)
        const prixUnitaireOverrideStr = formData.get("prixUnitaireOverride") as string
        const commentaire = formData.get("commentaire") as string

        if (!matierePremiereId || !modeQuantite || isNaN(quantite)) {
            return { error: "Champs obligatoires manquants ou invalides" }
        }

        const prixUnitaireOverride = prixUnitaireOverrideStr ? parseFloat(prixUnitaireOverrideStr) : null

        // Get material to infer unit if needed, although we might just use material default unit
        // Ideally we should pass unit from form if we want flexibility, but for now let's default to material unit.
        const material = await prisma.material.findUnique({ where: { id: matierePremiereId } })
        if (!material) return { error: "Matière non trouvée" }

        await prisma.commandeLigneMatiereSupplementaire.create({
            data: {
                commandeLigneId,
                matierePremiereId,
                modeQuantite,
                quantite,
                unite: material.unit, // Default to material unit
                prixUnitaireOverride,
                commentaire: commentaire || null
            }
        })

        // Revalidate
        // We need to find the commandeId to revalidate the page
        const ligne = await prisma.commandeLigne.findUnique({
            where: { id: commandeLigneId },
            select: { commandeId: true }
        })

        if (ligne) {
            revalidatePath(`/bo/commandes/${ligne.commandeId}`)
        }

    } catch (error: any) {
        console.error("Error adding supplement:", error)
        return { error: error?.message || "Erreur lors de l'ajout du supplément" }
    }
}

export async function deleteSupplement(supplementId: string) {
    try {
        const supplement = await prisma.commandeLigneMatiereSupplementaire.findUnique({
            where: { id: supplementId },
            include: { commandeLigne: true }
        })

        if (!supplement) return { error: "Supplément non trouvé" }

        await prisma.commandeLigneMatiereSupplementaire.delete({
            where: { id: supplementId }
        })

        revalidatePath(`/bo/commandes/${supplement.commandeLigne.commandeId}`)
    } catch (error: any) {
        console.error("Error deleting supplement:", error)
        return { error: error?.message || "Erreur lors de la suppression du supplément" }
    }
}

export async function updateSupplement(
    supplementId: string,
    formData: FormData
) {
    try {
        const modeQuantite = formData.get("modeQuantite") as "PAR_BOUGIE" | "PAR_LIGNE"
        const quantite = parseFloat(formData.get("quantite") as string)
        const prixUnitaireOverrideStr = formData.get("prixUnitaireOverride") as string
        const commentaire = formData.get("commentaire") as string

        if (!modeQuantite || isNaN(quantite)) {
            return { error: "Champs obligatoires manquants ou invalides" }
        }

        const prixUnitaireOverride = prixUnitaireOverrideStr ? parseFloat(prixUnitaireOverrideStr) : null

        const supplement = await prisma.commandeLigneMatiereSupplementaire.update({
            where: { id: supplementId },
            data: {
                modeQuantite,
                quantite,
                prixUnitaireOverride,
                commentaire: commentaire || null
            },
            include: { commandeLigne: true }
        })

        revalidatePath(`/bo/commandes/${supplement.commandeLigne.commandeId}`)
    } catch (error: any) {
        console.error("Error updating supplement:", error)
        return { error: error?.message || "Erreur lors de la mise à jour du supplément" }
    }
}
