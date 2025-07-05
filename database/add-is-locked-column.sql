-- Add is_locked column to slides table
-- This migration adds admin locking functionality to slides

-- Add the is_locked column with default value false
ALTER TABLE public.slides 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

-- Add a comment to document the column purpose
COMMENT ON COLUMN public.slides.is_locked IS 'Whether the slide is locked from client editing by admin';

-- Create an index for better performance when querying locked slides
CREATE INDEX IF NOT EXISTS idx_slides_is_locked ON public.slides(is_locked);

-- Update RLS policies to consider the is_locked column
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Restaurant owners can manage their slides" ON public.slides;

-- Recreate the policy with is_locked check
CREATE POLICY "Restaurant owners can manage their slides" ON public.slides
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND restaurant_id = slides.restaurant_id
    ) AND is_locked = false
);

-- Add policy for admins to manage all slides (including locked ones)
CREATE POLICY "Admins can manage all slides" ON public.slides
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Add policy for viewing locked slides (admins can see all, restaurant owners can see their own)
CREATE POLICY "Users can view slides" ON public.slides
FOR SELECT USING (
    is_active = true AND (
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