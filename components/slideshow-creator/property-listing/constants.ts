import { PropertyTheme, PropertyLayout } from "./types";

export const propertyThemes: PropertyTheme[] = [
    {
        id: "modern-luxury",
        name: "Modern Luxury",
        backgroundColor: "#1a1a1a",
        textColor: "#ffffff",
        accentColor: "#d4af37", // Gold
        priceColor: "#d4af37",
        fontFamily: "Playfair Display, serif",
    },
    {
        id: "minimalist-white",
        name: "Minimalist White",
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        accentColor: "#3b82f6", // Blue
        priceColor: "#1f2937",
        fontFamily: "Inter, sans-serif",
    },
    {
        id: "classic-navy",
        name: "Classic Navy",
        backgroundColor: "#0f172a",
        textColor: "#f8fafc",
        accentColor: "#cbd5e1", // Slate
        priceColor: "#cbd5e1",
        fontFamily: "Georgia, serif",
    },
    {
        id: "nature-green",
        name: "Nature Green",
        backgroundColor: "#f0fdf4",
        textColor: "#14532d",
        accentColor: "#15803d", // Green
        priceColor: "#15803d",
        fontFamily: "Inter, sans-serif",
    },
];

export const propertyLayouts: PropertyLayout[] = [
    {
        id: "featured-large",
        name: "Featured Large",
        description: "Large full-width image with overlays",
        type: "single",
    },
    {
        id: "split-view",
        name: "Split View",
        description: "Image on one side, details on the other",
        type: "single",
    },
    {
        id: "gallery-grid",
        name: "Gallery Grid",
        description: "Grid of multiple images for a property",
        type: "grid",
    },
];

export const propertyTypes = [
    "House",
    "Condo",
    "Apartment",
    "Townhouse",
    "Land",
    "Commercial",
    "Other",
];
