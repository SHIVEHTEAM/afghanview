import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Search,
  Filter,
  Heart,
  Clock,
  Plus,
  Shuffle,
  Repeat,
  List,
  Grid,
  Settings,
  Save,
  Upload,
  X,
  Check,
  Sparkles,
  Zap,
  Moon,
  Sun,
  Waves,
  Mic,
  Guitar,
  Disc3,
} from "lucide-react";
import { MusicService } from "../../../lib/music-service";
import { useToast } from "../../ui/Toast";
import {
  MusicTrack,
  MusicCategory,
  MusicPlaylist,
  SlideshowMusicSettings,
} from "../../../types/music";

interface IntegratedMusicSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onMusicSelected: (settings: SlideshowMusicSettings) => void;
  currentSettings?: SlideshowMusicSettings;
  title?: string;
  description?: string;
}

export default function IntegratedMusicSelector({
  isOpen,
  onClose,
  onMusicSelected,
  currentSettings,
  title = "Choose Your Music",
  description = "Select background music for your slideshow",
}: IntegratedMusicSelectorProps) {
  // State management
  const [activeTab, setActiveTab] = useState<
    "quick" | "library" | "playlists" | "upload"
  >("quick");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Music data
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [categories, setCategories] = useState<MusicCategory[]>([]);
  const [playlists, setPlaylists] = useState<MusicPlaylist[]>([]);
  const [favorites, setFavorites] = useState<MusicTrack[]>([]);

  // Selection state
  const [selectedTracks, setSelectedTracks] = useState<MusicTrack[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<MusicPlaylist | null>(null);
  const [playMode, setPlayMode] = useState<"sequential" | "shuffle" | "random">(
    "sequential"
  );
  const [musicVolume, setMusicVolume] = useState(
    currentSettings?.music_volume || 50
  );
  const [musicLoop, setMusicLoop] = useState(
    currentSettings?.music_loop ?? true
  );

  // UI state
  const [loading, setLoading] = useState(true);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  // Upload state
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMetadata, setUploadMetadata] = useState({
    name: "",
    artist: "",
    description: "",
    category: "Other",
    tags: [] as string[],
    is_public: true,
  });

  const { showError, showSuccess } = useToast();

  // Quick music presets
  const quickMusicPresets = [
    {
      id: "afghan-traditional",
      name: "Afghan Traditional",
      artist: "Traditional Afghan",
      description: "Beautiful traditional Afghan melodies",
      category: "Traditional",
      icon: Guitar,
      color: "from-orange-500 to-red-600",
      tags: ["afghan", "traditional", "cultural"],
    },
    {
      id: "persian-classical",
      name: "Persian Classical",
      artist: "Persian Classical",
      description: "Elegant Persian classical music",
      category: "Classical",
      icon: Mic,
      color: "from-blue-500 to-purple-600",
      tags: ["persian", "classical", "elegant"],
    },
    {
      id: "ambient-relaxing",
      name: "Ambient Relaxing",
      artist: "Ambient",
      description: "Peaceful ambient background music",
      category: "Ambient",
      icon: Moon,
      color: "from-green-500 to-teal-600",
      tags: ["ambient", "relaxing", "peaceful"],
    },
    {
      id: "upbeat-energetic",
      name: "Upbeat Energetic",
      artist: "Energetic",
      description: "High-energy upbeat music",
      category: "Upbeat",
      icon: Zap,
      color: "from-yellow-500 to-orange-600",
      tags: ["upbeat", "energetic", "dynamic"],
    },
    {
      id: "instrumental-smooth",
      name: "Instrumental Smooth",
      artist: "Instrumental",
      description: "Smooth instrumental melodies",
      category: "Instrumental",
      icon: Waves,
      color: "from-indigo-500 to-blue-600",
      tags: ["instrumental", "smooth", "melodic"],
    },
    {
      id: "no-music",
      name: "No Music",
      artist: "Silent",
      description: "Play slideshow without background music",
      category: "None",
      icon: VolumeX,
      color: "from-gray-500 to-gray-600",
      tags: ["silent", "no-music"],
    },
  ];

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tracksData, categoriesData, playlistsData, favoritesData] =
        await Promise.all([
          MusicService.getTracks(),
          MusicService.getCategories(),
          MusicService.getUserPlaylists(),
          MusicService.getUserFavorites(),
        ]);

      setTracks(tracksData);
      setCategories(categoriesData);
      setPlaylists(playlistsData);
      setFavorites(favoritesData);
    } catch (error) {
      console.error("Error loading music data:", error);
      showError("Failed to load music library");
    } finally {
      setLoading(false);
    }
  };

  // Filter tracks based on search and category
  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      searchTerm === "" ||
      track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || track.category === selectedCategory;
    const matchesFavorites =
      !showFavorites || favorites.some((fav) => fav.id === track.id);

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  // Handle quick music selection
  const handleQuickMusicSelect = async (presetId: string) => {
    if (presetId === "no-music") {
      const settings: SlideshowMusicSettings = {
        music_play_mode: "sequential",
        music_volume: musicVolume,
        music_loop: musicLoop,
      };
      onMusicSelected(settings);
      showSuccess("No music selected");
      onClose();
      return;
    }

    // Find tracks in the selected category
    const preset = quickMusicPresets.find((p) => p.id === presetId);
    if (!preset) return;

    const categoryTracks = tracks.filter(
      (track) => track.category.toLowerCase() === preset.category.toLowerCase()
    );

    if (categoryTracks.length === 0) {
      showError("No tracks found in this category");
      return;
    }

    // Create a playlist for the category
    try {
      const playlist = await MusicService.createPlaylist(
        `${preset.name} - ${new Date().toLocaleDateString()}`,
        `Auto-generated playlist for ${preset.name}`,
        undefined,
        "shuffle"
      );

      if (playlist) {
        await MusicService.addTracksToPlaylist(
          playlist.id,
          categoryTracks.map((t) => t.id)
        );

        const settings: SlideshowMusicSettings = {
          music_playlist_id: playlist.id,
          music_play_mode: "shuffle",
          music_volume: musicVolume,
          music_loop: musicLoop,
        };

        onMusicSelected(settings);
        showSuccess(`${preset.name} music selected!`);
        onClose();
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
      showError("Failed to select music");
    }
  };

  // Handle track selection
  const handleTrackSelect = (track: MusicTrack) => {
    if (activeTab === "library") {
      setSelectedTracks([track]);
      setSelectedPlaylist(null);
    } else if (activeTab === "playlists") {
      setSelectedTracks((prev) => {
        const exists = prev.find((t) => t.id === track.id);
        if (exists) {
          return prev.filter((t) => t.id !== track.id);
        } else {
          return [...prev, track];
        }
      });
    }
  };

  // Handle playlist selection
  const handlePlaylistSelect = (playlist: MusicPlaylist) => {
    setSelectedPlaylist(playlist);
    setSelectedTracks([]);
    setPlayMode(playlist.play_mode);
  };

  // Handle music preview
  const handlePlayPreview = (trackId: string) => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    if (playingTrack === trackId) {
      setPlayingTrack(null);
      setAudioElement(null);
    } else {
      const track = tracks.find((t) => t.id === trackId);
      if (track) {
        const audio = new Audio(track.file_url);
        audio.volume = 0.3;

        audio.onended = () => {
          setPlayingTrack(null);
          setAudioElement(null);
        };

        audio.onerror = () => {
          console.error("Failed to play audio preview");
          setPlayingTrack(null);
          setAudioElement(null);
        };

        audio
          .play()
          .then(() => {
            setPlayingTrack(trackId);
            setAudioElement(audio);
          })
          .catch((err) => {
            console.error("Error playing preview:", err);
            setPlayingTrack(null);
            setAudioElement(null);
          });
      }
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setUploadingFile(file);
    setUploadProgress(0);
    setUploadMetadata((prev) => ({
      ...prev,
      name: file.name.replace(/\.[^/.]+$/, ""),
    }));

    try {
      const result = await MusicService.uploadMusic(file, uploadMetadata);

      if (result.success && result.track) {
        setTracks((prev) => [result.track!, ...prev]);
        setSelectedTracks([result.track!]);
        showSuccess("Music uploaded successfully");
        setActiveTab("library");
      } else {
        showError(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showError("Failed to upload music file");
    } finally {
      setUploadingFile(null);
      setUploadProgress(0);
    }
  };

  // Apply music selection
  const handleApplyMusic = async () => {
    try {
      let settings: SlideshowMusicSettings;

      if (selectedPlaylist) {
        settings = {
          music_playlist_id: selectedPlaylist.id,
          music_play_mode: playMode,
          music_volume: musicVolume,
          music_loop: musicLoop,
        };
      } else if (selectedTracks.length > 0) {
        // Create a temporary playlist for multiple tracks
        const playlist = await MusicService.createPlaylist(
          `Slideshow Music - ${new Date().toLocaleDateString()}`,
          `Auto-generated playlist for slideshow`,
          undefined,
          playMode
        );

        if (playlist) {
          await MusicService.addTracksToPlaylist(
            playlist.id,
            selectedTracks.map((t) => t.id)
          );
          settings = {
            music_playlist_id: playlist.id,
            music_play_mode: playMode,
            music_volume: musicVolume,
            music_loop: musicLoop,
          };
        } else {
          // Fallback to single track
          settings = {
            background_music: selectedTracks[0].file_url,
            music_play_mode: "sequential",
            music_volume: musicVolume,
            music_loop: musicLoop,
          };
        }
      } else {
        // No music selected
        settings = {
          music_play_mode: "sequential",
          music_volume: musicVolume,
          music_loop: musicLoop,
        };
      }

      onMusicSelected(settings);
      showSuccess("Music applied successfully!");
      onClose();
    } catch (error) {
      console.error("Error applying music:", error);
      showError("Failed to apply music");
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, [audioElement]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-gray-600">{description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-white">
            {[
              { id: "quick", label: "Quick Select", icon: Sparkles },
              { id: "library", label: "Music Library", icon: Music },
              { id: "playlists", label: "Playlists", icon: List },
              { id: "upload", label: "Upload Music", icon: Upload },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading music library...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Quick Select Tab */}
                {activeTab === "quick" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Choose a Music Style
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quickMusicPresets.map((preset) => (
                          <motion.div
                            key={preset.id}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="p-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer bg-white shadow-sm hover:shadow-lg transition-all duration-200"
                            onClick={() => handleQuickMusicSelect(preset.id)}
                          >
                            <div
                              className={`w-12 h-12 bg-gradient-to-r ${preset.color} rounded-xl flex items-center justify-center mb-4`}
                            >
                              <preset.icon className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {preset.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {preset.artist}
                            </p>
                            <p className="text-xs text-gray-500">
                              {preset.description}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Music Library Tab */}
                {activeTab === "library" && (
                  <div className="space-y-6">
                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search music..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setShowFavorites(!showFavorites)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          showFavorites
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            showFavorites ? "fill-current" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Music Tracks Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTracks.map((track) => (
                        <motion.div
                          key={track.id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer bg-white shadow-sm hover:shadow-lg ${
                            selectedTracks.some((t) => t.id === track.id)
                              ? "border-blue-500 bg-blue-50 shadow-lg"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleTrackSelect(track)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {track.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {track.artist}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayPreview(track.id);
                              }}
                              className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors"
                            >
                              {playingTrack === track.id ? (
                                <Pause className="w-3 h-3" />
                              ) : (
                                <Play className="w-3 h-3 ml-0.5" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                            {track.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{track.category}</span>
                            <span>{track.duration}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Playlists Tab */}
                {activeTab === "playlists" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {playlists.map((playlist) => (
                        <motion.div
                          key={playlist.id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer bg-white shadow-sm hover:shadow-lg ${
                            selectedPlaylist?.id === playlist.id
                              ? "border-blue-500 bg-blue-50 shadow-lg"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handlePlaylistSelect(playlist)}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                              <List className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {playlist.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {playlist.track_count} tracks
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            {playlist.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{playlist.play_mode}</span>
                            <span>{playlist.created_at}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Tab */}
                {activeTab === "upload" && (
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Upload Your Music
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Upload your own music files to use in your slideshows
                      </p>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="hidden"
                        id="music-upload"
                      />
                      <label
                        htmlFor="music-upload"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        Choose Music File
                      </label>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-600" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600 w-8">
                    {musicVolume}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="music-loop"
                    checked={musicLoop}
                    onChange={(e) => setMusicLoop(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="music-loop" className="text-sm text-gray-600">
                    Loop Music
                  </label>
                </div>
                {selectedTracks.length > 0 && (
                  <div className="flex items-center gap-2">
                    <select
                      value={playMode}
                      onChange={(e) => setPlayMode(e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="sequential">Sequential</option>
                      <option value="shuffle">Shuffle</option>
                      <option value="random">Random</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyMusic}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Apply Music
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
