"use client"

import { MaterialNeeded } from "@/lib/business/commandes"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { Unit } from "@prisma/client"

const unitLabels: Record<Unit, string> = {
    G: "g",
    KG: "kg",
    ML: "ml",
    L: "L",
    PIECE: "pièce",
}

export function CommandeFeasibilityAnalysis({
    isFeasible,
    materials,
    missingMaterials,
}: {
    isFeasible: boolean
    materials: MaterialNeeded[]
    missingMaterials: MaterialNeeded[]
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Analyse de faisabilité
                    {isFeasible ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                    )}
                </CardTitle>
                <CardDescription>
                    {isFeasible
                        ? "Cette commande est faisable immédiatement avec le stock actuel."
                        : "Cette commande n'est pas faisable immédiatement. Il manque des matières premières."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-[var(--medicandle-beige)] bg-[var(--medicandle-ivory)]">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[var(--medicandle-beige)]/50">
                                <TableHead className="text-[var(--medicandle-dark-brown)]">Matière première</TableHead>
                                <TableHead className="text-[var(--medicandle-dark-brown)]">Type</TableHead>
                                <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Quantité nécessaire</TableHead>
                                <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Stock physique</TableHead>
                                <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Stock réservé</TableHead>
                                <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Stock disponible</TableHead>
                                <TableHead className="text-right text-[var(--medicandle-dark-brown)]">Manque</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {materials.map((material) => (
                                <TableRow
                                    key={material.materialId}
                                    className={
                                        material.manque > 0 
                                            ? "bg-red-50 hover:bg-red-100" 
                                            : "bg-green-50 hover:bg-green-100"
                                    }
                                >
                                    <TableCell className="font-medium">
                                        {material.materialName}
                                    </TableCell>
                                    <TableCell>{material.materialType}</TableCell>
                                    <TableCell className="text-right">
                                        {material.quantiteNecessaire.toFixed(2)}{" "}
                                        {unitLabels[material.materialUnit]}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {material.stockPhysique.toFixed(2)}{" "}
                                        {unitLabels[material.materialUnit]}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {material.stockReserve.toFixed(2)}{" "}
                                        {unitLabels[material.materialUnit]}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {material.stockDisponible.toFixed(2)}{" "}
                                        {unitLabels[material.materialUnit]}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {material.manque > 0 ? (
                                            <Badge variant="destructive">
                                                {material.manque.toFixed(2)}{" "}
                                                {unitLabels[material.materialUnit]}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-green-100">
                                                OK
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {missingMaterials.length > 0 && (
                    <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800">
                                Matières premières manquantes
                            </h3>
                            <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                                {missingMaterials.map((material) => (
                                    <li key={material.materialId}>
                                        {material.materialName}: manque{" "}
                                        {material.manque.toFixed(2)}{" "}
                                        {unitLabels[material.materialUnit]}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

