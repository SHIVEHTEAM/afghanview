import React, { useState } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";
import SlideMusicSelector from "./SlideMusicSelector";
import { SlideMusicSettings } from "../../../types/music";

interface SlideMusicButtonProps {
  slideId: string;
  slideTitle: string;
  currentSettings?: SlideMusicSettings;
  onSettingsChange: (settings: SlideMusicSettings) => void;
}

export default function SlideMusicButton({
  slideId,
  slideTitle,
  currentSettings,
  onSettingsChange,
}: SlideMusicButtonProps) {
  const [showSelector, setShowSelector] = useState(false);

  const hasMusic =
    currentSettings?.enabled && currentSettings?.music_type !== "none";

  return (
    <>
      <button
        onClick={() => setShowSelector(true)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          hasMusic
            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
        title={hasMusic ? "Edit slide music" : "Add music to slide"}
      >
        {hasMusic ? (
          <Volume2 className="w-4 h-4" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
        {hasMusic ? "Music" : "Add Music"}
      </button>

      {showSelector && (
        <SlideMusicSelector
          slideId={slideId}
          slideTitle={slideTitle}
          currentSettings={currentSettings}
          onSettingsChange={onSettingsChange}
          onClose={() => setShowSelector(false)}
        />
      )}
    </>
  );
}
