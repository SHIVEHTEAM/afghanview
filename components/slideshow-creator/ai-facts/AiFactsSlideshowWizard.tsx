import React, { useState, useEffect } from "react";
import { Fact } from "./types";
import { SlideshowSettings } from "../shared/types";
import { DEFAULT_SETTINGS } from "../shared/constants";
import SettingsPanel from "../shared/SettingsPanel";
import WizardStepper from "../shared/WizardStepper";
import FactGenerationStep from "./FactGenerationStep";

interface AiFactsSlideshowWizardProps {
  step?: number;
  formData: any;
  updateFormData: (data: any) => void;
  onComplete: (data: any) => void;
  onBack?: () => void;
  isEditing?: boolean;
  initialData?: any;
}

const steps = [
  {
    id: "generate",
    label: "Generate Facts",
    description: "Create Afghan culture facts",
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

export default function AiFactsSlideshowWizard({
  step,
  formData,
  updateFormData,
  onComplete,
  onBack,
  isEditing = false,
  initialData,
}: AiFactsSlideshowWizardProps) {
  const [currentStep, setCurrentStep] = useState(step ?? 0);
  const [generatedFacts, setGeneratedFacts] = useState<Fact[]>(
    Array.isArray(formData.facts)
      ? formData.facts
      : Array.isArray(initialData?.facts)
      ? initialData.facts
      : []
  );
  const [slideshowName, setSlideshowName] = useState(
    formData.name || initialData?.name || "AI Facts Slideshow"
  );
  const [settings, setSettings] = useState<SlideshowSettings>(
    formData.settings || initialData?.settings || DEFAULT_SETTINGS
  );
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    updateFormData({ facts: generatedFacts, name: slideshowName, settings });
  }, [generatedFacts, slideshowName, settings, updateFormData]);

  const handleFactGenerationComplete = (facts: Fact[]) => {
    setGeneratedFacts(facts);
    setCurrentStep(1);
  };

  const handleCreate = async () => {
    if (generatedFacts.length === 0) {
      alert("Please generate some facts first");
      return;
    }

    setIsCreating(true);

    try {
      // Convert facts to slides
      const slides = generatedFacts.map((fact, index) => ({
        id: `fact-${index}`,
        file_path: `data:image/svg+xml;base64,${btoa(`
          <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
            <rect width="100%" height="100%" fill="${
              fact.backgroundColor || "#1f2937"
            }"/>
            <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
                  font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
                  fill="${fact.fontColor || "#ffffff"}" text-align="center">
              ${fact.text}
            </text>
          </svg>
        `)}`,
        name: `Fact ${index + 1}`,
        type: "image",
        order_index: index,
        duration: settings.duration,
        styling: {
          backgroundColor: fact.backgroundColor || "#1f2937",
          textColor: fact.fontColor || "#ffffff",
          fontSize: fact.fontSize || 48,
          animation: settings.transition,
        },
      }));

      const slideshowData = {
        slides,
        type: "ai-facts",
        name: slideshowName,
        settings,
        facts: generatedFacts,
      };

      updateFormData(slideshowData);
      onComplete(slideshowData);
    } catch (error) {
      console.error("Error creating AI facts slideshow:", error);
      alert(`Error creating slideshow: ${(error as any).message || error}`);
    } finally {
      setIsCreating(false);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return generatedFacts.length > 0;
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
          <FactGenerationStep
            onComplete={handleFactGenerationComplete}
            onBack={onBack || (() => {})}
          />
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
                Generated Facts Preview
              </h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {generatedFacts.map((fact, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="text-sm font-medium text-gray-800">
                      {fact.text}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {fact.category}
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
              {generatedFacts.length > 0 ? (
                <div
                  className="w-full h-full flex items-center justify-center p-8"
                  style={{
                    backgroundColor:
                      generatedFacts[0].backgroundColor || "#1f2937",
                  }}
                >
                  <p
                    className="text-center text-white text-2xl font-bold"
                    style={{ color: generatedFacts[0].fontColor || "#ffffff" }}
                  >
                    {generatedFacts[0].text}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No facts generated
                </div>
              )}
            </div>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                {generatedFacts.length} fact
                {generatedFacts.length !== 1 ? "s" : ""} •{" "}
                {Math.round((generatedFacts.length * settings.duration) / 1000)}
                s total
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
      <div className="flex-1 overflow-y-auto p-6">{renderStepContent()}</div>

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
