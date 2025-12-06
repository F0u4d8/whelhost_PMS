-- Add image_urls column to the units table to store room images
ALTER TABLE public.units 
ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Update the existing units with empty array as default
UPDATE public.units 
SET image_urls = '{}' 
WHERE image_urls IS NULL;

-- Optional: Create an index on the image_urls column if needed for querying
-- CREATE INDEX CONCURRENTLY idx_units_image_urls ON public.units USING GIN (image_urls);
