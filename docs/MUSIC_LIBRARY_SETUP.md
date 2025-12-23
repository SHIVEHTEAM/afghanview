# 🎵 Music Library Setup Guide

## Overview

The Shivehview Music Library is a comprehensive system that provides:

- **No hardcoded music** - All music comes from user uploads or external APIs
- **Shared library** - Uploaded music is available to all users
- **Advanced features** - Playlists, shuffle, random play, favorites
- **Category-based organization** - Music is organized by cultural categories
- **Clean storage structure** - Files are stored in organized folders

## 🚀 Quick Setup

### 1. Run the Database Setup

```bash
pnpm run setup-music-library
```

This will:

- Create all music-related database tables
- Set up Row Level Security (RLS) policies
- Create indexes for performance
- Add default music categories
- Set up triggers and functions

### 2. Organize Existing Music Files (Optional)

If you have existing music files in storage, organize them:

```bash
pnpm run organize-music-storage
```

This will:

- Scan existing music files
- Move them to category-based folders
- Update database URLs
- Clean up old files

## 📁 Storage Organization

### New Folder Structure

```
slideshow-media/
├── music/
│   ├── afghan-traditional/
│   │   ├── 1703123456789-song1.mp3
│   │   └── 1703123456790-song2.mp3
│   ├── persian-classical/
│   │   ├── 1703123456791-song3.mp3
│   │   └── 1703123456792-song4.mp3
│   ├── pashto-traditional/
│   ├── ambient-relaxing/
│   ├── upbeat-energetic/
│   └── instrumental/
├── images/
├── videos/
└── audio/ (legacy - will be cleaned up)
```

### File Naming Convention

- **Format**: `{timestamp}-{clean-filename}`
- **Example**: `1703123456789-afghan_traditional_song.mp3`
- **Benefits**:
  - Unique filenames prevent conflicts
  - Timestamps for sorting
  - Clean filenames for readability

## 🗄️ Database Schema

### Core Tables

1. **`music_tracks`** - Stores all music file metadata
2. **`music_playlists`** - User-created playlists
3. **`playlist_tracks`** - Junction table for playlist tracks
4. **`user_favorites`** - User favorite tracks
5. **`music_categories`** - Music categories with icons

### Key Features

- **Row Level Security (RLS)** - Users can only access their own uploads + public tracks
- **Automatic counters** - Play count and favorite count are managed automatically
- **Category system** - Predefined categories for Afghan, Persian, Pashto music
- **Source tracking** - Track whether music is user upload, curated, or from API

## 🎯 Music Categories

### Default Categories

1. **All Music** - Browse all available tracks
2. **Afghan Traditional** - Classic Afghan folk and traditional
3. **Persian Classical** - Traditional Persian melodies
4. **Pashto Traditional** - Traditional Pashto music
5. **Ambient & Relaxing** - Calming background music
6. **Upbeat & Energetic** - Energetic and positive vibes
7. **Instrumental** - Beautiful instrumental pieces

### Adding Custom Categories

You can add custom categories by inserting into the `music_categories` table:

```sql
INSERT INTO music_categories (name, description, icon, color_gradient, sort_order)
VALUES ('Custom Category', 'Description', 'IconName', 'from-color-500 to-color-600', 10);
```

## 🔧 Advanced Features

### Playlists

- **Sequential** - Play tracks in order
- **Shuffle** - Random order, no repeats
- **Random** - Completely random selection

### Music Sources

1. **User Uploads** - Users upload their own music
2. **Curated** - Admin-curated music library
3. **API** - External music APIs (planned)

### Favorites System

- Users can favorite tracks
- Favorites are private to each user
- Automatic favorite count tracking

## 🛡️ Security & Permissions

### Row Level Security (RLS)

- **Public tracks**: Viewable by everyone (when approved)
- **Private tracks**: Only viewable by uploader
- **Playlists**: Only viewable by creator and business members
- **Favorites**: Only viewable by the user

### File Access

- **Public files**: Direct URL access
- **Private files**: Require authentication
- **Business files**: Require business membership

## 📊 Usage Examples

### Upload Music

```typescript
import { MusicService } from "@/lib/music-service";

const result = await MusicService.uploadMusic(file, {
  name: "Traditional Afghan Song",
  artist: "Unknown Artist",
  category: "Afghan Traditional",
  tags: ["traditional", "folk"],
  is_public: true,
});
```

### Create Playlist

```typescript
const playlist = await MusicService.createPlaylist(
  "My Afghan Mix",
  "Collection of Afghan traditional music",
  businessId,
  "shuffle"
);
```

### Get Music by Category

```typescript
const tracks = await MusicService.getTracks({
  category: "Afghan Traditional",
  limit: 10,
  sort_by: "play_count",
  sort_order: "desc",
});
```

## 🔍 Troubleshooting

### Common Issues

1. **"Table already exists" errors**

   - The script handles this automatically
   - Tables are created with `IF NOT EXISTS`

2. **"Policy already exists" errors**

   - Policies are dropped and recreated
   - This ensures clean setup

3. **Storage permission errors**

   - Check Supabase storage bucket permissions
   - Ensure service role key has full access

4. **File upload failures**
   - Check file size limits (50MB max)
   - Verify file format (MP3, WAV, OGG, AAC)
   - Check network connectivity

### Debug Commands

```bash
# Check database tables
pnpm run setup-music-library

# Organize storage
pnpm run organize-music-storage

# Check Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     "https://YOUR_PROJECT.supabase.co/rest/v1/music_tracks?select=*&limit=1"
```

## 🚀 Next Steps

After setup:

1. **Upload initial music** - Add some sample tracks to each category
2. **Test playlists** - Create test playlists with multiple tracks
3. **Test favorites** - Add/remove favorites to test the system
4. **Configure slideshows** - Set up slideshows with music playlists
5. **Monitor usage** - Check play counts and favorite counts

## 📈 Performance Tips

1. **Use indexes** - All queries are properly indexed
2. **Pagination** - Use `limit` and `offset` for large datasets
3. **Caching** - Consider CDN caching for frequently accessed files
4. **Compression** - Audio files are served with appropriate compression

## 🔄 Migration from Old System

If migrating from the old music system:

1. Run `pnpm run setup-music-library` to create new tables
2. Run `pnpm run organize-music-storage` to reorganize files
3. Update any hardcoded music references in your code
4. Test all music functionality

The new system is backward compatible with existing slideshow music settings.
