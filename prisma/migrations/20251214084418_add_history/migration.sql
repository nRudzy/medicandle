/*
  Warnings:

  - The values [ENVOYE_FOURNISSEUR] on the enum `BonDeCommandeMatieresStatut` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('AJUSTEMENT_MANUEL', 'RECEPTION_APPRO', 'RESERVATION_COMMANDE', 'ANNULATION_RESERVATION', 'CONSOMMATION_COMMANDE', 'CORRECTION');

-- CreateEnum
CREATE TYPE "StockMovementSourceType" AS ENUM ('BON_COMMANDE_MATIERES', 'COMMANDE', 'MANUEL', 'AUTRE');

-- CreateEnum
CREATE TYPE "FinancialTransactionType" AS ENUM ('DEPENSE_APPRO', 'RECETTE_COMMANDE', 'DEPENSE_AUTRE', 'REMBOURSEMENT', 'AJUSTEMENT', 'DEPENSE_MATIERE_CONSOMMEE');

-- CreateEnum
CREATE TYPE "FinancialTransactionSourceType" AS ENUM ('BON_COMMANDE_MATIERES', 'COMMANDE', 'MANUEL');

-- AlterEnum
BEGIN;
CREATE TYPE "BonDeCommandeMatieresStatut_new" AS ENUM ('BROUILLON', 'ENVOYE', 'RECU_PARTIEL', 'RECU_TOTAL', 'ANNULE');
ALTER TABLE "public"."BonDeCommandeMatieres" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "BonDeCommandeMatieres" ALTER COLUMN "statut" TYPE "BonDeCommandeMatieresStatut_new" USING ("statut"::text::"BonDeCommandeMatieresStatut_new");
ALTER TYPE "BonDeCommandeMatieresStatut" RENAME TO "BonDeCommandeMatieresStatut_old";
ALTER TYPE "BonDeCommandeMatieresStatut_new" RENAME TO "BonDeCommandeMatieresStatut";
DROP TYPE "public"."BonDeCommandeMatieresStatut_old";
ALTER TABLE "BonDeCommandeMatieres" ALTER COLUMN "statut" SET DEFAULT 'BROUILLON';
COMMIT;

-- AlterTable
ALTER TABLE "BonDeCommandeMatieres" ADD COLUMN     "dateEnvoi" TIMESTAMP(3),
ADD COLUMN     "dateReception" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "BonDeCommandeMatieresLigne" ADD COLUMN     "prixUnitaireAchat" DOUBLE PRECISION,
ADD COLUMN     "quantiteRecue" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matierePremiereId" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantiteDelta" DOUBLE PRECISION NOT NULL,
    "unite" "Unit" NOT NULL,
    "prixUnitaire" DOUBLE PRECISION,
    "valeurDelta" DOUBLE PRECISION,
    "sourceType" "StockMovementSourceType",
    "sourceId" TEXT,
    "commentaire" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialTransaction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "FinancialTransactionType" NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'EUR',
    "description" TEXT,
    "categorie" TEXT,
    "sourceType" "FinancialTransactionSourceType",
    "sourceId" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_matierePremiereId_fkey" FOREIGN KEY ("matierePremiereId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
