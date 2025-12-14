"use server"

import { revalidatePath } from "next/cache"
import { createStockMovement } from "@/lib/business/stock"
import { Unit } from "@prisma/client"

export async function adjustStock(
    prevState: { error?: string } | null,
    formData: FormData
): Promise<{ error?: string } | void> {
    try {
        const materialId = formData.get("materialId") as string
        const quantityDeltaStr = formData.get("quantityDelta") as string
        const unit = formData.get("unit") as Unit
        const commentaire = formData.get("commentaire") as string

        if (!materialId) return { error: "Matière requise" }
        if (!quantityDeltaStr) return { error: "Quantité requise" }

        const quantityDelta = parseFloat(quantityDeltaStr)
        if (isNaN(quantityDelta)) return { error: "Quantité invalide" }

        if (!commentaire || !commentaire.trim()) return { error: "Commentaire requis pour ajustement manuel" }

        await createStockMovement({
            matierePremiereId: materialId,
            quantiteDelta: quantityDelta,
            unite: unit, // We assume the form sends the correct unit matching the material
            type: "AJUSTEMENT_MANUEL",
            sourceType: "MANUEL",
            commentaire
        })

        revalidatePath("/bo/matieres")
        revalidatePath(`/bo/matieres/${materialId}`)
    } catch (error: any) {
        console.error("Error adjusting stock:", error)
        return { error: error.message || "Une erreur s'est produite lors de l'ajustement du stock" }
    }
}
