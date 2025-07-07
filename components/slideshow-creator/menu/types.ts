export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  isPopular?: boolean;
  dietaryInfo?: string[];
  image?: string; // Base64 encoded image or URL
}

export interface MenuTheme {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  priceColor: string;
  descriptionColor: string;
  fontFamily: string;
}

export interface MenuLayout {
  id: string;
  name: string;
  description: string;
}

export interface MenuSlideshowData {
  items: MenuItem[];
  theme: MenuTheme;
  layout: MenuLayout;
  autoGenerate?: boolean;
  aiSuggestions?: boolean;
}

export interface MenuSlideshowWizardProps {
  step?: number;
  formData?: any;
  updateFormData?: (data: any) => void;
  onComplete?: (data: any) => void;
  isEditing?: boolean;
  initialData?: any;
}

export interface MenuItemFormProps {
  item: MenuItem;
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export interface MenuItemsListProps {
  menuItems: MenuItem[];
  onAddItem: (item: MenuItem) => void;
  onUpdateItem: (item: MenuItem) => void;
  onRemoveItem: (id: string) => void;
}

export interface ThemeSelectorProps {
  selectedTheme: MenuTheme;
  onThemeSelect: (theme: MenuTheme) => void;
}

export interface LayoutSelectorProps {
  selectedLayout: MenuLayout;
  onLayoutSelect: (layout: MenuLayout) => void;
}

export interface MenuPreviewProps {
  menuItems: MenuItem[];
  theme: MenuTheme;
  layout: MenuLayout;
}

export interface AISuggestionsProps {
  onSuggestionSelect: (suggestion: MenuItem) => void;
  category?: string;
}
