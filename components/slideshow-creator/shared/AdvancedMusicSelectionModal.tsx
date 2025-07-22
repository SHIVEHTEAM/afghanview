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
  Plus,
  Shuffle,
  Repeat,
  List,
  Grid,
  Settings,
  Save,
  Trash2,
  Edit3,
} from "lucide-react";
import { MusicService } from "../../../lib/music-service";
import { useToast } from "../../ui/Toast";
import {
  MusicTrack,
  MusicCategory,
  MusicPlaylist,
  SlideshowMusicSettings,
} from "../../../types/music";

interface AdvancedMusicSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  slideshowId: string;
  currentSettings?: SlideshowMusicSettings;
  onMusicUpdated: (settings: SlideshowMusicSettings) => void;
}

export default function AdvancedMusicSelectionModal({
  isOpen,
  onClose,
  slideshowId,
  currentSettings,
  onMusicUpdated,
}: AdvancedMusicSelectionModalProps) {
  // State management
  const [activeTab, setActiveTab] = useState<
    "library" | "playlists" | "upload"
  >("library");
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

  // Music settings
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

  // Handle track selection
  const handleTrackSelect = (track: MusicTrack) => {
    if (activeTab === "library") {
      // Single track selection for slideshow
      setSelectedTracks([track]);
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

  // Create new playlist
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      showError("Please enter a playlist name");
      return;
    }

    setIsCreatingPlaylist(true);
    try {
      const playlist = await MusicService.createPlaylist(
        newPlaylistName,
        `Playlist for slideshow ${slideshowId}`,
        undefined,
        playMode
      );

      if (playlist && selectedTracks.length > 0) {
        await MusicService.addTracksToPlaylist(
          playlist.id,
          selectedTracks.map((t) => t.id)
        );
        setPlaylists((prev) => [
          ...prev,
          {
            ...playlist,
            tracks: selectedTracks,
            track_count: selectedTracks.length,
          },
        ]);
        setSelectedPlaylist(playlist);
        setNewPlaylistName("");
        showSuccess("Playlist created successfully");
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
      showError("Failed to create playlist");
    } finally {
      setIsCreatingPlaylist(false);
    }
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

  // Save music settings
  const handleSaveSettings = async () => {
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

      await MusicService.updateSlideshowMusic(slideshowId, settings);
      onMusicUpdated(settings);
      showSuccess("Music settings saved successfully");
      onClose();
    } catch (error) {
      console.error("Error saving music settings:", error);
      showError("Failed to save music settings");
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Advanced Music Selection
                </h2>
                <p className="text-gray-600">
                  Choose single tracks, create playlists, or upload your own
                  music
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

          <div className="flex h-[calc(90vh-120px)]">
            {/* Left Sidebar */}
            <div className="w-80 border-r border-gray-100 p-6 overflow-y-auto bg-gray-50/50">
              {/* Tabs */}
              <div className="flex flex-col gap-2 mb-6">
                <button
                  onClick={() => setActiveTab("library")}
                  className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === "library"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "bg-white hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  <Music className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">Music Library</div>
                    <div
                      className={`text-sm ${
                        activeTab === "library"
                          ? "text-white/80"
                          : "text-gray-600"
                      }`}
                    >
                      Browse and select tracks
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("playlists")}
                  className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === "playlists"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "bg-white hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  <List className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">Playlists</div>
                    <div
                      className={`text-sm ${
                        activeTab === "playlists"
                          ? "text-white/80"
                          : "text-gray-600"
                      }`}
                    >
                      Create and manage playlists
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === "upload"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "bg-white hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">Upload Music</div>
                    <div
                      className={`text-sm ${
                        activeTab === "upload"
                          ? "text-white/80"
                          : "text-gray-600"
                      }`}
                    >
                      Add your own music files
                    </div>
                  </div>
                </button>
              </div>

              {/* Search and Filters */}
              {activeTab === "library" && (
                <div className="space-y-4">
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

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFavorites(!showFavorites)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        showFavorites
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          showFavorites ? "fill-current" : ""
                        }`}
                      />
                      Favorites
                    </button>
                  </div>

                  {/* Categories */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Categories
                    </h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() =>
                            setSelectedCategory(
                              category.name === "All Music"
                                ? "all"
                                : category.name
                            )
                          }
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                            selectedCategory ===
                            (category.name === "All Music"
                              ? "all"
                              : category.name)
                              ? "bg-gradient-to-r " +
                                category.color_gradient +
                                " text-white shadow-lg"
                              : "bg-white hover:bg-gray-50 border border-gray-200 text-gray-900"
                          }`}
                        >
                          <div className="font-semibold">{category.name}</div>
                          <div
                            className={`text-sm ${
                              selectedCategory ===
                              (category.name === "All Music"
                                ? "all"
                                : category.name)
                                ? "text-white/80"
                                : "text-gray-600"
                            }`}
                          >
                            {category.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Playlist Creation */}
              {activeTab === "playlists" && selectedTracks.length > 0 && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3">
                      Create New Playlist
                    </h3>
                    <input
                      type="text"
                      placeholder="Playlist name..."
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="w-full p-2 border border-blue-300 rounded-lg mb-3"
                    />
                    <button
                      onClick={handleCreatePlaylist}
                      disabled={isCreatingPlaylist || !newPlaylistName.trim()}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isCreatingPlaylist ? "Creating..." : "Create Playlist"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
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
                  {/* Content based on active tab */}
                  {activeTab === "library" && (
                    <MusicLibraryContent
                      tracks={filteredTracks}
                      selectedTracks={selectedTracks}
                      onTrackSelect={handleTrackSelect}
                      onPlayPreview={handlePlayPreview}
                      playingTrack={playingTrack}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                    />
                  )}

                  {activeTab === "playlists" && (
                    <PlaylistsContent
                      playlists={playlists}
                      tracks={tracks}
                      selectedPlaylist={selectedPlaylist}
                      selectedTracks={selectedTracks}
                      onPlaylistSelect={handlePlaylistSelect}
                      onTrackSelect={handleTrackSelect}
                      onPlayPreview={handlePlayPreview}
                      playingTrack={playingTrack}
                    />
                  )}

                  {activeTab === "upload" && (
                    <UploadContent
                      onFileUpload={handleFileUpload}
                      uploadingFile={uploadingFile}
                      uploadProgress={uploadProgress}
                      uploadMetadata={uploadMetadata}
                      setUploadMetadata={setUploadMetadata}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer with Settings and Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-6">
              {/* Music Settings */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <VolumeX className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(Number(e.target.value))}
                    className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <Volume2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 w-8">
                    {musicVolume}%
                  </span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={musicLoop}
                    onChange={(e) => setMusicLoop(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Loop</span>
                </label>

                {/* Play Mode Selection */}
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
              </div>
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
    </AnimatePresence>
  );
}

// Sub-components for better organization
function MusicLibraryContent({
  tracks,
  selectedTracks,
  onTrackSelect,
  onPlayPreview,
  playingTrack,
  viewMode,
  onViewModeChange,
}: any) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Music Library</h3>
          <p className="text-gray-600">{tracks.length} tracks available</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-lg ${
              viewMode === "grid"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded-lg ${
              viewMode === "list"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tracks Grid/List */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-2"
        }
      >
        {tracks.map((track: MusicTrack) => (
          <TrackCard
            key={track.id}
            track={track}
            isSelected={selectedTracks.some(
              (t: MusicTrack) => t.id === track.id
            )}
            isPlaying={playingTrack === track.id}
            onSelect={() => onTrackSelect(track)}
            onPlayPreview={() => onPlayPreview(track.id)}
            viewMode={viewMode}
          />
        ))}
      </div>

      {tracks.length === 0 && (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No music found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}

function PlaylistsContent({
  playlists,
  tracks,
  selectedPlaylist,
  selectedTracks,
  onPlaylistSelect,
  onTrackSelect,
  onPlayPreview,
  playingTrack,
}: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Playlists</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist: MusicPlaylist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              isSelected={selectedPlaylist?.id === playlist.id}
              onSelect={() => onPlaylistSelect(playlist)}
            />
          ))}
        </div>
      </div>

      {selectedPlaylist && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedPlaylist.name} - Add Tracks
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track: MusicTrack) => (
              <TrackCard
                key={track.id}
                track={track}
                isSelected={selectedTracks.some(
                  (t: MusicTrack) => t.id === track.id
                )}
                isPlaying={playingTrack === track.id}
                onSelect={() => onTrackSelect(track)}
                onPlayPreview={() => onPlayPreview(track.id)}
                viewMode="grid"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UploadContent({
  onFileUpload,
  uploadingFile,
  uploadProgress,
  uploadMetadata,
  setUploadMetadata,
}: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Music</h3>
        <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileUpload(file);
            }}
            className="hidden"
            id="music-upload"
          />
          <label
            htmlFor="music-upload"
            className="flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Choose Music File
            </p>
            <p className="text-gray-600">MP3, WAV, OGG, AAC (max 50MB)</p>
          </label>
        </div>
      </div>

      {uploadingFile && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3">
            Uploading: {uploadingFile.name}
          </h4>
          <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-blue-700">{uploadProgress}% complete</p>
        </div>
      )}
    </div>
  );
}

function TrackCard({
  track,
  isSelected,
  isPlaying,
  onSelect,
  onPlayPreview,
  viewMode,
}: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer bg-white shadow-sm hover:shadow-lg ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-lg"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onSelect}
    >
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
              onPlayPreview();
            }}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {track.description}
        </p>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-3 h-3" />
            <span className="font-medium">{track.duration_formatted}</span>
          </div>
          <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-xs font-semibold">
            {track.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function PlaylistCard({ playlist, isSelected, onSelect }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer bg-white shadow-sm hover:shadow-lg ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-lg"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <List className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{playlist.name}</h4>
          <p className="text-xs text-gray-600">{playlist.track_count} tracks</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{playlist.play_mode}</span>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
          Playlist
        </span>
      </div>
    </motion.div>
  );
}
