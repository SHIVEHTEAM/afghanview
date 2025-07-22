import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Shuffle,
  Repeat,
  List,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { MusicService } from "../../../lib/music-service";
import { useToast } from "../../ui/Toast";
import {
  MusicTrack,
  MusicPlaylist,
  MusicCategory,
  SlideMusicSettings,
} from "../../../types/music";

interface SlideMusicSelectorProps {
  slideId: string;
  slideTitle: string;
  currentSettings?: SlideMusicSettings;
  onSettingsChange: (settings: SlideMusicSettings) => void;
  onClose: () => void;
}

export default function SlideMusicSelector({
  slideId,
  slideTitle,
  currentSettings,
  onSettingsChange,
  onClose,
}: SlideMusicSelectorProps) {
  const [settings, setSettings] = useState<SlideMusicSettings>(
    currentSettings || {
      enabled: false,
      music_type: "none",
      volume: 50,
      fade_in_duration: 1,
      fade_out_duration: 1,
      loop: true,
      play_mode: "sequential",
    }
  );

  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [playlists, setPlaylists] = useState<MusicPlaylist[]>([]);
  const [categories, setCategories] = useState<MusicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  const { showError, showSuccess } = useToast();

  useEffect(() => {
    loadMusicData();
  }, []);

  const loadMusicData = async () => {
    setLoading(true);
    try {
      const [tracksData, playlistsData, categoriesData] = await Promise.all([
        MusicService.getTracks(),
        MusicService.getUserPlaylists(),
        MusicService.getCategories(),
      ]);

      setTracks(tracksData);
      setPlaylists(playlistsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading music data:", error);
      showError("Failed to load music library");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPreview = (trackId: string) => {
    if (playingTrack === trackId) {
      // Stop playing
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
        setAudioElement(null);
      }
      setPlayingTrack(null);
    } else {
      // Start playing
      const track = tracks.find((t) => t.id === trackId);
      if (track) {
        if (audioElement) {
          audioElement.pause();
        }
        const audio = new Audio(track.file_url);
        audio.volume = settings.volume / 100;
        audio.addEventListener("ended", () => setPlayingTrack(null));
        audio.play();
        setAudioElement(audio);
        setPlayingTrack(trackId);
      }
    }
  };

  const handleSave = () => {
    onSettingsChange(settings);
    showSuccess("Slide music settings saved!");
    onClose();
  };

  const updateSettings = (updates: Partial<SlideMusicSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const getSelectedTrack = () => {
    return tracks.find((t) => t.id === settings.track_id);
  };

  const getSelectedPlaylist = () => {
    return playlists.find((p) => p.id === settings.playlist_id);
  };

  const getSelectedCategory = () => {
    return categories.find((c) => c.name === settings.category);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Slide Music Settings
            </h2>
            <p className="text-sm text-gray-600">{slideTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading music library...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Enable/Disable Music */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Background Music
                    </h3>
                    <p className="text-sm text-gray-600">
                      Add music to this specific slide
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) =>
                      updateSettings({ enabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.enabled && (
                <>
                  {/* Music Type Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Music Type
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "none", label: "No Music", icon: VolumeX },
                        {
                          value: "single_track",
                          label: "Single Track",
                          icon: Music,
                        },
                        { value: "playlist", label: "Playlist", icon: List },
                        {
                          value: "category_random",
                          label: "Random from Category",
                          icon: Shuffle,
                        },
                      ].map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() =>
                              updateSettings({
                                music_type: option.value as any,
                              })
                            }
                            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                              settings.music_type === option.value
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <Icon className="w-5 h-5 text-gray-600 mb-2" />
                            <div className="font-semibold text-gray-900">
                              {option.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Music Selection based on type */}
                  {settings.music_type === "single_track" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Select Track
                      </h3>
                      <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                        {tracks.map((track) => (
                          <div
                            key={track.id}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              settings.track_id === track.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() =>
                              updateSettings({ track_id: track.id })
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {track.name}
                                </h4>
                                <p className="text-sm text-gray-600 truncate">
                                  {track.artist} • {track.duration_formatted}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayPreview(track.id);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                {playingTrack === track.id ? (
                                  <Pause className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <Play className="w-4 h-4 text-gray-600" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {settings.music_type === "playlist" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Select Playlist
                      </h3>
                      <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                        {playlists.map((playlist) => (
                          <div
                            key={playlist.id}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              settings.playlist_id === playlist.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() =>
                              updateSettings({ playlist_id: playlist.id })
                            }
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <List className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {playlist.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {playlist.track_count} tracks •{" "}
                                  {playlist.play_mode}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {settings.music_type === "category_random" && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Select Category
                      </h3>
                      <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                        {categories
                          .filter((c) => c.name !== "All Music")
                          .map((category) => (
                            <div
                              key={category.id}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                settings.category === category.name
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() =>
                                updateSettings({ category: category.name })
                              }
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r ${category.color_gradient}`}
                                >
                                  <Music className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">
                                    {category.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {category.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Music Settings */}
                  {(settings.music_type === "single_track" ||
                    settings.music_type === "playlist" ||
                    settings.music_type === "category_random") && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Music Settings
                      </h3>

                      {/* Volume */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Volume ({settings.volume}%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.volume}
                          onChange={(e) =>
                            updateSettings({ volume: parseInt(e.target.value) })
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Fade In/Out */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fade In ({settings.fade_in_duration}s)
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.5"
                            value={settings.fade_in_duration}
                            onChange={(e) =>
                              updateSettings({
                                fade_in_duration: parseFloat(e.target.value),
                              })
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fade Out ({settings.fade_out_duration}s)
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.5"
                            value={settings.fade_out_duration}
                            onChange={(e) =>
                              updateSettings({
                                fade_out_duration: parseFloat(e.target.value),
                              })
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Loop */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Loop Music
                          </h4>
                          <p className="text-sm text-gray-600">
                            Repeat music until slide ends
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.loop}
                            onChange={(e) =>
                              updateSettings({ loop: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </motion.div>
  );
}
