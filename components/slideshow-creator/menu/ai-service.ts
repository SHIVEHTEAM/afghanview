import { MenuItem } from "./types";

export interface AISuggestionRequest {
  category?: string;
  cuisine?: string;
  priceRange?: string;
  dietary?: string[];
}

export interface AISuggestionResponse {
  items: MenuItem[];
  success: boolean;
  error?: string;
}

export class MenuAIService {
  private static async callAI(prompt: string): Promise<string> {
    try {
      const response = await fetch("/api/facts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          language: "en",
          group: "general",
        }),
      });

      if (!response.ok) {
        throw new Error("AI service request failed");
      }

      const data = await response.json();
      return data.fact || data.text || "";
    } catch (error) {
      console.error("AI service error:", error);
      throw error;
    }
  }

  static async generateMenuSuggestions(
    request: AISuggestionRequest
  ): Promise<AISuggestionResponse> {
    try {
      const { category, cuisine = "Afghan", priceRange, dietary } = request;

      let prompt = `Generate 3-5 authentic ${cuisine} menu items`;

      if (category) {
        prompt += ` in the ${category} category`;
      }

      if (priceRange) {
        prompt += ` with prices around ${priceRange}`;
      }

      if (dietary && dietary.length > 0) {
        prompt += ` that are ${dietary.join(" and ")}`;
      }

      prompt += `. For each item provide: name, description, price, and indicate if it's spicy, vegetarian, or popular. Format as JSON array with properties: name, description, price, category, spicy (boolean), vegetarian (boolean), popular (boolean).`;

      const response = await this.callAI(prompt);

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(response);
        if (Array.isArray(parsed)) {
          const items: MenuItem[] = parsed.map((item, index) => ({
            id: `ai-${Date.now()}-${index}`,
            name: item.name || "",
            description: item.description || "",
            price: parseFloat(item.price) || 12.99,
            category: item.category || category || "Main Course",
            isPopular: item.popular || false,
          }));

          return { items, success: true };
        }
      } catch (parseError) {
        // If JSON parsing fails, try to extract menu items from text
        return this.parseMenuFromText(response, category);
      }

      return { items: [], success: false, error: "Invalid AI response format" };
    } catch (error) {
      return {
        items: [],
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async generateItemDescription(
    itemName: string,
    category: string
  ): Promise<string> {
    try {
      const prompt = `Write a brief, appetizing description for a ${category} dish called "${itemName}". Keep it under 100 words and focus on taste, ingredients, and cultural significance if it's an Afghan dish.`;

      const response = await this.callAI(prompt);
      return response.trim();
    } catch (error) {
      console.error("Error generating description:", error);
      return "";
    }
  }

  static async suggestPrice(
    itemName: string,
    category: string
  ): Promise<string> {
    try {
      const prompt = `Suggest a reasonable price for a ${category} dish called "${itemName}" in USD. Consider it's a restaurant dish. Return only the price number (e.g., 15.99).`;

      const response = await this.callAI(prompt);
      const price = response.replace(/[^0-9.]/g, "");
      return price || "12.99";
    } catch (error) {
      console.error("Error suggesting price:", error);
      return "12.99";
    }
  }

  private static parseMenuFromText(
    text: string,
    category?: string
  ): AISuggestionResponse {
    const items: MenuItem[] = [];
    const lines = text.split("\n").filter((line) => line.trim());

    for (let i = 0; i < lines.length; i += 3) {
      if (i + 2 < lines.length) {
        const nameLine = lines[i];
        const descLine = lines[i + 1];
        const priceLine = lines[i + 2];

        const name = nameLine.replace(/^\d+\.\s*/, "").trim();
        const description = descLine.trim();
        const price = parseFloat(priceLine.replace(/[^0-9.]/g, "")) || 12.99;

        if (name) {
          items.push({
            id: `ai-${Date.now()}-${i}`,
            name,
            description,
            price,
            category: category || "Main Course",
            isPopular: false,
          });
        }
      }
    }

    return { items, success: items.length > 0 };
  }
}
