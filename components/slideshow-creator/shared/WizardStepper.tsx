import React from "react";
import { Check, ChevronRight } from "lucide-react";

interface WizardStep {
  id: string;
  label: string;
  description?: string;
}

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  canGoNext: boolean;
  canGoBack: boolean;
  onNext: () => void;
  onBack: () => void;
  onComplete?: () => void;
  isCreating?: boolean;
  createButtonText?: string;
}

export default function WizardStepper({
  steps,
  currentStep,
  onStepClick,
  canGoNext,
  canGoBack,
  onNext,
  onBack,
  onComplete,
  isCreating = false,
  createButtonText = "Create Slideshow",
}: WizardStepperProps) {
  return (
    <div className="w-full bg-white border-t border-gray-200">
      {/* Step Indicators */}
      <div className="px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = onStepClick && (isCompleted || isCurrent);

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white shadow-lg"
                      : isCurrent
                      ? "bg-blue-500 border-blue-500 text-white shadow-lg"
                      : "bg-gray-100 border-gray-300 text-gray-500"
                  } ${
                    isClickable
                      ? "cursor-pointer hover:opacity-80 hover:scale-110"
                      : ""
                  }`}
                  onClick={() => isClickable && onStepClick(index)}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="ml-3">
                  <div
                    className={`text-sm font-medium ${
                      isCurrent
                        ? "text-blue-600"
                        : isCompleted
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-xs text-gray-400">
                      {step.description}
                    </div>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-gray-300 mx-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="px-6 py-4 flex justify-between items-center gap-4">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-all duration-200 hover:scale-105"
        >
          Back
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Next
          </button>
        ) : (
          <button
            onClick={onComplete}
            disabled={isCreating}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {createButtonText}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
