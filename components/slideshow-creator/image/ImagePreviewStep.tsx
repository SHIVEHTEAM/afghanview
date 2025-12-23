import React from "react";
import { Eye, Image as ImageIcon, CheckCircle } from "lucide-react";
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
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center gap-3 mb-10">
        <Eye className="w-5 h-5 text-black/20" />
        <h3 className="text-xl font-bold text-black">Final Review</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl relative">
            {images.length > 0 ? (
              <img
                src={images[0].url}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageIcon className="w-12 h-12 text-white/10" />
              </div>
            )}
            <div className="absolute bottom-6 left-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-black text-white uppercase tracking-widest">
              Live Preview Instance
            </div>
          </div>

          <div className="p-8 bg-gray-50 rounded-2xl border border-black/5">
            <div className="flex items-center gap-4 text-black mb-4">
              <CheckCircle className="w-5 h-5 text-black" />
              <span className="text-sm font-bold uppercase tracking-widest">System Check Passed</span>
            </div>
            <p className="text-xs text-black/40 leading-relaxed uppercase tracking-wide">
              All {images.length} units have been validated and are ready for deployment to the TV network.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm">
            <h4 className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] mb-6">Module Identity</h4>
            <p className="text-2xl font-bold text-black mb-2">{slideshowName}</p>
            <p className="text-xs text-black/40 uppercase tracking-widest">
              {images.length} Units • {Math.round((images.length * settings.duration) / 1000)}s Total Cycle
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] mb-6">Execution Logic</h4>
            <div className="grid grid-cols-2 gap-y-4">
              {[
                { label: "Transition", value: settings.transition },
                { label: "Interval", value: `${settings.duration / 1000}s` },
                { label: "Auto Play", value: settings.autoPlay ? "Active" : "Disabled" },
                { label: "Looping", value: settings.loopSlideshow ? "Active" : "Disabled" },
                { label: "Controls", value: settings.showControls ? "Visible" : "Hidden" },
                { label: "Audio", value: settings.backgroundMusic ? "Linked" : "Muted" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[8px] font-bold text-black/20 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-xs font-black text-black uppercase">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
