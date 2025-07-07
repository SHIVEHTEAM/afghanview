import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "../layout";
import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import {
  ArrowLeft,
  Edit,
  Eye,
  Trash2,
  Copy,
  Download,
  Share,
  Settings,
  Lock,
  Unlock,
  Calendar,
  User,
  Clock,
  Image as ImageIcon,
  Video,
  FileText,
  Star,
  Quote,
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  ExternalLink,
} from "lucide-react";
import { ProtectedRoute } from "../../../components/auth";

interface Slide {
  id: string;
  restaurant_id: string | null;
  template_id: string | null;
  name: string;
  type: string;
  title: string;
  subtitle: string | null;
  content: {
    images: any[];
    videos: any[];
    text: {
      title: string;
      subtitle: string;
      description: string;
    };
    styling: any;
    animation: any;
    mediaCount: number;
    hasVideos: boolean;
    hasImages: boolean;
  };
  styling: any;
  duration: number;
  order_index: number;
  is_active: boolean;
  is_published: boolean;
  is_locked: boolean;
  published_at: string | null;
  published_by: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  restaurant?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export default function SlideDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [slide, setSlide] = useState<Slide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchSlide();
    }
  }, [id]);

  const fetchSlide = async () => {
    try {
      const response = await fetch(`/api/slides/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load slide");
      }

      const data = await response.json();
      setSlide(data);
    } catch (error) {
      console.error("Error fetching slide:", error);
      setError(error instanceof Error ? error.message : "Failed to load slide");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this slide?")) return;

    try {
      const response = await fetch(`/api/slides/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete slide");
      }

      router.push("/admin/slides");
    } catch (error) {
      console.error("Error deleting slide:", error);
      alert(error instanceof Error ? error.message : "Failed to delete slide");
    }
  };

  const handleToggleLock = async () => {
    if (!slide) return;

    try {
      const response = await fetch(`/api/slides/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_locked: !slide.is_locked }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update slide lock status"
        );
      }

      const updatedSlide = await response.json();
      setSlide(updatedSlide);
    } catch (error) {
      console.error("Error toggling lock:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update slide lock status"
      );
    }
  };

  const handleTogglePublish = async () => {
    if (!slide) return;

    try {
      const updateData = {
        is_published: !slide.is_published,
        published_at: !slide.is_published ? new Date().toISOString() : null,
        published_by: !slide.is_published ? user?.id || null : null,
      };

      const response = await fetch(`/api/slides/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update slide publish status"
        );
      }

      const updatedSlide = await response.json();
      setSlide(updatedSlide);
    } catch (error) {
      console.error("Error toggling publish:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update slide publish status"
      );
    }
  };

  const handleDuplicate = async () => {
    if (!slide) return;

    try {
      const duplicateData = {
        ...slide,
        name: `${slide.name} (Copy)`,
        title: `${slide.title} (Copy)`,
        is_published: false,
        published_at: null,
        published_by: null,
        created_by: user?.id,
        updated_by: user?.id,
      };

      // Remove the id so a new one is generated
      const {
        id: _,
        created_at: __,
        updated_at: ___,
        ...cleanDuplicateData
      } = duplicateData;

      const response = await fetch("/api/slides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanDuplicateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to duplicate slide");
      }

      const newSlide = await response.json();
      alert("Slide duplicated successfully!");
      router.push(`/admin/slides/${newSlide.id}`);
    } catch (error) {
      console.error("Error duplicating slide:", error);
      alert(
        error instanceof Error ? error.message : "Failed to duplicate slide"
      );
    }
  };

  const handlePreview = () => {
    if (!slide) return;

    // Open preview in a new tab
    const previewUrl = `/slideshow/preview/${slide.id}`;
    window.open(previewUrl, "_blank");
  };

  const getSlideTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      case "custom":
        return <Video className="h-5 w-5" />;
      case "menu":
        return <FileText className="h-5 w-5" />;
      case "promo":
        return <Star className="h-5 w-5" />;
      case "quote":
        return <Quote className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getSlideTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "bg-blue-100 text-blue-800";
      case "custom":
        return "bg-purple-100 text-purple-800";
      case "menu":
        return "bg-green-100 text-green-800";
      case "promo":
        return "bg-yellow-100 text-yellow-800";
      case "quote":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-afghan-green"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !slide) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Slide Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              {error || "The slide could not be found"}
            </p>
            <Link
              href="/admin/slides"
              className="inline-flex items-center px-4 py-2 bg-afghan-green text-white rounded-lg hover:bg-afghan-green-dark"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Slides
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <Head>
          <title>{slide.name} - ShivehView Admin</title>
          <meta
            name="description"
            content={`View and manage slide: ${slide.name}`}
          />
        </Head>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/slides"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {slide.name}
                </h1>
                <p className="text-gray-600">Slide Details</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleLock}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  slide.is_locked
                    ? "bg-red-100 text-red-800 hover:bg-red-200"
                    : "bg-green-100 text-green-800 hover:bg-green-200"
                }`}
              >
                {slide.is_locked ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Unlock
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Lock
                  </>
                )}
              </button>

              <button
                onClick={handleTogglePublish}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  slide.is_published
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {slide.is_published ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Published
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Unpublished
                  </>
                )}
              </button>

              <Link
                href={`/admin/slides/create?duplicate=${id}`}
                className="inline-flex items-center px-4 py-2 bg-afghan-green text-white rounded-lg hover:bg-afghan-green-dark"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </div>
          </div>

          {/* Slide Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Slide Preview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Preview
                  </h2>
                  <button
                    onClick={handlePreview}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open Preview
                  </button>
                </div>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {slide.content.images && slide.content.images.length > 0 ? (
                    <div className="relative w-full h-full">
                      <img
                        src={slide.content.images[0].url}
                        alt={slide.content.images[0].alt}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                        <h3 className="font-semibold">{slide.title}</h3>
                        {slide.subtitle && (
                          <p className="text-sm opacity-90">{slide.subtitle}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📺</div>
                        <p className="text-gray-600">No Preview Available</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {slide.content.mediaCount} media items
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Content
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{slide.title}</h3>
                    {slide.subtitle && (
                      <p className="text-gray-600 mt-1">{slide.subtitle}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSlideTypeColor(
                        slide.type
                      )}`}
                    >
                      {getSlideTypeIcon(slide.type)}
                      <span className="ml-2 capitalize">{slide.type}</span>
                    </span>

                    <span className="text-sm text-gray-500">
                      Duration: {slide.duration / 1000}s
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Images
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {slide.content.images.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Videos
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {slide.content.videos.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Status
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        slide.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {slide.is_active ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Published</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        slide.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {slide.is_published ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Locked</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        slide.is_locked
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {slide.is_locked ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Order</span>
                    <span className="text-sm font-medium text-gray-900">
                      {slide.order_index}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metadata Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Metadata
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Created: {new Date(slide.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Updated: {new Date(slide.updated_at).toLocaleDateString()}
                  </div>
                  {slide.published_at && (
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Published:{" "}
                      {new Date(slide.published_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Actions
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={handlePreview}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => {
                      const slideData = JSON.stringify(slide, null, 2);
                      const blob = new Blob([slideData], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${slide?.name || "slide"}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/slideshow/${slide?.id}`;
                      navigator.clipboard.writeText(shareUrl);
                      alert("Share URL copied to clipboard!");
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
