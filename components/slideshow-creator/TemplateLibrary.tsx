import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Download,
  Eye,
  Copy,
  Heart,
  Clock,
  Users,
  Building,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Briefcase,
  GraduationCap,
  Heart as HeartIcon,
  Sparkles,
  Zap,
  Crown,
  Award,
  Trophy,
  Medal,
  Badge,
  Flag,
  Sun,
  Moon,
  Cloud,
  Rainbow,
  Leaf,
  Flower,
  Bird,
  Fish,
  Cat,
  Dog,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  slides: number;
  rating: number;
  downloads: number;
  isPremium: boolean;
  isNew: boolean;
  isPopular: boolean;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
}

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void;
  onClose: () => void;
}

const TEMPLATE_CATEGORIES = [
  { id: "all", name: "All Templates", icon: Grid },
  { id: "restaurant", name: "Restaurants", icon: Utensils },
  { id: "retail", name: "Retail", icon: ShoppingBag },
  { id: "services", name: "Services", icon: Briefcase },
  { id: "automotive", name: "Automotive", icon: Car },
  { id: "real-estate", name: "Real Estate", icon: Home },
  { id: "education", name: "Education", icon: GraduationCap },
  { id: "healthcare", name: "Healthcare", icon: HeartIcon },
  { id: "entertainment", name: "Entertainment", icon: Star },
  { id: "technology", name: "Technology", icon: Zap },
];

const MOCK_TEMPLATES: Template[] = [
  {
    id: "restaurant-menu-1",
    name: "Elegant Restaurant Menu",
    description:
      "A sophisticated menu template with beautiful typography and elegant design",
    category: "restaurant",
    thumbnail: "/api/placeholder/400/300",
    slides: 8,
    rating: 4.8,
    downloads: 1247,
    isPremium: false,
    isNew: false,
    isPopular: true,
    tags: ["menu", "elegant", "typography"],
    author: "AfghanView Team",
    createdAt: "2025-01-15",
    updatedAt: "2025-01-20",
  },
  {
    id: "retail-promo-1",
    name: "Retail Promotion",
    description: "Eye-catching promotional slideshow for retail businesses",
    category: "retail",
    thumbnail: "/api/placeholder/400/300",
    slides: 6,
    rating: 4.6,
    downloads: 892,
    isPremium: false,
    isNew: true,
    isPopular: false,
    tags: ["promotion", "retail", "sales"],
    author: "AfghanView Team",
    createdAt: "2025-01-18",
    updatedAt: "2025-01-18",
  },
  {
    id: "service-showcase-1",
    name: "Service Business Showcase",
    description: "Professional template for service-based businesses",
    category: "services",
    thumbnail: "/api/placeholder/400/300",
    slides: 10,
    rating: 4.7,
    downloads: 567,
    isPremium: true,
    isNew: false,
    isPopular: false,
    tags: ["services", "professional", "showcase"],
    author: "AfghanView Team",
    createdAt: "2025-01-10",
    updatedAt: "2025-01-15",
  },
  {
    id: "auto-dealership-1",
    name: "Auto Dealership",
    description: "Dynamic template for automotive businesses",
    category: "automotive",
    thumbnail: "/api/placeholder/400/300",
    slides: 7,
    rating: 4.5,
    downloads: 423,
    isPremium: false,
    isNew: false,
    isPopular: false,
    tags: ["automotive", "dealership", "vehicles"],
    author: "AfghanView Team",
    createdAt: "2025-01-12",
    updatedAt: "2025-01-16",
  },
  {
    id: "real-estate-1",
    name: "Real Estate Showcase",
    description: "Beautiful property showcase template",
    category: "real-estate",
    thumbnail: "/api/placeholder/400/300",
    slides: 9,
    rating: 4.9,
    downloads: 756,
    isPremium: true,
    isNew: false,
    isPopular: true,
    tags: ["real-estate", "property", "showcase"],
    author: "AfghanView Team",
    createdAt: "2025-01-08",
    updatedAt: "2025-01-14",
  },
  {
    id: "education-1",
    name: "Educational Presentation",
    description: "Clean and professional educational template",
    category: "education",
    thumbnail: "/api/placeholder/400/300",
    slides: 12,
    rating: 4.4,
    downloads: 334,
    isPremium: false,
    isNew: false,
    isPopular: false,
    tags: ["education", "presentation", "clean"],
    author: "AfghanView Team",
    createdAt: "2025-01-05",
    updatedAt: "2025-01-12",
  },
  {
    id: "healthcare-1",
    name: "Healthcare Services",
    description: "Trustworthy healthcare service template",
    category: "healthcare",
    thumbnail: "/api/placeholder/400/300",
    slides: 8,
    rating: 4.6,
    downloads: 445,
    isPremium: false,
    isNew: false,
    isPopular: false,
    tags: ["healthcare", "medical", "trustworthy"],
    author: "AfghanView Team",
    createdAt: "2025-01-03",
    updatedAt: "2025-01-10",
  },
  {
    id: "entertainment-1",
    name: "Entertainment Venue",
    description: "Dynamic and exciting entertainment template",
    category: "entertainment",
    thumbnail: "/api/placeholder/400/300",
    slides: 6,
    rating: 4.3,
    downloads: 289,
    isPremium: false,
    isNew: false,
    isPopular: false,
    tags: ["entertainment", "venue", "dynamic"],
    author: "AfghanView Team",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-08",
  },
  {
    id: "tech-startup-1",
    name: "Tech Startup",
    description: "Modern and innovative tech startup template",
    category: "technology",
    thumbnail: "/api/placeholder/400/300",
    slides: 11,
    rating: 4.7,
    downloads: 678,
    isPremium: true,
    isNew: false,
    isPopular: true,
    tags: ["technology", "startup", "modern"],
    author: "AfghanView Team",
    createdAt: "2025-01-06",
    updatedAt: "2025-01-13",
  },
];

export default function TemplateLibrary({
  onSelectTemplate,
  onClose,
}: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [filteredTemplates, setFilteredTemplates] =
    useState<Template[]>(MOCK_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "popular" | "newest" | "rating" | "downloads"
  >("popular");
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  useEffect(() => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (template) => template.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          template.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filter by premium
    if (showPremiumOnly) {
      filtered = filtered.filter((template) => template.isPremium);
    }

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.downloads - a.downloads;
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "rating":
          return b.rating - a.rating;
        case "downloads":
          return b.downloads - a.downloads;
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchQuery, sortBy, showPremiumOnly]);

  const TemplateCard = ({ template }: { template: Template }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={() => onSelectTemplate(template)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          <div className="text-center">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{template.name}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex space-x-2">
          {template.isNew && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
              NEW
            </span>
          )}
          {template.isPopular && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-medium">
              POPULAR
            </span>
          )}
          {template.isPremium && (
            <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full font-medium flex items-center">
              <Crown className="w-3 h-3 mr-1" />
              PREMIUM
            </span>
          )}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
            <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
              <Eye className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
              <Copy className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
            {template.name}
          </h3>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs text-gray-600">{template.rating}</span>
          </div>
        </div>

        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {template.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{template.slides} slides</span>
            <span>{template.downloads} downloads</span>
          </div>

          <div className="flex items-center space-x-1">
            {template.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Template Library
            </h2>
            <p className="text-gray-600 mt-1">
              Choose from hundreds of professional templates
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {TEMPLATE_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
              <option value="downloads">Most Downloaded</option>
            </select>

            {/* Premium Filter */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showPremiumOnly}
                onChange={(e) => setShowPremiumOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Premium Only</span>
            </label>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No templates found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredTemplates.length} of {templates.length} templates
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                Create Custom Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
