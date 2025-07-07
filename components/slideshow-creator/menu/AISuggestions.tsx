import React, { useState } from "react";
import { Sparkles, Loader2, Plus, X } from "lucide-react";
import { MenuItem, AISuggestionsProps } from "./types";
import { MenuAIService, AISuggestionRequest } from "./ai-service";
import { menuCategories } from "./constants";

export default function AISuggestions({
  onSuggestionSelect,
  category,
}: AISuggestionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<MenuItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [request, setRequest] = useState<AISuggestionRequest>({
    category: category || "Main Course",
    cuisine: "Afghan",
    priceRange: "12-25",
    dietary: [],
  });

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await MenuAIService.generateMenuSuggestions(request);
      if (response.success) {
        setSuggestions(response.items);
      } else {
        console.error("AI suggestion error:", response.error);
      }
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = (item: MenuItem) => {
    onSuggestionSelect(item);
    setSuggestions([]);
    setShowForm(false);
  };

  const dietaryOptions = [
    { id: "vegetarian", label: "Vegetarian", icon: "🥬" },
    { id: "spicy", label: "Spicy", icon: "🌶️" },
    { id: "popular", label: "Popular", icon: "⭐" },
  ];

  return (
    <div className="space-y-4">
      {!showForm ? (
        <div
          className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-dashed border-purple-200 rounded-xl p-6 hover:border-purple-300 hover:from-purple-100 hover:to-blue-100 transition-all group cursor-pointer"
          onClick={() => setShowForm(true)}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Sparkles className="w-6 h-6 text-purple-600 group-hover:text-purple-700" />
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-purple-800 group-hover:text-purple-900 text-lg">
                Get AI Menu Suggestions
              </h4>
              <p className="text-sm text-purple-600 group-hover:text-purple-700">
                Let AI help you create authentic Afghan menu items
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-purple-600">
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="font-medium">Smart Suggestions</div>
              <div>Authentic dishes</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="font-medium">Auto Descriptions</div>
              <div>Appetizing text</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="font-medium">Price Guidance</div>
              <div>Market rates</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-purple-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Menu Suggestions
            </h4>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 text-purple-500 hover:text-purple-700 hover:bg-purple-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1">
                Category
              </label>
              <select
                value={request.category}
                onChange={(e) =>
                  setRequest({ ...request, category: e.target.value })
                }
                className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {menuCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1">
                Cuisine
              </label>
              <select
                value={request.cuisine}
                onChange={(e) =>
                  setRequest({ ...request, cuisine: e.target.value })
                }
                className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Afghan">Afghan</option>
                <option value="Persian">Persian</option>
                <option value="Middle Eastern">Middle Eastern</option>
                <option value="International">International</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1">
                Price Range
              </label>
              <select
                value={request.priceRange}
                onChange={(e) =>
                  setRequest({ ...request, priceRange: e.target.value })
                }
                className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="8-15">$8-15 (Budget)</option>
                <option value="12-25">$12-25 (Mid-range)</option>
                <option value="20-40">$20-40 (Premium)</option>
                <option value="35-60">$35-60 (Luxury)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1">
                Dietary Preferences
              </label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={request.dietary?.includes(option.id)}
                      onChange={(e) => {
                        const newDietary = e.target.checked
                          ? [...(request.dietary || []), option.id]
                          : (request.dietary || []).filter(
                              (d) => d !== option.id
                            );
                        setRequest({ ...request, dietary: newDietary });
                      }}
                      className="w-3 h-3 text-purple-500"
                    />
                    <span className="text-sm">
                      {option.icon} {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={generateSuggestions}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Suggestions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Menu Items
              </>
            )}
          </button>

          {suggestions.length > 0 && (
            <div className="mt-4 space-y-2">
              <h5 className="font-medium text-purple-800">AI Suggestions:</h5>
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-300 cursor-pointer transition-colors"
                  onClick={() => handleSuggestionSelect(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {item.name}
                      </div>
                      {item.description && (
                        <div className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-500">
                          {item.category}
                        </span>
                        <span className="font-bold text-green-600">
                          ${item.price}
                        </span>
                        {item.isPopular && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            ⭐ Popular
                          </span>
                        )}
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
