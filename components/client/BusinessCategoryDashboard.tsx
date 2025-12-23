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
        color: "bg-black",
      },
      {
        id: "content",
        title: "Content Creation",
        description: "Create and manage your slideshows",
        icon: <Image className="w-5 h-5" />,
        features: availableFeatures.filter((f) => f.category === "content"),
        color: "bg-black",
      },
      {
        id: "business",
        title: category.name + " Features",
        description: `Specific features for ${category.name.toLowerCase()}s`,
        icon: getCategoryIcon(category.slug),
        features: availableFeatures.filter((f) => f.category === category.slug),
        color: "bg-black",
      },
      {
        id: "management",
        title: "Management",
        description: "Team and business management tools",
        icon: <Users className="w-5 h-5" />,
        features: availableFeatures.filter((f) => f.category === "management"),
        color: "bg-black",
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
        color: "bg-black",
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
            color: "bg-black/90",
          },
          {
            id: "daily-specials",
            title: "Daily Specials",
            description: "Highlight today's specials",
            icon: <Star className="w-5 h-5" />,
            action: () => onCreateSlideshow("promo"),
            color: "bg-black/80",
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
            color: "bg-black/90",
          },
          {
            id: "promotions",
            title: "Promotions",
            description: "Create promotional content",
            icon: <Target className="w-5 h-5" />,
            action: () => onCreateSlideshow("promo"),
            color: "bg-black/80",
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
            color: "bg-black/90",
          },
          {
            id: "stylist-showcase",
            title: "Stylist Showcase",
            description: "Highlight your stylists",
            icon: <Users className="w-5 h-5" />,
            action: () => onCreateSlideshow("image"),
            color: "bg-black/80",
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
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  const sections = getDashboardSections();
  const quickActions = getQuickActions();

  return (
    <div className="space-y-8">
      {/* Header */}
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-black/[0.03] border border-black/5 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white bg-black shadow-lg shadow-black/10"
            >
              {getCategoryIcon(category.slug)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black tracking-tight">
                {category.name} Dashboard
              </h1>
              <p className="text-black/40 font-medium">{category.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Active Plan</span>
            <span className="px-4 py-1.5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10">
              {subscription?.plan?.name || "Starter"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-3xl border border-black/5 p-8">
        <h2 className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] mb-8">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <motion.button
              key={action.id}
              onClick={action.action}
              className={`${action.color} text-white p-6 rounded-2xl text-left shadow-xl shadow-black/10 hover:shadow-black/20 transition-all duration-300 relative overflow-hidden group`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-4 relative z-10">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-bold tracking-tight">{action.title}</h3>
                  <p className="text-xs opacity-60 font-medium">{action.description}</p>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-110 transition-transform duration-500">
                {action.icon}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-black/[0.03] border border-black/5 overflow-hidden">
        <div className="border-b border-black/[0.03]">
          <nav className="flex space-x-12 px-8">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-6 px-1 border-b-2 font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ${activeSection === section.id
                    ? "border-black text-black"
                    : "border-transparent text-black/20 hover:text-black/40"
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={activeSection === section.id ? "text-black" : "text-black/10"}>
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
              <div className="mb-10">
                <h3 className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] mb-2">
                  {section.title}
                </h3>
                <p className="text-base font-bold text-black tracking-tight">{section.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.features.map((feature) => (
                  <motion.div
                    key={feature.id}
                    className="bg-gray-50 rounded-2xl p-6 border border-black/5 hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all duration-300 cursor-pointer group"
                    onClick={() => onFeatureClick(feature.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">{feature.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-black mb-1 tracking-tight">
                          {feature.name}
                        </h4>
                        <p className="text-sm text-black/40 mb-4 font-medium leading-relaxed">
                          {feature.description}
                        </p>
                        {feature.isPremium && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black text-white shadow-lg shadow-black/10">
                            <Sparkles className="w-3 h-3 mr-1.5" />
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
        <div className="bg-white rounded-2xl shadow-xl shadow-black/[0.03] border border-black/5 p-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-black/40">
              <Eye className="w-6 h-6" />
            </div>
            <div className="ml-5">
              <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Total Views</p>
              <p className="text-2xl font-bold text-black tracking-tight">1,234</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-black/[0.03] border border-black/5 p-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-black/40">
              <Image className="w-6 h-6" />
            </div>
            <div className="ml-5">
              <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">
                Active Slideshows
              </p>
              <p className="text-2xl font-bold text-black tracking-tight">5</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-black/[0.03] border border-black/5 p-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-black/40">
              <Tv className="w-6 h-6" />
            </div>
            <div className="ml-5">
              <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Connected TVs</p>
              <p className="text-2xl font-bold text-black tracking-tight">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-black/[0.03] border border-black/5 p-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-black/40">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-5">
              <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Engagement</p>
              <p className="text-2xl font-bold text-black tracking-tight">87%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
