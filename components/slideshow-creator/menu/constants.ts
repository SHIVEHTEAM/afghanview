import { MenuTheme, MenuLayout } from "./types";

export const menuThemes: MenuTheme[] = [
  {
    id: "elegant",
    name: "Elegant",
    backgroundColor: "#1a1a1a",
    textColor: "#ffffff",
    accentColor: "#d4af37",
    priceColor: "#d4af37",
    descriptionColor: "#cccccc",
    fontFamily: "serif",
  },
  {
    id: "modern",
    name: "Modern",
    backgroundColor: "#2d3748",
    textColor: "#ffffff",
    accentColor: "#38b2ac",
    priceColor: "#38b2ac",
    descriptionColor: "#e2e8f0",
    fontFamily: "sans-serif",
  },
  {
    id: "warm",
    name: "Warm",
    backgroundColor: "#8b4513",
    textColor: "#ffffff",
    accentColor: "#fbbf24",
    priceColor: "#fbbf24",
    descriptionColor: "#fef3c7",
    fontFamily: "serif",
  },
  {
    id: "fresh",
    name: "Fresh",
    backgroundColor: "#065f46",
    textColor: "#ffffff",
    accentColor: "#10b981",
    priceColor: "#10b981",
    descriptionColor: "#d1fae5",
    fontFamily: "sans-serif",
  },
  {
    id: "vibrant",
    name: "Vibrant",
    backgroundColor: "#7c2d12",
    textColor: "#ffffff",
    accentColor: "#f97316",
    priceColor: "#f97316",
    descriptionColor: "#fed7aa",
    fontFamily: "sans-serif",
  },
  {
    id: "afghan",
    name: "Afghan Traditional",
    backgroundColor: "#8B4513",
    textColor: "#ffffff",
    accentColor: "#DAA520",
    priceColor: "#DAA520",
    descriptionColor: "#F5DEB3",
    fontFamily: "serif",
  },
  {
    id: "minimal",
    name: "Minimal",
    backgroundColor: "#f8fafc",
    textColor: "#1e293b",
    accentColor: "#64748b",
    priceColor: "#64748b",
    descriptionColor: "#64748b",
    fontFamily: "sans-serif",
  },
];

export const layoutOptions: MenuLayout[] = [
  { id: "centered", name: "Centered", description: "Classic centered layout" },
  {
    id: "left-aligned",
    name: "Left Aligned",
    description: "Modern left-aligned design",
  },
  {
    id: "card",
    name: "Card Style",
    description: "Card-based layout with borders",
  },
  { id: "minimal", name: "Minimal", description: "Clean and minimal design" },
  {
    id: "elegant",
    name: "Elegant",
    description: "Sophisticated layout with decorative elements",
  },
  {
    id: "modern-grid",
    name: "Modern Grid",
    description: "Grid-based modern layout",
  },
  {
    id: "multi-grid",
    name: "Multi Grid",
    description: "Professional grid with multiple items (up to 6)",
  },
  {
    id: "menu-style",
    name: "Menu Style",
    description: "Traditional restaurant menu layout (up to 8 items)",
  },
  {
    id: "grid-2x2",
    name: "2x2 Grid",
    description: "Featured items in 2x2 grid layout",
  },
  {
    id: "grid-3x2",
    name: "3x2 Grid",
    description: "Six items in 3x2 grid layout",
  },
];

export const menuCategories = [
  "Appetizer",
  "Soup",
  "Main Course",
  "Rice & Bread",
  "Dessert",
  "Beverage",
  "Special",
  "Traditional Afghan",
  "Grilled",
  "Seafood",
  "Vegetarian",
  "Kids Menu",
];

export const steps = [
  {
    id: "items",
    title: "Menu Items",
    description: "Add your food items",
  },
  {
    id: "design",
    title: "Design & Style",
    description: "Choose theme and layout",
  },
  {
    id: "preview",
    title: "Preview & Save",
    description: "Review and create",
  },
];
