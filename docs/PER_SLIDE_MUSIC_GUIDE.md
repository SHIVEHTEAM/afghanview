# 🎵 Per-Slide Music System Guide

## Overview

The per-slide music system allows you to assign different music to each individual slide in a slideshow, creating a dynamic and engaging experience.

## 🎯 **How It Works**

### **Current System (Slideshow-Level)**

- One music setting for entire slideshow
- Music plays continuously through all slides
- Limited flexibility

### **New System (Per-Slide)**

- Different music for each slide
- Music changes when slides change
- Maximum flexibility and creativity

## 🎵 **Music Types Available**

### **1. No Music**

- Slide plays silently
- Good for text-heavy slides or announcements

### **2. Single Track**

- One specific music file
- Perfect for curated experiences
- Example: Afghan traditional song for cultural slide

### **3. Playlist**

- Multiple tracks in sequence/shuffle/random
- Great for longer slides
- Example: Mix of Persian classical music

### **4. Random from Category**

- Random track from a music category
- Adds variety each time
- Example: Random Afghan traditional song

## 🎬 **Example Flow**

```
Slide 1: Afghan Traditional Music (Single Track)
Slide 2: Persian Classical Playlist (Shuffle Mode)
Slide 3: No Music (Silent)
Slide 4: Random from "Ambient & Relaxing" Category
Slide 5: Upbeat & Energetic (Single Track)
```

## 🛠️ **Implementation**

### **1. Database Structure**

Music settings are stored in the `slides` table:

```sql
slides.settings.music = {
  enabled: boolean,
  music_type: "none" | "single_track" | "playlist" | "category_random",
  track_id?: string,
  playlist_id?: string,
  category?: string,
  volume: number,
  fade_in_duration: number,
  fade_out_duration: number,
  loop: boolean,
  play_mode: "sequential" | "shuffle" | "random"
}
```

### **2. Components**

- **`SlideMusicSelector`** - Main music selection modal
- **`SlideMusicButton`** - Button to open music selector
- **`SlideMusicService`** - Backend service for music operations

### **3. Usage in Slideshow Editor**

```tsx
import SlideMusicButton from "./SlideMusicButton";
import { SlideMusicService } from "../../../lib/slide-music-service";

// In your slide editor component
const handleMusicSettingsChange = async (settings: SlideMusicSettings) => {
  const success = await SlideMusicService.updateSlideMusicSettings(
    slideId,
    settings
  );
  if (success) {
    // Update UI or show success message
  }
};

// In your JSX
<SlideMusicButton
  slideId={slide.id}
  slideTitle={slide.title}
  currentSettings={slide.settings?.music}
  onSettingsChange={handleMusicSettingsChange}
/>;
```

## 🎛️ **Music Settings**

### **Volume Control**

- Range: 0-100%
- Independent per slide
- Smooth transitions

### **Fade Effects**

- **Fade In**: 0-5 seconds
- **Fade Out**: 0-5 seconds
- Smooth audio transitions between slides

### **Playback Modes**

- **Sequential**: Play tracks in order
- **Shuffle**: Random order, no repeats
- **Random**: Completely random selection

### **Loop Options**

- **Enabled**: Music repeats until slide ends
- **Disabled**: Music plays once

## 🎨 **UI Features**

### **Visual Indicators**

- **Blue button with volume icon**: Slide has music
- **Gray button with muted icon**: No music
- **Hover effects**: Clear interaction feedback

### **Music Preview**

- Click play button to preview tracks
- Real-time audio playback
- Stop/play controls

### **Category Selection**

- Color-coded categories
- Afghan Traditional (Orange)
- Persian Classical (Green)
- Pashto Traditional (Purple)
- Ambient & Relaxing (Indigo)
- Upbeat & Energetic (Yellow)
- Instrumental (Pink)

## 🔧 **Advanced Features**

### **Bulk Operations**

```typescript
// Copy music settings from one slide to another
await SlideMusicService.copySlideMusicSettings(fromSlideId, toSlideId);

// Reset music settings for a slide
await SlideMusicService.resetSlideMusicSettings(slideId);

// Bulk update multiple slides
await SlideMusicService.bulkUpdateSlideMusic(slideIds, musicSettings);
```

### **Music Summary**

```typescript
// Get music summary for entire slideshow
const summary = await SlideMusicService.getSlideshowMusicSummary(slideshowId);
// Returns: { totalSlides: 5, slidesWithMusic: 3, musicTypes: { "single_track": 2, "playlist": 1 } }
```

### **Dynamic Music Loading**

```typescript
// Get music track for current slide
const track = await SlideMusicService.getSlideMusicTrack(slideId);
if (track) {
  // Play the track with slide settings
  playMusic(track, slideSettings);
}
```

## 🎯 **Best Practices**

### **1. Music Selection**

- **Cultural slides**: Use traditional music
- **Menu slides**: Use ambient/background music
- **Promotional slides**: Use upbeat/energetic music
- **Text slides**: Consider no music or very low volume

### **2. Volume Management**

- **Background music**: 30-50% volume
- **Featured music**: 60-80% volume
- **Text overlays**: Lower volume or no music

### **3. Transition Timing**

- **Short slides**: 1-2 second fade
- **Long slides**: 2-3 second fade
- **Quick transitions**: 0.5-1 second fade

### **4. Category Usage**

- **Afghan Traditional**: Cultural content, history
- **Persian Classical**: Elegant presentations, poetry
- **Ambient & Relaxing**: Background, waiting screens
- **Upbeat & Energetic**: Promotions, special offers

## 🚀 **Integration Examples**

### **1. Slideshow Player Integration**

```typescript
// When slide changes
const handleSlideChange = async (newSlideId: string) => {
  // Stop current music
  stopCurrentMusic();

  // Get new slide's music
  const track = await SlideMusicService.getSlideMusicTrack(newSlideId);
  const settings = await SlideMusicService.getSlideMusicSettings(newSlideId);

  if (track && settings?.enabled) {
    // Play new music with settings
    playMusicWithSettings(track, settings);
  }
};
```

### **2. Slide Editor Integration**

```typescript
// Add music button to slide toolbar
<div className="slide-toolbar">
  <SlideMusicButton
    slideId={slide.id}
    slideTitle={slide.title}
    currentSettings={slide.settings?.music}
    onSettingsChange={handleMusicSettingsChange}
  />
  {/* Other slide controls */}
</div>
```

### **3. Slideshow Summary**

```typescript
// Show music summary in slideshow overview
const MusicSummary = ({ slideshowId }) => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    SlideMusicService.getSlideshowMusicSummary(slideshowId).then(setSummary);
  }, [slideshowId]);

  return (
    <div className="music-summary">
      <h3>Music Summary</h3>
      <p>
        {summary?.slidesWithMusic} of {summary?.totalSlides} slides have music
      </p>
      {/* Show music type breakdown */}
    </div>
  );
};
```

## 🎵 **Example Use Cases**

### **Restaurant Menu Slideshow**

```
Slide 1: Welcome (Afghan Traditional - Single Track)
Slide 2: Appetizers (Ambient & Relaxing - Random)
Slide 3: Main Dishes (Persian Classical - Playlist)
Slide 4: Special Offer (Upbeat & Energetic - Single Track)
Slide 5: Contact Info (No Music)
```

### **Cultural Presentation**

```
Slide 1: Afghan History (Afghan Traditional - Single Track)
Slide 2: Poetry Reading (Persian Classical - Single Track)
Slide 3: Traditional Dance (Pashto Traditional - Random)
Slide 4: Modern Afghanistan (Instrumental - Playlist)
Slide 5: Thank You (Ambient & Relaxing - Single Track)
```

## 🔄 **Migration from Old System**

The new system is backward compatible:

- Existing slideshows continue to work
- Slideshow-level music settings are preserved
- Gradual migration to per-slide music
- No breaking changes

## 🎯 **Next Steps**

1. **Integrate into slide editor** - Add music button to slide toolbar
2. **Update slideshow player** - Handle per-slide music changes
3. **Add music summary** - Show overview in slideshow management
4. **Bulk operations** - Copy/reset music settings across slides
5. **Advanced features** - Music scheduling, conditional music

The per-slide music system provides maximum flexibility for creating engaging, culturally appropriate slideshows! 🎵✨
