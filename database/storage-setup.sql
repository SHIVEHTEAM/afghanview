-- =====================================================
-- Supabase Storage Setup for ShivehView Slideshow
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Create the storage bucket (if it doesn't exist)
-- Note: This might need to be done manually in the Storage section of your dashboard
-- Bucket name: media
-- Public: false (private bucket for authenticated access)
-- Allowed MIME types: image/*, audio/*, video/*
-- File size limit: 10MB

-- Step 2: Create storage policies for the media bucket

-- Policy 1: Allow authenticated users to read files
CREATE POLICY "allow_authenticated_read" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'media' 
  AND auth.role() = 'authenticated'
);

-- Policy 2: Allow authenticated users to upload files
CREATE POLICY "allow_authenticated_upload" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'media' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to update files
CREATE POLICY "allow_authenticated_update" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'media' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow authenticated users to delete files
CREATE POLICY "allow_authenticated_delete" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'media' 
  AND auth.role() = 'authenticated'
);

-- Alternative Policy for Development (if you're not using authentication)
-- Uncomment the following if you want to allow all operations without authentication
-- WARNING: This is for development only, not recommended for production

/*
-- Allow all operations for development
CREATE POLICY "Development Full Access" ON storage.objects 
FOR ALL USING (bucket_id = 'slide-images');

-- Or if you want to be more specific:
CREATE POLICY "Development Upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'slide-images');

CREATE POLICY "Development Update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'slide-images');

CREATE POLICY "Development Delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'slide-images');
*/

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'media';

-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- =====================================================
-- Troubleshooting
-- =====================================================

-- If you get permission errors, you might need to enable RLS first:
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- If you want to temporarily disable RLS for testing:
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- To drop all policies and start over:
/*
DROP POLICY IF EXISTS "allow_authenticated_read" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_delete" ON storage.objects;
*/

-- Storage setup for slideshow media (images and videos)
-- Run this in your Supabase SQL editor

-- Create a comprehensive media bucket for both images and videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'slideshow-media',
  'slideshow-media',
  true,
  52428800, -- 50MB limit
  ARRAY[
    -- Images
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    -- Videos
    'video/mp4',
    'video/webm',
    'video/mov',
    'video/avi',
    'video/quicktime'
  ]
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for the media bucket
CREATE POLICY "Public read access for slideshow media" ON storage.objects
  FOR SELECT USING (bucket_id = 'slideshow-media');

CREATE POLICY "Authenticated users can upload slideshow media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'slideshow-media' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own slideshow media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'slideshow-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own slideshow media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'slideshow-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Update media_files table to support videos
ALTER TABLE media_files 
ADD COLUMN IF NOT EXISTS media_type VARCHAR(10) DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
ADD COLUMN IF NOT EXISTS duration_ms INTEGER,
ADD COLUMN IF NOT EXISTS video_metadata JSONB;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_media_files_restaurant_type 
ON media_files(restaurant_id, media_type);

-- Function to get media file info
CREATE OR REPLACE FUNCTION get_media_info(file_path TEXT)
RETURNS TABLE(
  id UUID,
  filename TEXT,
  original_filename TEXT,
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT,
  media_type TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mf.id,
    mf.filename,
    mf.original_filename,
    mf.file_path,
    mf.file_size,
    mf.mime_type,
    mf.media_type,
    mf.duration_ms,
    mf.created_at
  FROM media_files mf
  WHERE mf.file_path = get_media_info.file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_media_files()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  orphaned_file RECORD;
BEGIN
  FOR orphaned_file IN
    SELECT mf.file_path
    FROM media_files mf
    LEFT JOIN storage.objects so ON so.name = mf.file_path
    WHERE so.name IS NULL
  LOOP
    DELETE FROM media_files WHERE file_path = orphaned_file.file_path;
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated; 