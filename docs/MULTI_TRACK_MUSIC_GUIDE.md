# 🎵 Multi-Track Music System Guide

## Overview

The multi-track music system allows you to select multiple music tracks for your entire slideshow that will play in sequence. The slides continue at their own pace while the music plays through multiple tracks in order.

## 🎯 **How It Works**

### **Key Features**

- **Multiple Tracks**: Select 2, 3, or more music tracks
- **Sequential Playback**: Tracks play in order from first to last
- **Independent Timing**: Slides continue at their own pace, music plays separately
- **Play Modes**: Sequential, shuffle, or random playback
- **Loop Options**: Music can loop through all tracks continuously

### **Example Flow**

```
Slideshow starts → Music Track 1 plays → Track 1 ends → Track 2 starts → Track 2 ends → Track 3 starts → etc.
Slides continue at their own pace regardless of music changes
```

## 🎵 **Music Selection Options**

### **1. Quick Music Mixes**

- **Afghan Traditional Mix**: 5 traditional Afghan melodies
- **Persian Classical Mix**: 4 Persian classical tracks
- **Ambient Relaxing Mix**: 6 peaceful ambient tracks
- **Upbeat Energetic Mix**: 4 high-energy tracks
- **Instrumental Smooth Mix**: 5 smooth instrumental tracks
- **No Music**: Silent slideshow

### **2. Custom Track Selection**

- Browse music library
- Select individual tracks
- Reorder tracks as needed
- Remove tracks from selection
- Preview tracks before selecting

### **3. Playlist Selection**

- Choose from existing playlists
- Multiple tracks already organized
- Different play modes available

### **4. Upload Your Music**

- Upload your own music files
- Add to your selection
- Mix with library tracks

## 🎛️ **Playback Modes**

### **Sequential (Default)**

- Tracks play in exact order selected
- Track 1 → Track 2 → Track 3 → etc.
- Perfect for curated music experience

### **Shuffle**

- Random order, no repeats
- All tracks play once before repeating
- Good for variety without repetition

### **Random**

- Completely random selection
- Tracks may repeat
- Maximum variety

## 🎬 **User Experience Flow**

### **During Slideshow Creation**

1. **Create Content** → Add your slides/images
2. **Select Music** → Choose multiple tracks or quick mix
3. **Configure Settings** → Adjust slideshow settings
4. **Preview & Create** → Review and finalize

### **Music Selection Process**

1. **Choose Method**:

   - Quick Mix (pre-selected collections)
   - Browse Library (individual track selection)
   - Select Playlist (existing playlists)
   - Upload Music (your own files)

2. **Select Tracks**:

   - Click tracks to add/remove from selection
   - Reorder tracks using up/down arrows
   - Preview tracks with play button

3. **Configure Settings**:

   - Volume control (0-100%)
   - Loop music (continuous playback)
   - Play mode (sequential/shuffle/random)

4. **Apply Music**:
   - Music is applied to entire slideshow
   - Tracks will play in sequence during slideshow

## 🎵 **Music Info Display**

### **During Playback**

- **Current Track**: Shows name and artist
- **Track Progress**: Current track number / total tracks
- **Play Mode**: Sequential, shuffle, or random indicator
- **Volume Control**: Adjust or mute music
- **Loop Status**: Shows if music is looping

### **Example Display**

```
🎵 Afghan Traditional - Track 1/5 • Sequential • Loop
```

## 🔧 **Technical Implementation**

### **Database Structure**

```sql
-- Music tracks table
CREATE TABLE music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  duration INTEGER,
  file_size INTEGER,
  is_public BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Music playlists table
CREATE TABLE music_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  play_mode VARCHAR(20) DEFAULT 'sequential',
  track_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist tracks junction table
CREATE TABLE playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES music_playlists(id) ON DELETE CASCADE,
  track_id UUID REFERENCES music_tracks(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, track_id)
);
```

### **Slideshow Music Settings**

```typescript
interface SlideshowMusicSettings {
  // Playlist-based (multiple tracks)
  music_playlist_id?: string;
  music_play_mode?: "sequential" | "shuffle" | "random";
  music_volume?: number;
  music_loop?: boolean;

  // Single track (legacy)
  backgroundMusic?: string;
  musicVolume?: number;
  musicLoop?: boolean;
}
```

## 🎨 **UI Components**

### **MultiTrackMusicSelector**

- Main music selection modal
- Quick mixes, library, playlists, upload tabs
- Track selection and reordering
- Real-time preview and search
- Volume and playback controls

### **MusicStep**

- Dedicated step in slideshow creation
- Quick music mix options
- Music style categories
- Skip option for no music

### **EnhancedSlideshowPlayer**

- Music info bar with track details
- Volume controls
- Play mode indicators
- Enhanced music playback with multiple tracks

## 📱 **User Interface Features**

### **Track Selection**

- **Visual Indicators**: Selected tracks highlighted in blue
- **Check Marks**: Clear indication of selected tracks
- **Track Counter**: Shows number of selected tracks
- **Reorder Controls**: Up/down arrows to change order
- **Remove Button**: Trash icon to remove tracks

### **Quick Mixes**

- **Category Icons**: Visual representation of music style
- **Track Count**: Shows how many tracks in each mix
- **Color Coding**: Different colors for different categories
- **Hover Effects**: Interactive feedback

### **Music Library**

- **Search**: Find tracks by name, artist, or tags
- **Category Filter**: Filter by music style
- **Favorites**: Show only favorite tracks
- **Preview**: Play button to test tracks

## 🎯 **Benefits**

### **For Users**

- **Rich Music Experience**: Multiple tracks instead of one
- **Variety**: Different music styles and moods
- **Flexibility**: Choose exactly which tracks to include
- **Control**: Reorder tracks as desired
- **Convenience**: Quick mixes for common styles

### **For Slideshows**

- **Longer Duration**: Music lasts through entire slideshow
- **Better Engagement**: Variety keeps viewers interested
- **Cultural Richness**: Mix of Afghan, Persian, and other music
- **Professional Feel**: Curated music experience

## 🔄 **Migration from Single Track**

### **Existing Slideshows**

- Continue to work with single track music
- Can be upgraded to multi-track via settings
- Backward compatible

### **New Slideshows**

- Use multi-track system by default
- Better music selection experience
- More music options and control

## 🚀 **Advanced Features**

### **Smart Playlist Creation**

- Auto-generates playlists from selected tracks
- Maintains track order as selected
- Supports all play modes

### **Music Analytics**

- Track which music is most popular
- User preferences and selections
- Music usage statistics

### **Future Enhancements**

- **Music Scheduling**: Different music for different times
- **Crossfade**: Smooth transitions between tracks
- **Music Recommendations**: AI-powered suggestions
- **Collaborative Playlists**: Shared music collections

## 📋 **Best Practices**

### **Track Selection**

1. **Consider Duration**: Match total music duration to slideshow length
2. **Mix Styles**: Combine different music styles for variety
3. **Cultural Relevance**: Include Afghan and Persian music
4. **Volume Balance**: Ensure consistent volume across tracks

### **Playback Settings**

1. **Sequential Mode**: Best for curated experience
2. **Shuffle Mode**: Good for variety without repetition
3. **Loop Music**: Enable for continuous playback
4. **Volume Control**: Set appropriate volume level

### **User Experience**

1. **Clear Labels**: Use descriptive track names
2. **Preview Tracks**: Always test before selecting
3. **Reasonable Selection**: Don't select too many tracks
4. **Skip Option**: Always allow no-music option

## 🎵 **Music Categories**

### **Cultural Music**

- **Afghan Traditional**: Traditional Afghan melodies and instruments
- **Persian Classical**: Classical Persian music and compositions
- **Pashto Music**: Traditional Pashto cultural music

### **Mood-based**

- **Relaxing**: Calm, peaceful background music
- **Energetic**: High-energy, upbeat tracks
- **Professional**: Business-appropriate instrumental music
- **Celebratory**: Festive and joyful music

### **Instrumental**

- **Piano**: Solo piano compositions
- **Strings**: Orchestral string arrangements
- **World**: Global instrumental music
- **Ambient**: Atmospheric background music

## 🔧 **Configuration**

### **Environment Variables**

```env
# Music API settings
MUSIC_API_ENABLED=true
MUSIC_STORAGE_BUCKET=slideshow-media
MUSIC_MAX_FILE_SIZE=10485760  # 10MB
MUSIC_ALLOWED_TYPES=audio/mpeg,audio/wav,audio/aac
```

### **Supabase Settings**

```sql
-- Enable RLS for music tables
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

-- Create storage policies
CREATE POLICY "Public music tracks are viewable by everyone" ON music_tracks
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can upload music" ON music_tracks
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
```

## 📞 **Support**

For questions or issues with the multi-track music system:

1. **Check Documentation**: Review this guide and API docs
2. **Test Music Files**: Ensure files are valid audio format
3. **Verify Permissions**: Check Supabase storage policies
4. **Contact Support**: Reach out for technical assistance

---

_This guide covers the complete multi-track music system for Shivehview. The system provides a rich music experience with multiple tracks playing in sequence during slideshows._
