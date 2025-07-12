import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { usePremiumFeatures } from "../../lib/usePremiumFeatures";
import {
  getBusinessCategory,
  getAvailableFeatures,
  BusinessCategory,
  BusinessFeature,
} from "../../lib/business-features";
import {
  Plus,
  Play,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Clock,
  Music,
  Palette,
  Eye,
  TrendingUp,
  BarChart3,
  Users,
  Building,
  Image,
  Link,
  Copy,
  ExternalLink,
  Sparkles,
  Calendar,
  Heart,
  Share2,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  QrCode,
  X,
  Star,
  Award,
  Activity,
  Target,
  Zap,
  Check,
  Save,
  HelpCircle,
  Info,
  Wifi,
  WifiOff,
  Loader2,
  Settings,
  Menu,
  ShoppingCart,
  Scissors,
  Stethoscope,
  Dumbbell,
  Hotel,
  GraduationCap,
  Briefcase,
  Utensils,
  Store,
} from "lucide-react";

interface BusinessCategoryDashboardProps {
  businessCategory: string;
  onFeatureClick: (featureId: string) => void;
  onCreateSlideshow: (type: string) => void;
}

interface DashboardSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: BusinessFeature[];
  color: string;
}

export default function BusinessCategoryDashboard({
  businessCategory,
  onFeatureClick,
  onCreateSlideshow,
}: BusinessCategoryDashboardProps) {
  const { user } = useAuth();
  const { subscription, features } = usePremiumFeatures();
  const [category, setCategory] = useState<BusinessCategory | null>(null);
  const [availableFeatures, setAvailableFeatures] = useState<BusinessFeature[]>(
    []
  );
  const [activeSection, setActiveSection] = useState<string>("overview");

  useEffect(() => {
    const businessCat = getBusinessCategory(businessCategory);
    if (businessCat) {
      setCategory(businessCat);
      const features = getAvailableFeatures(
        businessCategory,
        subscription?.plan?.slug || "starter"
      );
      setAvailableFeatures(features);
    }
  }, [businessCategory, subscription]);

  const getCategoryIcon = (categorySlug: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      restaurant: <Utensils className="w-6 h-6" />,
      store: <Store className="w-6 h-6" />,
      salon: <Scissors className="w-6 h-6" />,
      clinic: <Stethoscope className="w-6 h-6" />,
      gym: <Dumbbell className="w-6 h-6" />,
      hotel: <Hotel className="w-6 h-6" />,
      school: <GraduationCap className="w-6 h-6" />,
      office: <Briefcase className="w-6 h-6" />,
    };
    return iconMap[categorySlug] || <Building className="w-6 h-6" />;
  };

  const getDashboardSections = (): DashboardSection[] => {
    if (!category) return [];

    const sections: DashboardSection[] = [
      {
        id: "overview",
        title: "Overview",
        description: "Quick stats and recent activity",
        icon: <Activity className="w-5 h-5" />,
        features: availableFeatures.filter((f) => f.category === "analytics"),
        color: "bg-blue-500",
      },
      {
        id: "content",
        title: "Content Creation",
        description: "Create and manage your slideshows",
        icon: <Image className="w-5 h-5" />,
        features: availableFeatures.filter((f) => f.category === "content"),
        color: "bg-green-500",
      },
      {
        id: "business",
        title: category.name + " Features",
        description: `Specific features for ${category.name.toLowerCase()}s`,
        icon: getCategoryIcon(category.slug),
        features: availableFeatures.filter((f) => f.category === category.slug),
        color: "bg-purple-500",
      },
      {
        id: "management",
        title: "Management",
        description: "Team and business management tools",
        icon: <Users className="w-5 h-5" />,
        features: availableFeatures.filter((f) => f.category === "management"),
        color: "bg-orange-500",
      },
    ];

    return sections.filter((section) => section.features.length > 0);
  };

  const getQuickActions = () => {
    if (!category) return [];

    const actions = [
      {
        id: "create-slideshow",
        title: "Create Slideshow",
        description: "Start a new slideshow",
        icon: <Plus className="w-5 h-5" />,
        action: () => onCreateSlideshow("image"),
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
      },
    ];

    // Add category-specific quick actions
    switch (category.slug) {
      case "restaurant":
        actions.push(
          {
            id: "create-menu",
            title: "Create Menu",
            description: "Design a digital menu",
            icon: <Menu className="w-5 h-5" />,
            action: () => onCreateSlideshow("menu"),
            color: "bg-gradient-to-r from-green-500 to-blue-500",
          },
          {
            id: "daily-specials",
            title: "Daily Specials",
            description: "Highlight today's specials",
            icon: <Star className="w-5 h-5" />,
            action: () => onCreateSlideshow("promo"),
            color: "bg-gradient-to-r from-yellow-500 to-orange-500",
          }
        );
        break;
      case "store":
        actions.push(
          {
            id: "product-showcase",
            title: "Product Showcase",
            description: "Display your products",
            icon: <ShoppingCart className="w-5 h-5" />,
            action: () => onCreateSlideshow("image"),
            color: "bg-gradient-to-r from-blue-500 to-purple-500",
          },
          {
            id: "promotions",
            title: "Promotions",
            description: "Create promotional content",
            icon: <Target className="w-5 h-5" />,
            action: () => onCreateSlideshow("promo"),
            color: "bg-gradient-to-r from-red-500 to-pink-500",
          }
        );
        break;
      case "salon":
        actions.push(
          {
            id: "service-menu",
            title: "Service Menu",
            description: "Showcase your services",
            icon: <Scissors className="w-5 h-5" />,
            action: () => onCreateSlideshow("menu"),
            color: "bg-gradient-to-r from-pink-500 to-purple-500",
          },
          {
            id: "stylist-showcase",
            title: "Stylist Showcase",
            description: "Highlight your stylists",
            icon: <Users className="w-5 h-5" />,
            action: () => onCreateSlideshow("image"),
            color: "bg-gradient-to-r from-purple-500 to-indigo-500",
          }
        );
        break;
      // Add more cases for other business types...
    }

    return actions;
  };

  if (!category) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const sections = getDashboardSections();
  const quickActions = getQuickActions();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: category.color }}
            >
              {getCategoryIcon(category.slug)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {category.name} Dashboard
              </h1>
              <p className="text-gray-600">{category.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Plan:</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {subscription?.plan?.name || "Starter"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <motion.button
              key={action.id}
              onClick={action.action}
              className={`${action.color} text-white p-4 rounded-lg text-left hover:shadow-lg transition-all duration-200`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                {action.icon}
                <div>
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === section.id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={section.color.replace("bg-", "text-")}>
                    {section.icon}
                  </span>
                  <span>{section.title}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Section Content */}
        <div className="p-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className={activeSection === section.id ? "block" : "hidden"}
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {section.title}
                </h3>
                <p className="text-gray-600">{section.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.features.map((feature) => (
                  <motion.div
                    key={feature.id}
                    className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onFeatureClick(feature.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{feature.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {feature.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {feature.description}
                        </p>
                        {feature.isPremium && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900">1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Image className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Slideshows
              </p>
              <p className="text-2xl font-semibold text-gray-900">5</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Tv className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Connected TVs</p>
              <p className="text-2xl font-semibold text-gray-900">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Engagement</p>
              <p className="text-2xl font-semibold text-gray-900">87%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
