-- DropForeignKey
ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_matierePremiereId_fkey";

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_matierePremiereId_fkey" FOREIGN KEY ("matierePremiereId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;
