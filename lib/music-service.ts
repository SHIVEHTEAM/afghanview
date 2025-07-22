import { supabase } from "./supabase";
import {
  MusicTrack,
  MusicCategory,
  MusicPlaylist,
  MusicSearchParams,
  MusicUploadResponse,
  SlideshowMusicSettings,
  UserFavorite,
} from "../types/music";

export class MusicService {
  // Format duration from seconds to "3:45" format
  static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  // Get audio duration from file
  static async getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener("loadedmetadata", () => {
        resolve(audio.duration);
      });
      audio.addEventListener("error", () => {
        resolve(0); // fallback
      });
      audio.src = URL.createObjectURL(file);
    });
  }

  // Generate organized storage path for music files
  static generateMusicPath(category: string, filename: string): string {
    // Clean category name for folder path
    const cleanCategory = category
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const timestamp = Date.now();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

    return `music/${cleanCategory}/${timestamp}-${cleanFilename}`;
  }

  // Upload music file to Supabase storage and save to database
  static async uploadMusic(
    file: File,
    metadata: {
      name: string;
      artist: string;
      description?: string;
      category: string;
      tags?: string[];
      is_public?: boolean;
    }
  ): Promise<MusicUploadResponse> {
    try {
      // Validate file type
      const allowedMimeTypes = [
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/ogg",
        "audio/aac",
        "audio/m4a",
        "audio/flac",
        "audio/webm",
      ];

      if (!allowedMimeTypes.includes(file.type)) {
        throw new Error(
          `Unsupported file type: ${file.type}. Supported types: MP3, WAV, OGG, AAC, M4A, FLAC, WebM`
        );
      }

      // Get file info
      const fileSize = file.size;
      const fileType = file.type;
      const duration = await this.getAudioDuration(file);

      // Generate organized file path
      const fileName = this.generateMusicPath(metadata.category, file.name);

      console.log("Uploading music file:", {
        fileName,
        fileType,
        fileSize,
        category: metadata.category,
      });

      // Upload to Supabase storage with explicit content type
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("slideshow-media")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: fileType, // Explicitly set content type
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("slideshow-media")
        .getPublicUrl(fileName);

      const fileUrl = urlData?.publicUrl || "";

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Save to database
      const { data: track, error: dbError } = await supabase
        .from("music_tracks")
        .insert({
          name: metadata.name,
          artist: metadata.artist,
          description: metadata.description || "",
          duration: Math.round(duration),
          file_url: fileUrl,
          file_size: fileSize,
          file_type: fileType,
          category: metadata.category,
          tags: metadata.tags || [],
          source: "user_upload",
          uploaded_by: user.id,
          is_public: metadata.is_public ?? true,
          is_approved: true, // Auto-approve user uploads for now
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      return {
        success: true,
        track: {
          ...track,
          duration_formatted: this.formatDuration(track.duration),
        } as MusicTrack,
      };
    } catch (error) {
      console.error("Music upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  // Get music tracks with search and filtering
  static async getTracks(
    params: MusicSearchParams = {}
  ): Promise<MusicTrack[]> {
    try {
      let query = supabase
        .from("music_tracks")
        .select("*")
        .eq("is_public", true)
        .eq("is_approved", true);

      // Apply search filter
      if (params.search) {
        query = query.or(
          `name.ilike.%${params.search}%,artist.ilike.%${params.search}%,description.ilike.%${params.search}%`
        );
      }

      // Apply category filter
      if (params.category && params.category !== "all") {
        query = query.eq("category", params.category);
      }

      // Apply source filter
      if (params.source) {
        query = query.eq("source", params.source);
      }

      // Apply sorting
      if (params.sort_by) {
        query = query.order(params.sort_by, {
          ascending: params.sort_order === "asc",
        });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Apply pagination
      if (params.limit) {
        query = query.limit(params.limit);
      }
      if (params.offset) {
        query = query.range(
          params.offset,
          params.offset + (params.limit || 50) - 1
        );
      }

      const { data: tracks, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch tracks: ${error.message}`);
      }

      return tracks.map((track) => ({
        ...track,
        duration_formatted: this.formatDuration(track.duration),
      })) as MusicTrack[];
    } catch (error) {
      console.error("Error fetching tracks:", error);
      return [];
    }
  }

  // Get music categories
  static async getCategories(): Promise<MusicCategory[]> {
    try {
      const { data: categories, error } = await supabase
        .from("music_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      return categories as MusicCategory[];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  // Create a playlist
  static async createPlaylist(
    name: string,
    description?: string,
    business_id?: string,
    play_mode: "sequential" | "shuffle" | "random" = "sequential"
  ): Promise<MusicPlaylist | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data: playlist, error } = await supabase
        .from("music_playlists")
        .insert({
          name,
          description,
          business_id,
          created_by: user.id,
          play_mode,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create playlist: ${error.message}`);
      }

      return {
        ...playlist,
        tracks: [],
        track_count: 0,
      } as MusicPlaylist;
    } catch (error) {
      console.error("Error creating playlist:", error);
      return null;
    }
  }

  // Add tracks to playlist
  static async addTracksToPlaylist(
    playlist_id: string,
    track_ids: string[]
  ): Promise<boolean> {
    try {
      const tracksToAdd = track_ids.map((track_id, index) => ({
        playlist_id,
        track_id,
        position: index,
      }));

      const { error } = await supabase
        .from("playlist_tracks")
        .insert(tracksToAdd);

      if (error) {
        throw new Error(`Failed to add tracks to playlist: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error("Error adding tracks to playlist:", error);
      return false;
    }
  }

  // Get playlist with tracks
  static async getPlaylist(playlist_id: string): Promise<MusicPlaylist | null> {
    try {
      const { data: playlist, error: playlistError } = await supabase
        .from("music_playlists")
        .select("*")
        .eq("id", playlist_id)
        .single();

      if (playlistError) {
        throw new Error(`Failed to fetch playlist: ${playlistError.message}`);
      }

      const { data: playlistTracks, error: tracksError } = await supabase
        .from("playlist_tracks")
        .select(
          `
          *,
          track:music_tracks(*)
        `
        )
        .eq("playlist_id", playlist_id)
        .order("position", { ascending: true });

      if (tracksError) {
        throw new Error(
          `Failed to fetch playlist tracks: ${tracksError.message}`
        );
      }

      const tracks = playlistTracks.map((pt) => ({
        ...pt.track,
        duration_formatted: this.formatDuration(pt.track.duration),
      })) as MusicTrack[];

      return {
        ...playlist,
        tracks,
        track_count: tracks.length,
      } as MusicPlaylist;
    } catch (error) {
      console.error("Error fetching playlist:", error);
      return null;
    }
  }

  // Get user's playlists
  static async getUserPlaylists(): Promise<MusicPlaylist[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data: playlists, error } = await supabase
        .from("music_playlists")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch user playlists: ${error.message}`);
      }

      return playlists.map((playlist) => ({
        ...playlist,
        tracks: [],
        track_count: 0,
      })) as MusicPlaylist[];
    } catch (error) {
      console.error("Error fetching user playlists:", error);
      return [];
    }
  }

  // Toggle favorite
  static async toggleFavorite(track_id: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Check if already favorited
      const { data: existing } = await supabase
        .from("user_favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("track_id", track_id)
        .single();

      if (existing) {
        // Remove from favorites
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("id", existing.id);

        if (error) {
          throw new Error(`Failed to remove favorite: ${error.message}`);
        }
      } else {
        // Add to favorites
        const { error } = await supabase.from("user_favorites").insert({
          user_id: user.id,
          track_id,
        });

        if (error) {
          throw new Error(`Failed to add favorite: ${error.message}`);
        }
      }

      return true;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      return false;
    }
  }

  // Get user favorites
  static async getUserFavorites(): Promise<MusicTrack[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data: favorites, error } = await supabase
        .from("user_favorites")
        .select(
          `
          *,
          track:music_tracks(*)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch favorites: ${error.message}`);
      }

      return favorites.map((fav) => ({
        ...fav.track,
        duration_formatted: this.formatDuration(fav.track.duration),
      })) as MusicTrack[];
    } catch (error) {
      console.error("Error fetching favorites:", error);
      return [];
    }
  }

  // Update slideshow music settings
  static async updateSlideshowMusic(
    slideshow_id: string,
    settings: SlideshowMusicSettings
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("slideshows")
        .update({
          music_playlist_id: settings.music_playlist_id,
          music_play_mode: settings.music_play_mode,
          settings: {
            ...settings,
            music_volume: settings.music_volume,
            music_loop: settings.music_loop,
          },
        })
        .eq("id", slideshow_id);

      if (error) {
        throw new Error(`Failed to update slideshow music: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error("Error updating slideshow music:", error);
      return false;
    }
  }

  // Get popular tracks
  static async getPopularTracks(limit: number = 10): Promise<MusicTrack[]> {
    try {
      const { data: tracks, error } = await supabase
        .from("music_tracks")
        .select("*")
        .eq("is_public", true)
        .eq("is_approved", true)
        .order("play_count", { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch popular tracks: ${error.message}`);
      }

      return tracks.map((track) => ({
        ...track,
        duration_formatted: this.formatDuration(track.duration),
      })) as MusicTrack[];
    } catch (error) {
      console.error("Error fetching popular tracks:", error);
      return [];
    }
  }

  // Get recent uploads
  static async getRecentUploads(limit: number = 10): Promise<MusicTrack[]> {
    try {
      const { data: tracks, error } = await supabase
        .from("music_tracks")
        .select("*")
        .eq("is_public", true)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch recent uploads: ${error.message}`);
      }

      return tracks.map((track) => ({
        ...track,
        duration_formatted: this.formatDuration(track.duration),
      })) as MusicTrack[];
    } catch (error) {
      console.error("Error fetching recent uploads:", error);
      return [];
    }
  }

  // Increment play count
  static async incrementPlayCount(track_id: string): Promise<void> {
    try {
      await supabase.rpc("increment_play_count", { track_id });
    } catch (error) {
      console.error("Error incrementing play count:", error);
    }
  }
}
