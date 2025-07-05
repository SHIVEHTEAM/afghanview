import React from "react";
import { SlideshowSettings, durationOptions, transitionOptions } from "./types";

interface SettingsPanelProps {
  settings: SlideshowSettings;
  onUpdateSettings: (updates: Partial<SlideshowSettings>) => void;
  onMusicUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMusic: () => void;
}

export default function SettingsPanel({
  settings,
  onUpdateSettings,
  onMusicUpload,
  onRemoveMusic,
}: SettingsPanelProps) {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Slideshow Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timing Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Timing & Transitions</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Slide Duration
            </label>
            <select
              value={settings.defaultDuration}
              onChange={(e) =>
                onUpdateSettings({ defaultDuration: Number(e.target.value) })
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {durationOptions.map(
                (option: { value: number; label: string }) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transition Effect
            </label>
            <select
              value={settings.transition}
              onChange={(e) =>
                onUpdateSettings({ transition: e.target.value as any })
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {transitionOptions.map(
                (option: {
                  value: string;
                  label: string;
                  description: string;
                  icon: string;
                }) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label} - {option.description}
                  </option>
                )
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Current:{" "}
              {
                transitionOptions.find(
                  (opt) => opt.value === settings.transition
                )?.icon
              }{" "}
              {
                transitionOptions.find(
                  (opt) => opt.value === settings.transition
                )?.label
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transition Duration ({settings.transitionDuration}ms)
            </label>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={settings.transitionDuration}
              onChange={(e) =>
                onUpdateSettings({ transitionDuration: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>
        </div>

        {/* Playback Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Playback Options</h3>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoPlay}
                onChange={(e) =>
                  onUpdateSettings({ autoPlay: e.target.checked })
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Auto-play slideshow
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.loopSlideshow}
                onChange={(e) =>
                  onUpdateSettings({ loopSlideshow: e.target.checked })
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Loop slideshow</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showControls}
                onChange={(e) =>
                  onUpdateSettings({ showControls: e.target.checked })
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Show player controls
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.showProgress}
                onChange={(e) =>
                  onUpdateSettings({ showProgress: e.target.checked })
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Show progress bar
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.shuffleSlides}
                onChange={(e) =>
                  onUpdateSettings({ shuffleSlides: e.target.checked })
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Shuffle slides</span>
            </label>
          </div>
        </div>

        {/* Quality Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Quality & Format</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aspect Ratio
            </label>
            <select
              value={settings.aspectRatio}
              onChange={(e) =>
                onUpdateSettings({ aspectRatio: e.target.value as any })
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="16:9">16:9 (Widescreen)</option>
              <option value="4:3">4:3 (Standard)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="auto">Auto (Original)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality
            </label>
            <select
              value={settings.quality}
              onChange={(e) =>
                onUpdateSettings({ quality: e.target.value as any })
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="low">Low (Faster loading)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Best quality)</option>
            </select>
          </div>
        </div>

        {/* Background Music */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Background Music</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Music File
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={onMusicUpload}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {settings.backgroundMusic && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  {settings.backgroundMusic instanceof File
                    ? settings.backgroundMusic.name
                    : typeof settings.backgroundMusic === "string"
                    ? "Music file selected"
                    : ""}
                </p>
                <button
                  onClick={onRemoveMusic}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Music Volume ({settings.musicVolume}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.musicVolume}
              onChange={(e) =>
                onUpdateSettings({ musicVolume: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.musicLoop}
              onChange={(e) =>
                onUpdateSettings({ musicLoop: e.target.checked })
              }
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Loop background music
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
