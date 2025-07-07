import React, { useState } from "react";
import {
  Settings,
  Music,
  Volume2,
  Clock,
  Palette,
  Play,
  Pause,
} from "lucide-react";
import { SlideshowSettings } from "./types";
import { TRANSITIONS, ASPECT_RATIOS, QUALITY_OPTIONS } from "./constants";
import { supabase } from "../../../lib/supabase";

interface SettingsPanelProps {
  settings: SlideshowSettings;
  onSettingsChange: (settings: SlideshowSettings) => void;
  slideshowName: string;
  onSlideshowNameChange: (name: string) => void;
}

// Free open-source background music options
const BACKGROUND_MUSIC_OPTIONS = [
  {
    id: "none",
    name: "No Music",
    artist: "",
    url: "",
    duration: "0:00",
  },
  {
    id: "ambient-1",
    name: "Peaceful Ambience",
    artist: "Free Music Archive",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    duration: "3:45",
  },
  {
    id: "upbeat-1",
    name: "Upbeat Energy",
    artist: "Free Music Archive",
    url: "https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav",
    duration: "2:30",
  },
  {
    id: "cultural-1",
    name: "Cultural Melody",
    artist: "Free Music Archive",
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-04.wav",
    duration: "4:15",
  },
  {
    id: "custom",
    name: "Upload Custom Music",
    artist: "Your File",
    url: "",
    duration: "Custom",
  },
];

export default function SettingsPanel({
  settings,
  onSettingsChange,
  slideshowName,
  onSlideshowNameChange,
}: SettingsPanelProps) {
  const [selectedMusic, setSelectedMusic] = useState(
    settings.backgroundMusic || "none"
  );
  const [customMusicFile, setCustomMusicFile] = useState<File | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<string | null>(null);
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const handleMusicChange = async (musicId: string) => {
    setSelectedMusic(musicId);
    if (musicId === "custom") {
      // Handle custom music upload
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "audio/*,.mp3,.mp4,.wav,.ogg,.aac,.webm,.m4a";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          console.log("Selected file:", {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
          });

          setIsUploadingMusic(true);
          setUploadProgress(0);
          setUploadStatus("Validating file...");
          setCustomMusicFile(file);

          try {
            // More flexible file type validation
            const isAudioFile =
              file.type.startsWith("audio/") ||
              file.name
                .toLowerCase()
                .match(/\.(mp3|mp4|wav|ogg|aac|webm|m4a)$/);

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

            // Test Supabase connection first
            try {
              const { data: testData, error: testError } =
                await supabase.storage
                  .from("slideshow-media")
                  .list("audio", { limit: 1 });

              if (testError) {
                console.error("Supabase connection test failed:", testError);
                setUploadStatus("Error: Cannot connect to storage");
                setTimeout(() => setUploadStatus(""), 3000);
                alert(
                  "Cannot connect to storage server. Please check your internet connection and try again."
                );
                return;
              }

              console.log("Supabase connection test successful");
            } catch (testError) {
              console.error("Supabase connection test error:", testError);
              setUploadStatus("Error: Storage connection failed");
              setTimeout(() => setUploadStatus(""), 3000);
              alert("Storage connection failed. Please try again.");
              return;
            }

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

            console.log("Starting upload with params:", {
              fileName,
              contentType,
              fileSize: file.size,
            });

            // Add timeout protection for upload
            const uploadPromise = supabase.storage
              .from("slideshow-media")
              .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: contentType,
              });

            // Add timeout of 30 seconds
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(
                () => reject(new Error("Upload timeout - took too long")),
                30000
              );
            });

            const { data, error: uploadError } = (await Promise.race([
              uploadPromise,
              timeoutPromise,
            ])) as any;

            if (uploadError) {
              console.error("Upload error details:", uploadError);

              // Try fallback upload without content type if first attempt failed
              if (!uploadError.message.includes("timeout")) {
                console.log("Trying fallback upload without content type...");
                setUploadStatus("Retrying upload...");

                try {
                  const fallbackPromise = supabase.storage
                    .from("slideshow-media")
                    .upload(fileName, file, {
                      cacheControl: "3600",
                      upsert: false,
                    });

                  const fallbackTimeoutPromise = new Promise((_, reject) => {
                    setTimeout(
                      () => reject(new Error("Fallback upload timeout")),
                      30000
                    );
                  });

                  const { data: fallbackData, error: fallbackError } =
                    (await Promise.race([
                      fallbackPromise,
                      fallbackTimeoutPromise,
                    ])) as any;

                  if (fallbackError) {
                    console.error(
                      "Fallback upload also failed:",
                      fallbackError
                    );
                    setUploadProgress(0);

                    if (
                      fallbackError.message.includes("mime type") ||
                      fallbackError.message.includes("not supported")
                    ) {
                      setUploadStatus("Error: Format not supported");
                      setTimeout(() => setUploadStatus(""), 3000);
                      alert(
                        "This audio format is not supported. Please try converting your audio to WAV, OGG, or AAC format. You can use online converters or audio editing software."
                      );
                    } else {
                      setUploadStatus(`Error: ${fallbackError.message}`);
                      setTimeout(() => setUploadStatus(""), 3000);
                      alert(`Failed to upload audio: ${fallbackError.message}`);
                    }
                    return;
                  }

                  // Fallback upload succeeded
                  console.log("Fallback upload successful:", fallbackData);
                  setUploadProgress(75);
                  setUploadStatus("Getting public URL...");

                  // Get public URL
                  const { data: urlData } = supabase.storage
                    .from("slideshow-media")
                    .getPublicUrl(fileName);

                  let audioUrl = urlData?.publicUrl || "";

                  console.log(
                    "Fallback upload successful, audio URL:",
                    audioUrl
                  );

                  setUploadProgress(100);
                  setUploadStatus("Upload successful! ✓");

                  // Call the parent handler with the public URL
                  onSettingsChange({
                    ...settings,
                    backgroundMusic: audioUrl,
                  });

                  // Clear success message after 3 seconds
                  setTimeout(() => {
                    setUploadStatus("");
                    setUploadProgress(0);
                  }, 3000);

                  return;
                } catch (fallbackCatchError) {
                  console.error(
                    "Fallback upload catch error:",
                    fallbackCatchError
                  );
                }
              }

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
              } else if (uploadError.message.includes("timeout")) {
                setUploadStatus("Error: Upload timeout");
                setTimeout(() => setUploadStatus(""), 3000);
                alert(
                  "Upload took too long. Please try again with a smaller file or check your internet connection."
                );
              } else {
                setUploadStatus(`Error: ${uploadError.message}`);
                setTimeout(() => setUploadStatus(""), 3000);
                alert(`Failed to upload audio: ${uploadError.message}`);
              }
              return;
            }

            console.log("Upload completed successfully:", data);
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
            onSettingsChange({
              ...settings,
              backgroundMusic: audioUrl,
            });

            // Clear success message after 3 seconds
            setTimeout(() => {
              setUploadStatus("");
              setUploadProgress(0);
            }, 3000);
          } catch (error) {
            console.error("Music upload error:", error);
            setUploadProgress(0);
            setUploadStatus(
              `Error: ${
                error instanceof Error ? error.message : "Upload failed"
              }`
            );
            setTimeout(() => setUploadStatus(""), 3000);
            alert("Failed to upload music file. Please try again.");
          } finally {
            setIsUploadingMusic(false);
          }
        }
      };
      input.click();
    } else {
      const musicOption = BACKGROUND_MUSIC_OPTIONS.find(
        (m) => m.id === musicId
      );
      onSettingsChange({
        ...settings,
        backgroundMusic: musicOption?.url || "",
      });
    }
  };

  const playMusicPreview = (musicId: string) => {
    const musicOption = BACKGROUND_MUSIC_OPTIONS.find((m) => m.id === musicId);
    if (musicOption?.url) {
      setIsPlayingPreview(musicId);
      const audio = new Audio(musicOption.url);
      audio.play();
      audio.onended = () => setIsPlayingPreview(null);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Slideshow Settings
        </h3>
      </div>

      {/* Slideshow Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slideshow Name
        </label>
        <input
          type="text"
          value={slideshowName}
          onChange={(e) => onSlideshowNameChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter slideshow name..."
        />
      </div>

      {/* Slide Duration */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Slide Duration
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="2"
            max="10"
            step="0.5"
            value={settings.duration / 1000}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                duration: Number(e.target.value) * 1000,
              })
            }
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>2s</span>
            <span className="font-medium">{settings.duration / 1000}s</span>
            <span>10s</span>
          </div>
        </div>
      </div>

      {/* Transition Effect */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Transition Effect
        </label>
        <select
          value={settings.transition}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              transition: e.target.value as any,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {TRANSITIONS.map((transition) => (
            <option key={transition.id} value={transition.id}>
              {transition.name}
            </option>
          ))}
        </select>
      </div>

      {/* Background Music */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Music className="w-4 h-4" />
          Background Music
        </label>
        <div className="space-y-2">
          {BACKGROUND_MUSIC_OPTIONS.map((music) => (
            <div
              key={music.id}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedMusic === music.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleMusicChange(music.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Music className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">{music.name}</div>
                  {music.artist && (
                    <div className="text-sm text-gray-500">{music.artist}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {music.duration !== "Custom" && music.duration !== "0:00" && (
                  <span className="text-sm text-gray-500">
                    {music.duration}
                  </span>
                )}
                {music.url && music.id !== "none" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playMusicPreview(music.id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Preview"
                  >
                    {isPlayingPreview === music.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

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
            <strong>Supported audio formats:</strong> WAV, OGG, AAC, WebM, MP4.
            MP3 files are not supported due to storage limitations. You can
            convert MP3 files using online converters or audio editing software.
          </p>
        </div>
      </div>

      {/* Music Volume */}
      {selectedMusic !== "none" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Music Volume
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.musicVolume}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  musicVolume: Number(e.target.value),
                })
              }
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0%</span>
              <span className="font-medium">{settings.musicVolume}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      )}

      {/* Aspect Ratio */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aspect Ratio
        </label>
        <select
          value={settings.aspectRatio}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              aspectRatio: e.target.value as any,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {ASPECT_RATIOS.map((ratio) => (
            <option key={ratio.id} value={ratio.id}>
              {ratio.name}
            </option>
          ))}
        </select>
      </div>

      {/* Quality */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quality
        </label>
        <select
          value={settings.quality}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              quality: e.target.value as any,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {QUALITY_OPTIONS.map((quality) => (
            <option key={quality.id} value={quality.id}>
              {quality.name}
            </option>
          ))}
        </select>
      </div>

      {/* Playback Options */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-800">Playback Options</h4>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.autoPlay}
            onChange={(e) =>
              onSettingsChange({ ...settings, autoPlay: e.target.checked })
            }
            className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Auto Play</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.loopSlideshow}
            onChange={(e) =>
              onSettingsChange({ ...settings, loopSlideshow: e.target.checked })
            }
            className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Loop Slideshow</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.showControls}
            onChange={(e) =>
              onSettingsChange({ ...settings, showControls: e.target.checked })
            }
            className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Show Controls</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.showProgress}
            onChange={(e) =>
              onSettingsChange({ ...settings, showProgress: e.target.checked })
            }
            className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Show Progress Bar</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.shuffleSlides}
            onChange={(e) =>
              onSettingsChange({ ...settings, shuffleSlides: e.target.checked })
            }
            className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Shuffle Slides</span>
        </label>

        {selectedMusic !== "none" && (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.musicLoop}
              onChange={(e) =>
                onSettingsChange({ ...settings, musicLoop: e.target.checked })
              }
              className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Loop Music</span>
          </label>
        )}
      </div>
    </div>
  );
}
