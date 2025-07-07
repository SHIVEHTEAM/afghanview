import React, { useState } from "react";
import { Plus, Save, X, Sparkles, Loader2 } from "lucide-react";
import { MenuItem, MenuItemFormProps } from "./types";
import { MenuAIService } from "./ai-service";
import { menuCategories } from "./constants";

export default function MenuItemForm({
  item,
  onSave,
  onCancel,
  isEditing = false,
}: MenuItemFormProps) {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: item.name || "",
    price: item.price || 0,
    description: item.description || "",
    category: item.category || "Main Course",
    isPopular: item.isPopular || false,
    dietaryInfo: item.dietaryInfo || [],
    image: item.image || "",
  });

  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    item.image || null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.price) {
      const itemToSave = {
        id: item.id || Date.now().toString(),
        name: formData.name,
        price: formData.price,
        description: formData.description || "",
        category: formData.category || "Main Course",
        isPopular: formData.isPopular || false,
        dietaryInfo: formData.dietaryInfo || [],
        image: formData.image || "",
      };
      onSave(itemToSave);
    }
  };

  const generateDescription = async () => {
    if (!formData.name) return;

    setIsGeneratingDescription(true);
    try {
      const description = await MenuAIService.generateItemDescription(
        formData.name,
        formData.category || "Main Course"
      );
      setFormData({ ...formData, description });
    } catch (error) {
      console.error("Failed to generate description:", error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const suggestPrice = async () => {
    if (!formData.name) return;

    setIsSuggestingPrice(true);
    try {
      const price = await MenuAIService.suggestPrice(
        formData.name,
        formData.category || "Main Course"
      );
      setFormData({ ...formData, price: parseFloat(price) || 0 });
    } catch (error) {
      console.error("Failed to suggest price:", error);
    } finally {
      setIsSuggestingPrice(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image: "" });
  };

  const toggleDietaryInfo = (dietaryType: string) => {
    const current = formData.dietaryInfo || [];
    const updated = current.includes(dietaryType)
      ? current.filter((item) => item !== dietaryType)
      : [...current, dietaryType];
    setFormData({ ...formData, dietaryInfo: updated });
  };

  const dietaryOptions = [
    { key: "Vegetarian", label: "🥬 Vegetarian", color: "text-purple-500" },
    { key: "Vegan", label: "🌱 Vegan", color: "text-purple-600" },
    { key: "Spicy", label: "🌶️ Spicy", color: "text-pink-500" },
    { key: "Gluten-Free", label: "🌾 Gluten-Free", color: "text-yellow-600" },
    { key: "Halal", label: "☪️ Halal", color: "text-blue-500" },
    { key: "Kosher", label: "✡️ Kosher", color: "text-purple-500" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Kabuli Pulao"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price *
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="e.g., 15.99"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
              step="0.01"
              required
            />
            <button
              type="button"
              onClick={suggestPrice}
              disabled={!formData.name || isSuggestingPrice}
              className="px-3 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="AI Price Suggestion"
            >
              {isSuggestingPrice ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <div className="flex gap-2">
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="e.g., Traditional Afghan rice dish with lamb, carrots, and raisins"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
            />
            <button
              type="button"
              onClick={generateDescription}
              disabled={!formData.name || isGeneratingDescription}
              className="px-3 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed self-start"
              title="AI Description Generation"
            >
              {isGeneratingDescription ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {menuCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Popular Item
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, isPopular: !formData.isPopular })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isPopular ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isPopular ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="ml-2 text-sm text-gray-600">
              {formData.isPopular ? "Marked as popular" : "Not popular"}
            </span>
          </div>
        </div>

        {/* Image Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Food Image
          </label>
          <div className="space-y-3">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Food preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-pink-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id={`image-upload-${item.id}`}
                />
                <label
                  htmlFor={`image-upload-${item.id}`}
                  className="cursor-pointer text-blue-500 hover:text-blue-600"
                >
                  <div className="text-gray-500 mb-2">
                    <svg
                      className="mx-auto h-12 w-12"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">Click to upload food image</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Dietary Options */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dietary Information
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {dietaryOptions.map((option) => (
              <label key={option.key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.dietaryInfo?.includes(option.key) || false}
                  onChange={() => toggleDietaryInfo(option.key)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className={`ml-2 text-sm ${option.color}`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isEditing ? "Update Item" : "Add Item"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}
