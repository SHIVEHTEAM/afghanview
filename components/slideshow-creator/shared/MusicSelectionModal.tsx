import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Music,
  Play,
  Pause,
  Upload,
  Volume2,
  VolumeX,
  Search,
  Filter,
  Heart,
  Clock,
  User,
  Sparkles,
  Zap,
  Moon,
  Sun,
  Waves,
  Mic,
  Guitar,
  Disc3,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useToast } from "../../ui/Toast";
import { MusicAPIService, MusicTrack } from "../../../lib/music-api";

interface MusicSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  slideshowId: string;
  currentMusic?: string;
  onMusicUpdated: (musicUrl: string) => void;
}

// Modern music categories with icons and descriptions
const MUSIC_CATEGORIES = [
  {
    id: "all",
    name: "All Music",
    icon: Music,
    description: "Browse all available tracks",
    color: "from-blue-500 to-purple-600",
  },
  {
    id: "afghan-traditional",
    name: "Afghan Traditional",
    icon: Mic,
    description: "Classic Afghan folk and traditional",
    color: "from-orange-500 to-red-600",
  },
  {
    id: "persian-classical",
    name: "Persian Classical",
    icon: Guitar,
    description: "Traditional Persian melodies",
    color: "from-green-500 to-teal-600",
  },
  {
    id: "pashto-traditional",
    name: "Pashto Traditional",
    icon: Disc3,
    description: "Traditional Pashto music",
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: "ambient",
    name: "Ambient & Relaxing",
    icon: Moon,
    description: "Calming background music",
    color: "from-indigo-500 to-blue-600",
  },
  {
    id: "upbeat",
    name: "Upbeat & Energetic",
    icon: Zap,
    description: "Energetic and positive vibes",
    color: "from-yellow-500 to-orange-600",
  },
  {
    id: "instrumental",
    name: "Instrumental",
    icon: Waves,
    description: "Beautiful instrumental pieces",
    color: "from-pink-500 to-rose-600",
  },
];

export default function MusicSelectionModal({
  isOpen,
  onClose,
  slideshowId,
  currentMusic,
  onMusicUpdated,
}: MusicSelectionModalProps) {
  const [selectedMusic, setSelectedMusic] = useState(currentMusic || "none");
  const [customMusicFile, setCustomMusicFile] = useState<File | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<string | null>(null);
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [musicVolume, setMusicVolume] = useState(50);
  const [musicLoop, setMusicLoop] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);

  const { showError, showSuccess } = useToast();

  // Fetch tracks from API
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/music");
        const data = await response.json();

        if (data.success) {
          setTracks(data.tracks);
        } else {
          setTracks(MusicAPIService.getFallbackTracks());
        }
      } catch (err) {
        console.error("Error fetching tracks:", err);
        setTracks(MusicAPIService.getFallbackTracks());
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchTracks();
    }
  }, [isOpen]);

  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      searchTerm === "" ||
      track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" ||
      track.category.toLowerCase().includes(selectedCategory.replace("-", " "));

    const matchesFavorites = !showFavorites || favorites.has(track.id);

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const handleMusicChange = async (track: MusicTrack) => {
    setSelectedMusic(track.id);
    await updateSlideshowMusic(track.url);
  };

  const handleNoMusic = async () => {
    setSelectedMusic("none");
    await updateSlideshowMusic("");
  };

  const handleCustomMusicUpload = async (file: File) => {
    setIsUploadingMusic(true);
    setUploadProgress(0);
    setUploadStatus("Uploading music file...");

    try {
      const fileName = `music/${slideshowId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("slideshow-media")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setUploadProgress(50);
      setUploadStatus("Processing music file...");

      const { data: urlData } = supabase.storage
        .from("slideshow-media")
        .getPublicUrl(fileName);

      const audioUrl = urlData?.publicUrl || "";

      setUploadProgress(100);
      setUploadStatus("Upload successful! ✓");

      await updateSlideshowMusic(audioUrl);

      setTimeout(() => {
        setUploadStatus("");
        setUploadProgress(0);
      }, 3000);
    } catch (error) {
      console.error("Music upload error:", error);
      setUploadProgress(0);
      setUploadStatus(
        `Error: ${error instanceof Error ? error.message : "Upload failed"}`
      );
      showError("Failed to upload music file. Please try again.");
      setTimeout(() => setUploadStatus(""), 3000);
    } finally {
      setIsUploadingMusic(false);
    }
  };

  const updateSlideshowMusic = async (musicUrl: string) => {
    try {
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
            backgroundMusic: musicUrl,
            musicVolume: musicVolume,
            musicLoop: musicLoop,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update slideshow: ${response.statusText}`);
      }

      onMusicUpdated(musicUrl);
      showSuccess("Music updated successfully!");
    } catch (error) {
      console.error("Error updating slideshow music:", error);
      showError("Failed to update music settings");
    }
  };

  const handlePlayPreview = (trackId: string) => {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
    }

    if (isPlayingPreview === trackId) {
      setIsPlayingPreview(null);
      setPreviewAudio(null);
    } else {
      const track = tracks.find((t) => t.id === trackId);
      if (track) {
        const audio = new Audio(track.url);
        audio.volume = 0.3;

        audio.onended = () => {
          setIsPlayingPreview(null);
          setPreviewAudio(null);
        };

        audio.onerror = () => {
          console.error("Failed to play audio preview");
          setIsPlayingPreview(null);
          setPreviewAudio(null);
        };

        audio
          .play()
          .then(() => {
            setIsPlayingPreview(trackId);
            setPreviewAudio(audio);
          })
          .catch((err) => {
            console.error("Error playing preview:", err);
            setIsPlayingPreview(null);
            setPreviewAudio(null);
          });
      }
    }
  };

  const toggleFavorite = (trackId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(trackId)) {
      newFavorites.delete(trackId);
    } else {
      newFavorites.add(trackId);
    }
    setFavorites(newFavorites);
  };

  const handleVolumeChange = (newVolume: number) => {
    setMusicVolume(newVolume);
    if (previewAudio) {
      previewAudio.volume = newVolume / 100;
    }
  };

  const handleSaveSettings = async () => {
    await updateSlideshowMusic(selectedMusic === "none" ? "" : selectedMusic);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.currentTime = 0;
      }
    };
  }, [previewAudio]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-gray-100"
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
                    Enhance your slideshow with beautiful music
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

            <div className="flex h-[calc(95vh-120px)]">
              {/* Left Panel - Categories */}
              <div className="w-80 border-r border-gray-100 p-6 overflow-y-auto bg-gray-50/50">
                <div className="space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search music..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  </div>

                  {/* Favorites Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFavorites(!showFavorites)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showFavorites
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${showFavorites ? "fill-current" : ""
                          }`}
                      />
                      Favorites
                    </button>
                  </div>

                  {/* Categories */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Categories
                    </h3>
                    <div className="space-y-2">
                      {MUSIC_CATEGORIES.map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${selectedCategory === category.id
                                ? "bg-gradient-to-r " +
                                category.color +
                                " text-white shadow-lg"
                                : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedCategory === category.id
                                    ? "bg-white/20"
                                    : "bg-gray-100"
                                  }`}
                              >
                                <IconComponent
                                  className={`w-5 h-5 ${selectedCategory === category.id
                                      ? "text-white"
                                      : "text-gray-600"
                                    }`}
                                />
                              </div>
                              <div>
                                <div
                                  className={`font-semibold ${selectedCategory === category.id
                                      ? "text-white"
                                      : "text-gray-900"
                                    }`}
                                >
                                  {category.name}
                                </div>
                                <div
                                  className={`text-sm ${selectedCategory === category.id
                                      ? "text-white/80"
                                      : "text-gray-500"
                                    }`}
                                >
                                  {category.description}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Music Tracks */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {showFavorites
                        ? "Favorite Tracks"
                        : selectedCategory === "all"
                          ? "All Music Tracks"
                          : MUSIC_CATEGORIES.find(
                            (c) => c.id === selectedCategory
                          )?.name}
                    </h3>
                    <p className="text-gray-600">
                      {filteredTracks.length} track
                      {filteredTracks.length !== 1 ? "s" : ""} found
                    </p>
                  </div>

                  {/* No Music Option */}
                  <button
                    onClick={handleNoMusic}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${selectedMusic === "none"
                        ? "bg-red-100 text-red-700 border-2 border-red-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200"
                      }`}
                  >
                    No Music
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Loading music library...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Music Tracks Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTracks.map((track) => (
                        <motion.div
                          key={track.id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer bg-white shadow-sm hover:shadow-lg ${selectedMusic === track.id
                              ? "border-blue-500 bg-blue-50 shadow-lg"
                              : "border-gray-200 hover:border-gray-300"
                            }`}
                          onClick={() => handleMusicChange(track)}
                        >
                          {/* Track Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 truncate text-sm">
                                {track.name}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <User className="w-3 h-3" />
                                <span className="truncate">{track.artist}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(track.id);
                                }}
                                className={`p-1.5 rounded-full transition-colors ${favorites.has(track.id)
                                    ? "text-red-500 hover:text-red-600 bg-red-50"
                                    : "text-gray-400 hover:text-red-500 hover:bg-gray-50"
                                  }`}
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 ${favorites.has(track.id)
                                      ? "fill-current"
                                      : ""
                                    }`}
                                />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayPreview(track.id);
                                }}
                                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                {isPlayingPreview === track.id ? (
                                  <Pause className="w-3.5 h-3.5" />
                                ) : (
                                  <Play className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Track Info */}
                          <div className="space-y-2">
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                              {track.description}
                            </p>

                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span className="font-medium">
                                  {track.duration}
                                </span>
                              </div>
                              <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-xs font-semibold">
                                {track.category}
                              </span>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1">
                              {track.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                              {track.tags.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                  +{track.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Empty State */}
                    {filteredTracks.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Music className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No music found
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Try adjusting your search or filter criteria
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedCategory("all");
                            setShowFavorites(false);
                          }}
                          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Custom Music Upload */}
                <div className="mt-8 p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Upload Custom Music
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Upload your own music file (MP3, WAV, OGG, AAC)
                    </p>
                    <input
                      type="file"
                      id="custom-music-upload"
                      accept="audio/*,.mp3,.mp4,.wav,.ogg,.aac,.webm,.m4a"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleCustomMusicUpload(file);
                        }
                      }}
                      className="hidden"
                      disabled={isUploadingMusic}
                    />
                    <label
                      htmlFor="custom-music-upload"
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors cursor-pointer ${isUploadingMusic
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                      <Upload className="w-4 h-4" />
                      {isUploadingMusic ? "Uploading..." : "Choose Music File"}
                    </label>

                    {uploadStatus && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-700 font-medium">
                          {uploadStatus}
                        </div>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Music Settings */}
                {selectedMusic !== "none" && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      Music Settings
                    </h4>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Volume ({musicVolume}%)
                        </label>
                        <div className="flex items-center gap-3">
                          <VolumeX className="w-4 h-4 text-gray-400" />
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={musicVolume}
                            onChange={(e) =>
                              handleVolumeChange(Number(e.target.value))
                            }
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <Volume2 className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={musicLoop}
                          onChange={(e) => setMusicLoop(e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Loop background music
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50">
              <div className="text-sm text-gray-600">
                {selectedMusic !== "none"
                  ? "Music will be applied to your slideshow"
                  : "No background music will be used"}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Save Music Settings
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
