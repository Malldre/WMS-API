-- Migration: Update inventory table to use invoice_item_id instead of material_id
-- This migration changes the inventory reference from material to invoice_item

-- 1. Check if invoice_item_id column already exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory' AND column_name = 'invoice_item_id'
  ) THEN
    ALTER TABLE "inventory" ADD COLUMN "invoice_item_id" INTEGER;
  END IF;
END $$;

-- 2. Populate invoice_item_id based on existing material_id and storage_id
-- This finds the invoice_item that matches the material
UPDATE "inventory" 
SET "invoice_item_id" = (
  SELECT ii.id 
  FROM "invoice_item" ii
  WHERE ii.material_id = "inventory".material_id
  LIMIT 1
)
WHERE "invoice_item_id" IS NULL;

-- 3. Make invoice_item_id NOT NULL now that it's populated
ALTER TABLE "inventory" ALTER COLUMN "invoice_item_id" SET NOT NULL;

-- 4. Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'inventory_invoice_item_id_fkey'
    AND table_name = 'inventory'
  ) THEN
    ALTER TABLE "inventory" 
    ADD CONSTRAINT "inventory_invoice_item_id_fkey" 
    FOREIGN KEY ("invoice_item_id") 
    REFERENCES "invoice_item"("id") 
    ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Drop the old material_id column
ALTER TABLE "inventory" DROP COLUMN "material_id";
