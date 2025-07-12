import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Image,
  Video,
  FileText,
  Calendar,
  Building,
  Users,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Play,
  Pause,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import AdminLayout from "../layout";

interface Slideshow {
  id: string;
  title: string;
  description: string;
  business: {
    id: string;
    name: string;
    slug: string;
  };
  created_at: string;
  updated_at: string;
  is_active: boolean;
  slide_count: number;
  total_duration: number;
  created_by: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface Slide {
  id: string;
  title: string;
  type: string;
  business: {
    id: string;
    name: string;
  };
  slideshow: {
    id: string;
    title: string;
  };
  created_at: string;
  duration: number;
  order_index: number;
  created_by: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export default function AdminContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"slideshows" | "slides">(
    "slideshows"
  );
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedItem, setSelectedItem] = useState<Slideshow | Slide | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchContent();
    }
  }, [user, activeTab, filter, sortBy, sortOrder]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      console.log("Fetching content for tab:", activeTab);

      if (activeTab === "slideshows") {
        // Fetch slideshows with proper relationships
        const { data, error } = await supabase
          .from("slideshows")
          .select(
            `
            id,
            name,
            description,
            created_at,
            updated_at,
            is_active,
            business:businesses(id, name, slug)
          `
          )
          .order(sortBy, { ascending: sortOrder === "asc" });

        if (error) {
          console.error("Error fetching slideshows:", error);
          throw error;
        }

        console.log("Raw slideshows data:", data);

        // Get slide counts and durations for each slideshow
        const slideshowsWithDetails = await Promise.all(
          (data || []).map(async (slideshow: any) => {
            // Get slide count from slideshow_slides junction table
            const { count: slideCount } = await supabase
              .from("slideshow_slides")
              .select("*", { count: "exact", head: true })
              .eq("slideshow_id", slideshow.id);

            // Get total duration from slides
            const { data: slidesData } = await supabase
              .from("slideshow_slides")
              .select(
                `
                slides!inner(duration)
              `
              )
              .eq("slideshow_id", slideshow.id);

            console.log(
              `Slides data for slideshow ${slideshow.id}:`,
              slidesData
            );

            const totalDuration =
              slidesData?.reduce((sum: number, item: any) => {
                const duration = item.slides?.duration || 0;
                console.log(`Slide duration: ${duration}, item:`, item);
                return sum + duration;
              }, 0) || 0;

            console.log(
              `Total duration for slideshow ${slideshow.id}: ${totalDuration}`
            );

            return {
              ...slideshow,
              title: slideshow.name, // Map name to title for consistency
              business: slideshow.business?.[0] || {
                id: "",
                name: "",
                slug: "",
              },
              created_by: {
                id: "",
                first_name: "Admin",
                last_name: "User",
              },
              slide_count: slideCount || 0,
              total_duration: totalDuration,
            };
          })
        );

        console.log("Processed slideshows:", slideshowsWithDetails);
        setSlideshows(slideshowsWithDetails);
      } else {
        // Fetch slides with proper relationships
        const { data, error } = await supabase
          .from("slides")
          .select(
            `
            id,
            title,
            type,
            created_at,
            duration,
            order_index,
            business:businesses(id, name),
            created_by
          `
          )
          .order(sortBy, { ascending: sortOrder === "asc" });

        if (error) {
          console.error("Error fetching slides:", error);
          throw error;
        }

        console.log("Raw slides data:", data);

        // Get slideshow info for each slide
        const slidesWithDetails = await Promise.all(
          (data || []).map(async (slide: any) => {
            // Get slideshow info for this slide
            const { data: slideshowData } = await supabase
              .from("slideshow_slides")
              .select(
                `
                slideshow:slideshows(id, name)
              `
              )
              .eq("slide_id", slide.id)
              .limit(1);

            return {
              ...slide,
              business: slide.business?.[0] || { id: "", name: "" },
              slideshow: slideshowData?.[0]?.slideshow?.[0] || {
                id: "",
                title: "",
              },
              created_by: {
                id: slide.created_by || "",
                first_name: "Admin",
                last_name: "User",
              },
            };
          })
        );

        console.log("Processed slides:", slidesWithDetails);
        setSlides(slidesWithDetails);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async () => {
    if (!selectedItem) return;

    try {
      if (activeTab === "slideshows") {
        const slideshow = selectedItem as Slideshow;
        // Delete slideshow_slides associations first
        await supabase
          .from("slideshow_slides")
          .delete()
          .eq("slideshow_id", slideshow.id);
        // Delete slideshow
        await supabase.from("slideshows").delete().eq("id", slideshow.id);
      } else {
        const slide = selectedItem as Slide;
        // Delete slideshow_slides associations first
        await supabase
          .from("slideshow_slides")
          .delete()
          .eq("slide_id", slide.id);
        // Delete slide
        await supabase.from("slides").delete().eq("id", slide.id);
      }

      setShowDeleteModal(false);
      setSelectedItem(null);
      fetchContent();
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  const handleToggleStatus = async (slideshowId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("slideshows")
        .update({ is_active: !isActive })
        .eq("id", slideshowId);

      if (error) throw error;
      fetchContent();
    } catch (error) {
      console.error("Error updating slideshow status:", error);
    }
  };

  const filteredContent =
    activeTab === "slideshows"
      ? slideshows.filter(
          (slideshow) =>
            slideshow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slideshow.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            slideshow.business.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        )
      : slides.filter(
          (slide) =>
            slide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slide.business.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            slide.slideshow.title
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "text":
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "text-blue-600 bg-blue-100";
      case "video":
        return "text-purple-600 bg-purple-100";
      case "text":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Content Management - Admin Dashboard</title>
        <meta
          name="description"
          content="Manage slideshows and slides in AfghanView"
        />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Content Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage slideshows and slides across all businesses
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchContent}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push("/admin/content/slideshows/new")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create Slideshow</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("slideshows")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "slideshows"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Slideshows ({slideshows.length})
              </button>
              <button
                onClick={() => setActiveTab("slides")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "slides"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Individual Slides ({slides.length})
              </button>
            </nav>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  {activeTab === "slideshows" ? (
                    <>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </>
                  ) : (
                    <>
                      <option value="image">Images</option>
                      <option value="video">Videos</option>
                      <option value="text">Text</option>
                    </>
                  )}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="created_at">Created Date</option>
                  <option value="title">Title</option>
                  {activeTab === "slideshows" && (
                    <option value="is_active">Status</option>
                  )}
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading content...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === "slideshows" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(filteredContent as any).map((slideshow: Slideshow) => (
                    <div
                      key={slideshow.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {slideshow.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {slideshow.description}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <Building className="w-4 h-4 mr-1" />
                              {slideshow.business.name}
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              slideshow.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {slideshow.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">
                              {slideshow.slide_count}
                            </div>
                            <div className="text-xs text-gray-600">Slides</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">
                              {formatDuration(slideshow.total_duration)}
                            </div>
                            <div className="text-xs text-gray-600">
                              Duration
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>
                            Created {formatDate(slideshow.created_at)}
                          </span>
                          <span>
                            by {slideshow.created_by.first_name}{" "}
                            {slideshow.created_by.last_name}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/slideshow/${slideshow.business.slug}`
                                )
                              }
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/content/slideshows/${slideshow.id}/edit`
                                )
                              }
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </button>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() =>
                                handleToggleStatus(
                                  slideshow.id,
                                  slideshow.is_active
                                )
                              }
                              className={`p-1.5 rounded ${
                                slideshow.is_active
                                  ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                                  : "text-green-600 hover:text-green-900 hover:bg-green-50"
                              }`}
                            >
                              {slideshow.is_active ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(slideshow);
                                setShowDeleteModal(true);
                              }}
                              className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slide
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slideshow
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(filteredContent as any).map((slide: Slide) => (
                      <tr key={slide.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              {getTypeIcon(slide.type)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {slide.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                Order: {slide.order_index}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                              slide.type
                            )}`}
                          >
                            {slide.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {slide.business.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {slide.slideshow.title}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDuration(slide.duration)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(slide.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/content/slides/${slide.id}/edit`
                                )
                              }
                              className="p-1 text-gray-600 hover:text-gray-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(slide);
                                setShowDeleteModal(true);
                              }}
                              className="p-1 text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {!loading && filteredContent.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === "slideshows" ? (
                  <Play className="w-8 h-8 text-gray-400" />
                ) : (
                  <Image className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} found
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === "slideshows"
                  ? "No slideshows match your current filters."
                  : "No slides match your current filters."}
              </p>
              <button
                onClick={() => router.push("/admin/content/slideshows/new")}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create {activeTab === "slideshows" ? "Slideshow" : "Slide"}
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedItem && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete{" "}
                        {activeTab === "slideshows" ? "Slideshow" : "Slide"}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete "
                          {activeTab === "slideshows"
                            ? (selectedItem as Slideshow).title
                            : (selectedItem as Slide).title}
                          "? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleDeleteContent}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedItem(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
