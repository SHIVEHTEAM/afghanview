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
  transition:
    | "fade"
    | "slide"
    | "zoom"
    | "flip"
    | "bounce"
    | "cube"
    | "page"
    | "wipe";
  transitionDuration: number;
  backgroundMusic?: File | string;
  musicVolume: number;
  musicLoop: boolean;
  autoPlay: boolean;
  showControls: boolean;
  showProgress: boolean;
  loopSlideshow: boolean;
  shuffleSlides: boolean;
  aspectRatio: "16:9" | "4:3" | "1:1" | "auto";
  quality: "low" | "medium" | "high";
}

export const transitionOptions = [
  {
    value: "fade",
    label: "Fade",
    description: "Smooth fade transition",
    icon: "✨",
  },
  {
    value: "slide",
    label: "Slide",
    description: "Slide from right to left",
    icon: "➡️",
  },
  {
    value: "zoom",
    label: "Zoom",
    description: "Zoom in/out effect",
    icon: "🔍",
  },
  { value: "flip", label: "Flip", description: "3D flip effect", icon: "🔄" },
  {
    value: "bounce",
    label: "Bounce",
    description: "Bouncy transition",
    icon: "⚡",
  },
  {
    value: "cube",
    label: "Cube",
    description: "3D cube rotation",
    icon: "📦",
  },
  {
    value: "page",
    label: "Page Turn",
    description: "Book page turn effect",
    icon: "📖",
  },
  {
    value: "wipe",
    label: "Wipe",
    description: "Wipe across screen",
    icon: "🧹",
  },
];

export const durationOptions = [
  { value: 2000, label: "2 seconds" },
  { value: 3000, label: "3 seconds" },
  { value: 5000, label: "5 seconds" },
  { value: 8000, label: "8 seconds" },
  { value: 10000, label: "10 seconds" },
  { value: 15000, label: "15 seconds" },
  { value: 20000, label: "20 seconds" },
  { value: 30000, label: "30 seconds" },
];
