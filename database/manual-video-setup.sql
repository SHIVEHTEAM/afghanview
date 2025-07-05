-- Manual Video Setup SQL
-- Run this in your Supabase SQL editor to complete video support setup

-- 1. Update media_files table to support videos
ALTER TABLE media_files 
ADD COLUMN IF NOT EXISTS media_type VARCHAR(10) DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
ADD COLUMN IF NOT EXISTS duration_ms INTEGER,
ADD COLUMN IF NOT EXISTS video_metadata JSONB;

-- 2. Create performance index
CREATE INDEX IF NOT EXISTS idx_media_files_restaurant_type 
ON media_files(restaurant_id, media_type);

-- 3. Create RLS policies for the slideshow-media bucket
-- (These will be created automatically when you first access the bucket)

-- 4. Verify the setup
SELECT 
  'media_files table updated' as status,
  COUNT(*) as total_records
FROM media_files;

-- 5. Check if new columns exist
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'media_files' 
  AND column_name IN ('media_type', 'duration_ms', 'video_metadata')
ORDER BY column_name; 