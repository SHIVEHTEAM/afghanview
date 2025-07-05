import React from "react";

export default function EffectsPanel() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Advanced Effects</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Global Effects</h3>
          <p className="text-gray-600 text-sm">
            These effects will be applied to all slides. Individual slide
            effects can be set in the Media tab.
          </p>

          {/* Add more global effects here */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">More effects coming soon...</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Preset Themes</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Classic",
              "Modern",
              "Vintage",
              "Bold",
              "Minimal",
              "Colorful",
            ].map((theme) => (
              <button
                key={theme}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
