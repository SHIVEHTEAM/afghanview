import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Settings,
  Lock,
  Star,
  Users,
  Edit,
  Shield,
} from "lucide-react";

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

interface SlideshowWizardProps {
  type: string;
  steps: WizardStep[];
  onClose: () => void;
  onComplete: (data: any) => void;
  children: React.ReactNode;
  // Admin-specific props
  isAdmin?: boolean;
  isLocked?: boolean;
  isTemplate?: boolean;
  assignToAll?: boolean;
  selectedRestaurants?: string[];
  adminSettings?: {
    lockSlideshow?: boolean;
    markAsTemplate?: boolean;
    assignToAllRestaurants?: boolean;
    selectedRestaurantIds?: string[];
    allowClientEdit?: boolean;
    requireApproval?: boolean;
  };
}

export default function SlideshowWizard({
  type,
  steps,
  onClose,
  onComplete,
  children,
  isAdmin = false,
  isLocked = false,
  isTemplate = false,
  assignToAll = false,
  selectedRestaurants = [],
  adminSettings = {},
}: SlideshowWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [formData, setFormData] = useState<any>({
    // Initialize admin settings
    isLocked: isLocked,
    isTemplate: isTemplate,
    assignToAll: assignToAll,
    selectedRestaurants: selectedRestaurants,
    allowClientEdit: true,
    requireApproval: false,
    ...adminSettings,
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Include admin settings in the final data
    const finalData = {
      ...formData,
      adminSettings: {
        isLocked: formData.isLocked,
        isTemplate: formData.isTemplate,
        assignToAll: formData.assignToAll,
        selectedRestaurants: formData.selectedRestaurants,
        allowClientEdit: formData.allowClientEdit,
        requireApproval: formData.requireApproval,
      },
    };
    onComplete(finalData);
  };

  const updateFormData = (data: any) => {
    setFormData({ ...formData, ...data });
  };

  const canProceedToNext = () => {
    // For menu slideshow, check if there are menu items
    if (type === "menu") {
      return formData.canProceed !== false;
    }
    // For other types, always allow proceeding
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12"></div>
            <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-white rounded-full -translate-x-10 translate-y-10"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <h2 className="text-2xl font-bold capitalize">
                    {type.replace("-", " ")} Slideshow
                  </h2>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowAdminSettings(!showAdminSettings)}
                    className="p-3 bg-white/20 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Admin Settings Panel */}
            {isAdmin && showAdminSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Admin Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Lock Slideshow */}
                  <label className="flex items-center gap-3 p-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.isLocked}
                      onChange={(e) =>
                        updateFormData({ isLocked: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">Lock Slideshow</span>
                  </label>

                  {/* Mark as Template */}
                  <label className="flex items-center gap-3 p-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.isTemplate}
                      onChange={(e) =>
                        updateFormData({ isTemplate: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Mark as Template
                    </span>
                  </label>

                  {/* Assign to All Restaurants */}
                  <label className="flex items-center gap-3 p-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.assignToAll}
                      onChange={(e) =>
                        updateFormData({ assignToAll: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Assign to All Restaurants
                    </span>
                  </label>

                  {/* Allow Client Edit */}
                  <label className="flex items-center gap-3 p-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.allowClientEdit}
                      onChange={(e) =>
                        updateFormData({ allowClientEdit: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <Edit className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Allow Client Edit
                    </span>
                  </label>

                  {/* Require Approval */}
                  <label className="flex items-center gap-3 p-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.requireApproval}
                      onChange={(e) =>
                        updateFormData({ requireApproval: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Require Approval
                    </span>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Progress Steps */}
            <div className="flex items-center justify-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 shadow-lg ${
                      index <= currentStep
                        ? "bg-white text-purple-600 border-white shadow-xl"
                        : "border-white/30 text-white/30 bg-white/10 backdrop-blur-sm"
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-semibold text-white">
                      {step.title}
                    </div>
                    <div className="text-xs text-white/80 mt-1">
                      {step.description}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-1 mx-6 rounded-full transition-all duration-300 ${
                        index < currentStep
                          ? "bg-white shadow-lg"
                          : "bg-white/30"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-8 h-full"
            >
              {React.cloneElement(children as React.ReactElement, {
                step: currentStep,
                formData,
                updateFormData,
                onComplete: handleComplete,
                onBack: () => {
                  if (currentStep === 0) {
                    onClose();
                  } else {
                    prevStep();
                  }
                },
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-3 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="text-sm text-gray-600 font-medium">
              Step {currentStep + 1} of {steps.length}
            </div>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                disabled={!canProceedToNext()}
                className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                <Check className="w-5 h-5" />
                Create Slideshow
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
