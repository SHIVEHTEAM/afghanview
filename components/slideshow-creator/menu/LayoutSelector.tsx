import React from "react";
import { Settings } from "lucide-react";
import { MenuLayout, LayoutSelectorProps } from "./types";
import { layoutOptions } from "./constants";

export default function LayoutSelector({
  selectedLayout,
  onLayoutSelect,
}: LayoutSelectorProps) {
  const getLayoutPreview = (layoutId: string) => {
    switch (layoutId) {
      case "centered":
        return (
          <div className="h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-2 bg-gray-300 rounded mb-1"></div>
              <div className="w-16 h-1 bg-gray-200 rounded mb-1"></div>
              <div className="w-12 h-2 bg-gray-400 rounded"></div>
            </div>
          </div>
        );
      case "left-aligned":
        return (
          <div className="h-16 bg-gray-100 rounded-lg p-3">
            <div className="h-full flex flex-col justify-between">
              <div className="w-24 h-2 bg-gray-300 rounded"></div>
              <div className="w-20 h-1 bg-gray-200 rounded"></div>
              <div className="w-16 h-2 bg-gray-400 rounded"></div>
            </div>
          </div>
        );
      case "card":
        return (
          <div className="h-16 bg-gray-100 rounded-lg p-2">
            <div className="h-full bg-white rounded border-2 border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-2 bg-gray-300 rounded mb-1"></div>
                <div className="w-12 h-1 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        );
      case "minimal":
        return (
          <div className="h-16 bg-gray-100 rounded-lg relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-400"></div>
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-2 bg-gray-300 rounded mb-1"></div>
                <div className="w-16 h-2 bg-gray-400 rounded"></div>
              </div>
            </div>
          </div>
        );
      case "elegant":
        return (
          <div className="h-16 bg-gray-100 rounded-lg relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-400"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-400"></div>
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-gray-400"></div>
            <div className="absolute top-0 right-0 bottom-0 w-1 bg-gray-400"></div>
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-18 h-2 bg-gray-300 rounded mb-1"></div>
                <div className="w-14 h-2 bg-gray-400 rounded"></div>
              </div>
            </div>
          </div>
        );
      case "modern-grid":
        return (
          <div className="h-16 bg-gray-100 rounded-lg p-2">
            <div className="h-full bg-white rounded border border-gray-200 p-2">
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-2 bg-gray-300 rounded mb-1"></div>
                  <div className="w-12 h-1 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="w-20 h-2 bg-gray-300 rounded"></div>
          </div>
        );
    }
  };

  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Choose Layout
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {layoutOptions.map((layout) => (
          <div
            key={layout.id}
            onClick={() => onLayoutSelect(layout)}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              selectedLayout.id === layout.id
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium text-sm mb-2 text-gray-800">
              {layout.name}
            </div>
            {getLayoutPreview(layout.id)}
            <div className="text-xs text-gray-600 mt-2">
              {layout.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
