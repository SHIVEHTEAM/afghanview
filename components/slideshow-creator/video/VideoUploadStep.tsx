import React from "react";
import { Upload, Trash2, Video, CheckCircle } from "lucide-react";

interface VideoFile {
  id: string;
  file: File;
  name: string;
  size: number;
  thumbnail?: string;
  duration?: number;
}

interface VideoUploadStepProps {
  videos: VideoFile[];
  isUploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveVideo: (id: string) => void;
  formatDuration: (ms: number) => string;
}

export default function VideoUploadStep({
  videos,
  isUploading,
  onFileUpload,
  onRemoveVideo,
  formatDuration,
}: VideoUploadStepProps) {
  return (
    <div className="space-y-10">
      <div
        className={`border-2 border-dashed rounded-[2rem] p-16 text-center transition-all ${isUploading ? "bg-gray-50 border-black/5" : "bg-white border-black/10 hover:bg-gray-50 hover:border-black/20"
          }`}
      >
        <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/10">
          <Upload className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-black mb-2">
          {isUploading ? "Syncing cinematic data..." : "Add Video Assets"}
        </h3>
        <p className="text-sm text-black/40 mb-8">Drag and drop MP4/MOV files or click to browse</p>

        <input
          type="file"
          multiple
          accept="video/*"
          onChange={onFileUpload}
          className="hidden"
          id="video-upload"
          disabled={isUploading}
        />

        <button
          onClick={() => {
            const input = document.getElementById("video-upload") as HTMLInputElement;
            if (input) input.click();
          }}
          disabled={isUploading}
          className="inline-flex items-center px-10 py-4 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black/90 transition-all shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Video className="w-4 h-4 mr-3" />
          Initialize Upload
        </button>
        <p className="text-[10px] font-bold text-black/10 uppercase tracking-widest mt-8">Supported: MP4, MOV, WebM (Max 50MB)</p>
      </div>

      {isUploading && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-12 h-12 border-2 border-black/5 border-t-black rounded-full animate-spin"></div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-black/40">Encrypting & Storing Data Units...</p>
        </div>
      )}

      {videos.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-black uppercase tracking-widest flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-black" />
              Manifest Locked ({videos.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="flex items-center gap-6 p-6 bg-gray-50/50 rounded-2xl border border-black/5 group relative overflow-hidden">
                <div className="w-24 h-16 bg-black rounded-xl overflow-hidden shadow-lg flex-shrink-0 border border-white/10">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-6 h-6 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-black truncate uppercase tracking-tight">{video.name}</h4>
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-black/20 uppercase tracking-widest">
                    <span>{(video.size / 1024 / 1024).toFixed(1)} MB</span>
                    {video.duration && (
                      <>
                        <div className="w-1 h-1 rounded-full bg-black/10"></div>
                        <span>{formatDuration(video.duration)}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveVideo(video.id); }}
                  className="p-3 bg-white text-black border border-black/5 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
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
