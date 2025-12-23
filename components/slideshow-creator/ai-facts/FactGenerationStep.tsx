import React, { useState } from "react";
import { Loader2, Zap, RefreshCw, ArrowRight, Info, CheckCircle, Flame } from "lucide-react";
import { Fact } from "./types";
import { DEFAULT_SETTINGS } from "./constants";
import { generateFact } from "./utils";
import PromptSelector from "./PromptSelector";
import { useToastNotifications } from "../../../lib/toast-utils";

interface FactGenerationStepProps {
  onComplete: (facts: Fact[], settings: Record<string, unknown>) => void;
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
  const [selectedFacts, setSelectedFacts] = useState<Set<string>>(new Set());
  const toast = useToastNotifications();

  const handlePromptSelected = (prompt: string) => { setSelectedPrompt(prompt); };

  const handleGenerateFact = async () => {
    if (!selectedPrompt) { toast.showWarning("Input required."); return; }
    setIsGenerating(true);
    try {
      const data = await generateFact(selectedPrompt);
      const newFact: Fact = {
        id: Date.now().toString(),
        text: data.fact,
        category: "AI Insight",
        timestamp: new Date(),
        prompt: selectedPrompt,
        backgroundColor: "#000000",
        fontColor: "#ffffff",
        fontSize: 28,
        emoji: data.emoji,
      };
      setCurrentFact(newFact);
      setFacts((prev) => [newFact, ...prev]);
      setSelectedFacts((prev) => new Set([...prev, newFact.id]));
    } catch (error: unknown) {
      toast.showError("Generation Failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    const selected = facts.filter((f) => selectedFacts.has(f.id));
    if (selected.length === 0) {
      if (facts.length > 0) onComplete(facts, DEFAULT_SETTINGS);
      else toast.showError("No data generated.");
    } else {
      onComplete(selected, DEFAULT_SETTINGS);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-10 border-b border-black/5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black mb-1">AI Intelligence Pipeline</h2>
          <p className="text-sm text-black/40">Synthesizing cultural and historical insights</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
          {selectedFacts.size} Units Synchronized
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Control Center */}
        <div className="w-[450px] border-r border-black/5 p-10 overflow-y-auto custom-scrollbar">
          <PromptSelector onPromptSelected={handlePromptSelected} />

          <div className="mt-10 space-y-4">
            <button
              onClick={handleGenerateFact}
              disabled={isGenerating || !selectedPrompt}
              className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-black/90 transition-all disabled:opacity-20 flex items-center justify-center gap-4"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Flame className="w-5 h-5" />}
              {isGenerating ? "Synthesizing..." : "Initialize Synthesis"}
            </button>

            <div className="p-6 bg-gray-50 rounded-2xl border border-black/5 flex items-start gap-4">
              <Info className="w-5 h-5 text-black/20 shrink-0 mt-0.5" />
              <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest leading-relaxed">
                Synthesis protocol analyzes patterns to generate validated cultural insights for display modules.
              </p>
            </div>
          </div>
        </div>

        {/* Output Stream */}
        <div className="flex-1 p-10 bg-gray-50/30 overflow-y-auto custom-scrollbar">
          <h3 className="text-[10px] font-black text-black/20 uppercase tracking-[0.2em] mb-8">Generated Data Stream</h3>

          <div className="space-y-6">
            {facts.length === 0 && (
              <div className="py-40 text-center">
                <div className="w-20 h-20 bg-white border border-black/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/[0.02]">
                  <Zap className="w-8 h-8 text-black/10" />
                </div>
                <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Awaiting Command Input...</p>
              </div>
            )}

            {facts.map((fact) => (
              <div key={fact.id} className={`p-8 rounded-3xl border transition-all ${selectedFacts.has(fact.id) ? "bg-white border-black shadow-2xl" : "bg-white border-black/5 opacity-50"}`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="inline-flex items-center px-3 py-1 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-lg">
                    {fact.category}
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={selectedFacts.has(fact.id)} onChange={() => {
                      const newS = new Set(selectedFacts);
                      if (newS.has(fact.id)) newS.delete(fact.id); else newS.add(fact.id);
                      setSelectedFacts(newS);
                    }} className="hidden" />
                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${selectedFacts.has(fact.id) ? "bg-black border-black text-white" : "bg-white border-black/10 text-transparent"}`}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </label>
                </div>
                <p className="text-lg font-bold text-black leading-relaxed">{fact.text}</p>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-[8px] font-bold text-black/20 uppercase tracking-widest">Timestamp: {new Date(fact.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 border-t border-black/5 flex items-center justify-between">
        <button onClick={onBack} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors">Abort</button>
        <button onClick={handleContinue} className="px-10 py-4 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black/90 transition-all flex items-center gap-4">
          Lock Manifest & Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
