import React, { useState, useEffect } from "react";
import { MenuItem, MenuSlideshowWizardProps } from "./types";
import { SlideshowSettings } from "../shared/types";
import { DEFAULT_SETTINGS } from "../shared/constants";
import { menuThemes, layoutOptions } from "./constants";
import SettingsPanel from "../shared/SettingsPanel";
import WizardStepper from "../shared/WizardStepper";
import MenuItemsList from "./MenuItemsList";
import ThemeSelector from "./ThemeSelector";
import LayoutSelector from "./LayoutSelector";
import MenuPreview from "./MenuPreview";
import { MenuSVGGenerator } from "./svg-generator";

const steps = [
  { id: "items", label: "Menu Items", description: "Add your menu items" },
  { id: "design", label: "Design", description: "Choose theme and layout" },
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

export default function MenuSlideshowWizard({
  step = 0,
  formData = {},
  updateFormData = () => {},
  onComplete = () => {},
  isEditing = false,
  initialData,
}: MenuSlideshowWizardProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(
    Array.isArray(formData.menuItems)
      ? formData.menuItems
      : Array.isArray(initialData?.menuItems)
      ? initialData.menuItems
      : []
  );
  const [selectedTheme, setSelectedTheme] = useState(
    formData.theme || initialData?.theme || menuThemes[0]
  );
  const [selectedLayout, setSelectedLayout] = useState(
    formData.layout || initialData?.layout || layoutOptions[0]
  );
  const [currentStep, setCurrentStep] = useState(step);
  const [slideshowName, setSlideshowName] = useState(
    formData.name || initialData?.name || "Menu Slideshow"
  );
  const [settings, setSettings] = useState<SlideshowSettings>(
    formData.settings || initialData?.settings || DEFAULT_SETTINGS
  );
  const [isCreating, setIsCreating] = useState(false);

  const addMenuItem = (item: MenuItem) => {
    const newItems = [...menuItems, item];
    setMenuItems(newItems);
    updateFormData({
      menuItems: newItems,
      canProceed: newItems.length > 0,
    });
  };

  const updateMenuItem = (updatedItem: MenuItem) => {
    const newItems = menuItems.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setMenuItems(newItems);
    updateFormData({
      menuItems: newItems,
      canProceed: newItems.length > 0,
    });
  };

  const removeMenuItem = (id: string) => {
    const newItems = menuItems.filter((item) => item.id !== id);
    setMenuItems(newItems);
    updateFormData({
      menuItems: newItems,
      canProceed: newItems.length > 0,
    });
  };

  useEffect(() => {
    updateFormData({
      menuItems: menuItems,
      canProceed: menuItems.length > 0,
      name: slideshowName,
      settings,
      theme: selectedTheme,
      layout: selectedLayout,
    });
  }, [
    menuItems,
    slideshowName,
    settings,
    selectedTheme,
    selectedLayout,
    updateFormData,
  ]);

  const handleCreate = async () => {
    if (menuItems.length === 0) {
      alert("Please add at least one menu item");
      return;
    }

    setIsCreating(true);

    try {
      // Store menu data instead of large SVG strings
      const slides = menuItems.map((item, index) => ({
        id: `menu-${index}`,
        file_path: `menu://${item.id}`, // Use a custom protocol to identify menu items
        name: item.name,
        type: "menu", // Use custom type for menu items
        order_index: index,
        duration: settings.duration,
        menuData: {
          item: item,
          theme: selectedTheme,
          layout: selectedLayout,
        },
        styling: {
          backgroundColor: selectedTheme.backgroundColor,
          textColor: selectedTheme.textColor,
          fontSize: 48,
          animation: settings.transition,
        },
      }));

      const slideshowData = {
        menuItems: menuItems,
        slides: slides,
        theme: selectedTheme,
        layout: selectedLayout,
        settings,
        type: "menu",
        name: slideshowName,
      };

      updateFormData(slideshowData);
      onComplete(slideshowData);
    } catch (error) {
      console.error("Error creating menu slideshow:", error);
      alert(`Error creating slideshow: ${(error as any).message || error}`);
    } finally {
      setIsCreating(false);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return menuItems.length > 0;
      case 1:
        return (
          Object.keys(selectedTheme).length > 0 &&
          Object.keys(selectedLayout).length > 0
        );
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
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <MenuItemsList
            items={menuItems}
            onAddItem={addMenuItem}
            onUpdateItem={updateMenuItem}
            onRemoveItem={removeMenuItem}
          />
        );
      case 1:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ThemeSelector
                selectedTheme={selectedTheme}
                onThemeSelect={setSelectedTheme}
              />
              <LayoutSelector
                selectedLayout={selectedLayout}
                onLayoutSelect={setSelectedLayout}
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Menu Preview</h4>
              <MenuPreview
                menuItems={menuItems}
                theme={selectedTheme}
                layout={selectedLayout}
              />
            </div>
          </div>
        );
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
              <h4 className="font-medium text-gray-800 mb-3">Menu Preview</h4>
              <MenuPreview
                menuItems={menuItems}
                theme={selectedTheme}
                layout={selectedLayout}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
              <MenuPreview
                menuItems={menuItems}
                theme={selectedTheme}
                layout={selectedLayout}
              />
            </div>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                {menuItems.length} menu item{menuItems.length !== 1 ? "s" : ""}{" "}
                • {Math.round((menuItems.length * settings.duration) / 1000)}s
                total
              </p>
            </div>
            <div className="text-left text-gray-700 text-sm space-y-1">
              <div>
                <b>Name:</b> {slideshowName}
              </div>
              <div>
                <b>Theme:</b> {selectedTheme.name || "Default"}
              </div>
              <div>
                <b>Layout:</b> {selectedLayout.name || "Default"}
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
