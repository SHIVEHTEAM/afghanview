import React from "react";
import { ArrowLeft, Check, Video } from "lucide-react";
import {
  ArrowLeft as ArrowLeftIcon,
  Play,
  Music,
  Settings,
} from "lucide-react";

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
    <div className="h-full flex flex-col min-h-0">
      <div className="text-center mb-6 flex-shrink-0">
        <h3 className="text-lg font-semibold mb-2">Ready to Create!</h3>
        <p className="text-gray-600">Review your video slideshow settings</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-6 min-h-0">
        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Slideshow Summary</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Name:</span> {slideshowName}
            </div>
            <div>
              <span className="font-medium">Videos:</span> {videos.length}
            </div>
            <div>
              <span className="font-medium">Duration:</span> Auto-detected from
              videos
            </div>
            <div>
              <span className="font-medium">Transition:</span> {transition}
            </div>
            {backgroundMusic && (
              <div>
                <span className="font-medium">Background Music:</span>{" "}
                {backgroundMusic.name}
              </div>
            )}
          </div>
        </div>

        {/* Video Grid */}
        <div>
          <h4 className="font-medium mb-3">Videos</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {videos.map((video, index) => (
              <div key={video.id} className="relative">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.name}
                    className="w-full h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-16 bg-gray-200 rounded flex items-center justify-center">
                    <Video className="w-4 h-4 text-gray-400" />
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
                <div className="text-xs text-gray-600 mt-1 truncate">
                  {video.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
