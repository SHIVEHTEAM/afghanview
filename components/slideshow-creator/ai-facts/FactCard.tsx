import React from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { Fact } from "./types";
import { getContrastColor, copyToClipboard } from "./utils";

const BG_STYLES = [
  // Gradient backgrounds
  "linear-gradient(135deg, #f9fafb 0%, #e0e7ff 100%)",
  "linear-gradient(135deg, #fdf6e3 0%, #fceabb 100%)",
  "linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
  // Subtle pattern backgrounds (SVG as data URI)
  `url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="%23f9fafb"/><circle cx="50" cy="50" r="40" fill="%23e0e7ff" fill-opacity="0.2"/></svg>')`,
  `url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="%23fdf6e3"/><rect x="20" y="20" width="60" height="60" fill="%23fceabb" fill-opacity="0.15"/></svg>')`,
];

function getRandomBgStyle(id: string) {
  // Use a hash of the id to pick a style for consistency
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % BG_STYLES.length;
  return BG_STYLES[idx];
}

interface FactCardProps {
  fact: Fact;
  isSelected?: boolean;
  isCurrent?: boolean;
  onToggle?: (factId: string) => void;
  onCopy?: (factId: string) => void;
  copiedFactId?: string | null;
  showCheckbox?: boolean;
}

export default function FactCard({
  fact,
  isSelected = false,
  isCurrent = false,
  onToggle,
  onCopy,
  copiedFactId,
  showCheckbox = false,
}: FactCardProps) {
  const handleCopy = async () => {
    const success = await copyToClipboard(fact.text);
    if (success && onCopy) {
      onCopy(fact.id);
    }
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle(fact.id);
    }
  };

  const contrastColor = getContrastColor(fact.backgroundColor || "#f9fafb");
  const isCopied = copiedFactId === fact.id;
  const backgroundStyle = fact.backgroundColor
    ? { background: fact.backgroundColor }
    : { background: getRandomBgStyle(fact.id) };

  return (
    <motion.div
      initial={isCurrent ? { opacity: 0, y: 20 } : { opacity: 0, x: 20 }}
      animate={isCurrent ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
      exit={isCurrent ? { opacity: 0, y: -20 } : { opacity: 0, x: -20 }}
      className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${
        isSelected ? "ring-2 ring-amber-500 shadow-md" : ""
      } ${isCurrent ? "mb-6" : ""}`}
      style={{
        ...backgroundStyle,
        color: contrastColor,
      }}
      onClick={showCheckbox ? handleToggle : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-sm font-medium px-3 py-1 rounded-full"
          style={{
            backgroundColor: `${contrastColor}20`,
            color: contrastColor,
          }}
        >
          {fact.category}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            style={{ color: contrastColor }}
          >
            {isCopied ? (
              <span className="text-green-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Copied!
              </span>
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          {showCheckbox && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              className="w-4 h-4"
            />
          )}
        </div>
      </div>

      {fact.emoji && (
        <div className="text-3xl mb-3 text-center">{fact.emoji}</div>
      )}

      <p
        className={`leading-relaxed mb-3 ${
          isCurrent ? "font-medium text-lg" : "text-sm"
        }`}
      >
        {fact.text}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs opacity-70">
          {fact.timestamp.toLocaleTimeString()}
        </span>
        {isCurrent && (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                isSelected
                  ? "bg-white/30 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {isSelected ? "Selected" : "Select"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
