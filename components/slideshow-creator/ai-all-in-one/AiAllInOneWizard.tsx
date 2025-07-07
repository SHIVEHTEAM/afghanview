import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Brain,
  Wand2,
  Play,
  Settings,
  ArrowRight,
  Check,
  Copy,
  RefreshCw,
  Save,
} from "lucide-react";
import WizardStepper from "../shared/WizardStepper";
import SettingsPanel from "../shared/SettingsPanel";
import { useRouter } from "next/router";
import type { SlideshowSettings } from "../shared/types";
import { supabase } from "../../../lib/supabase";
import ErrorMessage from "../../ui/ErrorMessage";

interface GeneratedSlide {
  id: string;
  type:
    | "menu"
    | "fact"
    | "deal"
    | "welcome"
    | "promo"
    | "quote"
    | "hours"
    | "image"
    | "custom";
  title: string;
  content: string;
  emoji: string;
  gradient: string;
  items?: string[];
  price?: string;
}

interface AiAllInOneWizardProps {
  onComplete: (slides: GeneratedSlide[]) => void;
  onBack: () => void;
}

export default function AiAllInOneWizard({
  onComplete,
  onBack,
}: AiAllInOneWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState<GeneratedSlide[]>([]);
  const [selectedSlides, setSelectedSlides] = useState<string[]>([]);
  const defaultSettings: SlideshowSettings = {
    defaultDuration: 6000,
    duration: 6000,
    transition: "fade",
    transitionDuration: 500,
    backgroundMusic: "",
    musicVolume: 1,
    musicLoop: true,
    autoPlay: true,
    showControls: true,
    showProgress: true,
    loopSlideshow: true,
    shuffleSlides: false,
    aspectRatio: "16:9",
    quality: "high",
  };
  const [settings, setSettings] = useState<SlideshowSettings>(defaultSettings);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [slideshowName, setSlideshowName] = useState("");
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Helper function to get authenticated headers with token refresh
  const getAuthHeaders = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
        throw new Error("Authentication failed");
      }

      if (!session?.access_token) {
        throw new Error("No valid session");
      }

      // Check if token is about to expire (within 5 minutes)
      const tokenExpiry = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const fiveMinutes = 5 * 60;

      if (tokenExpiry && tokenExpiry - now < fiveMinutes) {
        console.log("Token expiring soon, refreshing...");
        const {
          data: { session: newSession },
          error: refreshError,
        } = await supabase.auth.refreshSession();

        if (refreshError || !newSession?.access_token) {
          throw new Error("Token refresh failed");
        }

        return {
          Authorization: `Bearer ${newSession.access_token}`,
          "Content-Type": "application/json",
        };
      }

      return {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };
    } catch (error) {
      console.error("Auth headers error:", error);
      // Redirect to login if authentication fails
      window.location.href = "/auth/signin";
      throw error;
    }
  };

  // Map AI-generated types to database-allowed types
  const mapSlideType = (aiType: string): string => {
    const typeMap: { [key: string]: string } = {
      welcome: "custom",
      fact: "quote",
      deal: "promo",
      menu: "menu",
      promo: "promo",
      quote: "quote",
      hours: "hours",
      image: "image",
      custom: "custom",
    };
    return typeMap[aiType] || "custom";
  };

  const generateSlides = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGenerationError(null);

    // Add instruction for AI to return emoji and gradient for each slide
    const enhancedPrompt = `${prompt}\n\nIMPORTANT: For each slide (menu, deal, fact, etc.), also suggest a suitable emoji and a beautiful background gradient (as a CSS linear-gradient string). Return the slide type, title, content, emoji, gradient, and any items/prices if relevant as JSON.`;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/slides/ai-all-in-one", {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: enhancedPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", response.status, errorData);
        throw new Error(
          `Failed to generate slides: ${errorData.error || response.statusText}`
        );
      }

      const slides = await response.json();

      // Map the types to database-allowed types
      const mappedSlides = slides.map((slide: any) => ({
        ...slide,
        type: mapSlideType(slide.type),
      }));

      setGeneratedSlides(mappedSlides);
      setSelectedSlides(mappedSlides.map((slide: any) => slide.id));
      setCurrentStep(2);
    } catch (e) {
      console.error("Generation error:", e);
      setGenerationError(
        `Failed to generate slides: ${
          e instanceof Error ? e.message : "Unknown error"
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSlideSelection = (slideId: string) => {
    setSelectedSlides((prev) =>
      prev.includes(slideId)
        ? prev.filter((id) => id !== slideId)
        : [...prev, slideId]
    );
  };

  const regenerateSlides = () => {
    setGeneratedSlides([]);
    setSelectedSlides([]);
    setCurrentStep(1);
  };

  const saveSlidesToDatabase = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const slidesToSave = generatedSlides.filter((slide) =>
        selectedSlides.includes(slide.id)
      );
      const headers = await getAuthHeaders();
      for (const [index, slide] of slidesToSave.entries()) {
        const payload = {
          name: slide.title,
          title: slide.title,
          type: slide.type,
          subtitle: slide.emoji, // Use emoji as subtitle for now
          content: {
            text: slide.content,
            items: slide.items || [],
            price: slide.price || null,
          },
          styling: {
            gradient: slide.gradient,
            emoji: slide.emoji,
          },
          duration: settings.duration,
          order_index: index,
          is_active: true,
          is_published: false,
        };
        const res = await fetch("/api/slides", {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to save slide");
        }
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        router.push("/client/slideshows");
      }, 1200);
    } catch (e: any) {
      setSaveError(e.message || "Failed to save slides");
    } finally {
      setIsSaving(false);
    }
  };

  const copySlideContent = (slide: GeneratedSlide) => {
    const content = `${slide.emoji} ${slide.title}\n\n${slide.content}${
      slide.items ? "\n\n" + slide.items.join("\n") : ""
    }`;
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <WizardStepper
        currentStep={currentStep - 1}
        steps={[
          { id: "generate", label: "Generate Content" },
          { id: "review", label: "Review & Select" },
          { id: "settings", label: "Settings" },
        ]}
        canGoNext={false}
        canGoBack={currentStep > 1}
        onNext={() => setCurrentStep(currentStep + 1)}
        onBack={() => setCurrentStep(currentStep - 1)}
        onComplete={saveSlidesToDatabase}
        isCreating={isSaving}
        createButtonText="Create Slideshow"
      />

      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI-Powered All-in-One Slideshow
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Describe your restaurant, menu, and specials. Our AI will create
              beautiful slides combining cultural facts, menu items, and
              promotional content.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Coming Soon!
              </h3>
              <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
                Our AI-powered slideshow generator is currently in development.
                We're working hard to bring you the most advanced restaurant
                display technology.
              </p>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-purple-700">
                  <strong>What's coming:</strong> One prompt → Complete
                  slideshow with cultural facts, menu items, special offers, and
                  beautiful designs.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Review Generated Slides
            </h2>
            <p className="text-xl text-gray-600">
              Select the slides you want to include in your slideshow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedSlides.map((slide) => (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  selectedSlides.includes(slide.id)
                    ? "ring-2 ring-purple-500"
                    : ""
                }`}
                onClick={() => toggleSlideSelection(slide.id)}
              >
                <div
                  className="h-32 flex items-center justify-center text-4xl"
                  style={{ background: slide.gradient }}
                >
                  {slide.emoji}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {slide.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copySlideContent(slide);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {slide.content}
                  </p>

                  {slide.items && (
                    <div className="space-y-1">
                      {slide.items.slice(0, 2).map((item, index) => (
                        <p key={index} className="text-xs text-gray-500">
                          • {item}
                        </p>
                      ))}
                      {slide.items.length > 2 && (
                        <p className="text-xs text-gray-400">
                          +{slide.items.length - 2} more items
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {slide.type}
                    </span>
                    {selectedSlides.includes(slide.id) && (
                      <Check className="w-5 h-5 text-purple-500" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={regenerateSlides}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              disabled={selectedSlides.length === 0}
              className="inline-flex items-center px-6 py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </motion.div>
      )}

      {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <SettingsPanel
            settings={settings}
            onSettingsChange={setSettings}
            slideshowName={slideshowName}
            onSlideshowNameChange={setSlideshowName}
          />
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={saveSlidesToDatabase}
              disabled={isSaving}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Slideshow
                </>
              )}
            </button>
          </div>
          {saveError && (
            <ErrorMessage
              message={saveError}
              onClose={() => setSaveError(null)}
              className="mt-4"
            />
          )}
          {saveSuccess && (
            <div className="text-purple-600 text-center font-semibold mt-4">
              Slideshow created successfully!
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
