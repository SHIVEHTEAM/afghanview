import { supabase } from "./supabase";
import { SlideMusicSettings, SlideWithMusic, MusicTrack } from "../types/music";

export class SlideMusicService {
  // Get music settings for a specific slide
  static async getSlideMusicSettings(
    slideId: string
  ): Promise<SlideMusicSettings | null> {
    try {
      const { data: slide, error } = await supabase
        .from("slides")
        .select("settings")
        .eq("id", slideId)
        .single();

      if (error) {
        console.error("Error fetching slide music settings:", error);
        return null;
      }

      return slide?.settings?.music || null;
    } catch (error) {
      console.error("Error getting slide music settings:", error);
      return null;
    }
  }

  // Update music settings for a specific slide
  static async updateSlideMusicSettings(
    slideId: string,
    musicSettings: SlideMusicSettings
  ): Promise<boolean> {
    try {
      // First get current slide settings
      const { data: slide, error: fetchError } = await supabase
        .from("slides")
        .select("settings")
        .eq("id", slideId)
        .single();

      if (fetchError) {
        console.error("Error fetching slide:", fetchError);
        return false;
      }

      // Update settings with new music settings
      const updatedSettings = {
        ...slide.settings,
        music: musicSettings,
      };

      const { error: updateError } = await supabase
        .from("slides")
        .update({ settings: updatedSettings })
        .eq("id", slideId);

      if (updateError) {
        console.error("Error updating slide music settings:", updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error updating slide music settings:", error);
      return false;
    }
  }

  // Get all slides with music settings for a slideshow
  static async getSlidesWithMusic(
    slideshowId: string
  ): Promise<SlideWithMusic[]> {
    try {
      const { data: slides, error } = await supabase
        .from("slides")
        .select("*")
        .eq("slideshow_id", slideshowId)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error fetching slides:", error);
        return [];
      }

      return slides.map((slide) => ({
        ...slide,
        settings: {
          ...slide.settings,
          music: slide.settings?.music || null,
        },
      })) as SlideWithMusic[];
    } catch (error) {
      console.error("Error getting slides with music:", error);
      return [];
    }
  }

  // Get music track for a slide based on its settings
  static async getSlideMusicTrack(slideId: string): Promise<MusicTrack | null> {
    try {
      const musicSettings = await this.getSlideMusicSettings(slideId);

      if (!musicSettings || !musicSettings.enabled) {
        return null;
      }

      switch (musicSettings.music_type) {
        case "single_track":
          if (musicSettings.track_id) {
            const { data: track, error } = await supabase
              .from("music_tracks")
              .select("*")
              .eq("id", musicSettings.track_id)
              .single();

            if (error) {
              console.error("Error fetching track:", error);
              return null;
            }

            return track as MusicTrack;
          }
          break;

        case "playlist":
          if (musicSettings.playlist_id) {
            // Get first track from playlist
            const { data: playlistTrack, error } = await supabase
              .from("playlist_tracks")
              .select(
                `
                track_id,
                music_tracks (*)
              `
              )
              .eq("playlist_id", musicSettings.playlist_id)
              .order("position", { ascending: true })
              .limit(1)
              .single();

            if (error) {
              console.error("Error fetching playlist track:", error);
              return null;
            }

            return playlistTrack.music_tracks as unknown as MusicTrack;
          }
          break;

        case "category_random":
          if (musicSettings.category) {
            // Get random track from category
            const { data: tracks, error } = await supabase
              .from("music_tracks")
              .select("*")
              .eq("category", musicSettings.category)
              .eq("is_public", true)
              .eq("is_approved", true);

            if (error || !tracks || tracks.length === 0) {
              console.error("Error fetching category tracks:", error);
              return null;
            }

            // Select random track
            const randomIndex = Math.floor(Math.random() * tracks.length);
            return tracks[randomIndex] as MusicTrack;
          }
          break;
      }

      return null;
    } catch (error) {
      console.error("Error getting slide music track:", error);
      return null;
    }
  }

  // Get music settings summary for a slideshow
  static async getSlideshowMusicSummary(slideshowId: string): Promise<{
    totalSlides: number;
    slidesWithMusic: number;
    musicTypes: Record<string, number>;
  }> {
    try {
      const slides = await this.getSlidesWithMusic(slideshowId);

      const summary = {
        totalSlides: slides.length,
        slidesWithMusic: 0,
        musicTypes: {} as Record<string, number>,
      };

      slides.forEach((slide) => {
        const musicSettings = slide.settings?.music;
        if (musicSettings && musicSettings.enabled) {
          summary.slidesWithMusic++;
          const type = musicSettings.music_type;
          summary.musicTypes[type] = (summary.musicTypes[type] || 0) + 1;
        }
      });

      return summary;
    } catch (error) {
      console.error("Error getting slideshow music summary:", error);
      return {
        totalSlides: 0,
        slidesWithMusic: 0,
        musicTypes: {},
      };
    }
  }

  // Copy music settings from one slide to another
  static async copySlideMusicSettings(
    fromSlideId: string,
    toSlideId: string
  ): Promise<boolean> {
    try {
      const sourceSettings = await this.getSlideMusicSettings(fromSlideId);
      if (!sourceSettings) {
        return false;
      }

      return await this.updateSlideMusicSettings(toSlideId, sourceSettings);
    } catch (error) {
      console.error("Error copying slide music settings:", error);
      return false;
    }
  }

  // Reset music settings for a slide
  static async resetSlideMusicSettings(slideId: string): Promise<boolean> {
    try {
      const defaultSettings: SlideMusicSettings = {
        enabled: false,
        music_type: "none",
        volume: 50,
        fade_in_duration: 1,
        fade_out_duration: 1,
        loop: true,
        play_mode: "sequential",
      };

      return await this.updateSlideMusicSettings(slideId, defaultSettings);
    } catch (error) {
      console.error("Error resetting slide music settings:", error);
      return false;
    }
  }

  // Bulk update music settings for multiple slides
  static async bulkUpdateSlideMusic(
    slideIds: string[],
    musicSettings: SlideMusicSettings
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const slideId of slideIds) {
      const result = await this.updateSlideMusicSettings(
        slideId,
        musicSettings
      );
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }
}
