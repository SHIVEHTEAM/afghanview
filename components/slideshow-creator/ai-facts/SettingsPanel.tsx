import React, { useState } from "react";
import { Music, Volume2, Eye, Check, VolumeX } from "lucide-react";
import { SlideshowSettings, Theme, Transition } from "./types";
import { SlideshowMusicSettings } from "../../../types/music";
import { THEMES, TRANSITIONS } from "./constants";
import MultiTrackMusicSelector from "../shared/MultiTrackMusicSelector";

interface SettingsPanelProps {
  settings: SlideshowSettings;
  onSettingsChange: (settings: SlideshowSettings) => void;
  slideshowName: string;
  onSlideshowNameChange: (name: string) => void;
}

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

  const updateSetting = (key: keyof SlideshowSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

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
    <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
      {/* Slideshow Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slideshow Name
        </label>
        <input
          type="text"
          value={slideshowName}
          onChange={(e) => onSlideshowNameChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter slideshow name..."
        />
      </div>

      {/* Transition Effect */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transition Effect
        </label>
        <select
          value={settings.transition}
          onChange={(e) => updateSetting("transition", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TRANSITIONS.map((transition) => (
            <option key={transition.id} value={transition.id}>
              {transition.name}
            </option>
          ))}
        </select>
      </div>

      {/* Slide Duration */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slide Duration: {settings.slideDuration / 1000}s
        </label>
        <input
          type="range"
          min="3000"
          max="10000"
          step="500"
          value={settings.slideDuration}
          onChange={(e) =>
            updateSetting("slideDuration", parseInt(e.target.value))
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>3s</span>
          <span>10s</span>
        </div>
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

      {/* Loop Slideshow */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.loopSlideshow}
            onChange={(e) => updateSetting("loopSlideshow", e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="font-medium text-gray-900">Loop slideshow</span>
        </label>
      </div>

      {/* Shuffle Facts */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.shuffleSlides}
            onChange={(e) => updateSetting("shuffleSlides", e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="font-medium text-gray-900">
            Shuffle facts (random order)
          </span>
        </label>
      </div>

      {/* Auto-generate new random fact every X hours */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.autoRandomFact}
            onChange={(e) => updateSetting("autoRandomFact", e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="font-medium text-gray-900">
            Auto-generate new random fact every
          </span>
          <input
            type="number"
            min={6}
            max={168}
            value={settings.randomFactInterval || 6}
            onChange={(e) =>
              updateSetting(
                "randomFactInterval",
                Math.max(6, parseInt(e.target.value) || 6)
              )
            }
            className="w-16 px-2 py-1 border border-gray-300 rounded ml-2"
            disabled={!settings.autoRandomFact}
          />
          <span className="font-medium text-gray-900">hours</span>
        </label>
        <div className="text-xs text-gray-500 mt-1 ml-7">
          (Minimum 6 hours to avoid excessive requests)
        </div>
      </div>

      {/* Auto Play */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.autoPlay}
            onChange={(e) => updateSetting("autoPlay", e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="font-medium text-gray-900">Auto-play slideshow</span>
        </label>
      </div>

      {/* Show Controls */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showControls}
            onChange={(e) => updateSetting("showControls", e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="font-medium text-gray-900">
            Show playback controls
          </span>
        </label>
      </div>

      {/* Music Settings */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Music Settings
        </label>
        <div className="flex items-center gap-3 cursor-pointer">
          <div
            className={`p-3 rounded-full ${currentMusicInfo.color} flex items-center justify-center`}
          >
            <currentMusicInfo.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{currentMusicInfo.name}</p>
            <p className="text-xs text-gray-500">
              {currentMusicInfo.description}
            </p>
          </div>
          <button
            onClick={() => setShowMusicSelector(true)}
            className="ml-auto text-blue-600 hover:underline text-sm"
          >
            Change Music
          </button>
        </div>
      </div>

      {/* Music Selector Modal */}
      <MultiTrackMusicSelector
        isOpen={showMusicSelector}
        onClose={() => setShowMusicSelector(false)}
        onMusicSelected={handleMusicSelected}
        currentSettings={currentMusicSettings}
        title="Choose Background Music"
        description="Select music to play during your AI facts slideshow"
      />
    </div>
  );
}
