import React from "react";
import { ArrowRight, ArrowLeft, Video, Music } from "lucide-react";

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
  setTransition: (
    transition: "fade" | "slide" | "zoom" | "flip" | "bounce"
  ) => void;
  backgroundMusic: File | null;
  onBackgroundMusicUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onBack: () => void;
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
  onNext,
  onBack,
  formatDuration,
}: VideoCustomizeStepProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Customize Your Slideshow</h3>
        <p className="text-gray-600">Set up your video slideshow settings</p>
      </div>

      <div className="flex-1 space-y-6">
        {/* Slideshow Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slideshow Name
          </label>
          <input
            type="text"
            value={slideshowName}
            onChange={(e) => setSlideshowName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter slideshow name"
          />
        </div>

        {/* Transition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transition Effect
          </label>
          <select
            value={transition}
            onChange={(e) =>
              setTransition(
                e.target.value as "fade" | "slide" | "zoom" | "flip" | "bounce"
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="fade">Fade</option>
            <option value="slide">Slide</option>
            <option value="zoom">Zoom</option>
            <option value="flip">Flip</option>
            <option value="bounce">Bounce</option>
          </select>
        </div>

        {/* Background Music */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Music (Optional)
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={onBackgroundMusicUpload}
            className="hidden"
            id="music-upload"
          />
          <label
            htmlFor="music-upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <Music className="w-4 h-4 mr-2" />
            {backgroundMusic ? backgroundMusic.name : "Choose Audio File"}
          </label>
          {backgroundMusic && (
            <p className="text-sm text-gray-500 mt-1">
              Selected: {backgroundMusic.name}
            </p>
          )}
        </div>

        {/* Video Preview */}
        <div>
          <h4 className="font-medium mb-3">Videos ({videos.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {videos.map((video, index) => (
              <div key={video.id} className="relative">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.name}
                    className="w-full h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center">
                    <Video className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                  {index + 1}
                </div>
                {video.duration && (
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}
