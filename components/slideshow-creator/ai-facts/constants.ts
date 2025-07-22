import {
  Users,
  Utensils,
  Heart,
  Coffee,
  Sparkles,
  BookOpen,
  Mountain,
  Star,
  Music,
  Globe,
  Palette,
  Book,
  Feather,
  Languages,
  Shield,
  Sun,
  Moon,
  Smile,
} from "lucide-react";
import { TajikCulturePrompt, Theme, Transition } from "./types";

export const AFGHAN_CULTURE_PROMPTS: TajikCulturePrompt[] = [
  {
    id: "afghan-food",
    name: "Afghan Food & Cuisine",
    prompt:
      "Share a surprising, little-known story or fact about Afghan cuisine, a traditional dish, or a unique cooking method that would fascinate a visitor. Include cultural context or a fun anecdote if possible.",
    icon: Utensils,
    color: "#F59E0B",
    description: "Traditional Afghan dishes and cooking",
  },
  {
    id: "afghan-history",
    name: "Afghan History & Heritage",
    prompt:
      "Reveal a fascinating or unexpected fact about Afghanistan's history, a legendary figure, or an ancient tradition that shaped the nation's identity. Make it engaging and memorable.",
    icon: BookOpen,
    color: "#6366F1",
    description: "Afghan historical heritage",
  },
  {
    id: "afghan-poetry",
    name: "Afghan Poetry & Literature",
    prompt:
      "Describe a poetic tradition, a famous poet, or a literary custom in Afghanistan that connects people across generations. Make it vivid and emotionally resonant.",
    icon: Feather,
    color: "#8B5CF6",
    description: "Poetry and literary traditions",
  },
  {
    id: "afghan-music",
    name: "Afghan Music & Arts",
    prompt:
      "Share a story or fact about Afghan music, a traditional instrument, or a dance that brings communities together. Highlight its cultural significance and any unique features.",
    icon: Music,
    color: "#EC4899",
    description: "Music and artistic heritage",
  },
  {
    id: "afghan-customs",
    name: "Afghan Customs & Traditions",
    prompt:
      "What is a unique Afghan custom, ritual, or celebration that most outsiders don't know? Explain its meaning and why it's special to Afghan people.",
    icon: Heart,
    color: "#DC2626",
    description: "Cultural customs and rituals",
  },
  {
    id: "afghan-hospitality",
    name: "Afghan Hospitality",
    prompt:
      "Describe a heartwarming or surprising aspect of Afghan hospitality, guest customs, or tea culture. Tell it as a story or with a cultural insight.",
    icon: Coffee,
    color: "#059669",
    description: "Hospitality and guest customs",
  },
  {
    id: "afghan-geography",
    name: "Afghan Geography & Nature",
    prompt:
      "Share a beautiful or awe-inspiring fact about Afghanistan's geography, a natural wonder, or a landscape that holds cultural meaning. Make it vivid and visual.",
    icon: Mountain,
    color: "#059669",
    description: "Geographical heritage",
  },
  {
    id: "afghan-crafts",
    name: "Afghan Crafts & Skills",
    prompt:
      "Tell a story about a traditional Afghan craft, handmade item, or artisanal skill. Explain its origins, cultural value, or a fun fact about how it's made.",
    icon: Palette,
    color: "#F97316",
    description: "Traditional crafts and skills",
  },
];

export const THEMES: Theme[] = [
  {
    id: "modern",
    name: "Modern",
    backgroundColor: "#1f2937",
    textColor: "#ffffff",
    accentColor: "#3b82f6",
    colors: ["#1f2937", "#3b82f6", "#ffffff"],
  },
  {
    id: "warm",
    name: "Warm",
    backgroundColor: "#92400e",
    textColor: "#ffffff",
    accentColor: "#f59e0b",
    colors: ["#92400e", "#f59e0b", "#ffffff"],
  },
  {
    id: "elegant",
    name: "Elegant",
    backgroundColor: "#581c87",
    textColor: "#ffffff",
    accentColor: "#a855f7",
    colors: ["#581c87", "#a855f7", "#ffffff"],
  },
  {
    id: "natural",
    name: "Natural",
    backgroundColor: "#064e3b",
    textColor: "#ffffff",
    accentColor: "#10b981",
    colors: ["#064e3b", "#10b981", "#ffffff"],
  },
  {
    id: "vibrant",
    name: "Vibrant",
    backgroundColor: "#7c2d12",
    textColor: "#ffffff",
    accentColor: "#f97316",
    colors: ["#7c2d12", "#f97316", "#ffffff"],
  },
];

export const TRANSITIONS: Transition[] = [
  { id: "fade", name: "Fade", duration: 800 },
  { id: "slide", name: "Slide", duration: 600 },
  { id: "zoom", name: "Zoom", duration: 700 },
  { id: "flip", name: "Flip", duration: 900 },
];

export const DEFAULT_SETTINGS = {
  slideDuration: 5000,
  transition: "fade",
  // Music settings using the new structure
  music: {
    music_play_mode: "sequential" as const,
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
  theme: "modern",
  loopSlideshow: true,
  shuffleSlides: false,
  autoRandomFact: false,
  randomFactInterval: 6,
};
