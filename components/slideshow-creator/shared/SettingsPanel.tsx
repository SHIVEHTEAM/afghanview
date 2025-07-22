import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Volume2,
  VolumeX,
  Music,
  Play,
  Pause,
  Upload,
  X,
  Clock,
  Palette,
  Monitor,
  RotateCcw,
  Shuffle,
  Eye,
  EyeOff,
  Square,
  Circle,
  Triangle,
} from "lucide-react";
import { SlideshowSettings } from "./types";
import { SlideshowMusicSettings } from "../../../types/music";
import MultiTrackMusicSelector from "./MultiTrackMusicSelector";

interface SettingsPanelProps {
  settings: SlideshowSettings;
  onSettingsChange: (updates: Partial<SlideshowSettings>) => void;
  slideshowName: string;
  onSlideshowNameChange: (name: string) => void;
}

// Duration options in milliseconds
const DURATION_OPTIONS = [
  { label: "2 seconds", value: 2000 },
  { label: "3 seconds", value: 3000 },
  { label: "5 seconds", value: 5000 },
  { label: "7 seconds", value: 7000 },
  { label: "10 seconds", value: 10000 },
  { label: "15 seconds", value: 15000 },
];

// Transition options
const TRANSITION_OPTIONS = [
  { label: "Fade", value: "fade", icon: Circle },
  { label: "Slide", value: "slide", icon: Square },
  { label: "Zoom", value: "zoom", icon: Triangle },
  { label: "Flip", value: "flip", icon: RotateCcw },
  { label: "Bounce", value: "bounce", icon: RotateCcw },
];

// Aspect ratio options
const ASPECT_RATIO_OPTIONS = [
  { label: "16:9 (Widescreen)", value: "16:9" },
  { label: "4:3 (Standard)", value: "4:3" },
  { label: "1:1 (Square)", value: "1:1" },
];

// Quality options
const QUALITY_OPTIONS = [
  { label: "Low (Fast)", value: "low" },
  { label: "Medium (Balanced)", value: "medium" },
  { label: "High (Best)", value: "high" },
];

export default function SettingsPanel({
  settings,
  onSettingsChange,
  slideshowName,
  onSlideshowNameChange,
}: SettingsPanelProps) {
  const [showMusicSelector, setShowMusicSelector] = useState(false);
  const [currentMusicSettings, setCurrentMusicSettings] = useState<
    SlideshowMusicSettings | undefined
  >(settings.music);

  // Get current music info for display
  const getCurrentMusicInfo = () => {
    if (!currentMusicSettings) {
      return {
        type: "none",
        name: "No Music",
        description: "Slideshow will play silently",
        icon: VolumeX,
        color: "from-gray-500 to-gray-600",
      };
    }

    if (currentMusicSettings.music_playlist_id) {
      return {
        type: "playlist",
        name: "Custom Playlist",
        description: `${
          currentMusicSettings.music_play_mode || "sequential"
        } playback`,
        icon: Music,
        color: "from-purple-500 to-pink-600",
      };
    } else if (
      currentMusicSettings.background_music ||
      currentMusicSettings.backgroundMusic
    ) {
      return {
        type: "single",
        name: "Single Track",
        description: "Background music track",
        icon: Music,
        color: "from-blue-500 to-purple-600",
      };
    }

    return {
      type: "none",
      name: "No Music",
      description: "Slideshow will play silently",
      icon: VolumeX,
      color: "from-gray-500 to-gray-600",
    };
  };

  const currentMusicInfo = getCurrentMusicInfo();

  const handleMusicSelected = (musicSettings: SlideshowMusicSettings) => {
    setCurrentMusicSettings(musicSettings);
    onSettingsChange({
      ...settings,
      music: musicSettings,
      // Also update legacy fields for backward compatibility
      backgroundMusic: musicSettings.backgroundMusic,
      background_music: musicSettings.background_music,
      musicVolume: musicSettings.music_volume,
      music_volume: musicSettings.music_volume,
      musicLoop: musicSettings.music_loop,
      music_loop: musicSettings.music_loop,
      music_play_mode: musicSettings.music_play_mode,
      music_playlist_id: musicSettings.music_playlist_id,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Slideshow Settings
        </h3>
      </div>

      {/* Slideshow Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slideshow Name
        </label>
        <input
          type="text"
          value={slideshowName}
          onChange={(e) => onSlideshowNameChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter slideshow name..."
        />
      </div>

      {/* Slide Duration */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Slide Duration
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="2"
            max="10"
            step="0.5"
            value={settings.duration / 1000}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                duration: Number(e.target.value) * 1000,
              })
            }
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>2s</span>
            <span className="font-medium">{settings.duration / 1000}s</span>
            <span>10s</span>
          </div>
        </div>
      </div>

      {/* Transition Effect */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Transition Effect
        </label>
        <select
          value={settings.transition}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              transition: e.target.value as any,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {TRANSITION_OPTIONS.map((transition) => (
            <option key={transition.value} value={transition.value}>
              {transition.label}
            </option>
          ))}
        </select>
      </div>

      {/* Background Music */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Music className="w-4 h-4" />
          Background Music
        </label>

        {/* Current Music Display */}
        <div className="mb-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 bg-gradient-to-r ${currentMusicInfo.color} rounded-xl flex items-center justify-center`}
              >
                <currentMusicInfo.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {currentMusicInfo.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {currentMusicInfo.description}
                </p>
                {currentMusicSettings && (
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>Volume: {currentMusicSettings.music_volume}%</span>
                    <span>
                      Loop: {currentMusicSettings.music_loop ? "On" : "Off"}
                    </span>
                    {currentMusicSettings.music_play_mode && (
                      <span>Mode: {currentMusicSettings.music_play_mode}</span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowMusicSelector(true)}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Change
              </button>
            </div>
          </div>
        </div>

        {/* Music Selector Button */}
        <button
          onClick={() => setShowMusicSelector(true)}
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
        >
          <div className="flex items-center justify-center gap-2">
            <Music className="w-5 h-5" />
            <span className="font-medium">Select Music</span>
          </div>
        </button>
      </div>

      {/* Aspect Ratio */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aspect Ratio
        </label>
        <select
          value={settings.aspectRatio}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              aspectRatio: e.target.value as any,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {ASPECT_RATIO_OPTIONS.map((ratio) => (
            <option key={ratio.value} value={ratio.value}>
              {ratio.label}
            </option>
          ))}
        </select>
      </div>

      {/* Quality */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quality
        </label>
        <select
          value={settings.quality}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              quality: e.target.value as any,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {QUALITY_OPTIONS.map((quality) => (
            <option key={quality.value} value={quality.value}>
              {quality.label}
            </option>
          ))}
        </select>
      </div>

      {/* Playback Options */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-800">Playback Options</h4>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.autoPlay}
            onChange={(e) =>
              onSettingsChange({ ...settings, autoPlay: e.target.checked })
            }
            className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Auto Play</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.loopSlideshow}
            onChange={(e) =>
              onSettingsChange({ ...settings, loopSlideshow: e.target.checked })
            }
            className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Loop Slideshow</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.showControls}
            onChange={(e) =>
              onSettingsChange({ ...settings, showControls: e.target.checked })
            }
            className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Show Controls</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.showProgress}
            onChange={(e) =>
              onSettingsChange({ ...settings, showProgress: e.target.checked })
            }
            className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Show Progress Bar</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.shuffleSlides}
            onChange={(e) =>
              onSettingsChange({ ...settings, shuffleSlides: e.target.checked })
            }
            className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Shuffle Slides</span>
        </label>

        {currentMusicInfo.type !== "none" && (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.musicLoop}
              onChange={(e) =>
                onSettingsChange({ ...settings, musicLoop: e.target.checked })
              }
              className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Loop Music</span>
          </label>
        )}
      </div>

      {/* Music Selector Modal */}
      <MultiTrackMusicSelector
        isOpen={showMusicSelector}
        onClose={() => setShowMusicSelector(false)}
        onMusicSelected={handleMusicSelected}
        currentSettings={currentMusicSettings}
        title="Choose Background Music"
        description="Select music to play during your slideshow"
      />
    </div>
  );
}
