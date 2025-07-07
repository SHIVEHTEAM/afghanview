import React, { useState, useMemo } from "react";
import {
  promptBank,
  FactCategory,
  FactLanguage,
  FactNationality,
  PromptEntry,
} from "./prompts";

interface PromptSelectorProps {
  onPromptSelected: (prompt: string) => void;
}

const languages: FactLanguage[] = [
  "Dari",
  "Pashto",
  "Uzbeki",
  "Hazaragi",
  "Turkmeni",
  "Pashai",
  "Balochi",
  "English",
];
const nationalities: FactNationality[] = [
  "Pashtun",
  "Tajik",
  "Hazara",
  "Uzbek",
  "Turkmen",
  "Nuristani",
  "Aimaq",
  "Baloch",
  "Pashai",
  "Other",
];
const categories: FactCategory[] = Object.keys(promptBank) as FactCategory[];

export default function PromptSelector({
  onPromptSelected,
}: PromptSelectorProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<FactCategory>("Poetry");
  const [selectedLanguage, setSelectedLanguage] = useState<
    FactLanguage | "All"
  >("All");
  const [selectedNationality, setSelectedNationality] = useState<
    FactNationality | "All"
  >("All");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedPromptText, setSelectedPromptText] = useState<string>("");

  const filteredPrompts = useMemo(() => {
    let prompts = promptBank[selectedCategory] || [];
    if (selectedLanguage !== "All") {
      prompts = prompts.filter((p) => p.language === selectedLanguage);
    }
    if (selectedNationality !== "All") {
      prompts = prompts.filter((p) => p.nationality === selectedNationality);
    }
    return prompts;
  }, [selectedCategory, selectedLanguage, selectedNationality]);

  const handleRandomPrompt = () => {
    if (filteredPrompts.length > 0) {
      const random =
        filteredPrompts[Math.floor(Math.random() * filteredPrompts.length)];
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
    <div className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">Subject / Category:</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as FactCategory)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm mb-1">Language:</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedLanguage}
            onChange={(e) =>
              setSelectedLanguage(e.target.value as FactLanguage | "All")
            }
          >
            <option value="All">All</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1">Nationality:</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedNationality}
            onChange={(e) =>
              setSelectedNationality(e.target.value as FactNationality | "All")
            }
          >
            <option value="All">All</option>
            {nationalities.map((nat) => (
              <option key={nat} value={nat}>
                {nat}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
          onClick={handleRandomPrompt}
          disabled={filteredPrompts.length === 0}
        >
          Random Prompt
        </button>
        {selectedPromptText && (
          <span className="text-sm text-gray-600">{selectedPromptText}</span>
        )}
      </div>
      <div>
        <label className="block font-semibold mb-1">
          Or enter a custom prompt:
        </label>
        <input
          className="w-full p-2 border rounded mb-2"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Write your own prompt..."
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleCustomPrompt}
          disabled={!customPrompt.trim()}
        >
          Use Custom Prompt
        </button>
      </div>
    </div>
  );
}
