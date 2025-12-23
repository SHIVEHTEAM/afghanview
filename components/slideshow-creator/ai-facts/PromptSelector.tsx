import React, { useState, useMemo } from "react";
import {
  promptBank,
  FactCategory,
  FactLanguage,
  FactNationality,
} from "./prompts";

interface PromptSelectorProps {
  onPromptSelected: (prompt: string) => void;
}

const languages: FactLanguage[] = ["Dari", "Pashto", "Uzbeki", "Hazaragi", "Turkmeni", "Pashai", "Balochi", "English"];
const nationalities: FactNationality[] = ["Pashtun", "Tajik", "Hazara", "Uzbek", "Turkmen", "Nuristani", "Aimaq", "Baloch", "Pashai", "Other"];
const categories: FactCategory[] = Object.keys(promptBank) as FactCategory[];

export default function PromptSelector({ onPromptSelected }: PromptSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<FactCategory>("Poetry");
  const [selectedLanguage, setSelectedLanguage] = useState<FactLanguage | "All">("All");
  const [selectedNationality, setSelectedNationality] = useState<FactNationality | "All">("All");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedPromptText, setSelectedPromptText] = useState<string>("");

  const filteredPrompts = useMemo(() => {
    let prompts = promptBank[selectedCategory] || [];
    if (selectedLanguage !== "All") prompts = prompts.filter((p) => p.language === selectedLanguage);
    if (selectedNationality !== "All") prompts = prompts.filter((p) => p.nationality === selectedNationality);
    return prompts;
  }, [selectedCategory, selectedLanguage, selectedNationality]);

  const handleRandomPrompt = () => {
    if (filteredPrompts.length > 0) {
      const random = filteredPrompts[Math.floor(Math.random() * filteredPrompts.length)];
      setSelectedPromptText(random.prompt);
      onPromptSelected(random.prompt);
    }
  };

  const handleCustomPrompt = () => {
    if (customPrompt.trim()) {
      setSelectedPromptText(customPrompt.trim());
      onPromptSelected(customPrompt.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-2xl border border-black/5">
        <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-3">Topic / Subject</label>
        <select
          className="w-full px-4 py-3 bg-white border border-black/5 rounded-xl outline-none focus:border-black/20 font-bold text-sm"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as FactCategory)}
        >
          {categories.map((cat) => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-3">Language</label>
          <select
            className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white font-bold text-xs"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as any)}
          >
            <option value="All">ANY LANGUAGE</option>
            {languages.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-3">Origin</label>
          <select
            className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white font-bold text-xs"
            value={selectedNationality}
            onChange={(e) => setSelectedNationality(e.target.value as any)}
          >
            <option value="All">ANY ORIGIN</option>
            {nationalities.map((n) => <option key={n} value={n}>{n.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="px-6 py-3 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black/90 transition-all shadow-lg shadow-black/10"
          onClick={handleRandomPrompt}
          disabled={filteredPrompts.length === 0}
        >
          System Select
        </button>
        {selectedPromptText && (
          <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest truncate max-w-[200px]">{selectedPromptText}</span>
        )}
      </div>

      <div className="pt-6 border-t border-black/5">
        <label className="block text-[10px] font-black text-black/40 uppercase tracking-widest mb-3">Custom Command</label>
        <div className="flex gap-2">
          <input
            className="flex-1 px-6 py-4 bg-gray-50 border border-black/5 rounded-xl outline-none focus:bg-white font-medium text-sm"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Input raw instructions..."
          />
          <button
            className="px-6 bg-white text-black border border-black/5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all"
            onClick={handleCustomPrompt}
            disabled={!customPrompt.trim()}
          >
            Inject
          </button>
        </div>
      </div>
    </div>
  );
}
