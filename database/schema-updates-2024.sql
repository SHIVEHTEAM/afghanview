-- Schema Updates for AfghanView - 2024
-- This file contains updates to improve the database schema based on codebase analysis

-- 1. Add missing fields to slideshows table for better consistency
ALTER TABLE public.slideshows 
ADD COLUMN IF NOT EXISTS background_music text,
ADD COLUMN IF NOT EXISTS music_volume integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS music_loop boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_play boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_controls boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_progress boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS loop_slideshow boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS shuffle_slides boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS aspect_ratio text DEFAULT '16:9',
ADD COLUMN IF NOT EXISTS quality text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS transition_duration integer DEFAULT 800,
ADD COLUMN IF NOT EXISTS auto_random_fact boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS random_fact_interval integer DEFAULT 6;

-- 2. Add missing fields to facts table for AI facts functionality
ALTER TABLE public.facts 
ADD COLUMN IF NOT EXISTS font_color character varying DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS emoji text,
ADD COLUMN IF NOT EXISTS is_auto_generated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS generation_prompt text;

-- 3. Add missing fields to media_files table for better video support
ALTER TABLE public.media_files 
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS processing_status text DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS processing_error text;

-- 4. Add missing fields to businesses table for better business management
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS ai_credits integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS ai_credits_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_slideshows integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_staff_members integer DEFAULT 1;

-- 5. Add missing fields to profiles table for user management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ai_credits integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS ai_credits_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone;

-- 6. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_slideshows_business_id ON public.slideshows(business_id);
CREATE INDEX IF NOT EXISTS idx_slideshows_created_by ON public.slideshows(created_by);
CREATE INDEX IF NOT EXISTS idx_slideshows_is_active ON public.slideshows(is_active);
CREATE INDEX IF NOT EXISTS idx_media_files_business_id ON public.media_files(business_id);
CREATE INDEX IF NOT EXISTS idx_facts_business_id ON public.facts(business_id);
CREATE INDEX IF NOT EXISTS idx_facts_created_by ON public.facts(created_by);
CREATE INDEX IF NOT EXISTS idx_business_staff_business_id ON public.business_staff(business_id);
CREATE INDEX IF NOT EXISTS idx_business_staff_user_id ON public.business_staff(user_id);

-- 7. Add constraints for data integrity
ALTER TABLE public.slideshows 
ADD CONSTRAINT chk_music_volume CHECK (music_volume >= 0 AND music_volume <= 100),
ADD CONSTRAINT chk_aspect_ratio CHECK (aspect_ratio IN ('16:9', '4:3', '1:1', 'auto')),
ADD CONSTRAINT chk_quality CHECK (quality IN ('low', 'medium', 'high'));

ALTER TABLE public.businesses 
ADD CONSTRAINT chk_ai_credits CHECK (ai_credits >= 0),
ADD CONSTRAINT chk_ai_credits_used CHECK (ai_credits_used >= 0),
ADD CONSTRAINT chk_max_slideshows CHECK (max_slideshows >= 1),
ADD CONSTRAINT chk_max_staff_members CHECK (max_staff_members >= 1);

ALTER TABLE public.profiles 
ADD CONSTRAINT chk_ai_credits_profile CHECK (ai_credits >= 0),
ADD CONSTRAINT chk_ai_credits_used_profile CHECK (ai_credits_used >= 0);

-- 8. Add comments for better documentation
COMMENT ON COLUMN public.slideshows.background_music IS 'URL or path to background music file';
COMMENT ON COLUMN public.slideshows.music_volume IS 'Music volume percentage (0-100)';
COMMENT ON COLUMN public.slideshows.music_loop IS 'Whether background music should loop';
COMMENT ON COLUMN public.slideshows.auto_play IS 'Whether slideshow should auto-play';
COMMENT ON COLUMN public.slideshows.show_controls IS 'Whether to show player controls';
COMMENT ON COLUMN public.slideshows.show_progress IS 'Whether to show progress bar';
COMMENT ON COLUMN public.slideshows.loop_slideshow IS 'Whether slideshow should loop';
COMMENT ON COLUMN public.slideshows.shuffle_slides IS 'Whether to shuffle slides';
COMMENT ON COLUMN public.slideshows.aspect_ratio IS 'Slideshow aspect ratio';
COMMENT ON COLUMN public.slideshows.quality IS 'Slideshow quality setting';
COMMENT ON COLUMN public.slideshows.transition_duration IS 'Transition duration in milliseconds';
COMMENT ON COLUMN public.slideshows.auto_random_fact IS 'Whether to auto-generate random facts';
COMMENT ON COLUMN public.slideshows.random_fact_interval IS 'Interval for auto-generating facts (hours)';

COMMENT ON COLUMN public.facts.font_color IS 'Text color for fact display';
COMMENT ON COLUMN public.facts.emoji IS 'Emoji associated with the fact';
COMMENT ON COLUMN public.facts.is_auto_generated IS 'Whether fact was auto-generated';
COMMENT ON COLUMN public.facts.generation_prompt IS 'Prompt used to generate this fact';

COMMENT ON COLUMN public.businesses.subscription_plan IS 'Current subscription plan';
COMMENT ON COLUMN public.businesses.ai_credits IS 'Available AI credits';
COMMENT ON COLUMN public.businesses.ai_credits_used IS 'Used AI credits';
COMMENT ON COLUMN public.businesses.max_slideshows IS 'Maximum allowed slideshows';
COMMENT ON COLUMN public.businesses.max_staff_members IS 'Maximum allowed staff members';

COMMENT ON COLUMN public.profiles.ai_credits IS 'Available AI credits for user';
COMMENT ON COLUMN public.profiles.ai_credits_used IS 'Used AI credits for user';
COMMENT ON COLUMN public.profiles.subscription_plan IS 'User subscription plan';
COMMENT ON COLUMN public.profiles.subscription_status IS 'User subscription status';
COMMENT ON COLUMN public.profiles.subscription_expires_at IS 'When user subscription expires';

-- 9. Update existing data to set default values for new columns
UPDATE public.slideshows 
SET 
  music_volume = 50,
  music_loop = true,
  auto_play = true,
  show_controls = true,
  show_progress = true,
  loop_slideshow = true,
  shuffle_slides = false,
  aspect_ratio = '16:9',
  quality = 'medium',
  transition_duration = 800,
  auto_random_fact = false,
  random_fact_interval = 6
WHERE music_volume IS NULL;

UPDATE public.businesses 
SET 
  subscription_plan = 'free',
  ai_credits = 10,
  ai_credits_used = 0,
  max_slideshows = 1,
  max_staff_members = 1
WHERE subscription_plan IS NULL;

UPDATE public.profiles 
SET 
  ai_credits = 10,
  ai_credits_used = 0,
  subscription_plan = 'free',
  subscription_status = 'active'
WHERE ai_credits IS NULL;

-- 10. Create a function to migrate settings from JSONB to individual columns
CREATE OR REPLACE FUNCTION migrate_slideshow_settings()
RETURNS void AS $$
DECLARE
  slideshow_record RECORD;
BEGIN
  FOR slideshow_record IN SELECT id, settings FROM public.slideshows WHERE settings IS NOT NULL
  LOOP
    -- Migrate background music settings
    IF slideshow_record.settings->>'backgroundMusic' IS NOT NULL THEN
      UPDATE public.slideshows 
      SET background_music = slideshow_record.settings->>'backgroundMusic'
      WHERE id = slideshow_record.id;
    END IF;
    
    IF slideshow_record.settings->>'background_music' IS NOT NULL THEN
      UPDATE public.slideshows 
      SET background_music = slideshow_record.settings->>'background_music'
      WHERE id = slideshow_record.id;
    END IF;
    
    -- Migrate music volume
    IF slideshow_record.settings->>'musicVolume' IS NOT NULL THEN
      UPDATE public.slideshows 
      SET music_volume = (slideshow_record.settings->>'musicVolume')::integer
      WHERE id = slideshow_record.id;
    END IF;
    
    IF slideshow_record.settings->>'music_volume' IS NOT NULL THEN
      UPDATE public.slideshows 
      SET music_volume = (slideshow_record.settings->>'music_volume')::integer
      WHERE id = slideshow_record.id;
    END IF;
    
    -- Migrate music loop
    IF slideshow_record.settings->>'musicLoop' IS NOT NULL THEN
      UPDATE public.slideshows 
      SET music_loop = (slideshow_record.settings->>'musicLoop')::boolean
      WHERE id = slideshow_record.id;
    END IF;
    
    IF slideshow_record.settings->>'music_loop' IS NOT NULL THEN
      UPDATE public.slideshows 
      SET music_loop = (slideshow_record.settings->>'music_loop')::boolean
      WHERE id = slideshow_record.id;
    END IF;
    
    -- Migrate other settings
    IF slideshow_record.settings->>'autoPlay' IS NOT NULL THEN
      UPDATE public.slideshows 
      SET auto_play = (slideshow_record.settings->>'autoPlay')::boolean
      WHERE id = slideshow_record.id;
    END IF;
    
    IF slideshow_record.settings->>'showControls' IS NOT NULL THEN
      UPDATE public.slideshows 
      SET show_controls = (slideshow_record.settings->>'showControls')::boolean
      WHERE id = slideshow_record.id;
    END IF;
    
    IF slideshow_record.settings->>'showProgress' IS NOT NULL THEN
      UPDATE public.slideshows 
      SET show_progress = (slideshow_record.settings->>'showProgress')::boolean
      WHERE id = slideshow_record.id;
    END IF;
    
    IF slideshow_record.settings->>'loopSlideshow' IS NOT NULL THEN
      UPDATE public.slideshows 
      SET loop_slideshow = (slideshow_record.settings->>'loopSlideshow')::boolean
      WHERE id = slideshow_record.id;
    END IF;
    
    IF slideshow_record.settings->>'shuffleSlides' IS NOT NULL THEN
      UPDATE public.slideshows 
      SET shuffle_slides = (slideshow_record.settings->>'shuffleSlides')::boolean
      WHERE id = slideshow_record.id;
    END IF;
    
    IF slideshow_record.settings->>'aspectRatio' IS NOT NULL THEN
      UPDATE public.slideshows 
      SET aspect_ratio = slideshow_record.settings->>'aspectRatio'
      WHERE id = slideshow_record.id;
    END IF;
    
    IF slideshow_record.settings->>'quality' IS NOT NULL THEN
      UPDATE public.slideshows 
      SET quality = slideshow_record.settings->>'quality'
      WHERE id = slideshow_record.id;
    END IF;
    
    IF slideshow_record.settings->>'transitionDuration' IS NOT NULL THEN
      UPDATE public.slideshows 
      SET transition_duration = (slideshow_record.settings->>'transitionDuration')::integer
      WHERE id = slideshow_record.id;
    END IF;
    
    IF slideshow_record.settings->>'autoRandomFact' IS NOT NULL THEN
      UPDATE public.slideshows 
      SET auto_random_fact = (slideshow_record.settings->>'autoRandomFact')::boolean
      WHERE id = slideshow_record.id;
    END IF;
    
    IF slideshow_record.settings->>'randomFactInterval' IS NOT NULL THEN
      UPDATE public.slideshows 
      SET random_fact_interval = (slideshow_record.settings->>'randomFactInterval')::integer
      WHERE id = slideshow_record.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 11. Execute the migration function
SELECT migrate_slideshow_settings();

-- 12. Drop the migration function after use
DROP FUNCTION migrate_slideshow_settings();

-- 13. Add RLS policies for new columns (if RLS is enabled)
-- Note: These policies assume RLS is already set up for the tables

-- 14. Create a view for easier slideshow management
CREATE OR REPLACE VIEW slideshow_summary AS
SELECT 
  s.id,
  s.title,
  s.description,
  s.business_id,
  b.name as business_name,
  s.is_active,
  s.play_count,
  s.last_played,
  s.created_at,
  s.updated_at,
  s.background_music,
  s.music_volume,
  s.music_loop,
  s.auto_play,
  s.show_controls,
  s.aspect_ratio,
  s.quality,
  s.transition_duration,
  s.auto_random_fact,
  s.random_fact_interval,
  jsonb_array_length(s.content->'slides') as slide_count,
  u.first_name || ' ' || u.last_name as created_by_name
FROM public.slideshows s
LEFT JOIN public.businesses b ON s.business_id = b.id
LEFT JOIN public.profiles u ON s.created_by = u.id;

-- 15. Grant permissions on the view
GRANT SELECT ON slideshow_summary TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Schema updates completed successfully!';
  RAISE NOTICE 'Added new columns for better slideshow settings management';
  RAISE NOTICE 'Added AI credits tracking for businesses and users';
  RAISE NOTICE 'Added performance indexes for better query performance';
  RAISE NOTICE 'Added data integrity constraints';
  RAISE NOTICE 'Created slideshow_summary view for easier management';
END $$; 