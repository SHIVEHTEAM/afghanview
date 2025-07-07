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
  onBack: () => void;
  onCreate: () => void;
  formatDuration: (ms: number) => string;
}

export default function VideoPreviewStep({
  videos,
  slideshowName,
  transition,
  backgroundMusic,
  isCreating,
  onBack,
  onCreate,
  formatDuration,
}: VideoPreviewStepProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Ready to Create!</h3>
        <p className="text-gray-600">Review your video slideshow settings</p>
      </div>

      <div className="flex-1 space-y-6">
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
          onClick={onCreate}
          disabled={isCreating}
          className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium disabled:opacity-50"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Create Video Slideshow
            </>
          )}
        </button>
      </div>
    </div>
  );
}
