"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { MaterialType, Unit } from "@prisma/client"

export async function createMaterial(formData: FormData) {
    const name = formData.get("name") as string
    const type = formData.get("type") as MaterialType
    const costPerUnit = parseFloat(formData.get("costPerUnit") as string)
    const unit = formData.get("unit") as Unit
    const supplier = formData.get("supplier") as string
    const currentStock = formData.get("currentStock") as string
    const notes = formData.get("notes") as string

    await prisma.material.create({
        data: {
            name,
            type,
            costPerUnit,
            unit,
            supplier: supplier || null,
            currentStock: currentStock ? parseFloat(currentStock) : null,
            notes: notes || null,
        },
    })

    revalidatePath("/bo/matieres")
    redirect("/bo/matieres")
}

export async function updateMaterial(id: string, formData: FormData) {
    const name = formData.get("name") as string
    const type = formData.get("type") as MaterialType
    const costPerUnit = parseFloat(formData.get("costPerUnit") as string)
    const unit = formData.get("unit") as Unit
    const supplier = formData.get("supplier") as string
    const currentStock = formData.get("currentStock") as string
    const notes = formData.get("notes") as string

    await prisma.material.update({
        where: { id },
        data: {
            name,
            type,
            costPerUnit,
            unit,
            supplier: supplier || null,
            currentStock: currentStock ? parseFloat(currentStock) : null,
            notes: notes || null,
        },
    })

    revalidatePath("/bo/matieres")
    redirect("/bo/matieres")
}

export async function deleteMaterial(id: string) {
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

export async function createCandle(formData: FormData) {
  const name = formData.get("name") as string
  const format = formData.get("format") as string
  const category = formData.get("category") as string
  const positioning = formData.get("positioning") as string
  const shortDesc = formData.get("shortDesc") as string
  const longDesc = formData.get("longDesc") as string
  const prepTimeMinutes = formData.get("prepTimeMinutes") as string
  const heatingTimeMinutes = formData.get("heatingTimeMinutes") as string
  const currentPrice = formData.get("currentPrice") as string

  // Parse materials from form data
  const materials: { materialId: string; quantity: number; unit: string }[] = []
  let index = 0
  while (formData.get(`materials[${index}].materialId`)) {
    materials.push({
      materialId: formData.get(`materials[${index}].materialId`) as string,
      quantity: parseFloat(formData.get(`materials[${index}].quantity`) as string),
      unit: formData.get(`materials[${index}].unit`) as string,
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
          prepTimeMinutes: parseInt(prepTimeMinutes),
          heatingTimeMinutes: heatingTimeMinutes ? parseInt(heatingTimeMinutes) : null,
        },
      },
    },
  })

  revalidatePath("/bo/bougies")
  redirect("/bo/bougies")
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
