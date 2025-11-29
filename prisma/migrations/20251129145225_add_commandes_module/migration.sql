-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('PARTICULIER', 'PROFESSIONNEL');

-- CreateEnum
CREATE TYPE "CommandeStatut" AS ENUM ('BROUILLON', 'EN_ATTENTE_STOCK', 'EN_COURS_COMMANDE', 'EN_COURS_FABRICATION', 'TERMINEE', 'LIVREE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "BonDeCommandeMatieresStatut" AS ENUM ('BROUILLON', 'ENVOYE_FOURNISSEUR', 'RECU_PARTIEL', 'RECU_TOTAL');

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "stockMinimal" DOUBLE PRECISION,
ADD COLUMN     "stockPhysique" DOUBLE PRECISION,
ADD COLUMN     "stockReserve" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Migrate currentStock to stockPhysique
UPDATE "Material" SET "stockPhysique" = "currentStock" WHERE "currentStock" IS NOT NULL;

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "typeClient" "ClientType",
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "raisonSociale" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "adresseLigne1" TEXT,
    "adresseLigne2" TEXT,
    "codePostal" TEXT,
    "ville" TEXT,
    "pays" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commande" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "clientId" TEXT,
    "dateCommande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateLivraisonSouhaitee" TIMESTAMP(3),
    "statut" "CommandeStatut" NOT NULL DEFAULT 'BROUILLON',
    "commentaireInterne" TEXT,
    "commentaireClient" TEXT,
    "montantTotalEstime" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommandeLigne" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "bougieId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaireUtilise" DOUBLE PRECISION,
    "remisePourcentage" DOUBLE PRECISION,
    "remiseMontant" DOUBLE PRECISION,
    "montantLigne" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommandeLigne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonDeCommandeMatieres" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "statut" "BonDeCommandeMatieresStatut" DEFAULT 'BROUILLON',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BonDeCommandeMatieres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonDeCommandeMatieresLigne" (
    "id" TEXT NOT NULL,
    "bonDeCommandeMatieresId" TEXT NOT NULL,
    "matierePremiereId" TEXT NOT NULL,
    "quantiteACommander" DOUBLE PRECISION NOT NULL,
    "fournisseur" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BonDeCommandeMatieresLigne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonDeCommandeMatieresCommande" (
    "bonDeCommandeMatieresId" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,

    CONSTRAINT "BonDeCommandeMatieresCommande_pkey" PRIMARY KEY ("bonDeCommandeMatieresId","commandeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Commande_reference_key" ON "Commande"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "BonDeCommandeMatieres_reference_key" ON "BonDeCommandeMatieres"("reference");

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandeLigne" ADD CONSTRAINT "CommandeLigne_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandeLigne" ADD CONSTRAINT "CommandeLigne_bougieId_fkey" FOREIGN KEY ("bougieId") REFERENCES "Candle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonDeCommandeMatieresLigne" ADD CONSTRAINT "BonDeCommandeMatieresLigne_bonDeCommandeMatieresId_fkey" FOREIGN KEY ("bonDeCommandeMatieresId") REFERENCES "BonDeCommandeMatieres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonDeCommandeMatieresLigne" ADD CONSTRAINT "BonDeCommandeMatieresLigne_matierePremiereId_fkey" FOREIGN KEY ("matierePremiereId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonDeCommandeMatieresCommande" ADD CONSTRAINT "BonDeCommandeMatieresCommande_bonDeCommandeMatieresId_fkey" FOREIGN KEY ("bonDeCommandeMatieresId") REFERENCES "BonDeCommandeMatieres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonDeCommandeMatieresCommande" ADD CONSTRAINT "BonDeCommandeMatieresCommande_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;
