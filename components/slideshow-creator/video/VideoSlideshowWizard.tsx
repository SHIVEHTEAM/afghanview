import React, { useState, useEffect } from "react";
import { SlideMedia, SlideshowSettings } from "../shared/types";
import { DEFAULT_SETTINGS } from "../shared/constants";
import SettingsPanel from "../shared/SettingsPanel";
import WizardStepper from "../shared/WizardStepper";
import VideoUploadStep from "./VideoUploadStep";
import VideoCustomizeStep from "./VideoCustomizeStep";
import VideoPreviewStep from "./VideoPreviewStep";

interface VideoFile {
  id: string;
  file: File;
  name: string;
  size: number;
  thumbnail?: string;
  duration?: number;
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

    setIsUploading(true);
    const newVideos: VideoFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("video/")) {
        alert(`${file.name} is not a video file`);
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 50MB`);
        continue;
      }

      const videoFile: VideoFile = {
        id: Date.now().toString() + i,
        file,
        name: file.name,
        size: file.size,
      };

      try {
        const [thumbnail, duration] = await Promise.all([
          generateVideoThumbnail(file),
          getVideoDuration(file),
        ]);
        videoFile.thumbnail = thumbnail;
        videoFile.duration = duration;
      } catch (error) {
        console.error("Error processing video:", error);
      }

      newVideos.push(videoFile);
    }

    setVideos([...videos, ...newVideos]);
    setIsUploading(false);
    event.target.value = "";
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
      // Upload all video files to Supabase storage first
      const videoSlides = await Promise.all(
        videos.map(async (video, index) => {
          // Convert video file to base64 for upload
          const videoBase64 = await fileToBase64(video.file);

          // Upload to Supabase storage
          const uploadResponse = await fetch("/api/media/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              file: {
                name: video.name,
                type: video.file.type,
                data: videoBase64,
              },
              type: "video",
              restaurantId: "e46a2c25-fe10-4fd2-a2bd-4c72969a898e", // Use the test restaurant ID
              userId: "default-user",
            }),
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Failed to upload ${video.name}: ${errorText}`);
          }

          const uploadResult = await uploadResponse.json();

          return {
            id: uploadResult.id,
            file_path: uploadResult.url, // Use the public URL
            name: video.name,
            type: "video",
            order_index: index,
            duration: video.duration || 5000,
            styling: {
              animation: settings.transition,
            },
            url: uploadResult.url, // Store the URL for playback
          };
        })
      );

      const slideshowData = {
        slides: videoSlides,
        type: "video",
        name: slideshowName,
        settings,
      };

      updateFormData(slideshowData);
      onComplete(slideshowData);
    } catch (error) {
      console.error("Error creating video slideshow:", error);
      alert(`Error creating slideshow: ${(error as any).message || error}`);
    } finally {
      setIsCreating(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
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
            onNext={handleNext}
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
            onBackgroundMusicUpload={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setSettings({
                  ...settings,
                  backgroundMusic: file,
                });
              }
            }}
            onNext={handleNext}
            onBack={handleBack}
            formatDuration={formatDuration}
          />
        );
      case 2:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SettingsPanel
              settings={settings}
              onSettingsChange={setSettings}
              slideshowName={slideshowName}
              onSlideshowNameChange={setSlideshowName}
            />
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Quick Preview</h4>
              <div className="aspect-video bg-white rounded border">
                {videos.length > 0 ? (
                  <video
                    src={URL.createObjectURL(videos[0].file)}
                    className="w-full h-full object-cover rounded"
                    muted
                    loop
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No videos uploaded
                  </div>
                )}
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
            onBack={handleBack}
            onCreate={handleCreate}
            formatDuration={formatDuration}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">{renderStepContent()}</div>

      {currentStep !== 0 && currentStep !== 1 && currentStep !== 3 && (
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
      )}
    </div>
  );
}

export { steps };
