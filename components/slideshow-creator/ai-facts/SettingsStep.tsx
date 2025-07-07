import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Eye, Play, ArrowLeft } from "lucide-react";
import { Fact, SlideshowSettings } from "./types";
import { THEMES, TRANSITIONS, DEFAULT_SETTINGS } from "./constants";
import { getContrastColor } from "./utils";
import SettingsPanel from "./SettingsPanel";
import FactCard from "./FactCard";

interface SettingsStepProps {
  facts: Fact[];
  onComplete: (data: any) => void;
  onBack: () => void;
}

export default function SettingsStep({
  facts,
  onComplete,
  onBack,
}: SettingsStepProps) {
  const [settings, setSettings] = useState<SlideshowSettings>(DEFAULT_SETTINGS);
  const [slideshowName, setSlideshowName] = useState("AI Facts");

  const handleComplete = () => {
    const slideshowData = {
      name: slideshowName,
      type: "ai-facts",
      facts,
      settings,
      createdAt: new Date(),
    };
    onComplete(slideshowData);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex">
        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          slideshowName={slideshowName}
          onSlideshowNameChange={setSlideshowName}
        />

        {/* Right Panel - Preview */}
        <div className="w-1/2 p-6 overflow-y-auto">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </h3>

          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <div className="text-center text-white mb-2">
              <h4 className="font-medium">{slideshowName}</h4>
              <p className="text-sm text-gray-400">AI Facts Slideshow</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  Duration: {settings.slideDuration / 1000}s per slide
                </span>
                <span>Transition: {settings.transition}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  Theme: {THEMES.find((t) => t.id === settings.theme)?.name}
                </span>
                <span>Auto-play: {settings.autoPlay ? "Yes" : "No"}</span>
              </div>
              {settings.backgroundMusic && (
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Music: Uploaded</span>
                  <span>Volume: {settings.musicVolume}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Selected Facts Preview */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">
              Selected Facts ({facts.length})
            </h4>
            {facts.slice(0, 3).map((fact, index) => (
              <div
                key={fact.id}
                className="border rounded-lg p-3"
                style={{
                  backgroundColor: fact.backgroundColor || "#f9fafb",
                  color: getContrastColor(fact.backgroundColor || "#f9fafb"),
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <span
                    className="text-xs font-medium px-2 py-1 rounded"
                    style={{
                      backgroundColor: `${getContrastColor(
                        fact.backgroundColor || "#f9fafb"
                      )}20`,
                      color: getContrastColor(
                        fact.backgroundColor || "#f9fafb"
                      ),
                    }}
                  >
                    {fact.category}
                  </span>
                  <span className="text-xs opacity-70">Slide {index + 1}</span>
                </div>
                <p className="text-sm leading-relaxed">{fact.text}</p>
              </div>
            ))}
            {facts.length > 3 && (
              <div className="text-center text-gray-500 text-sm">
                +{facts.length - 3} more facts...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {facts.length} facts • {settings.slideDuration / 1000}s per slide
          </div>
          <button
            onClick={handleComplete}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Create Slideshow
          </button>
        </div>
      </div>
    </div>
  );
}
