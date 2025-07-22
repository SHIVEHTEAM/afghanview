import React, { useState } from "react";
import { motion } from "framer-motion";
import { Music, Play, Volume2, Sparkles, List, Upload, X } from "lucide-react";
import { SlideshowMusicSettings } from "../../../types/music";
import MultiTrackMusicSelector from "./MultiTrackMusicSelector";

interface MusicStepProps {
  currentSettings?: SlideshowMusicSettings;
  onMusicSelected: (settings: SlideshowMusicSettings) => void;
  onSkip: () => void;
  title?: string;
  description?: string;
}

export default function MusicStep({
  currentSettings,
  onMusicSelected,
  onSkip,
  title = "Add Background Music",
  description = "Select multiple tracks to play in sequence during your slideshow",
}: MusicStepProps) {
  const [showMusicSelector, setShowMusicSelector] = useState(false);
  const [selectedMusicInfo, setSelectedMusicInfo] = useState<{
    type: string;
    name: string;
    description: string;
  } | null>(null);

  const handleMusicSelected = (settings: SlideshowMusicSettings) => {
    // Determine what type of music was selected
    let musicInfo = null;

    if (settings.music_playlist_id) {
      musicInfo = {
        type: "playlist",
        name: "Custom Playlist",
        description: "Multiple tracks with shuffle/random play",
      };
    } else if (settings.background_music) {
      musicInfo = {
        type: "single",
        name: "Single Track",
        description: "One background music track",
      };
    } else {
      musicInfo = {
        type: "none",
        name: "No Music",
        description: "Slideshow will play without background music",
      };
    }

    setSelectedMusicInfo(musicInfo);
    onMusicSelected(settings);
    setShowMusicSelector(false);
  };

  const getMusicPreview = () => {
    if (!currentSettings) {
      return (
        <div className="text-center py-8">
          <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Music Selected
          </h3>
          <p className="text-gray-600">
            Add background music to enhance your slideshow
          </p>
        </div>
      );
    }

    if (selectedMusicInfo) {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {selectedMusicInfo.name}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedMusicInfo.description}
              </p>
              {currentSettings.music_volume && (
                <div className="flex items-center gap-2 mt-2">
                  <Volume2 className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    Volume: {currentSettings.music_volume}%
                  </span>
                  {currentSettings.music_loop && (
                    <span className="text-xs text-gray-500">• Loop</span>
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
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Music className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 max-w-md mx-auto">{description}</p>
      </div>

      {/* Music Preview */}
      {getMusicPreview()}

      {/* Quick Options */}
      {!currentSettings && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Quick Music Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => setShowMusicSelector(true)}
              className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 bg-white shadow-sm hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Choose Music</h4>
                  <p className="text-sm text-gray-600">
                    Browse our music library
                  </p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => setShowMusicSelector(true)}
              className="p-6 rounded-xl border-2 border-gray-200 hover:border-green-300 bg-white shadow-sm hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Upload Music</h4>
                  <p className="text-sm text-gray-600">
                    Use your own music files
                  </p>
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      )}

      {/* Music Categories */}
      {!currentSettings && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Popular Music Styles
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              {
                name: "Afghan Traditional",
                color: "from-orange-500 to-red-600",
                icon: Music,
              },
              {
                name: "Persian Classical",
                color: "from-blue-500 to-purple-600",
                icon: Music,
              },
              {
                name: "Ambient Relaxing",
                color: "from-green-500 to-teal-600",
                icon: Music,
              },
              {
                name: "Upbeat Energetic",
                color: "from-yellow-500 to-orange-600",
                icon: Music,
              },
              {
                name: "Instrumental",
                color: "from-indigo-500 to-blue-600",
                icon: Music,
              },
              { name: "No Music", color: "from-gray-500 to-gray-600", icon: X },
            ].map((style, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => setShowMusicSelector(true)}
                className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 bg-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div
                  className={`w-8 h-8 bg-gradient-to-r ${style.color} rounded-lg flex items-center justify-center mb-2 mx-auto`}
                >
                  <style.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900 text-center">
                  {style.name}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          onClick={() => setShowMusicSelector(true)}
          className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
        >
          <Music className="w-5 h-5" />
          {currentSettings ? "Change Music" : "Select Music"}
        </button>

        <button
          onClick={onSkip}
          className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
        >
          Skip for Now
        </button>
      </div>

      {/* Info Text */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div className="flex items-start gap-3">
          <Volume2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">
              Music enhances your slideshow experience
            </p>
            <p className="text-blue-600">
              You can always add or change music later from your slideshow
              settings. Choose from our curated collection or upload your own
              music files.
            </p>
          </div>
        </div>
      </div>

      {/* Music Selector Modal */}
      <MultiTrackMusicSelector
        isOpen={showMusicSelector}
        onClose={() => setShowMusicSelector(false)}
        onMusicSelected={handleMusicSelected}
        currentSettings={currentSettings}
        title="Choose Your Music"
        description="Select multiple tracks to play in sequence during your slideshow"
      />
    </div>
  );
}
