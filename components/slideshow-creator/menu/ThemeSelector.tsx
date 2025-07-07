import React from "react";
import { Palette } from "lucide-react";
import { MenuTheme, ThemeSelectorProps } from "./types";
import { menuThemes } from "./constants";

export default function ThemeSelector({
  selectedTheme,
  onThemeSelect,
}: ThemeSelectorProps) {
  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Palette className="w-5 h-5" />
        Choose Theme
      </h4>
      <div className="grid grid-cols-1 gap-3">
        {menuThemes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => onThemeSelect(theme)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
              selectedTheme.id === theme.id
                ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-100"
                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-800">{theme.name}</span>
              <div className="flex gap-2">
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: theme.backgroundColor }}
                  title="Background"
                />
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: theme.accentColor }}
                  title="Accent"
                />
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: theme.priceColor }}
                  title="Price"
                />
              </div>
            </div>

            <div
              className="h-20 rounded-lg border border-gray-200 relative overflow-hidden"
              style={{ backgroundColor: theme.backgroundColor }}
            >
              <div className="p-3 h-full flex flex-col justify-between">
                <div
                  className="text-sm font-bold truncate"
                  style={{ color: theme.textColor }}
                >
                  Sample Menu Item
                </div>
                <div
                  className="text-xs opacity-80"
                  style={{ color: theme.descriptionColor }}
                >
                  Delicious description here
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: theme.priceColor }}
                >
                  $15.99
                </div>
              </div>

              {/* Theme preview overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-10" />
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Font: {theme.fontFamily}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
