import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Music,
  Play,
  Pause,
  Plus,
  Volume2,
  Sparkles,
  Zap,
  Moon,
  Waves,
  Mic,
  Guitar,
  Disc3,
  Heart,
} from "lucide-react";
import MultiTrackMusicSelector from "./MultiTrackMusicSelector";
import { supabase } from "../../../lib/supabase";

interface QuickMusicSetupProps {
  slideshowId: string;
  slideshowName: string;
  onClose: () => void;
  onMusicAdded: () => void;
}

// Enhanced quick music presets with better descriptions and icons
const QUICK_MUSIC_PRESETS = [
  {
    id: "afghan-traditional",
    name: "Afghan Traditional",
    artist: "Traditional Afghan Folk",
    description: "Classic Afghan folk melodies and traditional music",
    url: "https://example.com/music/afghan-traditional.mp3",
    duration: "4:30",
    icon: Mic,
    color: "from-orange-500 to-red-600",
    tags: ["traditional", "afghan", "folk"],
  },
  {
    id: "persian-classical",
    name: "Persian Classical",
    artist: "Traditional Persian",
    description: "Beautiful classical Persian music and melodies",
    url: "https://example.com/music/persian-classical.mp3",
    duration: "5:15",
    icon: Guitar,
    color: "from-green-500 to-teal-600",
    tags: ["persian", "classical", "traditional"],
  },
  {
    id: "ambient-relaxing",
    name: "Ambient & Relaxing",
    artist: "Nature Sounds",
    description: "Calming ambient music perfect for background",
    url: "https://example.com/music/ambient-relaxing.mp3",
    duration: "6:00",
    icon: Moon,
    color: "from-indigo-500 to-blue-600",
    tags: ["ambient", "relaxing", "calm"],
  },
  {
    id: "upbeat-energetic",
    name: "Upbeat & Energetic",
    artist: "Modern Mix",
    description: "Energetic and positive background music",
    url: "https://example.com/music/upbeat-energetic.mp3",
    duration: "3:45",
    icon: Zap,
    color: "from-yellow-500 to-orange-600",
    tags: ["upbeat", "energetic", "positive"],
  },
  {
    id: "instrumental-beautiful",
    name: "Instrumental Beauty",
    artist: "Classical Ensemble",
    description: "Beautiful instrumental pieces without vocals",
    url: "https://example.com/music/instrumental-beautiful.mp3",
    duration: "4:20",
    icon: Waves,
    color: "from-pink-500 to-rose-600",
    tags: ["instrumental", "beautiful", "classical"],
  },
  {
    id: "pashto-traditional",
    name: "Pashto Traditional",
    artist: "Traditional Pashto",
    description: "Traditional Pashto music and cultural melodies",
    url: "https://example.com/music/pashto-traditional.mp3",
    duration: "4:50",
    icon: Disc3,
    color: "from-purple-500 to-indigo-600",
    tags: ["pashto", "traditional", "cultural"],
  },
];

export default function QuickMusicSetup({
  slideshowId,
  slideshowName,
  onClose,
  onMusicAdded,
}: QuickMusicSetupProps) {
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isApplyingMusic, setIsApplyingMusic] = useState(false);
  const [previewTrack, setPreviewTrack] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(
    null
  );

  const handleQuickMusicSelect = async (presetId: string) => {
    setSelectedPreset(presetId);
    setIsApplyingMusic(true);

    try {
      const preset = QUICK_MUSIC_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch(`/api/slideshows/${slideshowId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          settings: {
            backgroundMusic: preset.url,
            musicVolume: 50,
            musicLoop: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add music");
      }

      onMusicAdded();
      onClose();
    } catch (error) {
      console.error("Error adding music:", error);
    } finally {
      setIsApplyingMusic(false);
    }
  };

  const handlePlayPreview = (trackId: string) => {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
    }

    if (previewTrack === trackId) {
      setPreviewTrack(null);
      setPreviewAudio(null);
    } else {
      const preset = QUICK_MUSIC_PRESETS.find((p) => p.id === trackId);
      if (preset) {
        const audio = new Audio(preset.url);
        audio.volume = 0.3;

        audio.onended = () => {
          setPreviewTrack(null);
          setPreviewAudio(null);
        };

        audio.onerror = () => {
          console.error("Failed to play audio preview");
          setPreviewTrack(null);
          setPreviewAudio(null);
        };

        audio
          .play()
          .then(() => {
            setPreviewTrack(trackId);
            setPreviewAudio(audio);
          })
          .catch((err) => {
            console.error("Error playing preview:", err);
            setPreviewTrack(null);
            setPreviewAudio(null);
          });
      }
    }
  };

  const handleSkipMusic = () => {
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Add Background Music
                </h2>
                <p className="text-gray-600">
                  Enhance your slideshow "{slideshowName}" with beautiful music
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Introduction */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Choose Your Music Style
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Select from our curated collection of beautiful music that
                perfectly complements your slideshow. Each track is carefully
                chosen to enhance the viewing experience.
              </p>
            </div>

            {/* Music Presets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {QUICK_MUSIC_PRESETS.map((preset) => {
                const IconComponent = preset.icon;
                return (
                  <motion.div
                    key={preset.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer bg-white shadow-sm hover:shadow-lg ${selectedPreset === preset.id
                        ? "border-blue-500 bg-blue-50 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                    onClick={() => handleQuickMusicSelect(preset.id)}
                  >
                    {/* Preset Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate text-sm">
                          {preset.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="truncate">{preset.artist}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPreview(preset.id);
                          }}
                          className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          {previewTrack === preset.id ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Preset Info */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">
                          {preset.duration}
                        </span>
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-r ${preset.color} flex items-center justify-center`}
                        >
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {preset.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Loading State */}
                    {selectedPreset === preset.id && isApplyingMusic && (
                      <div className="mt-3 flex items-center gap-2 text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">
                          Adding music...
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowMusicModal(true)}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5" />
                Browse All Music
              </button>

              <button
                onClick={handleSkipMusic}
                disabled={isApplyingMusic}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip for Now
              </button>
            </div>

            {/* Info Text */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <Volume2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-1">
                    Music enhances your slideshow experience
                  </p>
                  <p className="text-blue-600">
                    You can always add or change music later from your slideshow
                    settings. All music is carefully selected to complement your
                    content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Music Selection Modal */}
      {showMusicModal && (
        <MultiTrackMusicSelector
          isOpen={showMusicModal}
          onClose={() => setShowMusicModal(false)}
          onMusicSelected={(settings) => {
            // Update the slideshow with new music settings
            const updateSlideshowMusic = async () => {
              try {
                const { error } = await supabase
                  .from("slideshows")
                  .update({ settings: { ...settings } })
                  .eq("id", slideshowId);

                if (error) throw error;

                setShowMusicModal(false);
                onMusicAdded();
                onClose();
              } catch (error) {
                console.error("Error updating slideshow music:", error);
              }
            };

            updateSlideshowMusic();
          }}
          title="Choose Music for Slideshow"
          description="Select multiple tracks to play in sequence during your slideshow"
        />
      )}
    </>
  );
}
