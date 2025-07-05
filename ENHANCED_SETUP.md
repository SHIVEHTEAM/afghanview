# Enhanced ShivehView Slideshow System Setup Guide

This guide will help you set up the enhanced slideshow system with multiple images per slide, drag & drop reordering, admin locking, and enhanced permissions.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
```

### 2. Database Setup

Run the enhanced database setup script:

```bash
node scripts/setup-enhanced-db.js
```

This script will:

- ✅ Create the enhanced database schema
- ✅ Set up storage bucket with proper policies
- ✅ Create demo restaurants and slides
- ✅ Create admin user (admin@shivehview.com / admin123456)

### 3. Start Development Server

```bash
npm run dev
```

## 🎯 Features Overview

### ✨ Enhanced Features

- **Multiple Images Per Slide**: Each slide can have multiple images with individual alt text
- **Drag & Drop Reordering**: Intuitive reordering of slides and images within slides
- **Admin Slide Locking**: Admins can lock slides to prevent client edits
- **Enhanced Permissions**: Role-based access control (admin, client, viewer)
- **Real-time Updates**: Live updates when slides are modified
- **Image Validation**: Size and format validation for uploads

### 🔐 User Roles

- **Admin**: Full access to all restaurants and slides, can lock/unlock slides
- **Client**: Can manage slides for their assigned restaurant (unless locked)
- **Viewer**: Read-only access to slides

## 📁 File Structure

```
shivehview/
├── components/
│   ├── EnhancedSlideEditor.tsx    # Enhanced slide editor with multiple images
│   ├── ImageUpload.tsx            # Image upload with validation
│   ├── ProtectedRoute.tsx         # Route protection component
│   ├── RestaurantInfo.tsx         # Restaurant information display
│   ├── SlideEditor.tsx            # Basic slide editor
│   └── Slideshow.tsx              # Slideshow display component
├── database/
│   ├── enhanced-schema.sql        # Enhanced database schema
│   ├── layout.sql                 # Basic database layout
│   └── storage-setup.sql          # Storage policies
├── pages/
│   ├── admin/
│   │   ├── index.tsx              # Admin dashboard
│   │   ├── layout.tsx             # Admin layout
│   │   ├── restaurants/
│   │   │   └── [id].tsx           # Restaurant management
│   │   └── slideshow.tsx          # Enhanced admin slideshow management
│   ├── api/
│   │   ├── slides/
│   │   │   ├── index.ts           # Slides CRUD API
│   │   │   ├── [id].ts            # Individual slide API
│   │   │   └── reorder.ts         # Slide reordering API
│   │   └── auth/
│   │       └── [...nextauth].ts   # NextAuth configuration
│   ├── client/
│   │   └── index.tsx              # Client slideshow page
│   └── auth/
│       ├── signin.tsx             # Sign in page
│       └── signup.tsx             # Sign up page
├── scripts/
│   ├── setup-enhanced-db.js       # Enhanced database setup
│   └── setup-storage.js           # Storage setup
└── types/
    └── next-auth.d.ts             # NextAuth type definitions
```

## 🗄️ Database Schema

### Core Tables

- **profiles**: User profiles with roles and restaurant assignments
- **restaurants**: Restaurant information
- **slides**: Slide data with enhanced features
- **slide_images**: Multiple images per slide
- **slide_permissions**: Fine-grained access control

### Key Features

- **Multiple Images**: Each slide can have multiple images with ordering
- **Slide Locking**: Admins can lock slides to prevent edits
- **Sort Ordering**: Flexible slide and image ordering
- **Permissions**: Role-based access control
- **Audit Trail**: Created/updated timestamps

## 🔧 API Endpoints

### Slides Management

- `GET /api/slides?restaurant_id=...` - Get slides for restaurant
- `POST /api/slides` - Create new slide
- `GET /api/slides/[id]` - Get specific slide
- `PUT /api/slides/[id]` - Update slide
- `DELETE /api/slides/[id]` - Delete slide
- `PUT /api/slides/reorder` - Reorder slides

### Authentication

- `GET /api/auth/me` - Get current user
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out

## 🎨 Component Usage

### Enhanced Slide Editor

```tsx
import { EnhancedSlideEditor } from "../components/EnhancedSlideEditor";

<EnhancedSlideEditor
  slide={slide}
  onSave={handleSave}
  onCancel={handleCancel}
  isLocked={slide.is_locked}
  userRole={session.user.role}
/>;
```

### Image Upload

```tsx
import { ImageUpload } from "../components/ImageUpload";

<ImageUpload
  onUpload={handleImageUpload}
  maxFiles={5}
  maxSize={5 * 1024 * 1024} // 5MB
  acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
/>;
```

## 🔒 Security Features

### Row Level Security (RLS)

- Users can only access their assigned restaurant's slides
- Admins have access to all restaurants
- Locked slides are protected from non-admin edits

### Storage Policies

- Public read access to slideshow images
- Authenticated users can upload images
- Users can only update/delete their own images

### API Protection

- All endpoints require authentication
- Role-based access control
- Input validation and sanitization

## 🚀 Deployment

### 1. Environment Variables

Set up your production environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXTAUTH_URL=your_production_domain
NEXTAUTH_SECRET=your_production_secret
```

### 2. Database Migration

Run the enhanced setup script on your production database:

```bash
NODE_ENV=production node scripts/setup-enhanced-db.js
```

### 3. Build and Deploy

```bash
npm run build
npm start
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Image Upload Fails

- Check if storage bucket exists: `slideshow-images`
- Verify storage policies are set up correctly
- Ensure file size is under 5MB
- Check file type is supported

#### 2. Permission Denied

- Verify user role and restaurant assignment
- Check if slide is locked by admin
- Ensure proper authentication

#### 3. Database Connection Issues

- Verify Supabase URL and keys
- Check if database schema is properly set up
- Ensure RLS policies are configured

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=next-auth:*
```

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the database schema and API documentation
3. Check browser console for client-side errors
4. Review server logs for API errors

## 🔄 Migration from Basic Version

If you're upgrading from the basic slideshow system:

1. **Backup your data** before running the enhanced setup
2. **Run the enhanced setup script** to create new schema
3. **Migrate existing data** (if needed) using the provided functions
4. **Update your components** to use the new enhanced features
5. **Test thoroughly** before deploying to production

## 🎉 What's New

### Enhanced Features

- ✅ Multiple images per slide with drag & drop reordering
- ✅ Admin slide locking system
- ✅ Enhanced permission system with roles
- ✅ Improved image upload with validation
- ✅ Real-time slide management
- ✅ Better error handling and user feedback

### Improved UX

- ✅ Intuitive drag & drop interface
- ✅ Visual feedback for locked slides
- ✅ Better image preview and management
- ✅ Responsive design improvements
- ✅ Enhanced admin dashboard

---

**Happy coding! 🚀**
