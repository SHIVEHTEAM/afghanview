// Shared constants for all slideshow creators

export const SLIDESHOW_TYPES = [
  {
    id: "image",
    title: "Image Slideshow",
    description: "Create slideshows from photos",
    icon: "Image",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "video",
    title: "Video Slideshow",
    description: "Create slideshows from videos",
    icon: "Video",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    id: "ai-facts",
    title: "AI Facts",
    description: "Generate Afghan cultural facts with AI",
    icon: "Sparkles",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    id: "menu",
    title: "Menu Slideshow",
    description: "Create menu displays",
    icon: "Utensils",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    id: "deals",
    title: "Special Deals",
    description: "Promote offers and deals",
    icon: "Gift",
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    id: "text",
    title: "Text Slideshow",
    description: "Create text announcements",
    icon: "Type",
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
];

export const TRANSITIONS = [
  { id: "fade", name: "Fade", duration: 800 },
  { id: "slide", name: "Slide", duration: 600 },
  { id: "zoom", name: "Zoom", duration: 700 },
  { id: "flip", name: "Flip", duration: 900 },
  { id: "bounce", name: "Bounce", duration: 1000 },
];

export const ASPECT_RATIOS = [
  { id: "16:9", name: "Widescreen (16:9)", width: 1920, height: 1080 },
  { id: "4:3", name: "Standard (4:3)", width: 1440, height: 1080 },
  { id: "1:1", name: "Square (1:1)", width: 1080, height: 1080 },
];

export const QUALITY_OPTIONS = [
  { id: "low", name: "Low", description: "Fast loading, smaller file size" },
  { id: "medium", name: "Medium", description: "Balanced quality and size" },
  { id: "high", name: "High", description: "Best quality, larger file size" },
];

export const DEFAULT_SETTINGS = {
  defaultDuration: 5000,
  duration: 5000,
  transition: "fade",
  transitionDuration: 800,
  // Music settings using the new structure
  music: {
    music_play_mode: "sequential",
    music_volume: 50,
    music_loop: true,
  },
  // Legacy music fields for backward compatibility
  backgroundMusic: undefined,
  background_music: undefined,
  musicVolume: 50,
  music_volume: 50,
  musicLoop: true,
  music_loop: true,
  autoPlay: true,
  showControls: true,
  showProgress: true,
  loopSlideshow: true,
  shuffleSlides: false,
  aspectRatio: "16:9",
  quality: "medium",
};

export const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const SUPPORTED_VIDEO_FORMATS = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/avi",
  "video/mov",
];

export const MAX_FILE_SIZE = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
};
