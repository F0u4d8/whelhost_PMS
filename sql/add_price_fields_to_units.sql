-- Migration to add price fields to units table

-- Add base_price column to units table
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2);

-- Add service_charges column to units table
ALTER TABLE public.units ADD COLUMN IF NOT EXISTS service_charges DECIMAL(10,2) DEFAULT 0;

-- Update the RLS policy for units if needed to ensure it includes the new columns
-- Note: This is just adding the columns; existing RLS policies remain the same