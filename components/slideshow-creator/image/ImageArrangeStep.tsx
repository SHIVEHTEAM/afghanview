import React from "react";
import { Grid, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { SlideMedia } from "../shared/types";

interface ImageArrangeStepProps {
  images: SlideMedia[];
  onImagesChange: (images: SlideMedia[]) => void;
}

export default function ImageArrangeStep({
  images,
  onImagesChange,
}: ImageArrangeStepProps) {
  const removeImage = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
  };

  const moveImage = (from: number, to: number) => {
    const arr = [...images];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    onImagesChange(arr);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Grid className="w-5 h-5" />
        Arrange Images
      </h3>

      {images.length === 0 ? (
        <div className="text-gray-500">
          No images to arrange. Go back and upload images.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group bg-gray-50 rounded-lg p-2 flex flex-col items-center"
            >
              <img
                src={image.url}
                alt={image.name}
                className="w-24 h-24 object-cover rounded-md border border-gray-200 mb-2"
              />
              <div className="text-xs text-gray-700 truncate w-full text-center">
                {image.name}
              </div>

              <div className="absolute top-1 right-1 flex gap-1">
                <button
                  onClick={() => moveImage(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    moveImage(index, Math.min(images.length - 1, index + 1))
                  }
                  disabled={index === images.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeImage(image.id)}
                  className="p-1 text-pink-500 hover:text-red-700"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
