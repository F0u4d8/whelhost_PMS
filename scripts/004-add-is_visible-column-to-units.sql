-- Add is_visible column to units table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'is_visible') THEN
        ALTER TABLE public.units ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;
        
        -- Update all existing units to be visible by default
        UPDATE public.units SET is_visible = TRUE WHERE is_visible IS NULL;
    END IF;
END $$;

-- Make sure the new column has appropriate RLS policies
-- (Additional RLS policies might be needed depending on your security requirements)