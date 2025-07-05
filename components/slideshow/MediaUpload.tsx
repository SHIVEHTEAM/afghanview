import React from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader } from "lucide-react";

interface MediaUploadProps {
  onDrop: (files: File[]) => void;
  uploading: boolean;
  isDragActive: boolean;
}

export default function MediaUpload({
  onDrop,
  uploading,
  isDragActive,
}: MediaUploadProps) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".mov", ".avi", ".quicktime"],
    },
    multiple: true,
    disabled: uploading,
    maxSize: 50 * 1024 * 1024, // 50MB max file size
  });

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-4">Upload Media</h2>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          uploading
            ? "border-gray-300 bg-gray-50 cursor-not-allowed"
            : isDragActive
            ? "border-green-500 bg-green-50 scale-105"
            : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Loader className="w-16 h-16 text-green-500 mx-auto mb-4 animate-spin" />
        ) : (
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        )}
        <p className="text-lg font-medium text-gray-700 mb-2">
          {uploading
            ? "Uploading files..."
            : isDragActive
            ? "Drop files here!"
            : "Drag & drop images & videos here"}
        </p>
        <p className="text-gray-500 mb-4">
          {uploading ? "Please wait..." : "or click to browse files"}
        </p>
        <div className="flex justify-center gap-2 text-sm text-gray-400">
          <span>Images: JPG, PNG, GIF, WebP</span>
          <span>•</span>
          <span>Videos: MP4, WebM (max 10s)</span>
        </div>
        <div className="text-xs text-gray-400 mt-2">Max file size: 50MB</div>
      </div>
    </div>
  );
}
