import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Play,
  Pause,
  Eye,
  FileText,
  Image,
  Video,
  Calendar,
  User,
  Building,
} from "lucide-react";

import { useAuth } from "../../../../lib/auth";
import { supabase } from "../../../../lib/supabase";
import AdminLayout from "../../layout";

interface Slideshow {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  business: {
    id: string;
    name: string;
    slug: string;
  };
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
  duration: number;
  order_index: number;
  created_at: string;
}

export default function SlideshowDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [slideshow, setSlideshow] = useState<Slideshow | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchSlideshowData();
    }
  }, [id, user]);

  const fetchSlideshowData = async () => {
    try {
      setLoading(true);

      // Fetch slideshow details
      const { data: slideshowData, error: slideshowError } = await supabase
        .from("slideshows")
        .select(
          `
          id,
          title,
          description,
          created_at,
          updated_at,
          is_active,
          business:businesses(id, name, slug),
          created_by:users(id, first_name, last_name)
        `
        )
        .eq("id", id)
        .single();

      if (slideshowError) throw slideshowError;

      // Fix the data structure
      const processedSlideshow = {
        ...slideshowData,
        business: slideshowData.business?.[0] || { id: "", name: "", slug: "" },
        created_by: slideshowData.created_by?.[0] || {
          id: "",
          first_name: "",
          last_name: "",
        },
      };

      setSlideshow(processedSlideshow);

      // Fetch slides using the junction table
      const { data: slidesData, error: slidesError } = await supabase
        .from("slideshow_slides")
        .select(
          `
          order_index,
          slide:slides(
            id,
            title,
            type,
            duration,
            created_at
          )
        `
        )
        .eq("slideshow_id", id)
        .order("order_index");

      if (slidesError) throw slidesError;

      // Extract slides from the junction table data
      const slidesList = (slidesData || [])
        .map((item) => item.slide?.[0])
        .filter((slide) => slide) // Remove any null slides
        .map((slide, index) => ({
          ...slide,
          order_index: slidesData[index]?.order_index || index + 1,
        }));

      setSlides(slidesList);
    } catch (error) {
      console.error("Error fetching slideshow data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!slideshow) return;

    try {
      const { error } = await supabase
        .from("slideshows")
        .update({ is_active: !slideshow.is_active })
        .eq("id", slideshow.id);

      if (error) throw error;
      fetchSlideshowData();
    } catch (error) {
      console.error("Error updating slideshow status:", error);
    }
  };

  const handleDeleteSlideshow = async () => {
    if (!slideshow) return;

    try {
      // Delete slides first
      await supabase.from("slides").delete().eq("slideshow_id", slideshow.id);
      // Delete slideshow
      await supabase.from("slideshows").delete().eq("id", slideshow.id);
      router.push("/admin/content");
    } catch (error) {
      console.error("Error deleting slideshow:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading slideshow...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!slideshow) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Slideshow Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              The slideshow you're looking for doesn't exist.
            </p>
            <button
              onClick={() => router.push("/admin/content")}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Content
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>{slideshow.title} - Admin Dashboard</title>
        <meta name="description" content="Slideshow details" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/admin/content")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {slideshow.title}
              </h1>
              <p className="text-gray-600 mt-2">
                Slideshow details and management
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleToggleStatus}
              className={`p-2 rounded-lg ${
                slideshow.is_active
                  ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                  : "text-green-600 hover:text-green-900 hover:bg-green-50"
              }`}
            >
              {slideshow.is_active ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() =>
                router.push(`/admin/content/slideshows/${slideshow.id}/edit`)
              }
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={handleDeleteSlideshow}
              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Slideshow Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Slideshow Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {slideshow.title}
                  </p>
                </div>
                {slideshow.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {slideshow.description}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          slideshow.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {slideshow.is_active ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Total Slides
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {slides.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Slides List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Slides ({slides.length})
                  </h3>
                  <button
                    onClick={() =>
                      router.push(
                        `/admin/content/slides/new?slideshow=${slideshow.id}`
                      )
                    }
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Slide</span>
                  </button>
                </div>
              </div>
              <div className="p-6">
                {slides.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Slides Yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start by adding your first slide to this slideshow.
                    </p>
                    <button
                      onClick={() =>
                        router.push(
                          `/admin/content/slides/new?slideshow=${slideshow.id}`
                        )
                      }
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Slide
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {slides.map((slide, index) => (
                      <div
                        key={slide.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {slide.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                                  slide.type
                                )}`}
                              >
                                {getTypeIcon(slide.type)}
                                <span className="ml-1">{slide.type}</span>
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDuration(slide.duration)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              router.push(`/admin/content/slides/${slide.id}`)
                            }
                            className="p-1 text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Business Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Business
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {slideshow.business.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {slideshow.business.slug}
                  </p>
                </div>
              </div>
            </div>

            {/* Created By */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Created By
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {slideshow.created_by.first_name}{" "}
                    {slideshow.created_by.last_name}
                  </p>
                  <p className="text-xs text-gray-500">Creator</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dates
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Created
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatDate(slideshow.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatDate(slideshow.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
