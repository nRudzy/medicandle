import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        const body = await req.json();
        const { targetId, sourceIds } = body;

        if (!targetId || !sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0) {
            return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
        }

        if (sourceIds.includes(targetId)) {
            return NextResponse.json({ error: "La cible ne peut pas être dans les sources" }, { status: 400 });
        }

        // Run all in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const target = await tx.material.findUnique({ where: { id: targetId } });
            if (!target) {
                throw new Error("Matière cible introuvable");
            }

            const sources = await tx.material.findMany({
                where: { id: { in: sourceIds } }
            });

            if (sources.length !== sourceIds.length) {
                throw new Error("Certaines matières sources sont introuvables");
            }

            // Validations
            for (const source of sources) {
                if (source.type !== target.type) {
                    throw new Error(`Types différents: La matière ${source.name} a le type ${source.type} (cible: ${target.type})`);
                }
            }

            // Remapper les FKs
            // 1. CandleMaterial (BougieMatierePremiere)
            // handle uniqueness collision candleId + materialId
            for (const source of sources) {
                const sourceCandleMaterials = await tx.candleMaterial.findMany({
                    where: { materialId: source.id }
                });

                for (const scm of sourceCandleMaterials) {
                    const existingTargetCm = await tx.candleMaterial.findUnique({
                        where: {
                            candleId_materialId: {
                                candleId: scm.candleId,
                                materialId: targetId
                            }
                        }
                    });

                    if (existingTargetCm) {
                        // Collision: merge quantiteUtilisee and delete the source one
                        await tx.candleMaterial.update({
                            where: { id: existingTargetCm.id },
                            data: {
                                quantity: existingTargetCm.quantity + scm.quantity
                            }
                        });
                        await tx.candleMaterial.delete({ where: { id: scm.id } });
                    } else {
                        // No collision: just re-assign
                        await tx.candleMaterial.update({
                            where: { id: scm.id },
                            data: { materialId: targetId }
                        });
                    }
                }
            }

            // 2. BonDeCommandeMatieresLigne
            await tx.bonDeCommandeMatieresLigne.updateMany({
                where: { matierePremiereId: { in: sourceIds } },
                data: { matierePremiereId: targetId }
            });

            // 3. StockMovement
            await tx.stockMovement.updateMany({
                where: { matierePremiereId: { in: sourceIds } },
                data: { matierePremiereId: targetId }
            });

            // 4. CommandeLigneMatiereSupplementaire
            await tx.commandeLigneMatiereSupplementaire.updateMany({
                where: { matierePremiereId: { in: sourceIds } },
                data: { matierePremiereId: targetId }
            });

            // Update Target (average price, sum stock)
            const convertValue = (value: number, fromUnit: string, toUnit: string): number => {
                if (fromUnit === toUnit) return value;

                // Weight conversions
                if (fromUnit === "G" && toUnit === "KG") return value / 1000;
                if (fromUnit === "KG" && toUnit === "G") return value * 1000;

                // Volume conversions
                if (fromUnit === "ML" && toUnit === "L") return value / 1000;
                if (fromUnit === "L" && toUnit === "ML") return value * 1000;

                // If no conversion possible, we take the raw value as requested ("passer l'unité directement")
                return value;
            };

            const allMaterials = [target, ...sources];

            // For price, if we convert units, we should ideally adjust costPerUnit too
            // But simple average was requested. However, if units are different, simple average of prices is wrong.
            // e.g. 10€/KG and 0.01€/G. Average = 5.005. If target is KG, it should be (10 + (0.01*1000))/2 = 10.
            const adjustedPrices = allMaterials.map(m => {
                if (m.unit === target.unit) return m.costPerUnit;
                // Cost per unit G normalized to KG: if it costs 1€ per G, it costs 1000€ per KG
                if (m.unit === "G" && target.unit === "KG") return m.costPerUnit * 1000;
                if (m.unit === "KG" && target.unit === "G") return m.costPerUnit / 1000;
                if (m.unit === "ML" && target.unit === "L") return m.costPerUnit * 1000;
                if (m.unit === "L" && target.unit === "ML") return m.costPerUnit / 1000;
                return m.costPerUnit;
            });
            const avgPrice = adjustedPrices.reduce((acc, p) => acc + p, 0) / adjustedPrices.length;

            const totalStockPhysique = allMaterials.reduce((acc, m) => acc + convertValue(m.stockPhysique || 0, m.unit, target.unit), 0);
            const totalStockReserve = allMaterials.reduce((acc, m) => acc + convertValue(m.stockReserve || 0, m.unit, target.unit), 0);

            await tx.material.update({
                where: { id: targetId },
                data: {
                    costPerUnit: avgPrice,
                    stockPhysique: totalStockPhysique,
                    stockReserve: totalStockReserve
                }
            });

            // Delete sources
            await tx.material.deleteMany({
                where: { id: { in: sourceIds } }
            });

            return true;
        }, {
            // Options pour la transaction en cas d'opérations lourdes
            timeout: 10000
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Erreur lors de la fusion" }, { status: 400 });
    }
}
