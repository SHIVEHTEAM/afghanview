import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import AdminLayout from "../layout";
import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import { ProtectedRoute } from "../../../components/auth";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Copy,
  Share2,
  Calendar,
  Building,
  Image as ImageIcon,
  Video,
  FileText,
  Star,
  Clock,
  Users,
  Settings,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import SlideshowCreator from "../../../components/slideshow-creator/SlideshowCreator";
import SlideshowWizard from "../../../components/slideshow-creator/SlideshowWizard";
import ImageSlideshowWizard from "../../../components/slideshow-creator/image/ImageSlideshowWizard";
import VideoSlideshowWizard from "../../../components/slideshow-creator/video/VideoSlideshowWizard";
import AiFactsSlideshowWizard from "../../../components/slideshow-creator/ai-facts/AiFactsSlideshowWizard";
import MenuSlideshowWizard from "../../../components/slideshow-creator/menu/MenuSlideshowWizard";
import DealsSlideshowWizard from "../../../components/slideshow-creator/deals/DealsSlideshowWizard";
import TextSlideshowWizard from "../../../components/slideshow-creator/text/TextSlideshowWizard";

interface Slide {
  id: string;
  name: string;
  type: string;
  title: string;
  subtitle?: string;
  content: any;
  styling: any;
  duration: number;
  order_index: number;
  is_active: boolean;
  is_published: boolean;
  is_locked: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  restaurant_id?: string;
  restaurant?: {
    id: string;
    name: string;
    slug: string;
  };
  created_by?: string;
  updated_by?: string;
}

export default function AdminSlides() {
  const { user } = useAuth();
  const [slides, setSlides] = useState<Slide[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSlides, setSelectedSlides] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [showSlideshowCreator, setShowSlideshowCreator] = useState(false);
  const [wizardType, setWizardType] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardFormData, setWizardFormData] = useState<any>({});
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      console.log("Fetching slides...");
      console.log("Current user:", user?.id);

      // Use server-side API to bypass RLS
      const response = await fetch("/api/slides");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch slides");
      }

      const data = await response.json();
      console.log("Slides fetched successfully:", data?.length || 0, "slides");
      if (data && data.length > 0) {
        console.log("First slide:", data[0]);
      }
      setSlides(data || []);
    } catch (error) {
      console.error("Error fetching slides:", error);
      // Show error to user
      alert(
        `Error fetching slides: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredSlides = slides.filter((slide) => {
    const matchesSearch =
      slide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slide.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || slide.type === selectedType;

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && slide.is_active) ||
      (selectedStatus === "published" && slide.is_published) ||
      (selectedStatus === "draft" && !slide.is_published);

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleBulkAction = async () => {
    if (!selectedSlides.length || !bulkAction) return;

    try {
      switch (bulkAction) {
        case "activate":
          await supabase
            .from("slides")
            .update({ is_active: true })
            .in("id", selectedSlides);
          break;
        case "deactivate":
          await supabase
            .from("slides")
            .update({ is_active: false })
            .in("id", selectedSlides);
          break;
        case "publish":
          await supabase
            .from("slides")
            .update({
              is_published: true,
              published_at: new Date().toISOString(),
            })
            .in("id", selectedSlides);
          break;
        case "unpublish":
          await supabase
            .from("slides")
            .update({ is_published: false })
            .in("id", selectedSlides);
          break;
        case "delete":
          await supabase.from("slides").delete().in("id", selectedSlides);
          break;
      }

      setSelectedSlides([]);
      setBulkAction("");
      fetchSlides();
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const getSlideTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "menu":
        return <FileText className="h-4 w-4" />;
      case "promo":
        return <Star className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getSlideTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "bg-blue-100 text-blue-800";
      case "video":
        return "bg-purple-100 text-purple-800";
      case "menu":
        return "bg-purple-100 text-green-800";
      case "promo":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handler for starting the wizard
  const handleStartCreation = (type: string) => {
    setWizardType(type);
    setShowSlideshowCreator(false);
    setShowWizard(true);
    setWizardFormData({});
  };

  // Update form data handler
  const handleUpdateFormData = (data: any) => {
    setWizardFormData({ ...wizardFormData, ...data });
  };

  // Handler for wizard completion
  const handleWizardComplete = async (data: any) => {
    try {
      console.log("Admin creating slideshow with data:", data);

      // Extract admin settings
      const adminSettings = data.adminSettings || {};

      // Prepare the slideshow data with admin settings
      const slideshowData = {
        ...data,
        // Admin-specific fields
        is_locked: adminSettings.isLocked || false,
        is_template: adminSettings.isTemplate || false,
        assign_to_all: adminSettings.assignToAll || false,
        selected_restaurants: adminSettings.selectedRestaurants || [],
        allow_client_edit: adminSettings.allowClientEdit !== false, // Default to true
        require_approval: adminSettings.requireApproval || false,
        created_by: user?.id,
        created_at: new Date().toISOString(),
      };
      // Remove images property if present
      if (slideshowData.images) delete slideshowData.images;

      // Call the slideshow creation API
      const response = await fetch("/api/slideshows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(slideshowData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to create slideshow: ${response.status} ${response.statusText} - ${errorData}`
        );
      }

      const result = await response.json();
      console.log("Slideshow created successfully:", result);

      // Show success message
      alert("Slideshow created successfully!");

      setShowWizard(false);
      // Refresh slides list
      fetchSlides();
    } catch (error) {
      console.error("Error creating slideshow:", error);
      alert(
        `Error creating slideshow: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Get the appropriate wizard component based on type
  const getWizardComponent = (type: string) => {
    switch (type) {
      case "image":
        return (
          <ImageSlideshowWizard
            formData={wizardFormData}
            updateFormData={handleUpdateFormData}
            onComplete={handleWizardComplete}
          />
        );
      case "video":
        return (
          <VideoSlideshowWizard
            formData={wizardFormData}
            updateFormData={handleUpdateFormData}
            onComplete={handleWizardComplete}
          />
        );
      case "ai-facts":
        return (
          <AiFactsSlideshowWizard
            formData={wizardFormData}
            updateFormData={handleUpdateFormData}
            onComplete={handleWizardComplete}
          />
        );
      case "menu":
        return (
          <MenuSlideshowWizard
            formData={wizardFormData}
            updateFormData={handleUpdateFormData}
            onComplete={handleWizardComplete}
          />
        );
      case "deals":
        return (
          <DealsSlideshowWizard
            formData={wizardFormData}
            updateFormData={handleUpdateFormData}
            onComplete={handleWizardComplete}
          />
        );
      case "text":
        return (
          <TextSlideshowWizard
            formData={wizardFormData}
            updateFormData={handleUpdateFormData}
            onComplete={handleWizardComplete}
          />
        );
      default:
        return (
          <ImageSlideshowWizard
            formData={wizardFormData}
            updateFormData={handleUpdateFormData}
            onComplete={handleWizardComplete}
          />
        );
    }
  };

  // Get steps for the wizard
  const getWizardSteps = (type: string) => {
    switch (type) {
      case "image":
        return [
          {
            id: "upload",
            title: "Upload Images",
            description: "Select and upload your images",
          },
          {
            id: "arrange",
            title: "Arrange Images",
            description: "Organize your slides",
          },
          {
            id: "settings",
            title: "Settings",
            description: "Configure slideshow settings",
          },
        ];
      case "video":
        return [
          {
            id: "upload",
            title: "Upload Videos",
            description: "Select and upload your videos",
          },
          {
            id: "customize",
            title: "Customize",
            description: "Adjust video settings",
          },
          {
            id: "preview",
            title: "Preview",
            description: "Preview your slideshow",
          },
        ];
      case "ai-facts":
        return [
          {
            id: "prompt",
            title: "AI Prompt",
            description: "Configure AI generation settings",
          },
          {
            id: "generate",
            title: "Generate Facts",
            description: "Generate Afghan cultural facts",
          },
          {
            id: "settings",
            title: "Settings",
            description: "Configure slideshow settings",
          },
        ];
      case "menu":
        return [
          {
            id: "items",
            title: "Menu Items",
            description: "Add your menu items",
          },
          {
            id: "layout",
            title: "Layout",
            description: "Choose layout and styling",
          },
          {
            id: "preview",
            title: "Preview",
            description: "Preview your menu slideshow",
          },
        ];
      case "deals":
        return [
          {
            id: "deals",
            title: "Special Deals",
            description: "Add your deals and offers",
          },
          {
            id: "styling",
            title: "Styling",
            description: "Customize appearance",
          },
          {
            id: "preview",
            title: "Preview",
            description: "Preview your deals slideshow",
          },
        ];
      case "text":
        return [
          {
            id: "content",
            title: "Text Content",
            description: "Add your text content",
          },
          {
            id: "styling",
            title: "Styling",
            description: "Customize text appearance",
          },
          {
            id: "preview",
            title: "Preview",
            description: "Preview your text slideshow",
          },
        ];
      default:
        return [
          { id: "upload", title: "Upload", description: "Upload your media" },
          {
            id: "settings",
            title: "Settings",
            description: "Configure settings",
          },
        ];
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <Head>
          <title>Slides Management - ShivehView Admin</title>
          <meta name="description" content="Manage slides in the system" />
        </Head>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Slides Management
              </h1>
              <p className="text-gray-600 mt-1">Manage slides in the system</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/test-slides");
                    const data = await response.json();
                    console.log("Slides test result:", data);
                    if (data.success) {
                      alert(
                        `Slides test: ${data.totalSlides} slides found - Table is working!`
                      );
                    } else {
                      alert(`Slides test error: ${data.error}`);
                    }
                  } catch (error) {
                    console.error("Test failed:", error);
                    alert("Test failed: " + error);
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afghan-green"
              >
                Test Slides
              </button>
              <button
                onClick={() => setShowSlideshowCreator(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afghan-green"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Slideshow
              </button>
              <Link
                href="/admin/slides/templates"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afghan-green"
              >
                <Settings className="h-4 w-4 mr-2" />
                Templates
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ImageIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Slides
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {slides.length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {slides.filter((s) => s.is_published).length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow"
            >
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {slides.filter((s) => !s.is_published).length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow"
            ></motion.div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search slides..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-afghan-green focus:border-afghan-green"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
              </div>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    >
                      <option value="all">All Types</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="menu">Menu</option>
                      <option value="promo">Promo</option>
                      <option value="quote">Quote</option>
                      <option value="hours">Hours</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedSlides.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  {selectedSlides.length} slide(s) selected
                </p>
                <div className="flex items-center space-x-3">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="">Select Action</option>
                    <option value="activate">Activate</option>
                    <option value="deactivate">Deactivate</option>
                    <option value="publish">Publish</option>
                    <option value="unpublish">Unpublish</option>
                    <option value="delete">Delete</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setSelectedSlides([])}
                    className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Slides Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={
                          selectedSlides.length === filteredSlides.length &&
                          filteredSlides.length > 0
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSlides(filteredSlides.map((s) => s.id));
                          } else {
                            setSelectedSlides([]);
                          }
                        }}
                        className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slide
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSlides.map((slide) => (
                    <motion.tr
                      key={slide.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedSlides.includes(slide.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSlides([...selectedSlides, slide.id]);
                            } else {
                              setSelectedSlides(
                                selectedSlides.filter((id) => id !== slide.id)
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              {getSlideTypeIcon(slide.type)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {slide.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {slide.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSlideTypeColor(
                            slide.type
                          )}`}
                        >
                          {getSlideTypeIcon(slide.type)}
                          <span className="ml-1">{slide.type}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {slide.is_published ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Draft
                            </span>
                          )}
                          {slide.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Unlock className="h-3 w-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-red-800">
                              <Lock className="h-3 w-3 mr-1" />
                              Inactive
                            </span>
                          )}
                          {slide.is_locked && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <Lock className="h-3 w-3 mr-1" />
                              Locked
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          {new Date(slide.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/slides/${slide.id}`}
                            className="text-afghan-green hover:text-afghan-green-dark"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/slides/${slide.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => {
                              // Handle copy slide
                            }}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              // Handle share slide
                            }}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSlides.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No slides found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ||
                  selectedType !== "all" ||
                  selectedStatus !== "all"
                    ? "Try adjusting your filters or search terms."
                    : "Get started by creating a new slide."}
                </p>
                {!searchTerm &&
                  selectedType === "all" &&
                  selectedStatus === "all" && (
                    <div className="mt-6">
                      <button
                        onClick={() => setShowSlideshowCreator(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afghan-green"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Slideshow
                      </button>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
        {showSlideshowCreator && (
          <SlideshowCreator
            onClose={() => setShowSlideshowCreator(false)}
            onStartCreation={handleStartCreation}
          />
        )}
        {showWizard && wizardType && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold capitalize">
                      {wizardType.replace("-", " ")} Slideshow
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowWizard(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                {wizardType === "image" && (
                  <ImageSlideshowWizard
                    step={0}
                    formData={wizardFormData}
                    updateFormData={handleUpdateFormData}
                    onComplete={handleWizardComplete}
                  />
                )}
                {wizardType === "video" && (
                  <VideoSlideshowWizard
                    step={0}
                    formData={wizardFormData}
                    updateFormData={handleUpdateFormData}
                    onComplete={handleWizardComplete}
                  />
                )}
                {wizardType === "ai-facts" && (
                  <AiFactsSlideshowWizard
                    step={0}
                    formData={wizardFormData}
                    updateFormData={handleUpdateFormData}
                    onComplete={handleWizardComplete}
                    onBack={() => setShowWizard(false)}
                  />
                )}
                {wizardType === "menu" && (
                  <MenuSlideshowWizard
                    step={0}
                    formData={wizardFormData}
                    updateFormData={handleUpdateFormData}
                    onComplete={handleWizardComplete}
                  />
                )}
                {wizardType === "deals" && (
                  <DealsSlideshowWizard
                    step={0}
                    formData={wizardFormData}
                    updateFormData={handleUpdateFormData}
                    onComplete={handleWizardComplete}
                  />
                )}
                {wizardType === "text" && (
                  <TextSlideshowWizard
                    step={0}
                    formData={wizardFormData}
                    updateFormData={handleUpdateFormData}
                    onComplete={handleWizardComplete}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
