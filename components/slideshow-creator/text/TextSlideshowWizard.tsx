import React, { useState, useEffect } from "react";
import { Plus, Trash2, Type } from "lucide-react";
import { SlideshowSettings } from "../shared/types";
import { DEFAULT_SETTINGS } from "../shared/constants";
import SettingsPanel from "../shared/SettingsPanel";
import WizardStepper from "../shared/WizardStepper";

interface TextSlideshowWizardProps {
  step?: number;
  formData?: any;
  updateFormData?: (data: any) => void;
  onComplete?: (data: any) => void;
  isEditing?: boolean;
  initialData?: any;
}

const steps = [
  {
    id: "create",
    label: "Create Text Slides",
    description: "Add your announcements",
  },
  {
    id: "settings",
    label: "Settings",
    description: "Configure slideshow and music",
  },
  {
    id: "preview",
    label: "Preview & Create",
    description: "Review and finish",
  },
];

interface TextSlide {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
}

export default function TextSlideshowWizard({
  step = 0,
  formData = {},
  updateFormData = () => {},
  onComplete = () => {},
  isEditing = false,
  initialData,
}: TextSlideshowWizardProps) {
  const [textSlides, setTextSlides] = useState<TextSlide[]>(
    Array.isArray(formData.textSlides)
      ? formData.textSlides
      : Array.isArray(initialData?.textSlides)
      ? initialData.textSlides
      : []
  );
  const [currentStep, setCurrentStep] = useState(step);
  const [slideshowName, setSlideshowName] = useState(
    formData.name || initialData?.name || "Text Slideshow"
  );
  const [settings, setSettings] = useState<SlideshowSettings>(
    formData.settings || initialData?.settings || DEFAULT_SETTINGS
  );
  const [isCreating, setIsCreating] = useState(false);
  const [newSlide, setNewSlide] = useState({
    title: "",
    subtitle: "",
    backgroundColor: "#2d3748",
    textColor: "#ffffff",
  });

  useEffect(() => {
    updateFormData({ textSlides, name: slideshowName, settings });
  }, [textSlides, slideshowName, settings, updateFormData]);

  const addTextSlide = () => {
    if (newSlide.title) {
      setTextSlides([
        ...textSlides,
        { ...newSlide, id: Date.now().toString() },
      ]);
      setNewSlide({
        title: "",
        subtitle: "",
        backgroundColor: "#2d3748",
        textColor: "#ffffff",
      });
    }
  };

  const removeTextSlide = (id: string) => {
    setTextSlides(textSlides.filter((slide) => slide.id !== id));
  };

  const handleCreate = async () => {
    if (textSlides.length === 0) {
      alert("Please add at least one text slide");
      return;
    }

    setIsCreating(true);

    try {
      const slides = textSlides.map((slide, index) => ({
        id: `text-${index}`,
        file_path: `data:image/svg+xml;base64,${btoa(`
          <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
            <rect width="100%" height="100%" fill="${slide.backgroundColor}"/>
            <text x="50%" y="40%" text-anchor="middle" dominant-baseline="middle" 
                  font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="${
                    slide.textColor
                  }">
              ${slide.title}
            </text>
            ${
              slide.subtitle
                ? `
            <text x="50%" y="60%" text-anchor="middle" dominant-baseline="middle" 
                  font-family="Arial, sans-serif" font-size="24" fill="${slide.textColor}" opacity="0.8">
              ${slide.subtitle}
            </text>
            `
                : ""
            }
          </svg>
        `)}`,
        name: slide.title,
        type: "image",
        order_index: index,
        duration: settings.duration,
        styling: {
          backgroundColor: slide.backgroundColor,
          textColor: slide.textColor,
          fontSize: 48,
          animation: settings.transition,
        },
      }));

      const slideshowData = {
        slides,
        type: "text",
        name: slideshowName,
        settings,
        textSlides,
      };

      updateFormData(slideshowData);
      onComplete(slideshowData);
    } catch (error) {
      console.error("Error creating text slideshow:", error);
      alert(`Error creating slideshow: ${(error as any).message || error}`);
    } finally {
      setIsCreating(false);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return textSlides.length > 0;
      case 1:
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
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Create Text Slides</h3>
              <p className="text-gray-600">
                Add announcements, welcome messages, and information
              </p>
            </div>

            <div className="space-y-4">
              {/* Add new text slide form */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Add New Text Slide</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Main title"
                    value={newSlide.title}
                    onChange={(e) =>
                      setNewSlide({ ...newSlide, title: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Subtitle (optional)"
                    value={newSlide.subtitle}
                    onChange={(e) =>
                      setNewSlide({ ...newSlide, subtitle: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Background Color
                      </label>
                      <input
                        type="color"
                        value={newSlide.backgroundColor}
                        onChange={(e) =>
                          setNewSlide({
                            ...newSlide,
                            backgroundColor: e.target.value,
                          })
                        }
                        className="w-full h-10 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Text Color
                      </label>
                      <input
                        type="color"
                        value={newSlide.textColor}
                        onChange={(e) =>
                          setNewSlide({
                            ...newSlide,
                            textColor: e.target.value,
                          })
                        }
                        className="w-full h-10 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={addTextSlide}
                  className="mt-3 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Text Slide
                </button>
              </div>

              {/* Text slides list */}
              <div className="space-y-2">
                {textSlides.map((slide) => (
                  <div
                    key={slide.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: slide.backgroundColor }}
                      />
                      <div>
                        <div className="font-medium">{slide.title}</div>
                        {slide.subtitle && (
                          <div className="text-sm text-gray-600">
                            {slide.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeTextSlide(slide.id)}
                      className="text-pink-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SettingsPanel
              settings={settings}
              onSettingsChange={setSettings}
              slideshowName={slideshowName}
              onSlideshowNameChange={setSlideshowName}
            />
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">
                Text Slides Preview
              </h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {textSlides.map((slide, index) => (
                  <div key={slide.id} className="bg-white p-3 rounded border">
                    <div className="text-sm font-medium text-gray-800">
                      {slide.title}
                    </div>
                    {slide.subtitle && (
                      <div className="text-xs text-gray-500 mt-1">
                        {slide.subtitle}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: slide.backgroundColor }}
                      />
                      <span className="text-xs text-gray-400">Background</span>
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: slide.textColor }}
                      />
                      <span className="text-xs text-gray-400">Text</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
              {textSlides.length > 0 ? (
                <div
                  className="w-full h-full flex items-center justify-center p-8"
                  style={{ backgroundColor: textSlides[0].backgroundColor }}
                >
                  <div className="text-center">
                    <h1
                      className="text-4xl font-bold mb-4"
                      style={{ color: textSlides[0].textColor }}
                    >
                      {textSlides[0].title}
                    </h1>
                    {textSlides[0].subtitle && (
                      <p
                        className="text-xl opacity-80"
                        style={{ color: textSlides[0].textColor }}
                      >
                        {textSlides[0].subtitle}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No text slides created
                </div>
              )}
            </div>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                {textSlides.length} text slide
                {textSlides.length !== 1 ? "s" : ""} •{" "}
                {Math.round((textSlides.length * settings.duration) / 1000)}s
                total
              </p>
            </div>
            <div className="text-left text-gray-700 text-sm space-y-1">
              <div>
                <b>Name:</b> {slideshowName}
              </div>
              <div>
                <b>Transition:</b> {settings.transition}
              </div>
              <div>
                <b>Duration:</b> {settings.duration / 1000}s per slide
              </div>
              <div>
                <b>Auto Play:</b> {settings.autoPlay ? "Yes" : "No"}
              </div>
              <div>
                <b>Loop:</b> {settings.loopSlideshow ? "Yes" : "No"}
              </div>
              <div>
                <b>Show Controls:</b> {settings.showControls ? "Yes" : "No"}
              </div>
              {settings.backgroundMusic && (
                <div>
                  <b>Background Music:</b> Yes
                </div>
              )}
            </div>
          </div>
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

export { steps };
