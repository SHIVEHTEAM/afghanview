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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const inputElement = event.target;
    setIsUploading(true);
    const newImages: SlideMedia[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) continue;

      const fileName = `images/${Date.now()}-${file.name}`;
      const { data, error: uploadError } = await supabase.storage.from("slideshow-media").upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (uploadError) continue;

      const { data: urlData } = supabase.storage.from("slideshow-media").getPublicUrl(fileName);
      let imageUrl = urlData?.publicUrl || "";

      newImages.push({ id: Date.now().toString() + i, file, name: file.name, type: "image", url: imageUrl });
    }

    onImagesChange([...images, ...newImages]);
    setIsUploading(false);
    if (inputElement) inputElement.value = "";
  };

  const removeImage = (id: string) => { onImagesChange(images.filter((img) => img.id !== id)); };

  return (
    <div className="space-y-10">
      <div className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
        <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-3">Module Name</label>
        <input
          type="text"
          value={slideshowName}
          onChange={(e) => onSlideshowNameChange(e.target.value)}
          className="w-full px-6 py-4 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white focus:border-black/20 transition-all font-medium"
          placeholder="Identity Reference..."
        />
      </div>

      <div
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file"; input.multiple = true; input.accept = "image/*";
          input.onchange = (e) => handleFileUpload(e as any);
          input.click();
        }}
        className={`border-2 border-dashed rounded-[2rem] p-16 text-center cursor-pointer transition-all ${isUploading ? "bg-gray-50 border-black/5 cursor-not-allowed" : "bg-white border-black/10 hover:bg-gray-50 hover:border-black/20"
          }`}
      >
        <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/10">
          <Upload className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-black mb-2">
          {isUploading ? "Syncing data..." : "Add Content Units"}
        </h3>
        <p className="text-sm text-black/40 mb-2">Drag and drop assets or click to browse</p>
        <p className="text-[10px] font-bold text-black/10 uppercase tracking-widest mt-6">Supported: JPG, PNG, GIF, WebP (Max 10MB)</p>
      </div>

      {images.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-black uppercase tracking-widest flex items-center gap-2">
              <Grid className="w-4 h-4 text-black/20" />
              Units Locked ({images.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
            {images.map((image) => (
              <div key={image.id} className="relative group aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-black/5">
                <img src={image.url} alt={image.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(image.id); }}
                    className="p-3 bg-white text-black rounded-xl hover:bg-red-50 hover:text-red-500 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
