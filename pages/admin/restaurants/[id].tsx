import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  Image as ImageIcon,
  FileText,
  Quote,
  Clock,
  Tag,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Package,
  Building,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { Restaurant, Slide } from "@/lib/supabase";

export default function RestaurantManagement() {
  const router = useRouter();
  const { id } = router.query;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState(false);

  // Mock data
  const mockRestaurant: Restaurant = {
    id: "1",
    name: "Afghan Palace",
    description: "Authentic Afghan Cuisine",
    address: "123 Main Street, New York",
    phone: "(555) 123-4567",
    website: "www.afghanpalace.com",
    owner_email: "owner@afghanpalace.com",
    package_type: "professional",
    slide_limit: 3,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  };

  const mockSlides: Slide[] = [
    {
      id: "1",
      restaurant_id: "1",
      type: "image",
      title: "Welcome to Afghan Palace",
      subtitle: "Authentic Afghan Cuisine & Culture",
      image_url:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
      duration: 6000,
      order_index: 1,
      is_active: true,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      restaurant_id: "1",
      type: "menu",
      title: "Today's Specials",
      subtitle: "Fresh & Authentic",
      content:
        "🍚 Kabuli Pulao - $22.99\n🥟 Mantu Dumplings - $18.99\n🍖 Qorma-e-Gosht - $24.99\n🥖 Naan-e-Afghan - $3.99",
      duration: 8000,
      order_index: 2,
      is_active: true,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "3",
      restaurant_id: "1",
      type: "promo",
      title: "Weekend Special",
      subtitle: "Family Feast Package",
      content: "Get 20% off on orders over $50",
      duration: 7000,
      order_index: 3,
      is_active: false,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
    },
  ];

  useEffect(() => {
    if (id) {
      // Simulate API call
      setTimeout(() => {
        setRestaurant(mockRestaurant);
        setSlides(mockSlides);
        setLoading(false);
      }, 1000);
    }
  }, [id]);

  const slideTypes = [
    { value: "image", label: "Image Slide", icon: ImageIcon },
    { value: "menu", label: "Menu Slide", icon: FileText },
    { value: "promo", label: "Promotion Slide", icon: Tag },
    { value: "quote", label: "Quote Slide", icon: Quote },
    { value: "hours", label: "Hours Slide", icon: Clock },
  ];

  const getSlideTypeIcon = (type: string) => {
    const slideType = slideTypes.find((t) => t.value === type);
    return slideType ? slideType.icon : ImageIcon;
  };

  const getPackageColor = (packageType: string) => {
    switch (packageType) {
      case "starter":
        return "bg-blue-100 text-blue-800";
      case "professional":
        return "bg-green-100 text-green-800";
      case "unlimited":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSlideUsage = () => {
    if (!restaurant) return { total: 0, active: 0, limit: 0, usage: 0 };

    const activeSlides = slides.filter((s) => s.is_active);
    const usage = Math.round((slides.length / restaurant.slide_limit) * 100);

    return {
      total: slides.length,
      active: activeSlides.length,
      limit: restaurant.slide_limit,
      usage: usage,
    };
  };

  const handleAddSlide = () => {
    const usage = getSlideUsage();
    if (usage.total >= usage.limit) {
      alert(
        `Cannot add more slides. Restaurant has reached the limit of ${usage.limit} slides for their ${restaurant?.package_type} package.`
      );
      return;
    }
    setShowAddModal(true);
    setEditingSlide(null);
  };

  const handleEditSlide = (slide: Slide) => {
    setEditingSlide(slide);
    setShowAddModal(true);
  };

  const handleDeleteSlide = (slideId: string) => {
    if (confirm("Are you sure you want to delete this slide?")) {
      setSlides(slides.filter((slide) => slide.id !== slideId));
    }
  };

  const handleToggleSlideActive = (slideId: string) => {
    const slide = slides.find((s) => s.id === slideId);
    if (!slide) return;

    const usage = getSlideUsage();
    if (!slide.is_active && usage.active >= usage.limit) {
      alert(
        `Cannot activate more slides. Restaurant has reached the limit of ${usage.limit} active slides for their ${restaurant?.package_type} package.`
      );
      return;
    }

    setSlides(
      slides.map((slide) =>
        slide.id === slideId ? { ...slide, is_active: !slide.is_active } : slide
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Restaurant not found</div>
      </div>
    );
  }

  const usage = getSlideUsage();

  return (
    <>
      <Head>
        <title>{restaurant.name} - Admin Management</title>
        <meta
          name="description"
          content={`Manage ${restaurant.name} slideshow`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {restaurant.name}
                  </h1>
                  <p className="text-sm text-gray-500">Restaurant Management</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href={`/restaurant/${restaurant.id}`}
                  target="_blank"
                  className="bg-afghan-green text-white px-4 py-2 rounded-lg hover:bg-afghan-green/90 transition-colors flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Display
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Restaurant Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Restaurant Info
                  </h2>
                  <button
                    onClick={() => setEditingRestaurant(!editingRestaurant)}
                    className="text-afghan-green hover:text-afghan-green/80"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Building className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {restaurant.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {restaurant.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="text-sm text-gray-600">
                      {restaurant.owner_email}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="text-sm text-gray-600">
                      {restaurant.phone}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="text-sm text-gray-600">
                      {restaurant.website}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Package:
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPackageColor(
                          restaurant.package_type
                        )}`}
                      >
                        {restaurant.package_type.charAt(0).toUpperCase() +
                          restaurant.package_type.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-medium text-gray-700">
                        Status:
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          restaurant.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {restaurant.is_active ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <X className="w-3 h-3 mr-1" />
                        )}
                        {restaurant.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide Usage */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Slide Usage
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Active Slides:
                    </span>
                    <span className="text-sm text-gray-900">
                      {usage.active}/{usage.limit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Total Slides:
                    </span>
                    <span className="text-sm text-gray-900">{usage.total}</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Usage:
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          usage.usage > 100
                            ? "text-red-600"
                            : usage.usage > 80
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {usage.usage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          usage.usage > 100
                            ? "bg-red-500"
                            : usage.usage > 80
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(usage.usage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  {usage.usage > 100 && (
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Over limit! Consider upgrading package.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Slides Management */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Slides Management
                    </h2>
                    <motion.button
                      onClick={handleAddSlide}
                      className="bg-afghan-green text-white px-4 py-2 rounded-lg hover:bg-afghan-green/90 transition-colors flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Slide
                    </motion.button>
                  </div>
                </div>

                <div className="p-6">
                  {slides.length === 0 ? (
                    <div className="text-center py-12">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No slides
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by creating the first slide.
                      </p>
                      <div className="mt-6">
                        <button
                          onClick={handleAddSlide}
                          className="bg-afghan-green text-white px-4 py-2 rounded-lg hover:bg-afghan-green/90 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2 inline" />
                          Add New Slide
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {slides.map((slide, index) => {
                        const Icon = getSlideTypeIcon(slide.type);
                        return (
                          <motion.div
                            key={slide.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Icon className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-500 capitalize">
                                  {slide.type}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {slide.title}
                                </h3>
                                {slide.subtitle && (
                                  <p className="text-sm text-gray-600">
                                    {slide.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  slide.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {slide.is_active ? "Active" : "Inactive"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {slide.duration / 1000}s
                              </span>
                              <button
                                onClick={() => handleEditSlide(slide)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleSlideActive(slide.id)
                                }
                                className={`p-2 transition-colors ${
                                  slide.is_active
                                    ? "text-red-400 hover:text-red-600"
                                    : "text-green-400 hover:text-green-600"
                                }`}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSlide(slide.id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingSlide ? "Edit Slide" : "Add New Slide"}
                </h3>

                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slide Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-afghan-green">
                      {slideTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-afghan-green"
                      placeholder="Enter slide title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-afghan-green"
                      placeholder="6"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-afghan-green text-white px-4 py-2 rounded-md hover:bg-afghan-green/90 transition-colors"
                    >
                      {editingSlide ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
