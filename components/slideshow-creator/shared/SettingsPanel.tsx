import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Music,
  Clock,
  Palette,
  Monitor,
  Check,
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

const TRANSITION_OPTIONS = [
  { label: "Fade", value: "fade" },
  { label: "Slide", value: "slide" },
  { label: "Zoom", value: "zoom" },
  { label: "Flip", value: "flip" },
];

const ASPECT_RATIO_OPTIONS = [
  { label: "16:9 (Widescreen)", value: "16:9" },
  { label: "4:3 (Standard)", value: "4:3" },
  { label: "1:1 (Square)", value: "1:1" },
];

const QUALITY_OPTIONS = [
  { label: "Performance", value: "low" },
  { label: "Balanced", value: "medium" },
  { label: "High Definition", value: "high" },
];

export default function SettingsPanel({
  settings,
  onSettingsChange,
  slideshowName,
  onSlideshowNameChange,
}: SettingsPanelProps) {
  const [showMusicSelector, setShowMusicSelector] = useState(false);
  const [currentMusicSettings, setCurrentMusicSettings] = useState<SlideshowMusicSettings | undefined>(settings.music);

  const getCurrentMusicInfo = () => {
    if (!currentMusicSettings) {
      return { type: "none", name: "System Muted", description: "No audio tracks active", icon: VolumeX };
    }
    return { type: "active", name: "Audio Track Active", description: "Custom playback enabled", icon: Music };
  };

  const currentMusicInfo = getCurrentMusicInfo();

  const handleMusicSelected = (musicSettings: SlideshowMusicSettings) => {
    setCurrentMusicSettings(musicSettings);
    onSettingsChange({
      ...settings,
      music: musicSettings,
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
    <div className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-10">
        <SettingsIcon className="w-5 h-5 text-black/20" />
        <h3 className="text-xl font-bold text-black">Configuration</h3>
      </div>

      <div className="space-y-8">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-3">Module Name</label>
          <input
            type="text"
            value={slideshowName}
            onChange={(e) => onSlideshowNameChange(e.target.value)}
            className="w-full px-6 py-4 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white focus:border-black/20 transition-all font-medium"
            placeholder="Identity Reference..."
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> <span>Interval Timing</span></div>
            <span className="text-black">{settings.duration / 1000}s</span>
          </label>
          <input
            type="range"
            min="2"
            max="15"
            step="0.5"
            value={settings.duration / 1000}
            onChange={(e) => onSettingsChange({ ...settings, duration: Number(e.target.value) * 1000 })}
            className="w-full accent-black h-1.5 bg-black/5 rounded-full appearance-none cursor-pointer"
          />
        </div>

        {/* Layout & Transition */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-3">Transition</label>
            <select
              value={settings.transition}
              onChange={(e) => onSettingsChange({ ...settings, transition: e.target.value as any })}
              className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white"
            >
              {TRANSITION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-3">Ratio</label>
            <select
              value={settings.aspectRatio}
              onChange={(e) => onSettingsChange({ ...settings, aspectRatio: e.target.value as any })}
              className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white"
            >
              {ASPECT_RATIO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Audio */}
        <div>
          <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-4">Audio Synchronization</label>
          <div className="p-6 bg-gray-50 rounded-2xl border border-black/5 group hover:border-black/20 transition-all cursor-pointer" onClick={() => setShowMusicSelector(true)}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
                <currentMusicInfo.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-black">{currentMusicInfo.name}</h4>
                <p className="text-xs text-black/30 mt-1">{currentMusicInfo.description}</p>
              </div>
              <button className="px-4 py-2 bg-white text-black border border-black/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">Configure</button>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="pt-4 border-t border-black/5 grid grid-cols-2 gap-y-4">
          {[
            { label: "Auto Play", key: "autoPlay" },
            { label: "Loop Module", key: "loopSlideshow" },
            { label: "Display Controls", key: "showControls" },
            { label: "Progress Bar", key: "showProgress" },
          ].map((opt) => (
            <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings[opt.key as keyof SlideshowSettings] as boolean}
                onChange={(e) => onSettingsChange({ ...settings, [opt.key]: e.target.checked })}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${settings[opt.key as keyof SlideshowSettings] ? "bg-black border-black text-white" : "bg-white border-black/10 text-transparent"}`}>
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-black/60 group-hover:text-black transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <MultiTrackMusicSelector
        isOpen={showMusicSelector}
        onClose={() => setShowMusicSelector(false)}
        onMusicSelected={handleMusicSelected}
        currentSettings={currentMusicSettings}
        title="Background Audio"
        description="Select tracks or playlists for this module"
      />
    </div>
  );
}
