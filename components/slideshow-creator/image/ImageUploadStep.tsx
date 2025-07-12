import React, { useState } from "react";
import { Upload, Grid, Trash2 } from "lucide-react";
import { SlideMedia } from "../shared/types";
import { supabase } from "../../../lib/supabase";

interface ImageUploadStepProps {
  images: SlideMedia[];
  onImagesChange: (images: SlideMedia[]) => void;
  slideshowName: string;
  onSlideshowNameChange: (name: string) => void;
}

export default function ImageUploadStep({
  images,
  onImagesChange,
  slideshowName,
  onSlideshowNameChange,
}: ImageUploadStepProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    // Store reference to the input element before async operations
    const inputElement = event.target;

    setIsUploading(true);
    const newImages: SlideMedia[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) continue;

      // Upload to Supabase Storage
      const fileName = `images/${Date.now()}-${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from("slideshow-media")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("slideshow-media")
        .getPublicUrl(fileName);

      let imageUrl = urlData?.publicUrl || "";

      newImages.push({
        id: Date.now().toString() + i,
        file,
        name: file.name,
        type: "image",
        url: imageUrl,
      });
    }

    onImagesChange([...images, ...newImages]);
    setIsUploading(false);

    // Clear the input value safely
    if (inputElement) {
      inputElement.value = "";
    }
  };

  const removeImage = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
  };

  return (
    <div>
      {/* Slideshow Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slideshow Name
        </label>
        <input
          type="text"
          value={slideshowName}
          onChange={(e) => onSlideshowNameChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter slideshow name..."
        />
      </div>

      {/* Upload Area */}
      <div
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.accept = "image/*";
          input.onchange = (e) => handleFileUpload(e as any);
          input.click();
        }}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isUploading
            ? "border-gray-300 bg-gray-50 cursor-not-allowed"
            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
        }`}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isUploading ? "Uploading images..." : "Click to upload images"}
        </p>
        <p className="text-gray-500 mb-4">
          {isUploading ? "Please wait..." : "or drag & drop images here"}
        </p>
        <div className="text-sm text-gray-400">
          Supported formats: JPG, PNG, GIF, WebP (max 10MB each)
        </div>
      </div>

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Grid className="w-5 h-5" />
            Uploaded Images ({images.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image) => (
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
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1 right-1 p-1 text-pink-500 hover:text-red-700 bg-white rounded-full shadow"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
