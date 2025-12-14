-- CreateEnum
CREATE TYPE "ModeQuantiteSupplement" AS ENUM ('PAR_BOUGIE', 'PAR_LIGNE');

-- CreateTable
CREATE TABLE "CommandeLigneMatiereSupplementaire" (
    "id" TEXT NOT NULL,
    "commandeLigneId" TEXT NOT NULL,
    "matierePremiereId" TEXT NOT NULL,
    "modeQuantite" "ModeQuantiteSupplement" NOT NULL,
    "quantite" DOUBLE PRECISION NOT NULL,
    "unite" "Unit",
    "prixUnitaireOverride" DOUBLE PRECISION,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommandeLigneMatiereSupplementaire_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommandeLigneMatiereSupplementaire_commandeLigneId_idx" ON "CommandeLigneMatiereSupplementaire"("commandeLigneId");

-- CreateIndex
CREATE INDEX "CommandeLigneMatiereSupplementaire_matierePremiereId_idx" ON "CommandeLigneMatiereSupplementaire"("matierePremiereId");

-- AddForeignKey
ALTER TABLE "CommandeLigneMatiereSupplementaire" ADD CONSTRAINT "CommandeLigneMatiereSupplementaire_commandeLigneId_fkey" FOREIGN KEY ("commandeLigneId") REFERENCES "CommandeLigne"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandeLigneMatiereSupplementaire" ADD CONSTRAINT "CommandeLigneMatiereSupplementaire_matierePremiereId_fkey" FOREIGN KEY ("matierePremiereId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
