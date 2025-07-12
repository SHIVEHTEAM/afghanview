import React, { useState } from "react";
import { Loader2, Zap, RefreshCw, ArrowRight, Info } from "lucide-react";
import { Fact, TajikCulturePrompt } from "./types";
import { AFGHAN_CULTURE_PROMPTS, DEFAULT_SETTINGS } from "./constants";
import { generateFact } from "./utils";
import PromptSelector from "./PromptSelector";
import FactCard from "./FactCard";
import { useToastNotifications } from "../../../lib/toast-utils";

interface FactGenerationStepProps {
  onComplete: (facts: Fact[], settings: any) => void;
  onBack: () => void;
}

export default function FactGenerationStep({
  onComplete,
  onBack,
}: FactGenerationStepProps) {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [currentFact, setCurrentFact] = useState<Fact | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [copiedFact, setCopiedFact] = useState<string | null>(null);
  const [selectedFacts, setSelectedFacts] = useState<Set<string>>(new Set());
  const toast = useToastNotifications();

  const handlePromptSelected = (prompt: string) => {
    setSelectedPrompt(prompt);
  };

  const handleGenerateFact = async () => {
    if (!selectedPrompt) {
      toast.showWarning("Please select or enter a prompt.");
      return;
    }
    setIsGenerating(true);
    try {
      // Enhance prompt for poetry/quote/language requests
      let enhancedPrompt = selectedPrompt;
      const lowerPrompt = selectedPrompt.toLowerCase();
      // Detect if user wants a poem or quote
      const wantsPoem =
        /poem|شعر|شاعر|شعری|شاعری|شعر فارسی|شعر دری|شعر پشتو|شعر از/i.test(
          selectedPrompt
        );
      const wantsQuote =
        /quote|نقل قول|سخن|گفته|فرمایش|فرمایشات|قول|حکمت|مقوله/i.test(
          selectedPrompt
        );
      // Detect if user wants a specific language
      const wantsPersian = /persian|فارسی|dari|دری/i.test(selectedPrompt);
      const wantsPashto = /pashto|پشتو/i.test(selectedPrompt);
      // If poem or quote and language is specified, add strict instructions
      if ((wantsPoem || wantsQuote) && (wantsPersian || wantsPashto)) {
        if (wantsPersian) {
          enhancedPrompt += `\n\nIMPORTANT: Only answer with the actual poem or quote in Persian (فارسی) script. Do NOT translate to English. Do NOT summarize. Only output the poem or quote itself. If you don't know, say 'I don't know.'`;
        } else if (wantsPashto) {
          enhancedPrompt += `\n\nIMPORTANT: Only answer with the actual poem or quote in Pashto (پشتو) script. Do NOT translate to English. Do NOT summarize. Only output the poem or quote itself. If you don't know, say 'I don't know.'`;
        }
      } else if (wantsPoem || wantsQuote) {
        // If poem/quote but no language, ask for original language
        enhancedPrompt += `\n\nIMPORTANT: Only answer with the actual poem or quote in its original language/script. Do NOT translate to English. Do NOT summarize. Only output the poem or quote itself. If you don't know, say 'I don't know.'`;
      } else if (wantsPersian) {
        // If just Persian requested
        enhancedPrompt += `\n\nIMPORTANT: Only answer in Persian (فارسی) script. Do NOT translate to English. If you don't know, say 'I don't know.'`;
      } else if (wantsPashto) {
        // If just Pashto requested
        enhancedPrompt += `\n\nIMPORTANT: Only answer in Pashto (پشتو) script. Do NOT translate to English. If you don't know, say 'I don't know.'`;
      }
      const data = await generateFact(enhancedPrompt);
      const newFact: Fact = {
        id: Date.now().toString(),
        text: data.fact,
        category: "AI Fact",
        timestamp: new Date(),
        prompt: selectedPrompt,
        backgroundColor: data.backgroundColor || "#1f2937",
        fontColor: "#ffffff",
        fontSize: 28,
        emoji: data.emoji,
      };
      setCurrentFact(newFact);
      setFacts((prev) => [newFact, ...prev]);
      setSelectedFacts((prev) => new Set([...prev, newFact.id]));
    } catch (error: any) {
      // Handle apologetic responses specifically
      if (error.message?.includes("apologetic") || error.status === 422) {
        toast.showWarning(
          "The AI couldn't generate a good response for this prompt. Please try a different topic or write a custom prompt."
        );
      } else {
        toast.showError(
          `Error generating fact: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickGenerate = async () => {
    setIsGenerating(true);

    // List of fallback prompts that are more general and likely to work
    const fallbackPrompts = [
      "Share an interesting fact about Afghan culture",
      "Tell a story about Afghan hospitality",
      "Describe a traditional Afghan dish",
      "Share a famous Afghan proverb",
      "Describe a beautiful place in Afghanistan",
      "Tell about Afghan music or poetry",
      "Share a fact about Afghan history",
      "Describe an Afghan tradition or celebration",
    ];

    for (let i = 0; i < fallbackPrompts.length; i++) {
      try {
        const data = await generateFact(fallbackPrompts[i]);
        const newFact: Fact = {
          id: Date.now().toString() + i,
          text: data.fact,
          category: "AI Fact",
          timestamp: new Date(),
          prompt: fallbackPrompts[i],
          backgroundColor: data.backgroundColor || "#1f2937",
          fontColor: "#ffffff",
          fontSize: 28,
          emoji: data.emoji,
        };
        setCurrentFact(newFact);
        setFacts((prev) => [newFact, ...prev]);
        setSelectedFacts((prev) => new Set([...prev, newFact.id]));
        break; // Success! Stop trying
      } catch (error: any) {
        // If this is the last attempt, show an error
        if (i === fallbackPrompts.length - 1) {
          toast.showError(
            "Could not generate any facts. Please try again later or use a custom prompt."
          );
        }
        // Otherwise, continue to the next prompt
        continue;
      }
    }

    setIsGenerating(false);
  };

  const handleFactToggle = (factId: string) => {
    const newSelected = new Set(selectedFacts);
    if (newSelected.has(factId)) {
      newSelected.delete(factId);
    } else {
      newSelected.add(factId);
    }
    setSelectedFacts(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedFacts(new Set(facts.map((f) => f.id)));
  };

  const handleSelectNone = () => {
    setSelectedFacts(new Set());
  };

  const handleContinue = () => {
    const selectedFactsArray = facts.filter((f) => selectedFacts.has(f.id));

    if (selectedFactsArray.length === 0) {
      // If no facts are selected, use all generated facts
      if (facts.length > 0) {
        onComplete(facts, DEFAULT_SETTINGS);
      } else {
        // If no facts generated, show a message
        toast.showError(
          "Please generate at least one fact before continuing to settings."
        );
        return;
      }
    } else {
      onComplete(selectedFactsArray, DEFAULT_SETTINGS);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            AI Facts Slideshow Creator
          </h2>
          <div className="text-sm text-gray-600">
            {selectedFacts.size} facts selected
          </div>
        </div>
      </div>

      {/* Main content - Compact layout */}
      <div className="flex-1 flex">
        {/* Left Panel - Compact prompts */}
        <div className="w-1/2 border-r border-gray-200 p-4">
          <div className="mb-4">
            <h3 className="font-medium text-gray-800 mb-3">
              Choose an Afghan Culture Topic
            </h3>
            <PromptSelector onPromptSelected={handlePromptSelected} />
          </div>

          {/* Generate Buttons */}
          <div className="space-y-2 mb-4">
            <button
              onClick={handleGenerateFact}
              disabled={isGenerating || !selectedPrompt}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-lg font-medium hover:from-amber-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate Fact
                </>
              )}
            </button>

            <button
              onClick={handleQuickGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Trying different prompts...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Quick Generate (Auto-retry)
                </>
              )}
            </button>
          </div>

          {/* Progress */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-sm text-gray-500">{facts.length}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((facts.length / 10) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">How it works:</p>
                <p>1. Choose a topic or write custom prompt</p>
                <p>2. Click "Generate Fact" for specific prompts</p>
                <p>3. Use "Quick Generate" to auto-try different topics</p>
                <p>4. Select the facts you want to include</p>
                <p>5. Click "Continue to Settings" when ready</p>
                <p className="mt-2 text-blue-700 font-medium">
                  💡 Tip: If a prompt fails, try "Quick Generate" or write a
                  custom prompt!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Compact facts display */}
        <div className="w-1/2 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">
              Generated Facts ({facts.length}) - FIXED SCROLLING
            </h3>
            {facts.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-amber-600 hover:text-amber-700"
                >
                  Select All
                </button>
                <button
                  onClick={handleSelectNone}
                  className="text-xs text-gray-600 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Compact facts grid */}
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
            {currentFact && (
              <div className="border-2 border-amber-500 rounded-lg p-3 bg-amber-50">
                <div className="text-sm font-medium text-amber-800 mb-1">
                  {currentFact.category}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {currentFact.text.substring(0, 100)}...
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedFacts.has(currentFact.id)}
                      onChange={() => handleFactToggle(currentFact.id)}
                      className="rounded"
                    />
                    Select
                  </label>
                </div>
              </div>
            )}

            {facts.slice(1).map((fact) => (
              <div
                key={fact.id}
                className="border border-gray-200 rounded-lg p-3"
              >
                <div className="text-sm font-medium text-gray-800 mb-1">
                  {fact.category}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {fact.text.substring(0, 100)}...
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedFacts.has(fact.id)}
                      onChange={() => handleFactToggle(fact.id)}
                      className="rounded"
                    />
                    Select
                  </label>
                </div>
              </div>
            ))}

            {facts.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <span className="text-4xl">✨</span>
                <p className="text-sm font-medium mb-1">
                  No facts generated yet
                </p>
                <p className="text-xs">
                  Choose a topic and generate your first fact!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Always visible */}
      <div
        className="p-4 border-t border-gray-200 bg-gray-50"
        style={{ position: "relative", zIndex: 10 }}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedFacts.size} facts selected • {facts.length}/10 generated
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all shadow-sm"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
            >
              Continue to Settings
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
