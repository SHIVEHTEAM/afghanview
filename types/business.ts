// Business Type System Types

export enum BusinessType {
  RESTAURANT = "restaurant",
  RETAIL = "retail",
  SERVICE = "service",
  ENTERTAINMENT = "entertainment",
  HEALTHCARE = "healthcare",
  EDUCATION = "education",
  OTHER = "other",
}

export interface BusinessTypeConfig {
  id: string;
  business_type: BusinessType;
  name: string;
  description: string;
  allowed_slideshow_types: string[];
  default_settings: {
    default_duration?: number;
    transition?: string;
    [key: string]: any;
  };
  features: {
    menu_support?: boolean;
    deals_support?: boolean;
    promotions_support?: boolean;
    events_support?: boolean;
    announcements_support?: boolean;
    professional_templates?: boolean;
    ai_facts?: boolean;
    [key: string]: any;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  organization_id?: string;
  name: string;
  slug?: string;
  description?: string;
  type: BusinessType; // Standardized to match database schema
  cuisine_type?: string; // Legacy field for restaurants
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    [key: string]: any;
  };
  contact_info?: {
    email?: string;
    phone?: string;
    website?: string;
    [key: string]: any;
  };
  business_hours?: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    [key: string]: any;
  };
  branding?: {
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    [key: string]: any;
  };
  settings?: {
    timezone?: string;
    language?: string;
    [key: string]: any;
  };
  is_active: boolean;
  is_verified?: boolean;
  verified_at?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  category_id?: string;
  user_id?: string; // Add user_id to match schema
}

export interface BusinessStaff {
  id: string;
  business_id: string;
  business_type: BusinessType;
  user_id: string;
  role: "owner" | "manager" | "staff";
  permissions: {
    can_create_slideshows?: boolean;
    can_edit_slideshows?: boolean;
    can_delete_slideshows?: boolean;
    can_manage_staff?: boolean;
    can_view_analytics?: boolean;
    can_manage_settings?: boolean;
    [key: string]: any;
  };
  joined_at: string;
  invited_by?: string;
  is_active: boolean;
}

export interface Slideshow {
  id: string;
  title: string; // Standardized to match database schema
  description?: string;
  business_id: string;
  business_type: BusinessType;
  is_active: boolean;
  is_favorite?: boolean;
  play_count?: number;
  last_played?: string;
  slug?: string;
  settings?: {
    duration?: number;
    transition?: string;
    background_music?: string;
    [key: string]: any;
  };
  content?: {
    slides?: any[];
    images?: any[];
    isTemplate?: boolean;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// Helper functions for business types
export const getBusinessTypeConfig = (
  businessType: BusinessType
): Partial<BusinessTypeConfig> => {
  const configs: Record<BusinessType, Partial<BusinessTypeConfig>> = {
    [BusinessType.RESTAURANT]: {
      name: "Restaurant & Cafe",
      description: "Food service businesses",
      allowed_slideshow_types: [
        "image",
        "video",
        "text",
        "ai-facts",
        "menu",
        "deals",
      ],
      default_settings: {
        default_duration: 5000,
        transition: "fade",
      },
      features: {
        menu_support: true,
        deals_support: true,
        ai_facts: true,
      },
    },
    [BusinessType.RETAIL]: {
      name: "Retail Store",
      description: "Retail and shopping businesses",
      allowed_slideshow_types: [
        "image",
        "video",
        "text",
        "ai-facts",
        "deals",
        "promotions",
      ],
      default_settings: {
        default_duration: 4000,
        transition: "slide",
      },
      features: {
        deals_support: true,
        promotions_support: true,
        ai_facts: true,
      },
    },
    [BusinessType.SERVICE]: {
      name: "Service Business",
      description: "Professional services",
      allowed_slideshow_types: ["image", "video", "text", "ai-facts"],
      default_settings: {
        default_duration: 6000,
        transition: "fade",
      },
      features: {
        ai_facts: true,
        professional_templates: true,
      },
    },
    [BusinessType.ENTERTAINMENT]: {
      name: "Entertainment",
      description: "Entertainment and leisure",
      allowed_slideshow_types: ["image", "video", "text", "ai-facts", "events"],
      default_settings: {
        default_duration: 3000,
        transition: "zoom",
      },
      features: {
        events_support: true,
        ai_facts: true,
      },
    },
    [BusinessType.HEALTHCARE]: {
      name: "Healthcare",
      description: "Medical and healthcare",
      allowed_slideshow_types: ["image", "video", "text", "ai-facts"],
      default_settings: {
        default_duration: 7000,
        transition: "fade",
      },
      features: {
        professional_templates: true,
        ai_facts: true,
      },
    },
    [BusinessType.EDUCATION]: {
      name: "Education",
      description: "Schools and educational institutions",
      allowed_slideshow_types: [
        "image",
        "video",
        "text",
        "ai-facts",
        "announcements",
      ],
      default_settings: {
        default_duration: 5000,
        transition: "slide",
      },
      features: {
        announcements_support: true,
        ai_facts: true,
      },
    },
    [BusinessType.OTHER]: {
      name: "Other",
      description: "Other business types",
      allowed_slideshow_types: ["image", "video", "text", "ai-facts"],
      default_settings: {
        default_duration: 5000,
        transition: "fade",
      },
      features: {
        ai_facts: true,
      },
    },
  };

  return configs[businessType] || configs[BusinessType.OTHER];
};

// Helper function to get business type display name
export const getBusinessTypeDisplayName = (
  businessType: BusinessType
): string => {
  const config = getBusinessTypeConfig(businessType);
  return config.name || "Unknown Business Type";
};

// Helper function to get business type description
export const getBusinessTypeDescription = (
  businessType: BusinessType
): string => {
  const config = getBusinessTypeConfig(businessType);
  return config.description || "No description available";
};

// Business type validation
export const isValidBusinessType = (type: string): type is BusinessType => {
  return Object.values(BusinessType).includes(type as BusinessType);
};

// Helper function to get allowed slideshow types for a business type
export const getAllowedSlideshowTypes = (
  businessType: BusinessType
): string[] => {
  const config = getBusinessTypeConfig(businessType);
  return config.allowed_slideshow_types || ["image", "video", "text"];
};

// Helper function to get default settings for a business type
export const getDefaultSettings = (
  businessType: BusinessType
): Record<string, any> => {
  const config = getBusinessTypeConfig(businessType);
  return config.default_settings || {};
};

// Helper function to check if a business type supports a feature
export const supportsFeature = (
  businessType: BusinessType,
  feature: string
): boolean => {
  const config = getBusinessTypeConfig(businessType);
  return config.features?.[feature] || false;
};

// Permission helper functions
export const canDeleteSlideshows = (
  role: "owner" | "manager" | "staff"
): boolean => {
  return role === "owner" || role === "manager";
};

export const canCreateSlideshows = (
  role: "owner" | "manager" | "staff"
): boolean => {
  return role === "owner" || role === "manager" || role === "staff";
};

export const canEditSlideshows = (
  role: "owner" | "manager" | "staff"
): boolean => {
  return role === "owner" || role === "manager" || role === "staff";
};

export const canManageStaff = (
  role: "owner" | "manager" | "staff"
): boolean => {
  return role === "owner" || role === "manager";
};

export const canViewAnalytics = (
  role: "owner" | "manager" | "staff"
): boolean => {
  return role === "owner" || role === "manager";
};
