export interface Property {
  id: string;
  name: string;           // Property name/title
  address: string;         // Full address
  price: string;          // Listing price (string to handle currency formatting flexibility or number if strict)
  bedrooms: string;       // Number of bedrooms
  bathrooms: string;      // Number of bathrooms
  squareFeet: string;     // Square footage
  propertyType: string;   // "house", "condo", "apartment", etc.
  description: string;     // Property description
  images: Array<File | string>;        // Array of image URLs or Files
  agentName?: string;     // Listing agent
  agentPhone?: string;    // Agent contact
  virtualTourUrl?: string; // Optional virtual tour link
  features?: string[];     // ["Garage", "Pool", "Fireplace"]
  aiInsights?: string;     // AI generated neighborhood insights
}

export interface PropertyTheme {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  priceColor: string;
  fontFamily: string;
}

export interface PropertyLayout {
  id: string;
  name: string;
  description: string;
  type: "single" | "grid" | "featured";
}

export interface PropertySlideshowWizardProps {
  step?: number;
  formData?: any;
  updateFormData?: (data: any) => void;
  onComplete?: (data: any) => void;
  isEditing?: boolean;
  initialData?: any;
}
