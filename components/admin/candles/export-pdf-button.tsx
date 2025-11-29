"use client"

import { jsPDF } from "jspdf"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"

interface CandleData {
    name: string
    format?: string | null
    category?: string | null
    shortDesc?: string | null
    longDesc?: string | null
    materials: {
        material: {
            name: string
        }
        quantity: number
        unit: string
    }[]
    materialCost: number
    productionCost: number
    totalCost: number
    currentPrice?: number | null
    prepTimeMinutes?: number
}

export function ExportPDFButton({ candle }: { candle: CandleData }) {
    const generatePDF = () => {
        const doc = new jsPDF()
        let y = 20

        // Title
        doc.setFontSize(20)
        doc.setFont("helvetica", "bold")
        doc.text("Fiche Produit", 105, y, { align: "center" })
        y += 15

        // Candle Name
        doc.setFontSize(16)
        doc.text(candle.name, 20, y)
        y += 10

        // Format and Category
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        if (candle.format) {
            doc.text(`Format: ${candle.format}`, 20, y)
            y += 6
        }
        if (candle.category) {
            doc.text(`Collection: ${candle.category}`, 20, y)
            y += 6
        }
        y += 5

        // Description
        if (candle.shortDesc) {
            doc.setFont("helvetica", "italic")
            doc.text(candle.shortDesc, 20, y, { maxWidth: 170 })
            y += 10
        }

        // Separator
        doc.line(20, y, 190, y)
        y += 10

        // Recipe Title
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("Recette", 20, y)
        y += 8

        // Materials
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        candle.materials.forEach((cm) => {
            doc.text(`• ${cm.material.name}: ${cm.quantity} ${cm.unit}`, 25, y)
            y += 5
        })
        y += 5

        // Separator
        doc.line(20, y, 190, y)
        y += 10

        // Costs Title
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("Coûts de revient", 20, y)
        y += 8

        // Cost Breakdown
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.text(`Coût matières: ${candle.materialCost.toFixed(2)} €`, 25, y)
        y += 6
        doc.text(`Coût production: ${candle.productionCost.toFixed(2)} €`, 25, y)
        y += 6
        doc.setFont("helvetica", "bold")
        doc.text(`Coût total: ${candle.totalCost.toFixed(2)} €`, 25, y)
        y += 10

        // Price and Margin (if available)
        if (candle.currentPrice) {
            const margin = candle.currentPrice - candle.totalCost
            const marginPercent = ((candle.currentPrice - candle.totalCost) / candle.currentPrice) * 100

            doc.line(20, y, 190, y)
            y += 10

            doc.setFontSize(12)
            doc.setFont("helvetica", "bold")
            doc.text("Prix de vente", 20, y)
            y += 8

            doc.setFontSize(9)
            doc.setFont("helvetica", "normal")
            doc.text(`Prix: ${candle.currentPrice.toFixed(2)} €`, 25, y)
            y += 6
            doc.text(`Marge: ${margin.toFixed(2)} € (${marginPercent.toFixed(1)}%)`, 25, y)
        }

        // Production time (if available)
        if (candle.prepTimeMinutes) {
            y += 10
            doc.line(20, y, 190, y)
            y += 10

            doc.setFontSize(12)
            doc.setFont("helvetica", "bold")
            doc.text("Production", 20, y)
            y += 8

            doc.setFontSize(9)
            doc.setFont("helvetica", "normal")
            doc.text(`Temps de préparation: ${candle.prepTimeMinutes} minutes`, 25, y)
        }

        // Footer
        doc.setFontSize(8)
        doc.setFont("helvetica", "italic")
        const date = new Date().toLocaleDateString("fr-FR")
        doc.text(`Fiche générée le ${date}`, 105, 280, { align: "center" })

        // Save
        doc.save(`fiche-${candle.name.toLowerCase().replace(/\s+/g, "-")}.pdf`)
    }

    return (
        <Button onClick={generatePDF} variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Exporter en PDF
        </Button>
    )
}
