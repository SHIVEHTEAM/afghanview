import React, { useState } from "react";
import { Video, Music, Settings as SettingsIcon, CheckCircle } from "lucide-react";
import { supabase } from "../../../lib/supabase";

interface VideoFile {
  id: string;
  file: File;
  name: string;
  size: number;
  thumbnail?: string;
  duration?: number;
}

interface VideoCustomizeStepProps {
  videos: VideoFile[];
  slideshowName: string;
  setSlideshowName: (name: string) => void;
  transition: "fade" | "slide" | "zoom" | "flip" | "bounce";
  setTransition: (transition: "fade" | "slide" | "zoom" | "flip" | "bounce") => void;
  backgroundMusic: File | null;
  onBackgroundMusicUpload: (url: string) => void;
  formatDuration: (ms: number) => string;
}

export default function VideoCustomizeStep({
  videos,
  slideshowName,
  setSlideshowName,
  transition,
  setTransition,
  backgroundMusic,
  onBackgroundMusicUpload,
  formatDuration,
}: VideoCustomizeStepProps) {
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const handleBackgroundMusicUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingMusic(true);
    setUploadProgress(0);
    setUploadStatus("Validating...");

    const isAudioFile = file.type.startsWith("audio/") || file.name.toLowerCase().match(/\.(mp3|mp4|wav|ogg|aac|webm|m4a)$/);
    if (!isAudioFile || file.size > 20 * 1024 * 1024) {
      setUploadStatus("Invalid File");
      setTimeout(() => setUploadStatus(""), 3000);
      alert("Invalid file type or size (>20MB)");
      setIsUploadingMusic(false);
      return;
    }

    const problematicTypes = ["audio/mpeg", "audio/mp3", "audio/x-mpeg", "audio/x-mpeg-3"];
    if (problematicTypes.includes(file.type)) {
      setUploadStatus("MP3 Not Supported");
      setTimeout(() => setUploadStatus(""), 3000);
      alert("Please use WAV, OGG, or AAC for better compatibility.");
      setIsUploadingMusic(false);
      return;
    }

    setUploadProgress(25);
    setUploadStatus("Preparing...");
    const fileName = `audio/${Date.now()}-${file.name}`;
    setUploadProgress(50);
    setUploadStatus("Uploading...");

    const { data, error: uploadError } = await supabase.storage.from("slideshow-media").upload(fileName, file, { cacheControl: "3600", upsert: false, contentType: file.type });
    if (uploadError) {
      setUploadStatus("Upload Failed");
      setTimeout(() => setUploadStatus(""), 3000);
      alert(uploadError.message);
      setIsUploadingMusic(false);
      return;
    }

    setUploadProgress(75);
    setUploadStatus("Finalizing...");
    const { data: urlData } = supabase.storage.from("slideshow-media").getPublicUrl(fileName);
    onBackgroundMusicUpload(urlData?.publicUrl || "");
    setUploadProgress(100);
    setUploadStatus("Ready ✓");
    setTimeout(() => { setUploadStatus(""); setUploadProgress(0); setIsUploadingMusic(false); }, 3000);
  };

  return (
    <div className="space-y-10">
      <div className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
        <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-3">Module Identity</label>
        <input
          type="text"
          value={slideshowName}
          onChange={(e) => setSlideshowName(e.target.value)}
          className="w-full px-6 py-4 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white focus:border-black/20 transition-all font-medium"
          placeholder="Identity Reference..."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
          <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-4">Transition Logic</label>
          <select
            value={transition}
            onChange={(e) => setTransition(e.target.value as any)}
            className="w-full px-6 py-4 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white transition-all font-medium"
          >
            {["fade", "slide", "zoom", "flip", "bounce"].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
          <label className="block text-xs font-bold text-black/40 uppercase tracking-widest mb-4">Audio Synchronization</label>
          <input type="file" id="music-upload" accept="audio/*,.mp3,.mp4,.wav,.ogg,.aac,.webm,.m4a" onChange={handleBackgroundMusicUpload} className="hidden" />
          <label htmlFor="music-upload" className="flex items-center gap-4 p-4 bg-gray-50 border border-black/5 rounded-xl hover:bg-black hover:text-white transition-all cursor-pointer group">
            <div className="w-10 h-10 bg-white group-hover:bg-white/20 rounded-lg flex items-center justify-center border border-black/5 shadow-sm transition-colors">
              <Music className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">{backgroundMusic ? backgroundMusic.name : "Select Audio Asset"}</span>
          </label>

          {isUploadingMusic && (
            <div className="mt-6 p-6 bg-black text-white rounded-2xl shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest">{uploadStatus}</span>
                <span className="text-[10px] font-black">{uploadProgress}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-500" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-2xl p-8 border border-black/5">
        <h4 className="text-[10px] font-black text-black/20 uppercase tracking-widest mb-6">Units in Manfest ({videos.length})</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {videos.map((v, i) => (
            <div key={v.id} className="relative aspect-video rounded-xl bg-black overflow-hidden group border border-white/5">
              {v.thumbnail ? <img src={v.thumbnail} alt={v.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Video className="w-5 h-5 text-white/10" /></div>}
              <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-white text-black text-[8px] font-black rounded flex items-center justify-center">{i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
