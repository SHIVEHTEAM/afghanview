import React from "react";
import { Eye, Upload } from "lucide-react";
import { MenuItem, MenuTheme, MenuLayout, MenuPreviewProps } from "./types";
import { MenuSVGGenerator } from "./svg-generator";

export default function MenuPreview({
  menuItems,
  theme,
  layout,
}: MenuPreviewProps) {
  if (menuItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Add menu items to see preview</p>
        </div>
      </div>
    );
  }

  // Check if this is a multi-item layout
  const isMultiItemLayout = [
    "multi-grid",
    "menu-style",
    "grid-2x2",
    "grid-3x2",
  ].includes(layout.id);

  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Eye className="w-5 h-5" />
        Preview ({menuItems.length} items)
        {isMultiItemLayout && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Multi-item layout
          </span>
        )}
      </h4>
      <div className="bg-gray-100 rounded-lg p-4 h-full overflow-y-auto">
        <div className="space-y-4">
          {isMultiItemLayout ? (
            // Show multi-item layout preview
            <div className="relative rounded-lg overflow-hidden shadow-lg bg-white">
              <img
                src={MenuSVGGenerator.generateMultiItemSlide(
                  menuItems,
                  theme,
                  layout
                )}
                alt="Multi-item menu"
                className="w-full h-auto"
              />
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                Multi-item Slide
              </div>
            </div>
          ) : (
            // Show individual item previews
            menuItems.slice(0, 6).map((item, index) => (
              <div
                key={item.id}
                className="relative rounded-lg overflow-hidden shadow-lg bg-white"
              >
                <img
                  src={MenuSVGGenerator.generateMenuSlide(item, theme, layout)}
                  alt={item.name}
                  className="w-full h-auto"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  Slide {index + 1}
                </div>
              </div>
            ))
          )}

          {!isMultiItemLayout && menuItems.length > 6 && (
            <div className="text-center text-gray-500 text-sm py-4">
              +{menuItems.length - 6} more items...
            </div>
          )}

          {isMultiItemLayout && menuItems.length > 8 && (
            <div className="text-center text-gray-500 text-sm py-4">
              +{menuItems.length - 8} more items (will be shown on additional
              slides)...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
