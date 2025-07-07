import React from "react";
import { Eye, Image as ImageIcon } from "lucide-react";
import { SlideMedia, SlideshowSettings } from "../shared/types";

interface ImagePreviewStepProps {
  images: SlideMedia[];
  slideshowName: string;
  settings: SlideshowSettings;
}

export default function ImagePreviewStep({
  images,
  slideshowName,
  settings,
}: ImagePreviewStepProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Eye className="w-5 h-5" />
        Preview
      </h3>

      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
        {images.length > 0 ? (
          <img
            src={images[0].url}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <ImageIcon className="w-16 h-16" />
          </div>
        )}
      </div>

      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          {images.length} image{images.length !== 1 ? "s" : ""} •{" "}
          {Math.round((images.length * settings.duration) / 1000)}s total
        </p>
      </div>

      <div className="text-left text-gray-700 text-sm space-y-1">
        <div>
          <b>Name:</b> {slideshowName}
        </div>
        <div>
          <b>Transition:</b> {settings.transition}
        </div>
        <div>
          <b>Duration:</b> {settings.duration / 1000}s per slide
        </div>
        <div>
          <b>Auto Play:</b> {settings.autoPlay ? "Yes" : "No"}
        </div>
        <div>
          <b>Loop:</b> {settings.loopSlideshow ? "Yes" : "No"}
        </div>
        <div>
          <b>Show Controls:</b> {settings.showControls ? "Yes" : "No"}
        </div>
        {settings.backgroundMusic && (
          <div>
            <b>Background Music:</b> Yes
          </div>
        )}
      </div>
    </div>
  );
}
