import React from "react";
import { Music, Volume2, Eye, Check } from "lucide-react";
import { SlideshowSettings, Theme, Transition } from "./types";
import { THEMES, TRANSITIONS } from "./constants";

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
  const updateSetting = (key: keyof SlideshowSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
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
    </div>
  );
}
