-- Migrate any remaining currentStock values to stockPhysique (if not already done)
UPDATE "Material" 
SET "stockPhysique" = COALESCE("stockPhysique", "currentStock") 
WHERE "currentStock" IS NOT NULL AND "stockPhysique" IS NULL;

-- DropColumn
ALTER TABLE "Material" DROP COLUMN "currentStock";

