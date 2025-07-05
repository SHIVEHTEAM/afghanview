# ShivehView Slideshow Setup Guide

This guide will help you set up the new slideshow functionality with real data integration using Supabase.

## 🚀 Features

- **Real-time Data**: Slides are stored in Supabase database
- **Image Upload**: Drag & drop image upload with size validation
- **Multiple Slide Types**: Image, Menu, Promotion, Quote, and Hours slides
- **Responsive Design**: Works on all screen sizes
- **Live Preview**: See changes in real-time
- **CRUD Operations**: Create, Read, Update, Delete slides

## 📋 Prerequisites

1. **Supabase Project**: You need a Supabase project with the database schema set up
2. **Environment Variables**: Configure your Supabase credentials
3. **Storage Bucket**: Set up a storage bucket for image uploads

## 🔧 Setup Instructions

### 1. Environment Variables

Create or update your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Setup

Run the database schema from `database/layout.sql` in your Supabase SQL editor.

### 3. Storage Setup (IMPORTANT!)

This is the most critical step for image uploads to work.

#### Option A: Automated Setup (Recommended)

Run the storage setup script:

```bash
node scripts/setup-storage.js
```

This will:

- Create the `slideshow-media` bucket
- Show you the SQL policies to run
- Test the setup

#### Option B: Manual Setup

1. **Create Storage Bucket**:

   - Go to your Supabase dashboard
   - Navigate to Storage
   - Click "Create a new bucket"
   - Name: `slideshow-media`
   - Public: ✅ (checked)
   - File size limit: 50MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif, video/mp4, video/webm, video/mov, video/avi, video/quicktime`

2. **Set up Storage Policies**:
   - Go to Storage > Policies
   - Or run the SQL from `database/storage-setup.sql` in your SQL editor

#### Quick Fix for Development

If you're getting upload errors and want a quick fix for development, run this in your Supabase SQL editor:

```sql
-- Allow all operations for development (NOT for production!)
CREATE POLICY "Development Full Access" ON storage.objects
FOR ALL USING (bucket_id = 'slide-images');
```

### 4. Install Dependencies

```bash
npm install
# or
yarn install
```

### 5. Setup Demo Data

Run the setup script to create sample data:

```bash
node scripts/setup-demo-data.js
```

This will create:

- A sample restaurant (Afghan Palace)
- 5 sample slides of different types
- Proper data structure for testing

## 🎯 Usage

### Accessing the Client Dashboard

1. Navigate to `/client` in your browser
2. You'll see the slideshow management interface
3. The dashboard shows:
   - Total slides count
   - Active slides count
   - Total duration
   - Play/Pause status

### Creating a New Slide

1. Click "Add Slide" button
2. Choose slide type:

   - **Image Slide**: Upload an image with title/subtitle
   - **Menu Slide**: Add menu items with prices
   - **Promotion Slide**: Create promotional content
   - **Quote Slide**: Add customer testimonials
   - **Hours Slide**: Display business hours

3. Fill in the required fields
4. Click "Create Slide"

### Image Requirements

For image slides:

- **Aspect Ratio**: 16:9 or 2:1 (landscape)
- **Minimum Size**: 1200x600 pixels
- **Maximum Size**: 10MB
- **Formats**: JPG, PNG, WebP

### Managing Slides

- **Edit**: Click the edit icon on any slide
- **Activate/Deactivate**: Toggle slide visibility
- **Delete**: Remove slides (with confirmation)
- **Reorder**: Drag and drop to reorder (coming soon)

### Viewing the Slideshow

1. Click "View Display" to see the slideshow
2. The slideshow will automatically cycle through active slides
3. Each slide displays for its configured duration

## 🏗️ Architecture

### Components

- **`ImageUpload.tsx`**: Handles image upload with validation
- **`SlideEditor.tsx`**: Modal for creating/editing slides
- **`Slideshow.tsx`**: Displays the actual slideshow
- **`pages/client/index.tsx`**: Main dashboard interface

### API Endpoints

- **`/api/slides`**: GET (list slides), POST (create slide)
- **`/api/slides/[id]`**: GET, PUT, DELETE individual slides

### Database Schema

Key tables:

- **`slides`**: Stores slide data with JSONB content
- **`media_files`**: Tracks uploaded images
- **`restaurants`**: Restaurant information

## 🔒 Security

- All API endpoints validate restaurant ownership
- Image uploads are restricted to authenticated users
- File size and type validation on upload
- SQL injection protection via Supabase

## 🎨 Customization

### Styling

The slideshow uses Tailwind CSS classes. Key color variables:

- `afghan-green`: Primary brand color
- `afghan-red`: Secondary brand color
- `afghan-gold`: Accent color

### Adding New Slide Types

1. Update the `Slide` interface in `lib/supabase.ts`
2. Add the new type to the `slideTypes` array
3. Implement rendering logic in `Slideshow.tsx`
4. Add form fields in `SlideEditor.tsx`

## 🐛 Troubleshooting

### Common Issues

#### 1. **Images not uploading**

**Error**: "Storage bucket not found" or "Storage permissions not configured"

**Solution**:

```bash
# Run the storage setup script
node scripts/setup-storage.js

# Then run the SQL policies in your Supabase dashboard
# Or use the quick fix for development:
```

```sql
-- In Supabase SQL editor
CREATE POLICY "Development Full Access" ON storage.objects
FOR ALL USING (bucket_id = 'slide-images');
```

#### 2. **Authentication errors**

**Error**: "Authentication required"

**Solution**:

- For development, use the development policy above
- For production, implement proper authentication

#### 3. **Slides not loading**

**Error**: "Failed to fetch slides"

**Solution**:

- Verify database connection
- Check restaurant ID in code
- Ensure slides are marked as active
- Check browser console for errors

#### 4. **API errors**

**Error**: 500 or 400 errors

**Solution**:

- Check Supabase logs
- Verify API endpoint URLs
- Check request/response format
- Ensure database schema is set up

### Debug Mode

Enable debug logging by adding to your environment:

```bash
DEBUG=shivehview:*
```

### Storage Troubleshooting Checklist

- [ ] Storage bucket `slide-images` exists
- [ ] Bucket is set to public
- [ ] Storage policies are configured
- [ ] File size limit is set to 10MB
- [ ] Allowed MIME types include image formats
- [ ] RLS (Row Level Security) is properly configured

### Quick Storage Test

Run this in your browser console to test storage:

```javascript
// Test storage access
const { data, error } = await supabase.storage.from("slide-images").list();

console.log("Storage test:", { data, error });
```

## 📈 Performance

- Images are optimized and cached
- Lazy loading for better performance
- Efficient database queries with proper indexing
- Responsive design for all devices

## 🔄 Future Enhancements

- [ ] Drag & drop slide reordering
- [ ] Slide templates and themes
- [ ] Analytics and view tracking
- [ ] Multi-language support
- [ ] Advanced image editing
- [ ] Real-time collaboration
- [ ] Mobile app integration

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review Supabase documentation
3. Check browser console for errors
4. Verify environment setup
5. Run the storage setup script

### Common Error Messages and Solutions

| Error                                | Solution                                   |
| ------------------------------------ | ------------------------------------------ |
| "Storage bucket not found"           | Run `node scripts/setup-storage.js`        |
| "Storage permissions not configured" | Add storage policies in Supabase dashboard |
| "Authentication required"            | Use development policy or implement auth   |
| "File too large"                     | Check file size (max 10MB)                 |
| "Invalid file type"                  | Use JPG, PNG, or WebP format               |

---

**Happy slideshow building! 🎉**
