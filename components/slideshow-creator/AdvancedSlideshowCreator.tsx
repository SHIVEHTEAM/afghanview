import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit3,
  Eye,
  Download,
  Settings,
  Palette,
  Type,
  Image,
  Video,
  Music,
  Sparkles,
  Wand2,
  Layers,
  Grid,
  List,
  RotateCw,
  Save,
  Share,
  Lock,
  Unlock,
  Copy,
  Scissors,
  Move,
  Scale,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Camera,
  Mic,
  Headphones,
  Speaker,
  Wifi,
  WifiOff,
  Bluetooth,
  Battery,
  Power,
  PowerOff,
  Zap,
  Sun,
  Moon,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  User,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  ShieldOff,
  Key,
  EyeOff,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  MoreVertical,
  Menu,
  Home,
  HelpCircle,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MinusCircle,
  PlusCircle,
  Circle,
  Square,
  Triangle,
  Target,
  Crosshair,
  Navigation,
  Compass,
  Map,
  Globe,
  Flag,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,
} from "lucide-react";

interface Slide {
  id: string;
  type: "text" | "image" | "video" | "ai-generated";
  content: string;
  background: string;
  transition: string;
  duration: number;
  effects: string[];
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  opacity: number;
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
}

interface AdvancedSlideshowCreatorProps {
  businessId: string;
  onSave: (slideshow: any) => void;
  onCancel: () => void;
}

const TRANSITION_EFFECTS = [
  { name: "Fade", value: "fade" },
  { name: "Slide Left", value: "slide-left" },
  { name: "Slide Right", value: "slide-right" },
  { name: "Slide Up", value: "slide-up" },
  { name: "Slide Down", value: "slide-down" },
  { name: "Zoom In", value: "zoom-in" },
  { name: "Zoom Out", value: "zoom-out" },
  { name: "Rotate", value: "rotate" },
  { name: "Flip", value: "flip" },
  { name: "Cube", value: "cube" },
  { name: "Carousel", value: "carousel" },
  { name: "Wave", value: "wave" },
  { name: "Dissolve", value: "dissolve" },
  { name: "Wipe", value: "wipe" },
  { name: "Random", value: "random" },
];

const VISUAL_EFFECTS = [
  { name: "Blur", icon: Eye, property: "blur" },
  { name: "Brightness", icon: Sun, property: "brightness" },
  { name: "Contrast", icon: Palette, property: "contrast" },
  { name: "Saturation", icon: Palette, property: "saturation" },
  { name: "Hue", icon: Palette, property: "hue" },
  { name: "Opacity", icon: Eye, property: "opacity" },
  { name: "Scale", icon: Scale, property: "scale" },
  { name: "Rotation", icon: RotateCw, property: "rotation" },
];

const AI_PROMPTS = [
  "Create a professional business presentation",
  "Generate engaging marketing content",
  "Design a modern restaurant menu",
  "Create a retail store promotion",
  "Generate a service business showcase",
  "Design a hospitality welcome message",
  "Create an educational slideshow",
  "Generate a product launch presentation",
];

export default function AdvancedSlideshowCreator({
  businessId,
  onSave,
  onCancel,
}: AdvancedSlideshowCreatorProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedSlide, setSelectedSlide] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [branding, setBranding] = useState({
    logo: "",
    colors: ["#3B82F6", "#10B981", "#F59E0B"],
    fonts: ["Inter", "Roboto", "Open Sans"],
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
  });

  const addSlide = (type: Slide["type"]) => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      type,
      content: type === "text" ? "New Text Slide" : "",
      background: "#ffffff",
      transition: "fade",
      duration: 3000,
      effects: [],
      position: { x: 0, y: 0 },
      scale: 1,
      rotation: 0,
      opacity: 1,
      blur: 0,
      brightness: 1,
      contrast: 1,
      saturation: 1,
      hue: 0,
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
  };

  const updateSlide = (slideId: string, updates: Partial<Slide>) => {
    setSlides(
      slides.map((slide) =>
        slide.id === slideId ? { ...slide, ...updates } : slide
      )
    );
  };

  const deleteSlide = (slideId: string) => {
    const newSlides = slides.filter((slide) => slide.id !== slideId);
    setSlides(newSlides);
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(Math.max(0, newSlides.length - 1));
    }
  };

  const generateAIContent = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      // Mock AI generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const aiSlide: Slide = {
        id: `ai-slide-${Date.now()}`,
        type: "ai-generated",
        content: `AI Generated: ${aiPrompt}`,
        background: "#f8fafc",
        transition: "zoom-in",
        duration: 4000,
        effects: ["blur", "brightness"],
        position: { x: 0, y: 0 },
        scale: 1,
        rotation: 0,
        opacity: 1,
        blur: 0,
        brightness: 1.1,
        contrast: 1,
        saturation: 1,
        hue: 0,
      };

      setSlides([...slides, aiSlide]);
      setCurrentSlide(slides.length);
      setAiPrompt("");
    } catch (error) {
      console.error("Error generating AI content:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyEffect = (slideId: string, effect: string) => {
    const slide = slides.find((s) => s.id === slideId);
    if (!slide) return;

    const newEffects = slide.effects.includes(effect)
      ? slide.effects.filter((e) => e !== effect)
      : [...slide.effects, effect];

    updateSlide(slideId, { effects: newEffects });
  };

  const SlideEditor = ({ slide }: { slide: Slide }) => (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Edit Slide</h3>
        <button
          onClick={() => setSelectedSlide(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            value={slide.content}
            onChange={(e) => updateSlide(slide.id, { content: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        {/* Background */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background
          </label>
          <input
            type="color"
            value={slide.background}
            onChange={(e) =>
              updateSlide(slide.id, { background: e.target.value })
            }
            className="w-full h-12 rounded-lg border border-gray-300"
          />
        </div>

        {/* Transition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transition Effect
          </label>
          <select
            value={slide.transition}
            onChange={(e) =>
              updateSlide(slide.id, { transition: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {TRANSITION_EFFECTS.map((effect) => (
              <option key={effect.value} value={effect.value}>
                {effect.name}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (ms)
          </label>
          <input
            type="number"
            value={slide.duration}
            onChange={(e) =>
              updateSlide(slide.id, { duration: parseInt(e.target.value) })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1000"
            max="10000"
            step="500"
          />
        </div>

        {/* Effects */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visual Effects
          </label>
          <div className="grid grid-cols-2 gap-2">
            {VISUAL_EFFECTS.map((effect) => (
              <button
                key={effect.property}
                onClick={() => applyEffect(slide.id, effect.property)}
                className={`p-2 rounded-lg border text-sm flex items-center space-x-2 ${
                  slide.effects.includes(effect.property)
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                <effect.icon className="w-4 h-4" />
                <span>{effect.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const AIPanel = () => (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span>AI Content Generator</span>
        </h3>
        <button
          onClick={() => setShowAIPanel(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe what you want to create
          </label>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., Create a professional restaurant menu with appetizers, main courses, and desserts..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {AI_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setAiPrompt(prompt)}
              className="p-3 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200"
            >
              {prompt}
            </button>
          ))}
        </div>

        <button
          onClick={generateAIContent}
          disabled={isGenerating || !aiPrompt.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Content</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const BrandingPanel = () => (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Branding Settings</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Color
          </label>
          <input
            type="color"
            value={branding.primaryColor}
            onChange={(e) =>
              setBranding({ ...branding, primaryColor: e.target.value })
            }
            className="w-full h-12 rounded-lg border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Color
          </label>
          <input
            type="color"
            value={branding.secondaryColor}
            onChange={(e) =>
              setBranding({ ...branding, secondaryColor: e.target.value })
            }
            className="w-full h-12 rounded-lg border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Family
          </label>
          <select
            value={branding.fonts[0]}
            onChange={(e) =>
              setBranding({
                ...branding,
                fonts: [e.target.value, ...branding.fonts.slice(1)],
              })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {branding.fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Advanced Slideshow Creator
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{slides.length} slides</span>
              <span>•</span>
              <span>
                Slide {currentSlide + 1} of {slides.length}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => onSave({ slides, branding })}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Save Slideshow
            </button>

            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Add Slide Buttons */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                Add New Slide
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addSlide("text")}
                  className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 text-sm flex items-center space-x-2"
                >
                  <Type className="w-4 h-4" />
                  <span>Text</span>
                </button>
                <button
                  onClick={() => addSlide("image")}
                  className="p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-green-700 text-sm flex items-center space-x-2"
                >
                  <Image className="w-4 h-4" />
                  <span>Image</span>
                </button>
                <button
                  onClick={() => addSlide("video")}
                  className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-purple-700 text-sm flex items-center space-x-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Video</span>
                </button>
                <button
                  onClick={() => setShowAIPanel(true)}
                  className="p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-orange-700 text-sm flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI</span>
                </button>
              </div>
            </div>

            {/* Slides List */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Slides</h3>
              <div className="space-y-2">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      currentSlide === index
                        ? "bg-blue-50 border-blue-300"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {slide.type.charAt(0).toUpperCase() +
                              slide.type.slice(1)}{" "}
                            Slide
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {slide.content.substring(0, 30)}...
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSlide(slide.id);
                        }}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && <BrandingPanel />}

            {/* AI Panel */}
            {showAIPanel && <AIPanel />}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Preview Area */}
          <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center">
            {slides.length > 0 ? (
              <div className="w-full max-w-4xl aspect-video bg-white rounded-lg shadow-lg overflow-hidden">
                <div
                  className="w-full h-full flex items-center justify-center p-8"
                  style={{ backgroundColor: slides[currentSlide]?.background }}
                >
                  <div className="text-center">
                    <h2 className="text-4xl font-bold mb-4">
                      {slides[currentSlide]?.content}
                    </h2>
                    {slides[currentSlide]?.type === "ai-generated" && (
                      <div className="flex items-center justify-center space-x-2 text-purple-600">
                        <Sparkles className="w-5 h-5" />
                        <span className="text-sm">AI Generated</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-medium mb-2">
                  Create Your First Slide
                </h3>
                <p className="text-gray-400">
                  Use the sidebar to add slides and start building your
                  presentation
                </p>
              </div>
            )}
          </div>

          {/* Slide Editor */}
          {selectedSlide && (
            <div className="h-96 bg-white border-t border-gray-200 p-4">
              <SlideEditor
                slide={slides.find((s) => s.id === selectedSlide)!}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
