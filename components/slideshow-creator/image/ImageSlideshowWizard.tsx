import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { SlideMedia, SlideshowSettings } from "../shared/types";
import { DEFAULT_SETTINGS } from "../shared/constants";
import SettingsPanel from "../shared/SettingsPanel";
import WizardStepper from "../shared/WizardStepper";
import ImageUploadStep from "./ImageUploadStep";
import ImageArrangeStep from "./ImageArrangeStep";
import ImagePreviewStep from "./ImagePreviewStep";

interface ImageSlideshowWizardProps {
  step?: number;
  formData: any;
  updateFormData: (data: any) => void;
  onComplete: (data: any) => void;
  isEditing?: boolean;
  initialData?: any;
}

const steps = [
  { id: "upload", label: "Upload Images", description: "Add your photos" },
  {
    id: "arrange",
    label: "Arrange Images",
    description: "Reorder your slides",
  },
  { id: "settings", label: "Settings", description: "Configure slideshow" },
  {
    id: "preview",
    label: "Preview & Create",
    description: "Review and finish",
  },
];

export default function ImageSlideshowWizard({
  step,
  formData,
  updateFormData,
  onComplete,
  isEditing = false,
  initialData,
}: ImageSlideshowWizardProps) {
  const [currentStep, setCurrentStep] = useState(step ?? 0);
  const [images, setImages] = useState<SlideMedia[]>(
    Array.isArray(formData.images)
      ? formData.images
      : Array.isArray(initialData?.images)
      ? initialData.images
      : []
  );
  const [slideshowName, setSlideshowName] = useState(
    formData.name || initialData?.name || "My Image Slideshow"
  );
  const [settings, setSettings] = useState<SlideshowSettings>(
    formData.settings || initialData?.settings || DEFAULT_SETTINGS
  );
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    updateFormData({ images, name: slideshowName, settings });
  }, [images, slideshowName, settings, updateFormData]);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      // Upload all images to Supabase Storage
      const uploadedImages = [];
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (image.url && image.url.startsWith("http")) {
          uploadedImages.push({ ...image, url: image.url });
          continue;
        }
        const file = image.file;
        if (!file) continue;

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `slideshows/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("slideshow-media")
          .upload(filePath, file, {
            contentType: file.type,
            cacheControl: "3600",
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          alert(
            `Failed to upload ${file.name}: ${
              uploadError.message || uploadError
            }`
          );
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("slideshow-media").getPublicUrl(filePath);

        uploadedImages.push({
          id: image.id,
          url: publicUrl,
          name: image.name,
          type: "image",
          order_index: i,
        });
      }

      // Prepare original data for storage
      const originalData = {
        images: await Promise.all(
          images.map(async (img, index) => ({
            id: img.id,
            file: img.file ? await fileToBase64(img.file) : img.url,
            name: img.name,
            url: img.url,
          }))
        ),
      };

      const slideshowData = {
        slides: uploadedImages,
        type: "image",
        name: slideshowName,
        settings,
        originalData,
      };

      updateFormData(slideshowData);
      onComplete(slideshowData);
    } catch (error) {
      console.error("Error uploading images:", error);
      alert(`Error uploading images: ${(error as any).message || error}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Helper function to convert File to base64
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
        return images.length > 0 && slideshowName.trim() !== "";
      case 1:
        return images.length > 0;
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
          <ImageUploadStep
            images={images}
            onImagesChange={setImages}
            slideshowName={slideshowName}
            onSlideshowNameChange={setSlideshowName}
          />
        );
      case 1:
        return <ImageArrangeStep images={images} onImagesChange={setImages} />;
      case 2:
        return (
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
              <h4 className="font-medium text-gray-800 mb-3">Quick Preview</h4>
              <div className="aspect-video bg-white rounded border">
                {images.length > 0 ? (
                  <img
                    src={images[0].url}
                    alt="Preview"
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No images uploaded
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <ImagePreviewStep
            images={images}
            slideshowName={slideshowName}
            settings={settings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
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
