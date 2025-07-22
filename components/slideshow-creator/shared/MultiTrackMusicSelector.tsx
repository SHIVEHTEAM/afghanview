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
  Trash2,
  Move,
} from "lucide-react";
import { MusicService } from "../../../lib/music-service";
import { useToast } from "../../ui/Toast";
import {
  MusicTrack,
  MusicCategory,
  MusicPlaylist,
  SlideshowMusicSettings,
} from "../../../types/music";

interface MultiTrackMusicSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onMusicSelected: (settings: SlideshowMusicSettings) => void;
  currentSettings?: SlideshowMusicSettings;
  title?: string;
  description?: string;
}

export default function MultiTrackMusicSelector({
  isOpen,
  onClose,
  onMusicSelected,
  currentSettings,
  title = "Select Multiple Music Tracks",
  description = "Choose multiple tracks to play in sequence during your slideshow",
}: MultiTrackMusicSelectorProps) {
  // State management
  const [activeTab, setActiveTab] = useState<
    "current" | "quick" | "library" | "playlists" | "upload"
  >("current");
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
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadMetadata, setUploadMetadata] = useState({
    name: "",
    artist: "",
    description: "",
    category: "Other",
    tags: [] as string[],
    is_public: true,
  });

  const { showError, showSuccess } = useToast();

  // Get current music info
  const getCurrentMusicInfo = () => {
    if (currentSettings?.music_playlist_id) {
      return {
        type: "playlist",
        name: "Custom Playlist",
        description: `${
          currentSettings.music_play_mode || "sequential"
        } playback`,
        icon: List,
        color: "from-purple-500 to-pink-600",
      };
    } else if (currentSettings?.background_music) {
      return {
        type: "single",
        name: "Single Track",
        description: "Background music track",
        icon: Music,
        color: "from-blue-500 to-purple-600",
      };
    }
    return null;
  };

  const currentMusicInfo = getCurrentMusicInfo();

  // Handle no music selection
  const handleNoMusic = () => {
    const settings: SlideshowMusicSettings = {
      music_play_mode: "sequential",
      music_volume: musicVolume,
      music_loop: musicLoop,
      // Explicitly clear all music-related fields
      background_music: undefined,
      backgroundMusic: undefined,
      music_playlist_id: undefined,
    };
    onMusicSelected(settings);
    showSuccess("Music removed from slideshow");
    onClose();
  };

  // Quick music presets for multiple tracks
  const quickMusicPresets = [
    {
      id: "afghan-traditional-mix",
      name: "Afghan Traditional Mix",
      artist: "Traditional Afghan",
      description: "Multiple traditional Afghan melodies",
      category: "Traditional",
      icon: Guitar,
      color: "from-orange-500 to-red-600",
      tags: ["afghan", "traditional", "cultural"],
      trackCount: 5,
    },
    {
      id: "persian-classical-mix",
      name: "Persian Classical Mix",
      artist: "Persian Classical",
      description: "Elegant Persian classical music collection",
      category: "Classical",
      icon: Mic,
      color: "from-blue-500 to-purple-600",
      tags: ["persian", "classical", "elegant"],
      trackCount: 4,
    },
    {
      id: "ambient-relaxing-mix",
      name: "Ambient Relaxing Mix",
      artist: "Ambient",
      description: "Peaceful ambient background music collection",
      category: "Ambient",
      icon: Moon,
      color: "from-green-500 to-teal-600",
      tags: ["ambient", "relaxing", "peaceful"],
      trackCount: 6,
    },
    {
      id: "upbeat-energetic-mix",
      name: "Upbeat Energetic Mix",
      artist: "Energetic",
      description: "High-energy upbeat music collection",
      category: "Upbeat",
      icon: Zap,
      color: "from-yellow-500 to-orange-600",
      tags: ["upbeat", "energetic", "dynamic"],
      trackCount: 4,
    },
    {
      id: "instrumental-smooth-mix",
      name: "Instrumental Smooth Mix",
      artist: "Instrumental",
      description: "Smooth instrumental melodies collection",
      category: "Instrumental",
      icon: Waves,
      color: "from-indigo-500 to-blue-600",
      tags: ["instrumental", "smooth", "melodic"],
      trackCount: 5,
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
      trackCount: 0,
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

  // Handle quick music selection
  const handleQuickMusicSelect = async (presetId: string) => {
    if (presetId === "no-music") {
      handleNoMusic();
      return;
    }

    try {
      // For now, create a simple playlist with the preset
      const settings: SlideshowMusicSettings = {
        music_playlist_id: `preset-${presetId}`,
        music_play_mode: "sequential",
        music_volume: musicVolume,
        music_loop: musicLoop,
      };

      onMusicSelected(settings);
      showSuccess(
        `Quick mix "${presetId
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())}" applied successfully!`
      );
      onClose();
    } catch (error) {
      console.error("Error applying quick music:", error);
      showError("Failed to apply quick music");
    }
  };

  // Handle track selection
  const handleTrackSelect = (track: MusicTrack) => {
    if (activeTab === "library") {
      // Add to selected tracks
      setSelectedTracks((prev) => {
        const exists = prev.find((t) => t.id === track.id);
        if (exists) {
          return prev.filter((t) => t.id !== track.id);
        } else {
          return [...prev, track];
        }
      });
      setSelectedPlaylist(null);
    } else if (activeTab === "playlists") {
      // Add to playlist selection
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
    setShowUploadForm(true);

    // Auto-fill name from filename
    const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    setUploadMetadata((prev) => ({
      ...prev,
      name: fileName,
      artist: "Unknown Artist",
    }));
  };

  const handleUploadWithMetadata = async () => {
    if (!uploadingFile) return;

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const result = await MusicService.uploadMusic(
        uploadingFile,
        uploadMetadata
      );

      clearInterval(interval);
      setUploadProgress(100);

      if (result.success && result.track) {
        showSuccess("Music uploaded successfully!");
        // Add the uploaded track to the tracks list
        setTracks((prev) => [result.track!, ...prev]);
        // Reset upload state
        setUploadingFile(null);
        setShowUploadForm(false);
        setUploadProgress(0);
        setUploadMetadata({
          name: "",
          artist: "",
          description: "",
          category: "Other",
          tags: [],
          is_public: true,
        });
      } else {
        showError(result.error || "Upload failed");
      }
    } catch (error) {
      clearInterval(interval);
      setUploadProgress(0);
      showError("Upload failed");
    }
  };

  // Remove track from selection
  const removeTrack = (trackId: string) => {
    setSelectedTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  // Move track up in order
  const moveTrackUp = (index: number) => {
    if (index > 0) {
      const newTracks = [...selectedTracks];
      [newTracks[index], newTracks[index - 1]] = [
        newTracks[index - 1],
        newTracks[index],
      ];
      setSelectedTracks(newTracks);
    }
  };

  // Move track down in order
  const moveTrackDown = (index: number) => {
    if (index < selectedTracks.length - 1) {
      const newTracks = [...selectedTracks];
      [newTracks[index], newTracks[index + 1]] = [
        newTracks[index + 1],
        newTracks[index],
      ];
      setSelectedTracks(newTracks);
    }
  };

  // Apply music selection
  const handleApplyMusic = async () => {
    try {
      let settings: SlideshowMusicSettings;

      if (selectedTracks.length > 0) {
        // Create playlist for multiple tracks
        const playlist = await MusicService.createPlaylist(
          `Slideshow Music - ${new Date().toLocaleDateString()}`,
          "Auto-generated playlist for slideshow",
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
      } else if (selectedPlaylist) {
        settings = {
          music_playlist_id: selectedPlaylist.id,
          music_play_mode: selectedPlaylist.play_mode,
          music_volume: musicVolume,
          music_loop: musicLoop,
        };
      } else {
        // No music selected
        settings = {
          music_play_mode: "sequential",
          music_volume: musicVolume,
          music_loop: musicLoop,
          // Explicitly clear all music-related fields
          background_music: undefined,
          backgroundMusic: undefined,
          music_playlist_id: undefined,
        };
      }

      console.log(
        "[MultiTrackMusicSelector] Applying music settings:",
        settings
      );
      onMusicSelected(settings);

      // Provide specific success message
      if (selectedTracks.length > 0) {
        showSuccess(
          `Music applied successfully! ${selectedTracks.length} tracks will play in ${playMode} mode.`
        );
      } else if (selectedPlaylist) {
        showSuccess(
          `Playlist "${selectedPlaylist.name}" applied successfully!`
        );
      } else {
        showSuccess("Music settings updated successfully!");
      }

      onClose();
    } catch (error) {
      console.error("Error applying music:", error);
      showError("Failed to apply music settings");
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] overflow-hidden border border-gray-100 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-gray-600">{description}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                  <Music className="w-4 h-4" />
                  <span>
                    Multiple tracks will play in sequence during your slideshow
                  </span>
                </div>
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
          <div className="flex border-b border-gray-100 bg-white flex-shrink-0">
            {[
              { id: "current", label: "Current Music", icon: Music },
              { id: "quick", label: "Quick Mixes", icon: Sparkles },
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

          {/* Content - Now with proper scrolling */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12 h-full">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading music library...</p>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-6">
                <>
                  {/* Current Music Tab */}
                  {activeTab === "current" && (
                    <div className="space-y-6">
                      {currentMusicInfo ? (
                        <>
                          {/* Current Music Display */}
                          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Music className="w-5 h-5" />
                              Current Music
                            </h3>
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-16 h-16 bg-gradient-to-r ${currentMusicInfo.color} rounded-xl flex items-center justify-center`}
                              >
                                <currentMusicInfo.icon className="w-8 h-8 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-lg">
                                  {currentMusicInfo.name}
                                </h4>
                                <p className="text-gray-600 mb-2">
                                  {currentMusicInfo.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>Volume: {musicVolume}%</span>
                                  <span>Loop: {musicLoop ? "On" : "Off"}</span>
                                  {currentSettings?.music_play_mode && (
                                    <span>
                                      Mode: {currentSettings.music_play_mode}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              onClick={() => setActiveTab("quick")}
                              className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                                  <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900">
                                    Change to Quick Mix
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    Select a preset music mix
                                  </p>
                                </div>
                              </div>
                            </button>
                            <button
                              onClick={() => setActiveTab("library")}
                              className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                  <Music className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900">
                                    Choose Custom Music
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    Select from music library
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>

                          {/* Remove Music */}
                          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <VolumeX className="w-4 h-4" />
                              Remove Music
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              Remove all music from this slideshow. The
                              slideshow will play silently.
                            </p>
                            <button
                              onClick={handleNoMusic}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                              Remove Music
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* No Music Selected */}
                          <div className="text-center py-12">
                            <VolumeX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              No Music Selected
                            </h3>
                            <p className="text-gray-600 mb-6">
                              This slideshow will play without background music.
                              Choose an option below to add music.
                            </p>
                          </div>

                          {/* Music Options */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <button
                              onClick={() => setActiveTab("quick")}
                              className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                            >
                              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-6 h-6 text-white" />
                              </div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                Quick Mix
                              </h4>
                              <p className="text-sm text-gray-600">
                                Choose a preset music collection
                              </p>
                            </button>
                            <button
                              onClick={() => setActiveTab("library")}
                              className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                            >
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Music className="w-6 h-6 text-white" />
                              </div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                Music Library
                              </h4>
                              <p className="text-sm text-gray-600">
                                Browse and select custom tracks
                              </p>
                            </button>
                            <button
                              onClick={() => setActiveTab("upload")}
                              className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                            >
                              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Upload className="w-6 h-6 text-white" />
                              </div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                Upload Music
                              </h4>
                              <p className="text-sm text-gray-600">
                                Upload your own music files
                              </p>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Quick Mixes Tab */}
                  {activeTab === "quick" && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Choose a Music Mix
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
                              <p className="text-xs text-gray-500 mb-3">
                                {preset.description}
                              </p>
                              {preset.trackCount > 0 && (
                                <div className="flex items-center gap-2 text-xs text-blue-600">
                                  <List className="w-3 h-3" />
                                  <span>{preset.trackCount} tracks</span>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Additional Options */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Additional Options
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4 border">
                            <h5 className="font-medium text-gray-900 mb-2">
                              Create Custom Mix
                            </h5>
                            <p className="text-sm text-gray-600 mb-3">
                              Build your own music collection from the library
                            </p>
                            <button
                              onClick={() => setActiveTab("library")}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Browse Library →
                            </button>
                          </div>
                          <div className="bg-white rounded-lg p-4 border">
                            <h5 className="font-medium text-gray-900 mb-2">
                              Use Existing Playlist
                            </h5>
                            <p className="text-sm text-gray-600 mb-3">
                              Select from your saved playlists
                            </p>
                            <button
                              onClick={() => setActiveTab("playlists")}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View Playlists →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Music Library Tab */}
                  {activeTab === "library" && (
                    <div className="space-y-6">
                      {/* Search and Filters */}
                      <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-xl">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search music by name, artist, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          className={`px-4 py-3 rounded-lg border transition-colors ${
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
                        <button
                          onClick={() =>
                            setViewMode(viewMode === "grid" ? "list" : "grid")
                          }
                          className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {viewMode === "grid" ? (
                            <List className="w-4 h-4" />
                          ) : (
                            <Grid className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Selected Tracks */}
                      {selectedTracks.length > 0 && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <List className="w-4 h-4" />
                            Selected Tracks ({selectedTracks.length})
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedTracks.map((track, index) => (
                              <div
                                key={track.id}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-medium text-gray-500 w-6">
                                    {index + 1}
                                  </span>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {track.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {track.artist}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => moveTrackUp(index)}
                                    disabled={index === 0}
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                  >
                                    <Move className="w-4 h-4 rotate-90" />
                                  </button>
                                  <button
                                    onClick={() => moveTrackDown(index)}
                                    disabled={
                                      index === selectedTracks.length - 1
                                    }
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                  >
                                    <Move className="w-4 h-4 -rotate-90" />
                                  </button>
                                  <button
                                    onClick={() => removeTrack(track.id)}
                                    className="p-1 text-red-400 hover:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Music Tracks Grid/List */}
                      <div
                        className={
                          viewMode === "grid"
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            : "space-y-3"
                        }
                      >
                        {(() => {
                          const filteredTracks = tracks.filter((track) => {
                            const matchesSearch =
                              searchTerm === "" ||
                              track.name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              track.artist
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              track.description
                                ?.toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              track.tags.some((tag) =>
                                tag
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase())
                              );

                            const matchesCategory =
                              selectedCategory === "all" ||
                              track.category === selectedCategory;
                            const matchesFavorites =
                              !showFavorites ||
                              favorites.some((fav) => fav.id === track.id);

                            return (
                              matchesSearch &&
                              matchesCategory &&
                              matchesFavorites
                            );
                          });

                          if (filteredTracks.length === 0) {
                            return (
                              <div className="col-span-full text-center py-12">
                                <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {searchTerm ||
                                  selectedCategory !== "all" ||
                                  showFavorites
                                    ? "No tracks found"
                                    : "No tracks available"}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                  {searchTerm ||
                                  selectedCategory !== "all" ||
                                  showFavorites
                                    ? "Try adjusting your search or filters"
                                    : "Upload some music to get started"}
                                </p>
                                <button
                                  onClick={() => setActiveTab("upload")}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <Upload className="w-4 h-4" />
                                  Upload Music
                                </button>
                              </div>
                            );
                          }

                          return filteredTracks.map((track) => (
                            <motion.div
                              key={track.id}
                              whileHover={{ scale: 1.02, y: -2 }}
                              className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer bg-white shadow-sm hover:shadow-lg ${
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
                                <span>{track.duration_formatted}</span>
                              </div>
                              {selectedTracks.some((t) => t.id === track.id) ? (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              ) : (
                                <div className="absolute top-2 right-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTrackSelect(track);
                                    }}
                                    className="w-6 h-6 bg-gray-200 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors"
                                    title="Add to selection"
                                  >
                                    <Plus className="w-3 h-3 text-gray-600 hover:text-white" />
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Playlists Tab */}
                  {activeTab === "playlists" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Your Playlists
                        </h3>
                        <button
                          onClick={() => setIsCreatingPlaylist(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Create Playlist
                        </button>
                      </div>

                      {playlists.length === 0 ? (
                        <div className="text-center py-12">
                          <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No playlists yet
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Create your first playlist to organize your music
                          </p>
                          <button
                            onClick={() => setIsCreatingPlaylist(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Create Playlist
                          </button>
                        </div>
                      ) : (
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
                                <span className="capitalize">
                                  {playlist.play_mode}
                                </span>
                                <span>
                                  {new Date(
                                    playlist.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upload Tab */}
                  {activeTab === "upload" && (
                    <div className="space-y-6">
                      {!showUploadForm ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Upload Your Music
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Upload your own music files to add to your
                            slideshow. Supported formats: MP3, WAV, OGG, AAC,
                            M4A, FLAC, WebM
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
                      ) : (
                        <div className="space-y-6">
                          {/* File Info */}
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center gap-3">
                              <Music className="w-8 h-8 text-blue-600" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {uploadingFile?.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {uploadingFile?.size
                                    ? (
                                        uploadingFile.size /
                                        1024 /
                                        1024
                                      ).toFixed(2)
                                    : "0"}{" "}
                                  MB
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setShowUploadForm(false);
                                  setUploadingFile(null);
                                  setUploadMetadata({
                                    name: "",
                                    artist: "",
                                    description: "",
                                    category: "Other",
                                    tags: [],
                                    is_public: true,
                                  });
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Metadata Form */}
                          <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-4">
                              Music Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Track Name *
                                </label>
                                <input
                                  type="text"
                                  value={uploadMetadata.name}
                                  onChange={(e) =>
                                    setUploadMetadata((prev) => ({
                                      ...prev,
                                      name: e.target.value,
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Enter track name"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Artist *
                                </label>
                                <input
                                  type="text"
                                  value={uploadMetadata.artist}
                                  onChange={(e) =>
                                    setUploadMetadata((prev) => ({
                                      ...prev,
                                      artist: e.target.value,
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Enter artist name"
                                  required
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Description
                                </label>
                                <textarea
                                  value={uploadMetadata.description}
                                  onChange={(e) =>
                                    setUploadMetadata((prev) => ({
                                      ...prev,
                                      description: e.target.value,
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Describe the music (optional)"
                                  rows={3}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Category *
                                </label>
                                <select
                                  value={uploadMetadata.category}
                                  onChange={(e) =>
                                    setUploadMetadata((prev) => ({
                                      ...prev,
                                      category: e.target.value,
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="Afghan Traditional">
                                    Afghan Traditional
                                  </option>
                                  <option value="Persian Classical">
                                    Persian Classical
                                  </option>
                                  <option value="Pashto Traditional">
                                    Pashto Traditional
                                  </option>
                                  <option value="Ambient & Relaxing">
                                    Ambient & Relaxing
                                  </option>
                                  <option value="Upbeat & Energetic">
                                    Upbeat & Energetic
                                  </option>
                                  <option value="Instrumental">
                                    Instrumental
                                  </option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Tags
                                </label>
                                <input
                                  type="text"
                                  value={uploadMetadata.tags.join(", ")}
                                  onChange={(e) => {
                                    const tags = e.target.value
                                      .split(",")
                                      .map((tag) => tag.trim())
                                      .filter((tag) => tag);
                                    setUploadMetadata((prev) => ({
                                      ...prev,
                                      tags,
                                    }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="traditional, folk, cultural (comma separated)"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={uploadMetadata.is_public}
                                    onChange={(e) =>
                                      setUploadMetadata((prev) => ({
                                        ...prev,
                                        is_public: e.target.checked,
                                      }))
                                    }
                                    className="rounded"
                                  />
                                  <span className="text-sm text-gray-700">
                                    Make this track public (visible to other
                                    users)
                                  </span>
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Upload Progress */}
                          {uploadProgress > 0 && (
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-800">
                                  Uploading {uploadingFile?.name}...
                                </span>
                                <span className="text-sm text-blue-600">
                                  {uploadProgress}%
                                </span>
                              </div>
                              <div className="w-full bg-blue-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Upload Button */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleUploadWithMetadata}
                              disabled={
                                !uploadMetadata.name ||
                                !uploadMetadata.artist ||
                                uploadProgress > 0
                              }
                              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
                            >
                              {uploadProgress > 0
                                ? "Uploading..."
                                : "Upload Music"}
                            </button>
                            <button
                              onClick={() => {
                                setShowUploadForm(false);
                                setUploadingFile(null);
                                setUploadProgress(0);
                              }}
                              className="px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
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
                  Apply Music (
                  {selectedTracks.length + (selectedPlaylist ? 1 : 0)} tracks)
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
