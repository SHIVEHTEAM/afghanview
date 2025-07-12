// Business Category Features System
// This defines the features available for each business category

export interface BusinessFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isPremium: boolean;
  requiredPlan: "starter" | "professional" | "unlimited";
}

export interface BusinessCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  features: BusinessFeature[];
  templates: string[];
  analytics: string[];
}

// Common features used across all business types
const commonFeatures: BusinessFeature[] = [
  {
    id: "image-slides",
    name: "Image Slides",
    description: "Create slides with your own images and photos",
    icon: "🖼️",
    category: "content",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "video-slides",
    name: "Video Slides",
    description: "Add video content to your slideshows",
    icon: "🎥",
    category: "content",
    isPremium: true,
    requiredPlan: "professional",
  },
  {
    id: "text-slides",
    name: "Text Slides",
    description: "Create slides with custom text and messages",
    icon: "📝",
    category: "content",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "ai-content",
    name: "AI Content Generation",
    description: "Generate engaging content using AI",
    icon: "🤖",
    category: "ai",
    isPremium: true,
    requiredPlan: "professional",
  },
  {
    id: "analytics",
    name: "Basic Analytics",
    description: "Track views and engagement",
    icon: "📊",
    category: "analytics",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "advanced-analytics",
    name: "Advanced Analytics",
    description: "Detailed insights and performance metrics",
    icon: "📈",
    category: "analytics",
    isPremium: true,
    requiredPlan: "professional",
  },
  {
    id: "staff-management",
    name: "Staff Management",
    description: "Invite and manage team members",
    icon: "👥",
    category: "management",
    isPremium: true,
    requiredPlan: "professional",
  },
  {
    id: "custom-branding",
    name: "Custom Branding",
    description: "Add your logo and brand colors",
    icon: "🎨",
    category: "branding",
    isPremium: true,
    requiredPlan: "professional",
  },
];

// Restaurant-specific features
const restaurantFeatures: BusinessFeature[] = [
  {
    id: "menu-management",
    name: "Menu Management",
    description: "Create and manage digital menus",
    icon: "🍽️",
    category: "restaurant",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "daily-specials",
    name: "Daily Specials",
    description: "Highlight daily specials and promotions",
    icon: "⭐",
    category: "restaurant",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "reservation-system",
    name: "Reservation System",
    description: "Accept online reservations",
    icon: "📅",
    category: "restaurant",
    isPremium: true,
    requiredPlan: "professional",
  },
  {
    id: "order-tracking",
    name: "Order Tracking",
    description: "Track and display order status",
    icon: "📋",
    category: "restaurant",
    isPremium: true,
    requiredPlan: "professional",
  },
  {
    id: "nutrition-info",
    name: "Nutrition Information",
    description: "Display nutritional facts for menu items",
    icon: "🥗",
    category: "restaurant",
    isPremium: true,
    requiredPlan: "unlimited",
  },
];

// Store-specific features
const storeFeatures: BusinessFeature[] = [
  {
    id: "product-catalog",
    name: "Product Catalog",
    description: "Showcase your products with images and details",
    icon: "🛍️",
    category: "store",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "inventory-display",
    name: "Inventory Display",
    description: "Show real-time inventory levels",
    icon: "📦",
    category: "store",
    isPremium: true,
    requiredPlan: "professional",
  },
  {
    id: "price-updates",
    name: "Price Updates",
    description: "Update prices in real-time",
    icon: "💰",
    category: "store",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "promotional-banners",
    name: "Promotional Banners",
    description: "Display sales and promotions",
    icon: "🎯",
    category: "store",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "customer-reviews",
    name: "Customer Reviews",
    description: "Show customer testimonials and reviews",
    icon: "⭐",
    category: "store",
    isPremium: true,
    requiredPlan: "professional",
  },
];

// Salon-specific features
const salonFeatures: BusinessFeature[] = [
  {
    id: "service-menu",
    name: "Service Menu",
    description: "Display services and pricing",
    icon: "💇‍♀️",
    category: "salon",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "appointment-booking",
    name: "Appointment Booking",
    description: "Allow customers to book appointments",
    icon: "📅",
    category: "salon",
    isPremium: true,
    requiredPlan: "professional",
  },
  {
    id: "stylist-profiles",
    name: "Stylist Profiles",
    description: "Showcase your stylists and their work",
    icon: "👩‍🎨",
    category: "salon",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "before-after",
    name: "Before & After Gallery",
    description: "Display transformation photos",
    icon: "🔄",
    category: "salon",
    isPremium: true,
    requiredPlan: "professional",
  },
  {
    id: "loyalty-program",
    name: "Loyalty Program",
    description: "Track and display loyalty points",
    icon: "🎁",
    category: "salon",
    isPremium: true,
    requiredPlan: "unlimited",
  },
];

// Clinic-specific features
const clinicFeatures: BusinessFeature[] = [
  {
    id: "service-list",
    name: "Service List",
    description: "Display medical services offered",
    icon: "🏥",
    category: "clinic",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "doctor-profiles",
    name: "Doctor Profiles",
    description: "Showcase your medical staff",
    icon: "👨‍⚕️",
    category: "clinic",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "appointment-scheduling",
    name: "Appointment Scheduling",
    description: "Allow patients to schedule appointments",
    icon: "📅",
    category: "clinic",
    isPremium: true,
    requiredPlan: "professional",
  },
  {
    id: "health-tips",
    name: "Health Tips",
    description: "Display health and wellness tips",
    icon: "💡",
    category: "clinic",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "insurance-info",
    name: "Insurance Information",
    description: "Show accepted insurance providers",
    icon: "🏦",
    category: "clinic",
    isPremium: true,
    requiredPlan: "professional",
  },
];

// Gym-specific features
const gymFeatures: BusinessFeature[] = [
  {
    id: "class-schedule",
    name: "Class Schedule",
    description: "Display fitness class schedules",
    icon: "🏋️‍♀️",
    category: "gym",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "trainer-profiles",
    name: "Trainer Profiles",
    description: "Showcase your fitness trainers",
    icon: "💪",
    category: "gym",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "membership-info",
    name: "Membership Information",
    description: "Display membership plans and pricing",
    icon: "🎫",
    category: "gym",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "workout-tips",
    name: "Workout Tips",
    description: "Share fitness tips and advice",
    icon: "💡",
    category: "gym",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "class-booking",
    name: "Class Booking",
    description: "Allow members to book classes",
    icon: "📅",
    category: "gym",
    isPremium: true,
    requiredPlan: "professional",
  },
];

// Hotel-specific features
const hotelFeatures: BusinessFeature[] = [
  {
    id: "room-types",
    name: "Room Types",
    description: "Display different room categories",
    icon: "🛏️",
    category: "hotel",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "amenities",
    name: "Amenities",
    description: "Show hotel amenities and services",
    icon: "🏊‍♂️",
    category: "hotel",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "local-attractions",
    name: "Local Attractions",
    description: "Highlight nearby attractions",
    icon: "🗺️",
    category: "hotel",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "room-booking",
    name: "Room Booking",
    description: "Allow guests to book rooms",
    icon: "📅",
    category: "hotel",
    isPremium: true,
    requiredPlan: "professional",
  },
  {
    id: "concierge-services",
    name: "Concierge Services",
    description: "Display concierge and guest services",
    icon: "🎩",
    category: "hotel",
    isPremium: true,
    requiredPlan: "professional",
  },
];

// School-specific features
const schoolFeatures: BusinessFeature[] = [
  {
    id: "course-catalog",
    name: "Course Catalog",
    description: "Display available courses and programs",
    icon: "📚",
    category: "school",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "faculty-profiles",
    name: "Faculty Profiles",
    description: "Showcase teachers and staff",
    icon: "👨‍🏫",
    category: "school",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "events-calendar",
    name: "Events Calendar",
    description: "Display school events and activities",
    icon: "📅",
    category: "school",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "achievements",
    name: "Student Achievements",
    description: "Highlight student accomplishments",
    icon: "🏆",
    category: "school",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "enrollment-info",
    name: "Enrollment Information",
    description: "Show enrollment process and requirements",
    icon: "📝",
    category: "school",
    isPremium: true,
    requiredPlan: "professional",
  },
];

// Office-specific features
const officeFeatures: BusinessFeature[] = [
  {
    id: "services-overview",
    name: "Services Overview",
    description: "Display business services offered",
    icon: "💼",
    category: "office",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "team-profiles",
    name: "Team Profiles",
    description: "Showcase your team members",
    icon: "👥",
    category: "office",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "contact-info",
    name: "Contact Information",
    description: "Display contact details and office hours",
    icon: "📞",
    category: "office",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "company-news",
    name: "Company News",
    description: "Share company updates and announcements",
    icon: "📰",
    category: "office",
    isPremium: false,
    requiredPlan: "starter",
  },
  {
    id: "client-portal",
    name: "Client Portal",
    description: "Provide client access to services",
    icon: "🔐",
    category: "office",
    isPremium: true,
    requiredPlan: "professional",
  },
];

// Business categories with their specific features
export const businessCategories: BusinessCategory[] = [
  {
    id: "restaurant",
    name: "Restaurant",
    slug: "restaurant",
    description: "Food and dining establishments",
    icon: "🍽️",
    color: "#FF6B6B",
    features: [...commonFeatures, ...restaurantFeatures],
    templates: ["menu", "daily-specials", "welcome", "hours", "reservations"],
    analytics: ["menu-views", "reservation-conversions", "peak-hours"],
  },
  {
    id: "store",
    name: "Store",
    slug: "store",
    description: "Retail stores and shops",
    icon: "🛍️",
    color: "#4ECDC4",
    features: [...commonFeatures, ...storeFeatures],
    templates: ["product-showcase", "promotions", "new-arrivals", "sales"],
    analytics: ["product-views", "sales-conversions", "inventory-turns"],
  },
  {
    id: "salon",
    name: "Salon",
    slug: "salon",
    description: "Beauty and hair salons",
    icon: "💇‍♀️",
    color: "#45B7D1",
    features: [...commonFeatures, ...salonFeatures],
    templates: [
      "service-menu",
      "stylist-showcase",
      "before-after",
      "appointments",
    ],
    analytics: ["service-views", "appointment-bookings", "stylist-performance"],
  },
  {
    id: "clinic",
    name: "Clinic",
    slug: "clinic",
    description: "Medical and health clinics",
    icon: "🏥",
    color: "#96CEB4",
    features: [...commonFeatures, ...clinicFeatures],
    templates: ["services", "doctor-profiles", "health-tips", "appointments"],
    analytics: [
      "service-views",
      "appointment-bookings",
      "patient-satisfaction",
    ],
  },
  {
    id: "gym",
    name: "Gym",
    slug: "gym",
    description: "Fitness centers and gyms",
    icon: "💪",
    color: "#FFEAA7",
    features: [...commonFeatures, ...gymFeatures],
    templates: [
      "class-schedule",
      "trainer-profiles",
      "membership-info",
      "workout-tips",
    ],
    analytics: [
      "class-attendance",
      "membership-signups",
      "trainer-performance",
    ],
  },
  {
    id: "hotel",
    name: "Hotel",
    slug: "hotel",
    description: "Hotels and accommodations",
    icon: "🏨",
    color: "#DDA0DD",
    features: [...commonFeatures, ...hotelFeatures],
    templates: ["room-showcase", "amenities", "local-attractions", "booking"],
    analytics: ["room-views", "booking-conversions", "amenity-usage"],
  },
  {
    id: "school",
    name: "School",
    slug: "school",
    description: "Educational institutions",
    icon: "🎓",
    color: "#98D8C8",
    features: [...commonFeatures, ...schoolFeatures],
    templates: ["course-catalog", "faculty-profiles", "events", "achievements"],
    analytics: ["course-interest", "event-attendance", "enrollment-inquiries"],
  },
  {
    id: "office",
    name: "Office",
    slug: "office",
    description: "Business offices and companies",
    icon: "🏢",
    color: "#F7DC6F",
    features: [...commonFeatures, ...officeFeatures],
    templates: ["services", "team-profiles", "contact-info", "company-news"],
    analytics: ["service-inquiries", "contact-clicks", "news-engagement"],
  },
];

// Utility functions
export function getBusinessCategory(
  slug: string
): BusinessCategory | undefined {
  return businessCategories.find((category) => category.slug === slug);
}

export function getBusinessFeatures(slug: string): BusinessFeature[] {
  const category = getBusinessCategory(slug);
  return category ? category.features : [];
}

export function getFeatureById(featureId: string): BusinessFeature | undefined {
  for (const category of businessCategories) {
    const feature = category.features.find((f) => f.id === featureId);
    if (feature) return feature;
  }
  return undefined;
}

export function getFeaturesByCategory(
  categorySlug: string,
  featureCategory: string
): BusinessFeature[] {
  const category = getBusinessCategory(categorySlug);
  if (!category) return [];

  return category.features.filter(
    (feature) => feature.category === featureCategory
  );
}

export function isFeatureAvailable(
  featureId: string,
  businessCategory: string,
  userPlan: "starter" | "professional" | "unlimited"
): boolean {
  const feature = getFeatureById(featureId);
  if (!feature) return false;

  const planHierarchy = { starter: 1, professional: 2, unlimited: 3 };
  const requiredLevel = planHierarchy[feature.requiredPlan];
  const userLevel = planHierarchy[userPlan];

  return userLevel >= requiredLevel;
}

export function getAvailableFeatures(
  businessCategory: string,
  userPlan: "starter" | "professional" | "unlimited"
): BusinessFeature[] {
  const category = getBusinessCategory(businessCategory);
  if (!category) return [];

  return category.features.filter((feature) =>
    isFeatureAvailable(feature.id, businessCategory, userPlan)
  );
}
