import React from "react";
import { Image as ImageIcon, Video } from "lucide-react";
import { SlideMedia, durationOptions } from "./types";

interface MediaDetailsProps {
  selectedMedia: SlideMedia | null;
  defaultDuration: number;
  onUpdateDuration: (id: string, duration: number) => void;
  onAddTextOverlay: (id: string, text: string) => void;
  onUpdateEffects: (id: string, effects: any) => void;
}

export default function MediaDetails({
  selectedMedia,
  defaultDuration,
  onUpdateDuration,
  onAddTextOverlay,
  onUpdateEffects,
}: MediaDetailsProps) {
  if (!selectedMedia) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Select a media item to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Media Details</h2>

        {/* Preview */}
        <div className="aspect-video bg-white rounded-xl overflow-hidden shadow-lg">
          {selectedMedia.type === "video" ? (
            <video
              src={selectedMedia.url}
              className="w-full h-full object-contain"
              controls
              muted
            />
          ) : (
            <img
              src={selectedMedia.url}
              alt={selectedMedia.name}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Duration Control - Only for Images */}
        {selectedMedia.type === "image" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Duration
            </label>
            <select
              value={selectedMedia.duration || defaultDuration}
              onChange={(e) =>
                onUpdateDuration(selectedMedia.id, Number(e.target.value))
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {durationOptions.map(
                (option: { value: number; label: string }) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>
        )}

        {/* Video Duration Info */}
        {selectedMedia.type === "video" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Duration
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                This video will play for its natural duration:{" "}
                <span className="font-medium text-gray-900">
                  {((selectedMedia.duration || 0) / 1000).toFixed(1)} seconds
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Text Overlay */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text Overlay
          </label>
          <textarea
            value={selectedMedia.textOverlay?.text || ""}
            onChange={(e) => onAddTextOverlay(selectedMedia.id, e.target.value)}
            placeholder="Add text overlay to this slide..."
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Effects - Only for Images */}
        {selectedMedia.type === "image" && (
          <div>
            <h3 className="text-lg font-medium mb-3">Visual Effects</h3>
            <div className="space-y-3">
              {["brightness", "contrast", "saturation", "blur"].map(
                (effect) => (
                  <div key={effect}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {effect}
                    </label>
                    <input
                      type="range"
                      min={effect === "blur" ? 0 : 0}
                      max={effect === "blur" ? 10 : 200}
                      value={
                        selectedMedia.effects?.[
                          effect as keyof typeof selectedMedia.effects
                        ] || 100
                      }
                      onChange={(e) =>
                        onUpdateEffects(selectedMedia.id, {
                          [effect]: Number(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{effect === "blur" ? "0px" : "0%"}</span>
                      <span>
                        {selectedMedia.effects?.[
                          effect as keyof typeof selectedMedia.effects
                        ] || 100}
                        {effect === "blur" ? "px" : "%"}
                      </span>
                      <span>{effect === "blur" ? "10px" : "200%"}</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Video Effects Info */}
        {selectedMedia.type === "video" && (
          <div>
            <h3 className="text-lg font-medium mb-3">Video Effects</h3>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                Visual effects are not available for videos. Videos will play
                with their original quality and appearance.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
