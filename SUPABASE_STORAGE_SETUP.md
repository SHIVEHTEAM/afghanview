# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for the ShivehView slideshow system.

## Prerequisites

1. A Supabase project (create one at https://supabase.com)
2. Your Supabase project URL and API keys

## Step 1: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

To get these values:

1. Go to your Supabase dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon key
4. Copy the service_role key (keep this secret!)

## Step 2: Create Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Click "Create a new bucket"
4. Set the following:
   - **Name**: `media`
   - **Public**: `false` (private bucket for authenticated access)
   - **File size limit**: `10MB`
   - **Allowed MIME types**: `image/*`, `audio/*`, `video/*`

## Step 3: Set Up Storage Policies

Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read files
CREATE POLICY "allow_authenticated_read" ON storage.objects
FOR SELECT USING (
  bucket_id = 'media'
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to upload files
CREATE POLICY "allow_authenticated_upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media'
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to update files
CREATE POLICY "allow_authenticated_update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'media'
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to delete files
CREATE POLICY "allow_authenticated_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'media'
  AND auth.role() = 'authenticated'
);
```

## Step 4: Run Setup Script

After setting up your environment variables, run:

```bash
node scripts/setup-storage.js
```

This will verify your setup and create the bucket if needed.

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Go to the client dashboard
3. Try creating a new slideshow and uploading images
4. The images should be uploaded to Supabase Storage and displayed correctly

## Troubleshooting

### "Missing Supabase environment variables"

- Make sure your `.env.local` file exists and has the correct values
- Restart your development server after adding environment variables

### "Upload failed" errors

- Check that the storage bucket exists and is named `media`
- Verify that the storage policies are correctly set up
- Make sure your service role key has the necessary permissions

### Images not displaying

- Check the browser console for errors
- Verify that signed URLs are being generated correctly
- Make sure the file paths in the database match the actual files in storage

### Permission errors

- Ensure RLS is enabled on the storage.objects table
- Check that the storage policies are active
- Verify that your API keys have the correct permissions

## Security Notes

- The `media` bucket is private and requires authentication
- Files are accessed via signed URLs that expire after 1 hour
- Only authenticated users can upload, read, update, or delete files
- The service role key should never be exposed to the client

## File Structure

Files are stored in the following structure:

```
media/
├── restaurants/
│   └── {restaurant-id}/
│       └── media/
│           ├── {timestamp}-{random}.jpg
│           ├── {timestamp}-{random}.png
│           └── ...
```

This structure ensures files are organized by restaurant and prevents naming conflicts.
