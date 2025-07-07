import React, { useState } from "react";
import { ArrowRight, ArrowLeft, Video, Music } from "lucide-react";
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
  setTransition: (
    transition: "fade" | "slide" | "zoom" | "flip" | "bounce"
  ) => void;
  backgroundMusic: File | null;
  onBackgroundMusicUpload: (url: string) => void;
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
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const handleBackgroundMusicUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("Selected file:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    });

    setIsUploadingMusic(true);
    setUploadProgress(0);
    setUploadStatus("Validating file...");

    // More flexible file type validation
    const isAudioFile =
      file.type.startsWith("audio/") ||
      file.name.toLowerCase().match(/\.(mp3|mp4|wav|ogg|aac|webm|m4a)$/);

    if (!isAudioFile) {
      setUploadStatus("Error: Invalid file type");
      setTimeout(() => setUploadStatus(""), 3000);
      alert(
        "Please select a valid audio file (MP3, MP4, WAV, OGG, AAC, WebM, M4A)"
      );
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setUploadStatus("Error: File too large");
      setTimeout(() => setUploadStatus(""), 3000);
      alert("Audio file size must be less than 20MB");
      return;
    }

    // Check for problematic MIME types and provide guidance
    const problematicTypes = [
      "audio/mpeg", // MP3
      "audio/mp3",
      "audio/x-mpeg",
      "audio/x-mpeg-3",
    ];

    if (problematicTypes.includes(file.type)) {
      setUploadStatus("Error: MP3 not supported");
      setTimeout(() => setUploadStatus(""), 3000);
      alert(
        "MP3 files are not supported. Please convert your audio to WAV, OGG, or AAC format for better compatibility."
      );
      return;
    }

    setUploadProgress(25);
    setUploadStatus("Preparing upload...");

    console.log("Uploading file to Supabase:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    // Upload to Supabase Storage with explicit content type
    const fileName = `audio/${Date.now()}-${file.name}`;

    // Use a more compatible content type if needed
    let contentType = file.type;
    if (file.type === "audio/mpeg" || file.type === "audio/mp3") {
      contentType = "audio/mpeg"; // Try with explicit type
    }

    setUploadProgress(50);
    setUploadStatus("Uploading to server...");

    const { data, error: uploadError } = await supabase.storage
      .from("slideshow-media")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: contentType,
      });

    if (uploadError) {
      console.error("Upload error details:", uploadError);
      setUploadProgress(0);

      // Provide specific guidance for MIME type errors
      if (
        uploadError.message.includes("mime type") ||
        uploadError.message.includes("not supported")
      ) {
        setUploadStatus("Error: Format not supported");
        setTimeout(() => setUploadStatus(""), 3000);
        alert(
          "This audio format is not supported. Please try converting your audio to WAV, OGG, or AAC format. You can use online converters or audio editing software."
        );
      } else {
        setUploadStatus(`Error: ${uploadError.message}`);
        setTimeout(() => setUploadStatus(""), 3000);
        alert(`Failed to upload audio: ${uploadError.message}`);
      }
      return;
    }

    setUploadProgress(75);
    setUploadStatus("Getting public URL...");

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("slideshow-media")
      .getPublicUrl(fileName);

    let audioUrl = urlData?.publicUrl || "";

    console.log("Upload successful, audio URL:", audioUrl);

    setUploadProgress(100);
    setUploadStatus("Upload successful! ✓");

    // Call the parent handler with the public URL
    onBackgroundMusicUpload(audioUrl);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setUploadStatus("");
      setUploadProgress(0);
    }, 3000);
  };

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
            id="music-upload"
            accept="audio/*,.mp3,.mp4,.wav,.ogg,.aac,.webm,.m4a"
            onChange={handleBackgroundMusicUpload}
            className="hidden"
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

          {/* Upload Progress Indicator */}
          {isUploadingMusic && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  {uploadStatus || "Uploading..."}
                </span>
                <span className="text-sm text-blue-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Audio Format Note */}
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Supported audio formats:</strong> WAV, OGG, AAC, WebM,
              MP4. MP3 files are not supported due to storage limitations.
            </p>
          </div>
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
