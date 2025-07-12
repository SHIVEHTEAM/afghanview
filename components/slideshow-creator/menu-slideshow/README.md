# Menu Slideshow Module

A comprehensive, modular menu slideshow creator with AI integration for Afghan restaurants.

## 🏗️ Architecture

The module is organized into focused, reusable components:

### Core Components

- **`MenuSlideshowWizard.tsx`** - Main orchestrator component
- **`MenuItemsList.tsx`** - Manages menu items with add/edit/delete functionality
- **`MenuItemForm.tsx`** - Form for adding/editing menu items with AI assistance
- **`ThemeSelector.tsx`** - Theme selection with live previews
- **`LayoutSelector.tsx`** - Layout selection with visual previews
- **`MenuPreview.tsx`** - Real-time preview of menu slides
- **`AISuggestions.tsx`** - AI-powered menu item suggestions

### Utilities & Services

- **`svg-generator.ts`** - Generates SVG slides for menu items
- **`ai-service.ts`** - AI integration for suggestions and descriptions
- **`types.ts`** - TypeScript interfaces and types
- **`constants.ts`** - Themes, layouts, and configuration data

## 🚀 Features

### AI Integration

- **Smart Suggestions**: Generate authentic Afghan menu items
- **Auto Descriptions**: AI-powered item descriptions
- **Price Suggestions**: Intelligent pricing recommendations
- **Category Filtering**: Context-aware suggestions

### Design System

- **7 Professional Themes**: From elegant to vibrant
- **6 Layout Options**: Centered, left-aligned, card, minimal, elegant, modern-grid
- **Live Previews**: Real-time design previews
- **Responsive Design**: Works on all screen sizes

### Menu Management

- **CRUD Operations**: Add, edit, delete menu items
- **Special Tags**: Spicy, vegetarian, popular indicators
- **Category Organization**: 12 predefined categories
- **Bulk Operations**: AI-powered batch suggestions

## 🎨 Themes Available

1. **Elegant** - Black background with gold accents
2. **Modern** - Dark blue with teal highlights
3. **Warm** - Brown tones with warm accents
4. **Fresh** - Green theme for healthy options
5. **Vibrant** - Orange and red for bold dishes
6. **Afghan Traditional** - Cultural brown and gold
7. **Minimal** - Clean white with subtle accents

## 📐 Layout Options

1. **Centered** - Classic centered text layout
2. **Left Aligned** - Modern left-aligned design
3. **Card Style** - Card-based with borders
4. **Minimal** - Clean and minimal design
5. **Elegant** - Sophisticated with decorative elements
6. **Modern Grid** - Grid-based modern layout

## 🔧 Usage

```tsx
import { MenuSlideshowWizard } from "./menu-slideshow";

// In your component
<MenuSlideshowWizard
  step={currentStep}
  formData={formData}
  updateFormData={updateFormData}
  onComplete={handleComplete}
/>;
```

## 🤖 AI Features

### Menu Suggestions

```tsx
// Generate AI suggestions
const suggestions = await MenuAIService.generateMenuSuggestions({
  category: "Main Course",
  cuisine: "Afghan",
  priceRange: "12-25",
  dietary: ["vegetarian"],
});
```

### Auto Description

```tsx
// Generate item description
const description = await MenuAIService.generateItemDescription(
  "Kabuli Pulao",
  "Main Course"
);
```

### Price Suggestions

```tsx
// Get price suggestion
const price = await MenuAIService.suggestPrice("Kabuli Pulao", "Main Course");
```

## 🎯 Key Benefits

1. **Modular Design**: Easy to maintain and extend
2. **AI-Powered**: Reduces manual work with smart suggestions
3. **Cultural Focus**: Designed for Afghan restaurants
4. **Professional Output**: High-quality SVG slides
5. **User-Friendly**: Intuitive interface with live previews
6. **Extensible**: Easy to add new themes and layouts

## 🔄 Migration from Original

The original 850-line `MenuSlideshowWizard.tsx` has been refactored into:

- **12 focused files** with clear responsibilities
- **Better maintainability** and code organization
- **Enhanced AI integration** with dedicated service
- **Improved user experience** with better components
- **Type safety** with comprehensive TypeScript types

## 📁 File Structure

```
menu-slideshow/
├── README.md              # This documentation
├── index.ts              # Main exports
├── MenuSlideshowWizard.tsx # Main orchestrator
├── MenuItemsList.tsx     # Menu items management
├── MenuItemForm.tsx      # Add/edit form with AI
├── ThemeSelector.tsx     # Theme selection
├── LayoutSelector.tsx    # Layout selection
├── MenuPreview.tsx       # Live preview component
├── AISuggestions.tsx     # AI suggestions panel
├── svg-generator.ts      # SVG slide generation
├── ai-service.ts         # AI integration service
├── types.ts             # TypeScript interfaces
└── constants.ts         # Configuration data
```