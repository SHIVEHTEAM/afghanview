import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Plus,
  Building,
  Users,
  Calendar,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Image,
  Video,
  FileText,
  Upload,
  Globe,
  Target,
} from "lucide-react";

import { useAuth } from "../../../../lib/auth";
import { supabase } from "../../../../lib/supabase";
import AdminLayout from "../../layout";
import { SlideshowWizard } from "../../../../components/slideshow-creator";

interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
}

interface BusinessCategory {
  id: string;
  name: string;
  slug: string;
  business_count: number;
}

export default function AdminCreateSlideshow() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [creationMode, setCreationMode] = useState<"single" | "bulk">("single");
  const [showSlideshowCreator, setShowSlideshowCreator] = useState(false);
  const [selectedSlideshowType, setSelectedSlideshowType] =
    useState<string>("");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch businesses and categories in parallel
      const [businessesResult, categoriesResult] = await Promise.all([
        supabase
          .from("businesses")
          .select(
            `
            id,
            name,
            category:business_categories(id, name, slug)
          `
          )
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("business_categories")
          .select(
            `
            id,
            name,
            slug
          `
          )
          .order("name"),
      ]);

      if (businessesResult.error) throw businessesResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      // Process businesses data
      const processedBusinesses = (businessesResult.data || []).map(
        (business: any) => ({
          id: business.id,
          name: business.name,
          slug: business.slug || "",
          category: business.category || { id: "", name: "", slug: "" },
        })
      );
      setBusinesses(processedBusinesses);

      // Process categories with business counts
      const processedCategories = await Promise.all(
        (categoriesResult.data || []).map(async (category: any) => {
          const { count } = await supabase
            .from("businesses")
            .select("*", { count: "exact", head: true })
            .eq("category_id", category.id)
            .eq("is_active", true);

          return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            business_count: count || 0,
          };
        })
      );
      setCategories(processedCategories);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlideshowCreated = (slideshowData: any) => {
    console.log("Slideshow created:", slideshowData);
    router.push("/admin/content");
  };

  const handleStartCreation = (type: string) => {
    setSelectedSlideshowType(type);
    setShowSlideshowCreator(true);
  };

  const getBusinessesInCategory = (categoryId: string) => {
    return businesses.filter(
      (business) => (business as any).category.id === categoryId
    );
  };

  const getSelectedBusinesses = () => {
    if (creationMode === "single") {
      return selectedBusiness
        ? [businesses.find((b) => b.id === selectedBusiness)]
        : [];
    } else {
      return selectedCategory ? getBusinessesInCategory(selectedCategory) : [];
    }
  };

  const getSlideshowSteps = (type: string) => {
    const baseSteps = [
      {
        id: "setup",
        title: "Setup",
        description: "Configure basic settings",
      },
      {
        id: "content",
        title: "Content",
        description: "Add your content",
      },
      {
        id: "preview",
        title: "Preview",
        description: "Review and finalize",
      },
    ];

    switch (type) {
      case "menu":
        return [
          {
            id: "setup",
            title: "Setup",
            description: "Configure menu settings",
          },
          { id: "items", title: "Menu Items", description: "Add menu items" },
          { id: "theme", title: "Theme", description: "Choose design theme" },
          { id: "preview", title: "Preview", description: "Review menu" },
        ];
      case "ai-facts":
        return [
          { id: "setup", title: "Setup", description: "Configure AI settings" },
          {
            id: "facts",
            title: "Generate Facts",
            description: "Create Afghan facts",
          },
          { id: "preview", title: "Preview", description: "Review facts" },
        ];
      default:
        return baseSteps;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Create New Slideshow - Admin Dashboard</title>
        <meta name="description" content="Create a new slideshow" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Slideshow
              </h1>
              <p className="text-gray-600 mt-2">
                Create slideshows for individual businesses or entire categories
              </p>
            </div>
          </div>
        </div>

        {/* Creation Mode Selection */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Creation Mode
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setCreationMode("single");
                setSelectedCategory("");
              }}
              className={`p-6 border-2 rounded-xl text-left transition-colors ${
                creationMode === "single"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Single Business
                  </p>
                  <p className="text-xs text-gray-500">
                    Create slideshow for one specific business
                  </p>
                </div>
              </div>
            </button>
            <button
              onClick={() => {
                setCreationMode("bulk");
                setSelectedBusiness("");
              }}
              className={`p-6 border-2 rounded-xl text-left transition-colors ${
                creationMode === "bulk"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Bulk Creation
                  </p>
                  <p className="text-xs text-gray-500">
                    Create slideshow for all businesses in a category
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Business/Category Selection */}
        {creationMode === "single" ? (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Business
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((business) => (
                <button
                  key={business.id}
                  onClick={() => setSelectedBusiness(business.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedBusiness === business.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {business.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(business as any).category?.name || "Business"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Category
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedCategory === category.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {category.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {category.business_count} businesses
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Businesses Preview */}
        {getSelectedBusinesses().length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              {creationMode === "single"
                ? "Selected Business:"
                : "Businesses in Category:"}
            </h4>
            <div className="flex flex-wrap gap-2">
              {getSelectedBusinesses().map((business) => (
                <span
                  key={business?.id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {business?.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Slideshow Type Selection */}
        {getSelectedBusinesses().length > 0 && !selectedSlideshowType && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Choose Slideshow Type
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Select the type of slideshow you want to create
                {creationMode === "bulk" &&
                  ` for ${getSelectedBusinesses().length} businesses`}
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: "image",
                    title: "Image Slideshow",
                    description: "Create slideshows from photos",
                    icon: Image,
                    color: "blue",
                  },
                  {
                    id: "video",
                    title: "Video Slideshow",
                    description: "Create slideshows from videos",
                    icon: Video,
                    color: "purple",
                  },
                  {
                    id: "ai-facts",
                    title: "AI Facts",
                    description: "Generate Afghan cultural facts with AI",
                    icon: FileText,
                    color: "green",
                  },
                  {
                    id: "menu",
                    title: "Menu Slideshow",
                    description: "Create menu displays",
                    icon: FileText,
                    color: "orange",
                  },
                  {
                    id: "deals",
                    title: "Special Deals",
                    description: "Promote offers and deals",
                    icon: FileText,
                    color: "red",
                  },
                  {
                    id: "text",
                    title: "Text Slideshow",
                    description: "Create text announcements",
                    icon: FileText,
                    color: "gray",
                  },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleStartCreation(type.id)}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 bg-${type.color}-100 rounded-lg flex items-center justify-center`}
                      >
                        <type.icon
                          className={`w-5 h-5 text-${type.color}-600`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {type.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Slideshow Wizard */}
        {showSlideshowCreator && selectedSlideshowType && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold capitalize">
                      {selectedSlideshowType.replace("-", " ")} Slideshow
                    </h2>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      {creationMode === "single"
                        ? "Single Business"
                        : "Bulk Creation"}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowSlideshowCreator(false);
                      setSelectedSlideshowType("");
                    }}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-white/80 mt-2">
                  {creationMode === "single"
                    ? `Creating for ${
                        businesses.find((b) => b.id === selectedBusiness)?.name
                      }`
                    : `Creating for ${
                        getSelectedBusinesses().length
                      } businesses in ${
                        categories.find((c) => c.id === selectedCategory)?.name
                      }`}
                </p>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[calc(95vh-120px)] overflow-y-auto">
                {(() => {
                  const selectedBusinesses = getSelectedBusinesses();
                  const businessData = selectedBusinesses[0]; // For single business mode

                  switch (selectedSlideshowType) {
                    case "image":
                      return (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Image className="w-8 h-8 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Image Slideshow Creation
                          </h3>
                          <p className="text-gray-600 mb-6">
                            {creationMode === "single"
                              ? `Creating image slideshow for ${businessData?.name}`
                              : `Creating image slideshows for ${selectedBusinesses.length} businesses`}
                          </p>
                          <div className="space-y-2 text-sm text-gray-500 mb-6">
                            <p>Slideshow Type: Image Slideshow</p>
                            <p>
                              Creation Mode:{" "}
                              {creationMode === "single"
                                ? "Single Business"
                                : "Bulk Category"}
                            </p>
                            {creationMode === "single" && (
                              <p>Business: {businessData?.name}</p>
                            )}
                            {creationMode === "bulk" && (
                              <p>
                                Category:{" "}
                                {
                                  categories.find(
                                    (c) => c.id === selectedCategory
                                  )?.name
                                }
                              </p>
                            )}
                            <p>Total Businesses: {selectedBusinesses.length}</p>
                          </div>
                          <div className="flex justify-center space-x-4">
                            <button
                              onClick={() => {
                                setShowSlideshowCreator(false);
                                setSelectedSlideshowType("");
                              }}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                // TODO: Implement actual image slideshow creation
                                alert(
                                  "Image slideshow creation will be implemented here"
                                );
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            >
                              Create Image Slideshow
                              {creationMode === "bulk" ? "s" : ""}
                            </button>
                          </div>
                        </div>
                      );

                    case "menu":
                      return (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-orange-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Menu Slideshow Creation
                          </h3>
                          <p className="text-gray-600 mb-6">
                            {creationMode === "single"
                              ? `Creating menu slideshow for ${businessData?.name}`
                              : `Creating menu slideshows for ${selectedBusinesses.length} businesses`}
                          </p>
                          <div className="space-y-2 text-sm text-gray-500 mb-6">
                            <p>Slideshow Type: Menu Slideshow</p>
                            <p>
                              Creation Mode:{" "}
                              {creationMode === "single"
                                ? "Single Business"
                                : "Bulk Category"}
                            </p>
                            {creationMode === "single" && (
                              <p>Business: {businessData?.name}</p>
                            )}
                            {creationMode === "bulk" && (
                              <p>
                                Category:{" "}
                                {
                                  categories.find(
                                    (c) => c.id === selectedCategory
                                  )?.name
                                }
                              </p>
                            )}
                            <p>Total Businesses: {selectedBusinesses.length}</p>
                          </div>
                          <div className="flex justify-center space-x-4">
                            <button
                              onClick={() => {
                                setShowSlideshowCreator(false);
                                setSelectedSlideshowType("");
                              }}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                // TODO: Implement actual menu slideshow creation
                                alert(
                                  "Menu slideshow creation will be implemented here"
                                );
                              }}
                              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
                            >
                              Create Menu Slideshow
                              {creationMode === "bulk" ? "s" : ""}
                            </button>
                          </div>
                        </div>
                      );

                    case "ai-facts":
                      return (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-green-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            AI Facts Slideshow Creation
                          </h3>
                          <p className="text-gray-600 mb-6">
                            {creationMode === "single"
                              ? `Creating AI facts slideshow for ${businessData?.name}`
                              : `Creating AI facts slideshows for ${selectedBusinesses.length} businesses`}
                          </p>
                          <div className="space-y-2 text-sm text-gray-500 mb-6">
                            <p>Slideshow Type: AI Facts Slideshow</p>
                            <p>
                              Creation Mode:{" "}
                              {creationMode === "single"
                                ? "Single Business"
                                : "Bulk Category"}
                            </p>
                            {creationMode === "single" && (
                              <p>Business: {businessData?.name}</p>
                            )}
                            {creationMode === "bulk" && (
                              <p>
                                Category:{" "}
                                {
                                  categories.find(
                                    (c) => c.id === selectedCategory
                                  )?.name
                                }
                              </p>
                            )}
                            <p>Total Businesses: {selectedBusinesses.length}</p>
                          </div>
                          <div className="flex justify-center space-x-4">
                            <button
                              onClick={() => {
                                setShowSlideshowCreator(false);
                                setSelectedSlideshowType("");
                              }}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                // TODO: Implement actual AI facts slideshow creation
                                alert(
                                  "AI facts slideshow creation will be implemented here"
                                );
                              }}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                            >
                              Create AI Facts Slideshow
                              {creationMode === "bulk" ? "s" : ""}
                            </button>
                          </div>
                        </div>
                      );

                    default:
                      return (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {selectedSlideshowType.charAt(0).toUpperCase() +
                              selectedSlideshowType.slice(1)}{" "}
                            Slideshow Creation
                          </h3>
                          <p className="text-gray-600 mb-6">
                            {creationMode === "single"
                              ? `Creating ${selectedSlideshowType} slideshow for ${businessData?.name}`
                              : `Creating ${selectedSlideshowType} slideshows for ${selectedBusinesses.length} businesses`}
                          </p>
                          <div className="space-y-2 text-sm text-gray-500 mb-6">
                            <p>Slideshow Type: {selectedSlideshowType}</p>
                            <p>
                              Creation Mode:{" "}
                              {creationMode === "single"
                                ? "Single Business"
                                : "Bulk Category"}
                            </p>
                            {creationMode === "single" && (
                              <p>Business: {businessData?.name}</p>
                            )}
                            {creationMode === "bulk" && (
                              <p>
                                Category:{" "}
                                {
                                  categories.find(
                                    (c) => c.id === selectedCategory
                                  )?.name
                                }
                              </p>
                            )}
                            <p>Total Businesses: {selectedBusinesses.length}</p>
                          </div>
                          <div className="flex justify-center space-x-4">
                            <button
                              onClick={() => {
                                setShowSlideshowCreator(false);
                                setSelectedSlideshowType("");
                              }}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                // TODO: Implement actual slideshow creation
                                alert(
                                  `${selectedSlideshowType} slideshow creation will be implemented here`
                                );
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            >
                              Create{" "}
                              {selectedSlideshowType.charAt(0).toUpperCase() +
                                selectedSlideshowType.slice(1)}{" "}
                              Slideshow{creationMode === "bulk" ? "s" : ""}
                            </button>
                          </div>
                        </div>
                      );
                  }
                })()}
              </div>
            </div>
          </div>
        )}

        {getSelectedBusinesses().length === 0 && businesses.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-5 h-5 text-yellow-600 mr-2">⚠️</div>
              <p className="text-sm text-yellow-800">
                Please select a{" "}
                {creationMode === "single" ? "business" : "category"} to start
                creating a slideshow.
              </p>
            </div>
          </div>
        )}

        {businesses.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Businesses
            </h3>
            <p className="text-gray-600 mb-4">
              You need to have active businesses to create slideshows.
            </p>
            <button
              onClick={() => router.push("/admin/businesses")}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Manage Businesses
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
