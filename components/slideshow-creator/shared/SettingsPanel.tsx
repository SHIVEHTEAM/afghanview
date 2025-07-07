import React, { useState } from "react";
import {
  Settings,
  Music,
  Volume2,
  Clock,
  Palette,
  Play,
  Pause,
} from "lucide-react";
import { SlideshowSettings } from "./types";
import { TRANSITIONS, ASPECT_RATIOS, QUALITY_OPTIONS } from "./constants";

interface SettingsPanelProps {
  settings: SlideshowSettings;
  onSettingsChange: (settings: SlideshowSettings) => void;
  slideshowName: string;
  onSlideshowNameChange: (name: string) => void;
}

// Free open-source background music options
const BACKGROUND_MUSIC_OPTIONS = [
  {
    id: "none",
    name: "No Music",
    artist: "",
    url: "",
    duration: "0:00",
  },
  {
    id: "ambient-1",
    name: "Peaceful Ambience",
    artist: "Free Music Archive",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    duration: "3:45",
  },
  {
    id: "upbeat-1",
    name: "Upbeat Energy",
    artist: "Free Music Archive",
    url: "https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav",
    duration: "2:30",
  },
  {
    id: "cultural-1",
    name: "Cultural Melody",
    artist: "Free Music Archive",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-04.wav",
    duration: "4:15",
  },
  {
    id: "custom",
    name: "Upload Custom Music",
    artist: "Your File",
    url: "",
    duration: "Custom",
  },
];

export default function SettingsPanel({
  settings,
  onSettingsChange,
  slideshowName,
  onSlideshowNameChange,
}: SettingsPanelProps) {
  const [selectedMusic, setSelectedMusic] = useState(
    settings.backgroundMusic || "none"
  );
  const [customMusicFile, setCustomMusicFile] = useState<File | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<string | null>(null);

  const handleMusicChange = (musicId: string) => {
    setSelectedMusic(musicId);
    if (musicId === "custom") {
      // Handle custom music upload
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "audio/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          setCustomMusicFile(file);
          onSettingsChange({
            ...settings,
            backgroundMusic: URL.createObjectURL(file),
          });
        }
      };
      input.click();
    } else {
      const musicOption = BACKGROUND_MUSIC_OPTIONS.find(
        (m) => m.id === musicId
      );
      onSettingsChange({
        ...settings,
        backgroundMusic: musicOption?.url || "",
      });
    }
  };

  const playMusicPreview = (musicId: string) => {
    const musicOption = BACKGROUND_MUSIC_OPTIONS.find((m) => m.id === musicId);
    if (musicOption?.url) {
      setIsPlayingPreview(musicId);
      const audio = new Audio(musicOption.url);
      audio.play();
      audio.onended = () => setIsPlayingPreview(null);
    }
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
          {TRANSITIONS.map((transition) => (
            <option key={transition.id} value={transition.id}>
              {transition.name}
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
        <div className="space-y-2">
          {BACKGROUND_MUSIC_OPTIONS.map((music) => (
            <div
              key={music.id}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedMusic === music.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleMusicChange(music.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Music className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">{music.name}</div>
                  {music.artist && (
                    <div className="text-sm text-gray-500">{music.artist}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {music.duration !== "Custom" && music.duration !== "0:00" && (
                  <span className="text-sm text-gray-500">
                    {music.duration}
                  </span>
                )}
                {music.url && music.id !== "none" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playMusicPreview(music.id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Preview"
                  >
                    {isPlayingPreview === music.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Music Volume */}
      {selectedMusic !== "none" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Music Volume
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.musicVolume}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  musicVolume: Number(e.target.value),
                })
              }
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0%</span>
              <span className="font-medium">{settings.musicVolume}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      )}

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
          {ASPECT_RATIOS.map((ratio) => (
            <option key={ratio.id} value={ratio.id}>
              {ratio.name}
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
            <option key={quality.id} value={quality.id}>
              {quality.name}
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

        {selectedMusic !== "none" && (
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
    </div>
  );
}
