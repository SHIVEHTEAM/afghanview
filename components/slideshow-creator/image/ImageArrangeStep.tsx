import React from "react";
import { Grid, ChevronLeft, ChevronRight, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { SlideMedia } from "../shared/types";
import { motion } from "framer-motion";

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
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold text-black flex items-center gap-3">
          <Grid className="w-5 h-5 text-black/20" />
          Sequence Arrangement
        </h3>
        <span className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em]">{images.length} Units Active</span>
      </div>

      {images.length === 0 ? (
        <div className="p-20 bg-gray-50 rounded-[2rem] border border-dashed border-black/5 text-center">
          <p className="text-sm font-medium text-black/40">No units detected in memory. Please revert and upload.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {images.map((image, index) => (
            <motion.div
              layout
              key={image.id}
              className="relative group bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
            >
              <div className="aspect-square relative">
                <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 w-6 h-6 bg-black text-white text-[10px] font-black rounded-lg flex items-center justify-center shadow-lg">
                  {index + 1}
                </div>
              </div>

              <div className="p-4 bg-white flex items-center justify-between">
                <p className="text-[10px] font-black text-black uppercase tracking-tight truncate flex-1 mr-4">{image.name}</p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveImage(index, index - 1)}
                    disabled={index === 0}
                    className="p-1.5 text-black/20 hover:text-black disabled:opacity-0 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveImage(index, index + 1)}
                    disabled={index === images.length - 1}
                    className="p-1.5 text-black/20 hover:text-black disabled:opacity-0 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeImage(image.id)}
                    className="p-1.5 text-black/10 hover:text-red-500 transition-colors ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
