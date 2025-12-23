import React from "react";
import { Video, CheckCircle, Music, Clock } from "lucide-react";

interface VideoFile {
  id: string;
  file: File;
  name: string;
  size: number;
  thumbnail?: string;
  duration?: number;
}

interface VideoPreviewStepProps {
  videos: VideoFile[];
  slideshowName: string;
  transition: string;
  backgroundMusic: File | null;
  isCreating: boolean;
  onCreate: () => void;
  formatDuration: (ms: number) => string;
}

export default function VideoPreviewStep({
  videos,
  slideshowName,
  transition,
  backgroundMusic,
  isCreating,
  onCreate,
  formatDuration,
}: VideoPreviewStepProps) {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="flex items-center gap-3 mb-10">
        <CheckCircle className="w-6 h-6 text-black" />
        <h3 className="text-xl font-bold text-black">Final Confirmation</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-black/5 p-8 rounded-[2rem] border border-black/5">
            <h4 className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] mb-6">Module Identity</h4>
            <p className="text-2xl font-bold text-black mb-1">{slideshowName}</p>
            <div className="flex items-center gap-3 mt-4 text-[10px] font-bold text-black/40 uppercase tracking-widest">
              <span>{videos.length} Cinematic Units</span>
              <div className="w-1 h-1 rounded-full bg-black/10"></div>
              <span>Status: Optimized</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] mb-6">Playback Parameters</h4>
            <div className="space-y-4">
              {[
                { label: "Transition Logic", value: transition, icon: Clock },
                { label: "Audio Sync", value: backgroundMusic ? backgroundMusic.name : "System Muted", icon: Music },
                { label: "Execution Pipeline", value: "Automatic Sequencer", icon: Video },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-black/5">
                    <item.icon className="w-4 h-4 text-black/20" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-black/20 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                    <p className="text-xs font-black text-black uppercase truncate max-w-[200px]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] px-2">Data Units Map</h4>
          <div className="grid grid-cols-2 gap-4">
            {videos.map((video, index) => (
              <div key={video.id} className="relative aspect-video rounded-xl bg-black overflow-hidden group shadow-lg">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-4 h-4 text-white/10" />
                  </div>
                )}
                <div className="absolute top-2 left-2 w-6 h-6 bg-white text-black text-[10px] font-black rounded flex items-center justify-center">
                  {index + 1}
                </div>
                {video.duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md text-[10px] font-black text-white rounded">
                    {formatDuration(video.duration)}
                  </div>
                )}
                <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
