import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, Sparkles } from "lucide-react";
import FactGenerationStep from "./FactGenerationStep";
import SettingsStep from "./SettingsStep";
import { Fact } from "./types";
import { useToastNotifications } from "../../../lib/toast-utils";

interface AiFactsSlideshowWizardProps {
  step?: number;
  formData?: any;
  updateFormData?: (data: any) => void;
  onComplete?: (data: any) => void;
  onBack?: () => void;
  isEditing?: boolean;
  initialData?: any;
}

// Helper function to safely encode UTF-8 strings to base64
function utf8ToBase64(str: string): string {
  if (typeof window !== "undefined") {
    // Browser environment
    return btoa(unescape(encodeURIComponent(str)));
  } else {
    // Node.js environment
    return Buffer.from(str, "utf8").toString("base64");
  }
}

// Helper function to create SVG for AI facts
function createFactSVG(fact: Fact): string {
  // Clean the text to remove any problematic characters for SVG
  const cleanText = fact.text
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Replace non-ASCII characters with HTML entities or safe alternatives
      const entityMap: { [key: string]: string } = {
        "🎨": "🎨",
        "🍽️": "🍽️",
        "🏔️": "🏔️",
        "🌹": "🌹",
        "📖": "📖",
        "🎵": "🎵",
        "🏛️": "🏛️",
        "🕌": "🕌",
        "🌙": "🌙",
        "☀️": "☀️",
        "⭐": "⭐",
        "💎": "💎",
        "🌺": "🌺",
        "🦅": "🦅",
        "🐪": "🐪",
        "🏺": "🏺",
        "🪕": "🪕",
        "🥻": "🥻",
        "🧿": "🧿",
        "🕯️": "🕯️",
      };
      return entityMap[char] || " ";
    })
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const svg = `
    <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${
            fact.backgroundColor || "#1f2937"
          };stop-opacity:1" />
          <stop offset="100%" style="stop-color:${
            fact.backgroundColor || "#1f2937"
          };stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Background pattern for visual interest -->
      <defs>
        <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1" fill="${
            fact.fontColor || "#ffffff"
          }" opacity="0.1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)"/>
      
      <!-- Main text container -->
      <foreignObject x="5%" y="10%" width="90%" height="80%">
        <div xmlns="http://www.w3.org/1999/xhtml" 
             style="
               font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
               font-size: ${fact.fontSize || 48}px; 
               font-weight: 600;
               color: ${fact.fontColor || "#ffffff"};
               text-align: center;
               line-height: 1.4;
               display: flex;
               align-items: center;
               justify-content: center;
               height: 100%;
               width: 100%;
               padding: 40px;
               text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
               word-wrap: break-word;
               overflow-wrap: break-word;
             ">
          ${cleanText}
        </div>
      </foreignObject>
      
      <!-- Decorative elements -->
      <circle cx="100" cy="100" r="3" fill="${
        fact.fontColor || "#ffffff"
      }" opacity="0.3"/>
      <circle cx="1820" cy="980" r="3" fill="${
        fact.fontColor || "#ffffff"
      }" opacity="0.3"/>
      <circle cx="100" cy="980" r="2" fill="${
        fact.fontColor || "#ffffff"
      }" opacity="0.2"/>
      <circle cx="1820" cy="100" r="2" fill="${
        fact.fontColor || "#ffffff"
      }" opacity="0.2"/>
    </svg>
  `;

  return svg;
}

export default function AiFactsSlideshowWizard({
  step,
  formData,
  updateFormData,
  onComplete,
  onBack,
  isEditing = false,
  initialData,
}: AiFactsSlideshowWizardProps) {
  const [currentStep, setCurrentStep] = useState(step || 0);
  const [generatedFacts, setGeneratedFacts] = useState<Fact[]>([]);
  const [selectedFacts, setSelectedFacts] = useState<Set<string>>(new Set());
  const [slideshowName, setSlideshowName] = useState(
    initialData?.name || "AI Facts Slideshow"
  );
  const [settings, setSettings] = useState({
    duration: 5000,
    transition: "fade",
    transitionDuration: 1000,
    backgroundMusic: "",
    musicVolume: 50,
    musicLoop: true,
    autoPlay: true,
    showControls: true,
    showProgress: true,
    loopSlideshow: true,
    shuffleSlides: false,
    aspectRatio: "16:9",
    quality: "high",
    autoRandomFact: false,
    randomFactInterval: 6,
  });
  const [isCreating, setIsCreating] = useState(false);
  const toast = useToastNotifications();

  const steps = [
    { name: "Generate Facts", description: "Create AI-generated facts" },
    { name: "Settings", description: "Configure slideshow settings" },
  ];

  useEffect(() => {
    if (initialData) {
      setGeneratedFacts(initialData.facts || []);
      setSelectedFacts(
        new Set(initialData.facts?.map((f: Fact) => f.id) || [])
      );
      setSlideshowName(initialData.name || "AI Facts Slideshow");
      setSettings(initialData.settings || settings);
    }
  }, [initialData]);

  const handleCreate = async () => {
    if (generatedFacts.length === 0) {
      toast.showWarning("Please generate some facts first");
      return;
    }

    setIsCreating(true);

    try {
      // Convert facts to slides using the safe SVG generation
      const slides = generatedFacts.map((fact, index) => {
        const svg = createFactSVG(fact);
        return {
          id: `fact-${index}`,
          file_path: `data:image/svg+xml;base64,${utf8ToBase64(svg)}`,
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
        };
      });

      const slideshowData = {
        slides,
        type: "ai-facts",
        name: slideshowName,
        settings,
        facts: generatedFacts,
      };

      updateFormData?.(slideshowData);
      onComplete?.(slideshowData);
    } catch (error) {
      console.error("Error creating AI facts slideshow:", error);
      toast.showError(
        `Error creating slideshow: ${(error as any).message || error}`
      );
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

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <FactGenerationStep
            onComplete={(facts, settings) => {
              setGeneratedFacts(facts);
              setSelectedFacts(new Set(facts.map((f) => f.id)));
              setSettings(settings);
              handleNext();
            }}
            onBack={onBack || (() => {})}
          />
        );
      case 1:
        return (
          <SettingsStep
            facts={generatedFacts}
            onComplete={handleCreate}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 pb-0">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <nav aria-label="Progress">
              <ol className="flex items-center space-x-4">
                {steps.map((step, index) => (
                  <li key={step.name} className="flex items-center">
                    <button
                      onClick={() => handleStepClick(index)}
                      className={`flex items-center space-x-2 ${
                        index <= currentStep
                          ? "text-blue-600 hover:text-blue-800"
                          : "text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index < currentStep
                            ? "bg-green-500 text-white"
                            : index === currentStep
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {index < currentStep ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-sm font-medium">{step.name}</p>
                        <p className="text-xs text-gray-500">
                          {step.description}
                        </p>
                      </div>
                    </button>
                    {index < steps.length - 1 && (
                      <div className="ml-4 h-0.5 w-8 bg-gray-200" />
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {renderStep()}
          </div>
        </div>
      </div>

      {/* Footer with navigation buttons */}
      <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Back
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Previous
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canGoNext()}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  canGoNext()
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={isCreating || !canGoNext()}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isCreating || !canGoNext()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isCreating ? "Creating..." : "Create Slideshow"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
