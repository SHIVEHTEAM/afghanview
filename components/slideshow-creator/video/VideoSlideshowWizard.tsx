import React, { useState, useEffect } from "react";
import { SlideMedia, SlideshowSettings } from "../shared/types";
import { DEFAULT_SETTINGS } from "../shared/constants";
import SettingsPanel from "../shared/SettingsPanel";
import WizardStepper from "../shared/WizardStepper";
import VideoUploadStep from "./VideoUploadStep";
import VideoCustomizeStep from "./VideoCustomizeStep";
import VideoPreviewStep from "./VideoPreviewStep";
import { supabase } from "../../../lib/supabase";

interface VideoFile {
  id: string;
  file: File;
  name: string;
  size: number;
  thumbnail?: string;
  duration?: number;
  url: string;
}

interface VideoSlideshowWizardProps {
  step?: number;
  formData: any;
  updateFormData: (data: any) => void;
  onComplete: (data: any) => void;
  isEditing?: boolean;
  initialData?: any;
}

const steps = [
  { id: "upload", label: "Upload Videos", description: "Add your video files" },
  {
    id: "customize",
    label: "Customize",
    description: "Style and arrange videos",
  },
  { id: "settings", label: "Settings", description: "Configure slideshow" },
  {
    id: "preview",
    label: "Preview & Create",
    description: "Review and finish",
  },
];

export default function VideoSlideshowWizard({
  step,
  formData,
  updateFormData,
  onComplete,
  isEditing = false,
  initialData,
}: VideoSlideshowWizardProps) {
  const [currentStep, setCurrentStep] = useState(step ?? 0);
  const [videos, setVideos] = useState<VideoFile[]>(
    formData.videos || initialData?.videos || []
  );
  const [slideshowName, setSlideshowName] = useState(
    formData.name || initialData?.name || "Video Slideshow"
  );
  const [settings, setSettings] = useState<SlideshowSettings>(
    formData.settings || initialData?.settings || DEFAULT_SETTINGS
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    updateFormData({ videos, name: slideshowName, settings });
  }, [videos, slideshowName, settings, updateFormData]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    console.log('Starting video upload, files:', files.length);
    setIsUploading(true);
    const newVideos: VideoFile[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file ${i + 1}/${files.length}:`, file.name, file.type, file.size);

        if (!file.type.startsWith("video/")) {
          console.warn(`Skipping ${file.name} - not a video file`);
          alert(`${file.name} is not a video file`);
          continue;
        }

        if (file.size > 50 * 1024 * 1024) {
          console.warn(`Skipping ${file.name} - too large (${file.size} bytes)`);
          alert(`${file.name} is too large. Maximum size is 50MB`);
          continue;
        }

        try {
          // Sanitize filename for Supabase Storage
          // Remove special characters and replace spaces with underscores
          const sanitizedFileName = file.name
            .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
            .replace(/\s+/g, '_') // Replace spaces with underscore
            .replace(/_+/g, '_'); // Replace multiple underscores with single

          const fileName = `videos/${Date.now()}-${sanitizedFileName}`;
          console.log('Uploading to Supabase:', fileName);

          const { data, error: uploadError } = await supabase.storage
            .from("slideshow-media")
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            alert(`Failed to upload ${file.name}: ${uploadError.message}`);
            continue;
          }

          console.log('Upload successful, getting public URL...');

          // Get public URL
          const { data: urlData } = supabase.storage
            .from("slideshow-media")
            .getPublicUrl(fileName);

          let videoUrl = urlData?.publicUrl || "";
          console.log('Public URL:', videoUrl);

          const videoFile: VideoFile = {
            id: Date.now().toString() + i,
            file,
            name: file.name,
            size: file.size,
            url: videoUrl,
          };

          try {
            console.log('Generating thumbnail and getting duration...');
            const [thumbnail, duration] = await Promise.all([
              generateVideoThumbnail(file),
              getVideoDuration(file),
            ]);
            videoFile.thumbnail = thumbnail;
            videoFile.duration = duration;
            console.log('Video processing complete:', { duration, hasThumbnail: !!thumbnail });
          } catch (error) {
            console.error("Error processing video metadata:", error);
            // Continue anyway - thumbnail/duration are optional
          }

          newVideos.push(videoFile);
          console.log('Video added to list:', videoFile.name);
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          alert(`Error processing ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
        }
      }

      console.log('All files processed, adding to videos list:', newVideos.length);
      setVideos([...videos, ...newVideos]);
    } catch (error) {
      console.error('Fatal error during upload:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      event.target.value = "";
      console.log('Upload process complete');
    }
  };

  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      video.onloadedmetadata = () => {
        canvas.width = 320;
        canvas.height = 180;
        video.currentTime = 1;
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg"));
        } else {
          reject(new Error("Could not get canvas context"));
        }
      };

      video.onerror = () => reject(new Error("Error loading video"));
      video.src = URL.createObjectURL(file);
    });
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.onloadedmetadata = () => {
        resolve(video.duration * 1000);
      };
      video.onerror = () => reject(new Error("Error loading video"));
      video.src = URL.createObjectURL(file);
    });
  };

  const removeVideo = (id: string) => {
    setVideos(videos.filter((video) => video.id !== id));
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleCreate = async () => {
    if (videos.length === 0) {
      alert("Please upload at least one video");
      return;
    }

    setIsCreating(true);

    try {
      // Use already uploaded video URLs
      const videoSlides = videos.map((video, index) => ({
        id: video.id,
        file_path: video.url, // Use the public URL
        name: video.name,
        type: "video",
        order_index: index,
        duration: video.duration || 5000,
        styling: {
          animation: settings.transition,
        },
        url: video.url, // Store the URL for playback
      }));

      const slideshowData = {
        slides: videoSlides,
        type: "video",
        name: slideshowName,
        settings,
      };

      console.log("Video wizard creating slideshow data:", slideshowData);
      console.log("Video slides array:", videoSlides);

      updateFormData(slideshowData);
      onComplete(slideshowData);
    } catch (error) {
      console.error("Error creating video slideshow:", error);
      alert(`Error creating slideshow: ${(error as any).message || error}`);
    } finally {
      setIsCreating(false);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return videos.length > 0 && slideshowName.trim() !== "";
      case 1:
        return videos.length > 0;
      case 2:
        return true;
      default:
        return true;
    }
  };

  const canGoBack = currentStep > 0;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Only allow clicking on completed steps or current step
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  // Handler for background music upload (receives public URL)
  const handleBackgroundMusicUpload = (audioUrl: string) => {
    setSettings((prev) => ({
      ...prev,
      backgroundMusic: audioUrl,
    }));
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <VideoUploadStep
            videos={videos}
            isUploading={isUploading}
            onFileUpload={handleFileUpload}
            onRemoveVideo={removeVideo}
            formatDuration={formatDuration}
          />
        );
      case 1:
        return (
          <VideoCustomizeStep
            videos={videos}
            slideshowName={slideshowName}
            setSlideshowName={setSlideshowName}
            transition={settings.transition}
            setTransition={(
              transition: "fade" | "slide" | "zoom" | "flip" | "bounce"
            ) => setSettings({ ...settings, transition })}
            backgroundMusic={null}
            onBackgroundMusicUpload={handleBackgroundMusicUpload}
            formatDuration={formatDuration}
          />
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SettingsPanel
                settings={settings}
                onSettingsChange={(updates) =>
                  setSettings((prev) => ({ ...prev, ...updates }))
                }
                slideshowName={slideshowName}
                onSlideshowNameChange={setSlideshowName}
              />
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">
                  Quick Preview
                </h4>
                <div className="aspect-video bg-white rounded border">
                  {videos.length > 0 ? (
                    <video
                      src={videos[0].url || URL.createObjectURL(videos[0].file)}
                      className="w-full h-full object-cover rounded"
                      controls
                      muted
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No videos uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <VideoPreviewStep
            videos={videos}
            slideshowName={slideshowName}
            transition={settings.transition}
            backgroundMusic={
              settings.backgroundMusic instanceof File
                ? settings.backgroundMusic
                : null
            }
            isCreating={isCreating}
            onCreate={handleCreate}
            formatDuration={formatDuration}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col max-h-[calc(90vh-200px)]">
      <div className="flex-1 overflow-y-auto p-6 pb-0">
        {renderStepContent()}
      </div>

      <WizardStepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
        canGoNext={canGoNext()}
        canGoBack={canGoBack}
        onNext={handleNext}
        onBack={handleBack}
        onComplete={handleCreate}
        isCreating={isCreating}
        createButtonText={isEditing ? "Update Slideshow" : "Create Slideshow"}
      />
    </div>
  );
}

export { steps };
