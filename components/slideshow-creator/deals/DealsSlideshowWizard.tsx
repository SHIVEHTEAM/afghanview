import React, { useState, useEffect } from "react";
import { Plus, Trash2, Clock, Tag } from "lucide-react";
import { SlideshowSettings } from "../shared/types";
import { DEFAULT_SETTINGS } from "../shared/constants";
import SettingsPanel from "../shared/SettingsPanel";
import WizardStepper from "../shared/WizardStepper";

interface DealsSlideshowWizardProps {
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
    label: "Create Deals",
    description: "Add your special offers",
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

interface Deal {
  id: string;
  title: string;
  description: string;
  originalPrice: string;
  dealPrice: string;
  validUntil: string;
  category: string;
}

export default function DealsSlideshowWizard({
  step = 0,
  formData = {},
  updateFormData = () => {},
  onComplete = () => {},
  isEditing = false,
  initialData,
}: DealsSlideshowWizardProps) {
  const [deals, setDeals] = useState<Deal[]>(
    Array.isArray(formData.deals)
      ? formData.deals
      : Array.isArray(initialData?.deals)
      ? initialData.deals
      : []
  );
  const [currentStep, setCurrentStep] = useState(step);
  const [slideshowName, setSlideshowName] = useState(
    formData.name || initialData?.name || "Deals Slideshow"
  );
  const [settings, setSettings] = useState<SlideshowSettings>(
    formData.settings || initialData?.settings || DEFAULT_SETTINGS
  );
  const [isCreating, setIsCreating] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: "",
    description: "",
    originalPrice: "",
    dealPrice: "",
    validUntil: "",
    category: "Daily Special",
  });

  useEffect(() => {
    updateFormData({ deals, name: slideshowName, settings });
  }, [deals, slideshowName, settings, updateFormData]);

  const addDeal = () => {
    if (newDeal.title && newDeal.dealPrice) {
      setDeals([...deals, { ...newDeal, id: Date.now().toString() }]);
      setNewDeal({
        title: "",
        description: "",
        originalPrice: "",
        dealPrice: "",
        validUntil: "",
        category: "Daily Special",
      });
    }
  };

  const removeDeal = (id: string) => {
    setDeals(deals.filter((deal) => deal.id !== id));
  };

  const handleCreate = async () => {
    if (deals.length === 0) {
      alert("Please add at least one deal");
      return;
    }

    setIsCreating(true);

    try {
      const slides = deals.map((deal, index) => ({
        id: `deal-${index}`,
        file_path: `data:image/svg+xml;base64,${btoa(`
          <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
            <rect width="100%" height="100%" fill="#dc2626"/>
            <text x="50%" y="25%" text-anchor="middle" dominant-baseline="middle" 
                  font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#ffffff">
              SPECIAL DEAL!
            </text>
            <text x="50%" y="40%" text-anchor="middle" dominant-baseline="middle" 
                  font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff">
              ${deal.title}
            </text>
            <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" 
                  font-family="Arial, sans-serif" font-size="24" fill="#fecaca">
              ${deal.description}
            </text>
            <text x="50%" y="70%" text-anchor="middle" dominant-baseline="middle" 
                  font-family="Arial, sans-serif" font-size="32" fill="#fbbf24">
              <tspan text-decoration="line-through" opacity="0.6">$${deal.originalPrice}</tspan>
              <tspan x="50%" dy="0">  $${deal.dealPrice}</tspan>
            </text>
            <text x="50%" y="85%" text-anchor="middle" dominant-baseline="middle" 
                  font-family="Arial, sans-serif" font-size="20" fill="#fecaca">
              Valid until: ${deal.validUntil}
            </text>
          </svg>
        `)}`,
        name: deal.title,
        type: "image",
        order_index: index,
        duration: settings.duration,
        styling: {
          backgroundColor: "#dc2626",
          textColor: "#ffffff",
          fontSize: 48,
          animation: settings.transition,
        },
      }));

      const slideshowData = {
        slides,
        type: "deals",
        name: slideshowName,
        settings,
        deals,
      };

      updateFormData(slideshowData);
      onComplete(slideshowData);
    } catch (error) {
      console.error("Error creating deals slideshow:", error);
      alert(`Error creating slideshow: ${(error as any).message || error}`);
    } finally {
      setIsCreating(false);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return deals.length > 0;
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
              <h3 className="text-lg font-semibold mb-2">
                Create Special Deals
              </h3>
              <p className="text-gray-600">
                Add your promotional offers and discounts
              </p>
            </div>

            <div className="space-y-4">
              {/* Add new deal form */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Add New Deal</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Deal title"
                    value={newDeal.title}
                    onChange={(e) =>
                      setNewDeal({ ...newDeal, title: e.target.value })
                    }
                    className="p-2 border border-gray-300 rounded"
                  />
                  <select
                    value={newDeal.category}
                    onChange={(e) =>
                      setNewDeal({ ...newDeal, category: e.target.value })
                    }
                    className="p-2 border border-gray-300 rounded"
                  >
                    <option>Daily Special</option>
                    <option>Happy Hour</option>
                    <option>Weekend Deal</option>
                    <option>Holiday Special</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Original price"
                    value={newDeal.originalPrice}
                    onChange={(e) =>
                      setNewDeal({ ...newDeal, originalPrice: e.target.value })
                    }
                    className="p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Deal price"
                    value={newDeal.dealPrice}
                    onChange={(e) =>
                      setNewDeal({ ...newDeal, dealPrice: e.target.value })
                    }
                    className="p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newDeal.description}
                    onChange={(e) =>
                      setNewDeal({ ...newDeal, description: e.target.value })
                    }
                    className="p-2 border border-gray-300 rounded col-span-2"
                  />
                  <input
                    type="date"
                    value={newDeal.validUntil}
                    onChange={(e) =>
                      setNewDeal({ ...newDeal, validUntil: e.target.value })
                    }
                    className="p-2 border border-gray-300 rounded col-span-2"
                  />
                </div>
                <button
                  onClick={addDeal}
                  className="mt-3 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Deal
                </button>
              </div>

              {/* Deals list */}
              <div className="space-y-2">
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded"
                  >
                    <div>
                      <div className="font-medium text-red-600">
                        {deal.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {deal.description}
                      </div>
                      <div className="text-sm">
                        <span className="line-through text-gray-400">
                          ${deal.originalPrice}
                        </span>
                        <span className="text-purple-600 font-medium ml-2">
                          ${deal.dealPrice}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeDeal(deal.id)}
                      className="text-red-500 hover:text-red-700"
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
              onSettingsChange={(updates) =>
                setSettings((prev) => ({ ...prev, ...updates }))
              }
              slideshowName={slideshowName}
              onSlideshowNameChange={setSlideshowName}
            />
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Deals Preview</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {deals.map((deal, index) => (
                  <div key={deal.id} className="bg-white p-3 rounded border">
                    <div className="text-sm font-medium text-red-600">
                      {deal.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {deal.description}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      <span className="line-through">
                        ${deal.originalPrice}
                      </span>
                      <span className="text-green-600 font-medium ml-2">
                        ${deal.dealPrice}
                      </span>
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
              {deals.length > 0 ? (
                <div className="w-full h-full flex items-center justify-center p-8 bg-red-600">
                  <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-2">SPECIAL DEAL!</h2>
                    <h1 className="text-4xl font-bold mb-2">
                      {deals[0].title}
                    </h1>
                    <p className="text-lg mb-4">{deals[0].description}</p>
                    <div className="text-2xl">
                      <span className="line-through opacity-60">
                        ${deals[0].originalPrice}
                      </span>
                      <span className="text-yellow-300 ml-2">
                        ${deals[0].dealPrice}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No deals created
                </div>
              )}
            </div>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                {deals.length} deal{deals.length !== 1 ? "s" : ""} •{" "}
                {Math.round((deals.length * settings.duration) / 1000)}s total
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
