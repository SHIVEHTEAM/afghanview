-- Add support for template slides (slides without restaurant_id)
-- This allows admins to create slides that can be used by all restaurants

-- First, make restaurant_id nullable for template slides
ALTER TABLE public.slides 
ALTER COLUMN restaurant_id DROP NOT NULL;

-- Add a comment to explain the new behavior
COMMENT ON COLUMN public.slides.restaurant_id IS 'Restaurant ID for specific slides, NULL for template slides available to all restaurants';

-- Add a check constraint to ensure either restaurant_id or template_id is provided
ALTER TABLE public.slides 
ADD CONSTRAINT check_restaurant_or_template 
CHECK (restaurant_id IS NOT NULL OR template_id IS NOT NULL);

-- Update RLS policies to handle template slides
DROP POLICY IF EXISTS "Anyone can view active slides" ON public.slides;

-- New policy that allows viewing template slides (restaurant_id IS NULL) and restaurant-specific slides
CREATE POLICY "Users can view slides" ON public.slides
FOR SELECT USING (
    is_active = true AND (
        restaurant_id IS NULL OR -- Template slides
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND restaurant_id = slides.restaurant_id
        )
    )
);

-- Policy for admins to manage all slides including templates
CREATE POLICY "Admins can manage all slides" ON public.slides
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy for restaurant owners to manage their slides (but not templates)
CREATE POLICY "Restaurant owners can manage their slides" ON public.slides
FOR ALL USING (
    restaurant_id IS NOT NULL AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND restaurant_id = slides.restaurant_id
    ) AND is_locked = false
);

-- Add index for template slides
CREATE INDEX IF NOT EXISTS idx_slides_template_slides ON public.slides(restaurant_id) WHERE restaurant_id IS NULL;

-- Add index for restaurant slides
CREATE INDEX IF NOT EXISTS idx_slides_restaurant_slides ON public.slides(restaurant_id) WHERE restaurant_id IS NOT NULL; 