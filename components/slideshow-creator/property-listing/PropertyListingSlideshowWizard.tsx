import React, { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Property, PropertySlideshowWizardProps } from "./types";
import { SlideshowSettings } from "../shared/types";
import { DEFAULT_SETTINGS } from "../shared/constants";
import { propertyThemes, propertyLayouts } from "./constants";
import SettingsPanel from "../shared/SettingsPanel";
import WizardStepper from "../shared/WizardStepper";
import PropertyList from "./PropertyList";
import PropertyForm from "./PropertyForm";
import ThemeSelector from "./ThemeSelector";
import PropertyPreview from "./PropertyPreview";

const steps = [
    { id: "listings", label: "Properties", description: "Add property details" },
    { id: "design", label: "Design", description: "Choose theme" },
    {
        id: "settings",
        label: "Settings",
        description: "Configure slideshow",
    },
    {
        id: "preview",
        label: "Preview & Create",
        description: "Review and finish",
    },
];

export default function PropertyListingSlideshowWizard({
    step = 0,
    formData = {},
    updateFormData = () => { },
    onComplete = () => { },
    isEditing = false,
    initialData,
}: PropertySlideshowWizardProps) {
    const [properties, setProperties] = useState<Property[]>(
        Array.isArray(formData.properties)
            ? formData.properties
            : Array.isArray(initialData?.properties)
                ? initialData.properties
                : []
    );

    const [selectedTheme, setSelectedTheme] = useState(
        formData.theme || initialData?.theme || propertyThemes[0]
    );

    const [selectedLayout, setSelectedLayout] = useState(
        formData.layout || initialData?.layout || propertyLayouts[0]
    );

    const [currentStep, setCurrentStep] = useState(step);
    const [slideshowName, setSlideshowName] = useState(
        formData.name || initialData?.name || "Property Listings"
    );

    const [settings, setSettings] = useState<SlideshowSettings>(
        formData.settings || initialData?.settings || DEFAULT_SETTINGS
    );

    // Sync state with initialData/formData when they change (critical for edit mode)
    // Sync state with initialData/formData when they change (critical for edit mode)
    useEffect(() => {
        // Prioritize initialData which comes from the database structure
        const sourceData = initialData || formData;
        if (sourceData) {
            console.log("Syncing Property Wizard Data:", sourceData);

            if (sourceData.properties && Array.isArray(sourceData.properties) && sourceData.properties.length > 0) {
                setProperties(sourceData.properties);
            }
            if (sourceData.theme) setSelectedTheme(sourceData.theme);
            if (sourceData.layout) setSelectedLayout(sourceData.layout);
            if (sourceData.name) setSlideshowName(sourceData.name);
            if (sourceData.settings) setSettings(sourceData.settings);
        }
    }, [initialData, formData]);

    const [isCreating, setIsCreating] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [isAddingProperty, setIsAddingProperty] = useState(false);

    useEffect(() => {
        updateFormData({
            properties,
            canProceed: properties.length > 0,
            name: slideshowName,
            settings,
            theme: selectedTheme,
            layout: selectedLayout,
        });
    }, [
        properties,
        slideshowName,
        settings,
        selectedTheme,
        selectedLayout,
        updateFormData,
    ]);

    const handleAddProperty = (property: Property) => {
        const newProperties = [...properties, property];
        setProperties(newProperties);
        setIsAddingProperty(false);
    };

    const handleUpdateProperty = (updatedProperty: Property) => {
        const newProperties = properties.map((p) =>
            p.id === updatedProperty.id ? updatedProperty : p
        );
        setProperties(newProperties);
        setEditingProperty(null);
    };

    const handleRemoveProperty = (id: string) => {
        setProperties(properties.filter((p) => p.id !== id));
    };

    const handleCreate = async () => {
        if (properties.length === 0) {
            alert("Please add at least one property");
            return;
        }

        setIsCreating(true);

        try {
            // Upload images for all properties
            const updatedProperties = await Promise.all(
                properties.map(async (property) => {
                    const updatedImages = await Promise.all(
                        property.images.map(async (img) => {
                            if (img instanceof File) {
                                const fileExt = img.name.split(".").pop();
                                const fileName = `${Date.now()}-${Math.random()
                                    .toString(36)
                                    .substring(2)}.${fileExt}`;
                                const filePath = `slideshows/${fileName}`;

                                const { error: uploadError } = await supabase.storage
                                    .from("slideshow-media")
                                    .upload(filePath, img, {
                                        contentType: img.type,
                                        cacheControl: "3600",
                                    });

                                if (uploadError) throw uploadError;

                                const {
                                    data: { publicUrl },
                                } = supabase.storage.from("slideshow-media").getPublicUrl(filePath);

                                return publicUrl;
                            }
                            return img; // Already a URL or string
                        })
                    );
                    return { ...property, images: updatedImages };
                })
            );

            // Create slides from properties
            // Each property becomes a slide
            const slides = updatedProperties.map((property, index) => ({
                id: `property-${crypto.randomUUID()}`,
                type: "property-listing",
                duration: settings.duration,
                content: {
                    property,
                    theme: selectedTheme,
                    layout: selectedLayout,
                },
                styling: {
                    backgroundColor: selectedTheme.backgroundColor,
                    textColor: selectedTheme.textColor,
                    fontSize: 24,
                    animation: settings.transition,
                },
                // We'll also store minimal info at top level for list views if needed
                name: property.name,
                thumbnail: property.images[0],
            }));

            const slideshowData = {
                name: slideshowName,
                type: "property-listing",
                properties: updatedProperties, // Store raw data
                slides: slides,         // Store processed slides
                theme: selectedTheme,
                layout: selectedLayout,
                settings,
            };

            updateFormData(slideshowData);
            onComplete(slideshowData);
        } catch (error) {
            console.error("Error creating property slideshow:", error);
            alert(`Error uploading images: ${(error as any).message || error}`);
        } finally {
            setIsCreating(false);
        }
    };

    const canGoNext = () => {
        switch (currentStep) {
            case 0:
                return properties.length > 0 && !isAddingProperty && !editingProperty;
            case 1:
                return !!selectedTheme;
            case 2:
                return true;
            case 3:
                return true;
            default:
                return true;
        }
    };

    const renderStepContent = () => {
        if (isAddingProperty) {
            return (
                <PropertyForm
                    onSubmit={handleAddProperty}
                    onCancel={() => setIsAddingProperty(false)}
                />
            );
        }

        if (editingProperty) {
            return (
                <PropertyForm
                    initialData={editingProperty}
                    onSubmit={handleUpdateProperty}
                    onCancel={() => setEditingProperty(null)}
                />
            );
        }

        switch (currentStep) {
            case 0:
                return (
                    <PropertyList
                        properties={properties}
                        onAdd={() => setIsAddingProperty(true)}
                        onEdit={setEditingProperty}
                        onRemove={handleRemoveProperty}
                    />
                );
            case 1:
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <ThemeSelector
                                selectedTheme={selectedTheme}
                                onThemeSelect={setSelectedTheme}
                            />
                            {/* Future: Add Layout Selector here if needed */}
                        </div>
                        <div className="bg-gray-100 rounded-xl overflow-hidden shadow-inner aspect-video">
                            <PropertyPreview
                                properties={properties}
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
                        <div className="bg-gray-100 rounded-xl overflow-hidden shadow-inner aspect-video">
                            <PropertyPreview
                                properties={properties}
                                theme={selectedTheme}
                                layout={selectedLayout}
                            />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                            <PropertyPreview
                                properties={properties}
                                theme={selectedTheme}
                                layout={selectedLayout}
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-center">
                                <div className="text-sm text-gray-500">Properties</div>
                                <div className="font-semibold text-lg">{properties.length}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-500">Est. Duration</div>
                                <div className="font-semibold text-lg">{Math.ceil(properties.length * (settings.duration / 1000))}s</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-500">Theme</div>
                                <div className="font-semibold text-lg truncate">{selectedTheme.name}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-500">Transition</div>
                                <div className="font-semibold text-lg capitalize">{settings.transition}</div>
                            </div>
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

            {!isAddingProperty && !editingProperty && (
                <WizardStepper
                    steps={steps}
                    currentStep={currentStep}
                    onStepClick={setCurrentStep}
                    canGoNext={canGoNext()}
                    canGoBack={currentStep > 0}
                    onNext={() => setCurrentStep(c => Math.min(steps.length - 1, c + 1))}
                    onBack={() => setCurrentStep(c => Math.max(0, c - 1))}
                    onComplete={handleCreate}
                    isCreating={isCreating}
                    createButtonText={isEditing ? "Update Slideshow" : "Create Slideshow"}
                />
            )}
        </div>
    );
}
