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
    <div className="w-full bg-white border-t border-black/5">
      {/* Step Indicators */}
      <div className="px-10 py-6 bg-gray-50/50">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = onStepClick && (isCompleted || isCurrent);

            return (
              <div key={step.id} className="flex items-center group">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300 ${isCompleted
                      ? "bg-black border-black text-white"
                      : isCurrent
                        ? "bg-black border-black text-white shadow-xl shadow-black/10"
                        : "bg-white border-black/5 text-black/20"
                    } ${isClickable
                      ? "cursor-pointer hover:border-black/20"
                      : ""
                    }`}
                  onClick={() => isClickable && onStepClick(index)}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest">{index + 1}</span>
                  )}
                </div>
                <div className="ml-4">
                  <div
                    className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCurrent || isCompleted
                        ? "text-black"
                        : "text-black/20"
                      }`}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-[8px] font-bold text-black/10 uppercase tracking-widest mt-0.5">
                      {step.description}
                    </div>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-black/5 mx-8" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="px-10 py-8 flex justify-between items-center gap-6">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className="px-8 py-4 rounded-xl bg-gray-50 text-black border border-black/5 font-black text-[10px] uppercase tracking-[0.2em] disabled:opacity-20 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-300"
        >
          Back
        </button>

        <div className="flex-1 h-px bg-black/5 mx-4 hidden sm:block"></div>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="px-10 py-4 rounded-xl bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] disabled:opacity-20 disabled:cursor-not-allowed hover:bg-black/90 transition-all duration-300 shadow-xl shadow-black/10"
          >
            Next Step
          </button>
        ) : (
          <button
            onClick={onComplete}
            disabled={isCreating}
            className="px-10 py-4 rounded-xl bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] disabled:opacity-20 disabled:cursor-not-allowed hover:bg-black/90 transition-all duration-300 shadow-2xl shadow-black/20 flex items-center gap-4"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Deploying...
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
