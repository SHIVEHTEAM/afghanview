import { SlideshowMusicSettings } from "../../../types/music";

export interface Fact {
  id: string;
  text: string;
  category: string;
  timestamp: Date;
  prompt: string;
  backgroundColor?: string;
  fontColor?: string;
  fontSize?: number;
  emoji?: string;
}

export interface SlideshowSettings {
  // Music settings using the new structure
  music?: SlideshowMusicSettings;
  // Legacy music fields for backward compatibility
  backgroundMusic?: string;
  background_music?: string;
  musicVolume?: number;
  music_volume?: number;
  musicLoop?: boolean;
  music_loop?: boolean;
  music_play_mode?: "sequential" | "shuffle" | "random";
  music_playlist_id?: string;
  slideDuration: number;
  transition: string;
  autoPlay: boolean;
  showControls: boolean;
  theme: string;
  loopSlideshow: boolean;
  shuffleSlides: boolean;
  autoRandomFact: boolean;
  randomFactInterval: number;
}

export interface TajikCulturePrompt {
  id: string;
  name: string;
  prompt: string;
  icon: any;
  color: string;
  description: string;
}

export interface Theme {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  colors?: string[];
}

export interface Transition {
  id: string;
  name: string;
  duration: number;
}
