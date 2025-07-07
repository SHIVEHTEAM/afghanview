import React from "react";
import { Upload, Trash2, Video, ArrowRight } from "lucide-react";

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
  onNext: () => void;
  formatDuration: (ms: number) => string;
}

export default function VideoUploadStep({
  videos,
  isUploading,
  onFileUpload,
  onRemoveVideo,
  onNext,
  formatDuration,
}: VideoUploadStepProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Upload Videos</h3>
        <p className="text-gray-600">
          Add video files to create your slideshow
        </p>
      </div>

      <div className="flex-1 space-y-4">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Drag and drop video files here, or click to browse
          </p>
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={onFileUpload}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer"
          >
            <Video className="w-4 h-4 mr-2" />
            Choose Videos
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: MP4, MOV, AVI, WebM (Max 50MB each)
          </p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Processing videos...</p>
            <p className="text-sm text-gray-500">
              This may take a moment for large files
            </p>
          </div>
        )}

        {/* Videos List */}
        {videos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Uploaded Videos ({videos.length})</h4>
              <div className="flex items-center text-purple-600 text-sm">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Ready
              </div>
            </div>
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.name}
                    className="w-16 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <Video className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium text-sm">{video.name}</div>
                  <div className="text-xs text-gray-500">
                    {(video.size / 1024 / 1024).toFixed(1)} MB
                    {video.duration && ` • ${formatDuration(video.duration)}`}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveVideo(video.id)}
                  className="text-pink-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          disabled={videos.length === 0}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}
