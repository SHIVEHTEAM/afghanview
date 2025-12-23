import React from "react";
import { Check } from "lucide-react";
import { PropertyTheme } from "./types";
import { propertyThemes } from "./constants";

interface ThemeSelectorProps {
    selectedTheme: PropertyTheme;
    onThemeSelect: (theme: PropertyTheme) => void;
}

export default function ThemeSelector({ selectedTheme, onThemeSelect }: ThemeSelectorProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Select Theme</h3>
            <div className="grid grid-cols-2 gap-4">
                {propertyThemes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => onThemeSelect(theme)}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left overflow-hidden ${selectedTheme.id === theme.id
                                ? "border-blue-500 shadow-md ring-1 ring-blue-500"
                                : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                            }`}
                    >
                        {/* Theme Stylistic Preview Background */}
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{ backgroundColor: theme.backgroundColor }}
                        ></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-gray-900">{theme.name}</span>
                                {selectedTheme.id === theme.id && (
                                    <div className="p-1 bg-blue-500 text-white rounded-full">
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                            </div>

                            {/* Mini Color Palette Preview */}
                            <div className="flex gap-2 mt-3">
                                <div
                                    className="w-6 h-6 rounded-full shadow-sm border border-gray-100"
                                    title="Background"
                                    style={{ backgroundColor: theme.backgroundColor }}
                                />
                                <div
                                    className="w-6 h-6 rounded-full shadow-sm border border-gray-100"
                                    title="Text"
                                    style={{ backgroundColor: theme.textColor }}
                                />
                                <div
                                    className="w-6 h-6 rounded-full shadow-sm border border-gray-100"
                                    title="Accent"
                                    style={{ backgroundColor: theme.accentColor }}
                                />
                            </div>

                            <div
                                className="mt-3 text-xs opacity-70 truncate px-2 py-1 rounded bg-black/5 inline-block"
                                style={{ fontFamily: theme.fontFamily }}
                            >
                                Aa Bb Cc
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
