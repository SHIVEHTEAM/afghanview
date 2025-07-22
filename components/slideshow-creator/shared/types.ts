// Shared types for all slideshow creators

import { SlideshowMusicSettings } from "../../../types/music";

export interface SlideMedia {
  id: string;
  file: File;
  url: string;
  name: string;
  type: "image" | "video";
  duration?: number;
  file_path?: string;
  textOverlay?: {
    text: string;
    position: "top" | "center" | "bottom";
    fontSize: number;
    color: string;
    backgroundColor?: string;
    opacity: number;
  };
  effects?: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
  };
}

export interface SlideshowSettings {
  defaultDuration: number;
  duration: number;
  transition: "fade" | "slide" | "zoom" | "flip" | "bounce";
  transitionDuration: number;
  // Music settings - now using the new SlideshowMusicSettings type
  music?: SlideshowMusicSettings;
  // Legacy music fields for backward compatibility
  backgroundMusic?: File | string;
  background_music?: string;
  musicVolume?: number;
  music_volume?: number;
  musicLoop?: boolean;
  music_loop?: boolean;
  music_play_mode?: "sequential" | "shuffle" | "random";
  music_playlist_id?: string;
  autoPlay: boolean;
  showControls: boolean;
  showProgress: boolean;
  loopSlideshow: boolean;
  shuffleSlides: boolean;
  aspectRatio: "16:9" | "4:3" | "1:1";
  quality: "low" | "medium" | "high";
}

// Original data types for each slideshow type
export interface ImageOriginalData {
  images: Array<{
    id: string;
    file: File | string; // File for new uploads, string for existing URLs
    name: string;
    url?: string;
  }>;
}

export interface VideoOriginalData {
  videos: Array<{
    id: string;
    file: File | string;
    name: string;
    url?: string;
    duration?: number;
    thumbnail?: string;
  }>;
}

export interface Fact {
  id: string;
  text: string;
  category: string;
  backgroundColor: string;
  fontColor: string;
  fontSize: number;
}

export interface AiFactsOriginalData {
  facts: Fact[];
  prompt?: string;
  language?: string;
  settings?: {
    factCount: number;
    categories: string[];
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image?: File | string;
}

export interface MenuOriginalData {
  menuItems: MenuItem[];
  theme: {
    backgroundColor: string;
    textColor: string;
    accentColor?: string;
  };
  layout: {
    type: "grid" | "list" | "cards";
    columns?: number;
  };
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  originalPrice: string;
  dealPrice: string;
  validUntil: string;
  category: string;
}

export interface DealsOriginalData {
  deals: Deal[];
}

export interface TextSlide {
  id: string;
  title: string;
  subtitle?: string;
  backgroundColor: string;
  textColor: string;
  fontSize?: number;
}

export interface TextOriginalData {
  textSlides: TextSlide[];
}

export type OriginalData =
  | ImageOriginalData
  | VideoOriginalData
  | AiFactsOriginalData
  | MenuOriginalData
  | DealsOriginalData
  | TextOriginalData;

export interface SlideshowData {
  name: string;
  type: "image" | "video" | "ai-facts" | "menu" | "deals" | "text";
  slides?: SlideMedia[];
  settings: SlideshowSettings;
  originalData?: OriginalData;
  createdAt?: Date;
  [key: string]: any; // Allow additional properties for specific slideshow types
}

export interface SlideshowWizardProps {
  step?: number;
  formData?: any;
  updateFormData?: (data: any) => void;
  onComplete?: (data: any) => void;
  onBack?: () => void;
  isEditing?: boolean;
  initialData?: any;
}

export interface SlideshowEditorProps {
  onSave: (data: SlideshowData) => void;
  onCancel: () => void;
  restaurantId: string;
  userId: string;
  initialData?: any;
  isEditing?: boolean;
}
