export interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  description?: string;
  duration: number; // in seconds
  duration_formatted: string; // formatted like "3:45"
  file_url: string;
  file_size?: number;
  file_type?: string;
  category: string;
  tags: string[];
  source: "user_upload" | "curated" | "api";
  uploaded_by?: string;
  is_public: boolean;
  is_approved: boolean;
  play_count: number;
  favorite_count: number;
  created_at: string;
  updated_at: string;
}

export interface MusicCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color_gradient: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface MusicPlaylist {
  id: string;
  name: string;
  description?: string;
  business_id?: string;
  created_by: string;
  is_public: boolean;
  play_mode: "sequential" | "shuffle" | "random";
  tracks: MusicTrack[];
  track_count: number;
  created_at: string;
  updated_at: string;
}

export interface PlaylistTrack {
  id: string;
  playlist_id: string;
  track_id: string;
  position: number;
  track: MusicTrack;
  created_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  track_id: string;
  track: MusicTrack;
  created_at: string;
}

export interface MusicUploadResponse {
  success: boolean;
  track?: MusicTrack;
  error?: string;
}

export interface MusicSearchParams {
  search?: string;
  category?: string;
  tags?: string[];
  source?: string;
  limit?: number;
  offset?: number;
  sort_by?: "name" | "artist" | "created_at" | "play_count" | "favorite_count";
  sort_order?: "asc" | "desc";
}

export interface MusicLibraryStats {
  total_tracks: number;
  total_playlists: number;
  total_favorites: number;
  categories_count: number;
  recent_uploads: MusicTrack[];
  popular_tracks: MusicTrack[];
  trending_categories: MusicCategory[];
}

export interface SlideshowMusicSettings {
  music_playlist_id?: string;
  music_play_mode: "sequential" | "shuffle" | "random";
  music_volume: number;
  music_loop: boolean;
  background_music?: string; // legacy support for single track
  backgroundMusic?: string; // legacy support for single track (camelCase)
}

// New interface for per-slide music settings
export interface SlideMusicSettings {
  enabled: boolean;
  music_type: "none" | "single_track" | "playlist" | "category_random";
  track_id?: string;
  playlist_id?: string;
  category?: string;
  volume: number;
  fade_in_duration: number; // in seconds
  fade_out_duration: number; // in seconds
  loop: boolean;
  play_mode: "sequential" | "shuffle" | "random";
}

// Interface for slide with music settings
export interface SlideWithMusic {
  id: string;
  slideshow_id: string;
  title: string;
  content: string;
  media_url: string;
  media_type: string;
  order_index: number;
  settings: {
    music?: SlideMusicSettings;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface MusicPlayerState {
  currentTrack?: MusicTrack;
  currentPlaylist?: MusicPlaylist;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playMode: "sequential" | "shuffle" | "random";
  playlistIndex: number;
  playlistTracks: MusicTrack[];
}

export interface MusicUploadProgress {
  progress: number;
  status: string;
  uploaded_bytes: number;
  total_bytes: number;
}

export interface MusicFilterOptions {
  categories: MusicCategory[];
  sources: string[];
  tags: string[];
  duration_ranges: {
    label: string;
    min: number;
    max: number;
  }[];
}
