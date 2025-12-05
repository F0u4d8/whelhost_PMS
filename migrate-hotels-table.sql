-- Add missing columns to the hotels table to support property management features

-- Add type column
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'hotel' CHECK (type IN ('hotel', 'apartments', 'resort', 'villa'));

-- Add status column  
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Add units_count column
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS units_count INTEGER DEFAULT 0;

-- Add name_ar column for Arabic name
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS name_ar TEXT;

-- Update the name_ar column with the existing name value for existing records
UPDATE public.hotels 
SET name_ar = name 
WHERE name_ar IS NULL;

-- Update the RLS policies to include the new columns in the permissions
-- First, drop the existing policy
DROP POLICY IF EXISTS "Users can manage own hotels" ON public.hotels;

-- Then recreate with proper permissions
CREATE POLICY "Users can manage own hotels" ON public.hotels
  FOR ALL USING (owner_id = auth.uid());