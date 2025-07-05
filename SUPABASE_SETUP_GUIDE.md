# Supabase Setup Guide for ShivehView

This guide will help you set up Supabase for the ShivehView slideshow system.

## 🚀 Quick Setup Steps

### 1. Create a Supabase Project

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Sign in** or create an account
3. **Click "New Project"**
4. **Choose your organization**
5. **Enter project details**:
   - Name: `shivehview` (or any name you prefer)
   - Database Password: Choose a strong password
   - Region: Select closest to your users
6. **Click "Create new project"**
7. **Wait for setup** (usually 1-2 minutes)

### 2. Get Your API Credentials

1. **In your Supabase project dashboard**, go to **Settings** → **API**
2. **Copy the following values**:
   - **Project URL**: Looks like `https://your-project-id.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`
   - **service_role key**: Long string starting with `eyJ...` (keep this secret!)

### 3. Update Your Environment File

1. **Open `.env.local`** in your project root
2. **Replace the placeholder values** with your actual credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Other configurations...
```

### 4. Run the Database Setup

After updating your credentials, run:

```bash
node scripts/setup-enhanced-db.js
```

This will:

- ✅ Create the enhanced database schema
- ✅ Set up storage bucket with proper policies
- ✅ Create demo restaurants and slides
- ✅ Create admin user (admin@shivehview.com / admin123456)

### 5. Start the Application

```bash
npm run dev
```

Visit: http://localhost:3001 (or the port shown in your terminal)

## 🔧 Manual Database Setup (Alternative)

If you prefer to set up the database manually:

### 1. Run SQL in Supabase Dashboard

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `database/enhanced-schema.sql`
3. Click **Run** to execute the schema

### 2. Create Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Name: `slideshow-images`
4. Public bucket: ✅ **Yes**
5. Click **Create bucket**

### 3. Set Storage Policies

Run these SQL commands in the SQL Editor:

```sql
-- Public read access to slideshow images
CREATE POLICY "Public read access to slideshow images" ON storage.objects
FOR SELECT USING (bucket_id = 'slideshow-images');

-- Authenticated users can upload slideshow images
CREATE POLICY "Authenticated users can upload slideshow images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'slideshow-images'
  AND auth.role() = 'authenticated'
);

-- Users can update their own slideshow images
CREATE POLICY "Users can update their own slideshow images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'slideshow-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own slideshow images
CREATE POLICY "Users can delete their own slideshow images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'slideshow-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🎯 What You'll Get

After setup, you'll have:

- ✅ **Enhanced Database Schema** with multiple images per slide
- ✅ **Storage Bucket** for image uploads
- ✅ **Demo Data** with sample restaurants and slides
- ✅ **Admin User** for testing
- ✅ **Full CRUD Operations** for slides
- ✅ **Admin Locking** functionality
- ✅ **Drag & Drop** reordering

## 🔍 Testing Your Setup

1. **Visit the client page**: http://localhost:3001/client
2. **Login as admin**: admin@shivehview.com / admin123456
3. **Try adding a slide** with multiple images
4. **Test the slideshow preview**
5. **Test admin locking** functionality

## 🐛 Troubleshooting

### "Invalid URL" Error

- Make sure your `NEXT_PUBLIC_SUPABASE_URL` starts with `https://`
- Check that you copied the full URL from Supabase dashboard

### "Permission Denied" Error

- Ensure you copied the correct `SUPABASE_SERVICE_ROLE_KEY`
- Check that your Supabase project is active

### "Bucket Not Found" Error

- Make sure you created the `slideshow-images` bucket
- Check that the bucket is public

### Database Connection Issues

- Verify your project URL and keys are correct
- Check that your Supabase project is not paused

## 📞 Need Help?

If you encounter issues:

1. **Check the Supabase logs** in your project dashboard
2. **Verify your credentials** are correctly copied
3. **Ensure your project is active** (not paused)
4. **Check the browser console** for detailed error messages

## 🎉 Success!

Once everything is working, you'll have a fully functional slideshow system with:

- Multiple images per slide
- Drag & drop reordering
- Admin slide locking
- Real-time updates
- Image upload and management
- Enhanced permissions system

Happy coding! 🚀
