-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('WAX', 'SCENT', 'WICK', 'CONTAINER', 'DYE', 'ACCESSORY', 'PACKAGING', 'OTHER');

-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('G', 'KG', 'ML', 'L', 'PIECE');

-- CreateEnum
CREATE TYPE "Positioning" AS ENUM ('ENTRY', 'PREMIUM', 'LUXURY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MaterialType" NOT NULL,
    "costPerUnit" DOUBLE PRECISION NOT NULL,
    "unit" "Unit" NOT NULL,
    "quantityPerUnit" DOUBLE PRECISION,
    "supplier" TEXT,
    "currentStock" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDesc" TEXT,
    "longDesc" TEXT,
    "category" TEXT,
    "format" TEXT,
    "photoUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "positioning" "Positioning",
    "currentPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandleMaterial" (
    "id" TEXT NOT NULL,
    "candleId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "Unit",

    CONSTRAINT "CandleMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionSettings" (
    "id" TEXT NOT NULL,
    "laborRate" DOUBLE PRECISION NOT NULL,
    "electricityCost" DOUBLE PRECISION,
    "amortizationCost" DOUBLE PRECISION,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),

    CONSTRAINT "ProductionSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandleProductionParams" (
    "id" TEXT NOT NULL,
    "candleId" TEXT NOT NULL,
    "prepTimeMinutes" INTEGER NOT NULL,
    "heatingTimeMinutes" INTEGER,

    CONSTRAINT "CandleProductionParams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingSettings" (
    "id" TEXT NOT NULL,
    "targetMargin" DOUBLE PRECISION,
    "multiplierEntry" DOUBLE PRECISION NOT NULL,
    "multiplierPremium" DOUBLE PRECISION NOT NULL,
    "multiplierLuxury" DOUBLE PRECISION NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3),

    CONSTRAINT "PricingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectionScenario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "globalHypotheses" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectionScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioItem" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "candleId" TEXT NOT NULL,
    "estimatedQty" INTEGER NOT NULL,
    "usedPrice" DOUBLE PRECISION,

    CONSTRAINT "ScenarioItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CandleMaterial_candleId_materialId_key" ON "CandleMaterial"("candleId", "materialId");

-- CreateIndex
CREATE UNIQUE INDEX "CandleProductionParams_candleId_key" ON "CandleProductionParams"("candleId");

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioItem_scenarioId_candleId_key" ON "ScenarioItem"("scenarioId", "candleId");

-- AddForeignKey
ALTER TABLE "CandleMaterial" ADD CONSTRAINT "CandleMaterial_candleId_fkey" FOREIGN KEY ("candleId") REFERENCES "Candle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandleMaterial" ADD CONSTRAINT "CandleMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandleProductionParams" ADD CONSTRAINT "CandleProductionParams_candleId_fkey" FOREIGN KEY ("candleId") REFERENCES "Candle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioItem" ADD CONSTRAINT "ScenarioItem_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "ProjectionScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioItem" ADD CONSTRAINT "ScenarioItem_candleId_fkey" FOREIGN KEY ("candleId") REFERENCES "Candle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
