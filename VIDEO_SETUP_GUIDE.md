# 🎬 Video Support Setup Guide

This guide will help you set up video support for your slideshow application.

## 📋 Prerequisites

- Supabase project with storage enabled
- Service role key with admin permissions
- Node.js environment

## 🚀 Quick Setup

### 1. Run the Setup Script

```bash
node scripts/setup-video-storage.js
```

This script will:

- ✅ Create the `slideshow-media` bucket
- ✅ Configure RLS policies
- ✅ Update the `media_files` table
- ✅ Create performance indexes

### 2. Manual SQL Setup (Alternative)

If the script doesn't work, run this SQL in your Supabase SQL editor:

```sql
-- Create the slideshow-media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'slideshow-media',
  'slideshow-media',
  true,
  52428800, -- 50MB limit
  ARRAY[
    -- Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    -- Videos
    'video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime'
  ]
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Update media_files table
ALTER TABLE media_files
ADD COLUMN IF NOT EXISTS media_type VARCHAR(10) DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
ADD COLUMN IF NOT EXISTS duration_ms INTEGER,
ADD COLUMN IF NOT EXISTS video_metadata JSONB;

-- Create index
CREATE INDEX IF NOT EXISTS idx_media_files_restaurant_type
ON media_files(restaurant_id, media_type);
```

## 🔧 Configuration

### Environment Variables

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### API Configuration

The upload API now supports:

- **File size limit**: 50MB (increased from 10MB)
- **Video formats**: MP4, WebM, MOV, AVI, QuickTime
- **Image formats**: JPEG, PNG, GIF, WebP
- **Automatic media type detection**

## 🎯 Features

### Video Support

- ✅ **10-second maximum duration** (enforced client-side)
- ✅ **Multiple video formats** supported
- ✅ **Automatic duration detection**
- ✅ **Secure signed URLs** for video access
- ✅ **Optimized storage** with proper MIME types

### Enhanced Upload

- ✅ **Drag & drop** for both images and videos
- ✅ **File validation** (size, format, duration)
- ✅ **Progress tracking**
- ✅ **Error handling**

### Database Schema

- ✅ **media_type** column (image/video)
- ✅ **duration_ms** for video length
- ✅ **video_metadata** for additional info
- ✅ **Performance indexes**

## 🔒 Security

### RLS Policies

- **Public read access** for slideshow media
- **Authenticated upload** only
- **User-specific permissions** for updates/deletes

### Signed URLs

- **Temporary access** (1 hour default)
- **Secure video streaming**
- **No direct bucket access**

## 📊 Storage Structure

```
slideshow-media/
├── restaurants/
│   └── {restaurant-id}/
│       └── media/
│           ├── {timestamp}-{random}.jpg
│           ├── {timestamp}-{random}.mp4
│           └── {timestamp}-{random}.webm
```

## 🧪 Testing

### Test Video Upload

1. Go to your slideshow editor
2. Try uploading a video file (MP4, WebM, etc.)
3. Verify it appears in the media list
4. Check the preview functionality
5. Test the duration controls

### Test Video Validation

1. Try uploading a video longer than 10 seconds
2. Verify the error message appears
3. Try uploading an unsupported format
4. Verify proper error handling

## 🐛 Troubleshooting

### Common Issues

**"Bucket not found" error**

- Run the setup script again
- Check if the bucket exists in Supabase dashboard

**"Permission denied" error**

- Verify RLS policies are set up correctly
- Check service role key permissions

**"File too large" error**

- Verify the 50MB limit is set correctly
- Check client-side validation

**"Unsupported format" error**

- Verify the MIME type is in the allowed list
- Check file extension validation

### Debug Steps

1. Check Supabase logs for errors
2. Verify bucket configuration
3. Test with a small video file first
4. Check network tab for upload requests

## 📈 Performance

### Optimizations

- **Client-side duration detection** (faster than server-side)
- **Lazy loading** for video previews
- **Compressed uploads** (base64)
- **Efficient database queries** with indexes

### Monitoring

- Monitor storage usage
- Track upload success rates
- Watch for failed uploads
- Monitor signed URL generation

## 🔄 Migration

### From Old System

If you have existing images in the `slide-images` bucket:

1. **Keep the old bucket** for backward compatibility
2. **New uploads** go to `slideshow-media`
3. **Gradual migration** can be done later
4. **Update existing code** to use new bucket

### Data Migration

```sql
-- Copy existing data to new structure
UPDATE media_files
SET media_type = 'image'
WHERE media_type IS NULL;
```

## 🎉 Success!

Once setup is complete, you'll have:

- ✅ Full video support in slideshows
- ✅ Secure file storage and access
- ✅ Enhanced user experience
- ✅ Scalable architecture

Your slideshow editor now supports both images and videos with advanced features like text overlays, effects, and custom timing!
