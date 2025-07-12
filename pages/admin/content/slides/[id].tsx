import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Image,
  Video,
  Calendar,
  User,
  Building,
  Clock,
} from "lucide-react";

import { useAuth } from "../../../../lib/auth";
import { supabase } from "../../../../lib/supabase";
import AdminLayout from "../../layout";

interface Slide {
  id: string;
  title: string;
  type: string;
  duration: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  business_id: string;
  slideshow_id: string;
  created_by: string;
  business: {
    id: string;
    name: string;
  };
  slideshow: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export default function SlideDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [slide, setSlide] = useState<Slide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchSlideData();
    }
  }, [id, user]);

  const fetchSlideData = async () => {
    try {
      setLoading(true);

      // Fetch slide details with related data
      const { data, error } = await supabase
        .from("slides")
        .select(
          `
          *,
          business:businesses(id, name),
          slideshow:slideshows(id, title),
          user:users(id, first_name, last_name)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      // Fix the data structure
      const processedSlide = {
        ...data,
        business: data.business?.[0] || { id: "", name: "" },
        slideshow: data.slideshow?.[0] || { id: "", title: "" },
        user: data.user?.[0] || { id: "", first_name: "", last_name: "" },
      };

      setSlide(processedSlide);
    } catch (error) {
      console.error("Error fetching slide data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlide = async () => {
    if (!slide) return;

    try {
      await supabase.from("slides").delete().eq("id", slide.id);
      router.push(`/admin/content/slideshows/${slide.slideshow_id}`);
    } catch (error) {
      console.error("Error deleting slide:", error);
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
        return <Image className="w-6 h-6" />;
      case "video":
        return <Video className="w-6 h-6" />;
      case "text":
        return <FileText className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
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
            <p className="text-gray-600">Loading slide...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!slide) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Slide Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              The slide you're looking for doesn't exist.
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
        <title>{slide.title} - Admin Dashboard</title>
        <meta name="description" content="Slide details" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                router.push(`/admin/content/slideshows/${slide.slideshow_id}`)
              }
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {slide.title}
              </h1>
              <p className="text-gray-600 mt-2">Slide details and management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                router.push(`/admin/content/slides/${slide.id}/edit`)
              }
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={handleDeleteSlide}
              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Slide Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Slide Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{slide.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                          slide.type
                        )}`}
                      >
                        {getTypeIcon(slide.type)}
                        <span className="ml-2">{slide.type}</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Duration
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatDuration(slide.duration)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Order Index
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {slide.order_index}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Slide ID
                    </label>
                    <p className="text-sm text-gray-900 mt-1 font-mono">
                      {slide.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Content Preview
              </h3>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {getTypeIcon(slide.type)}
                </div>
                <p className="text-sm text-gray-600">
                  {slide.type === "image" && "Image content preview"}
                  {slide.type === "video" && "Video content preview"}
                  {slide.type === "text" && "Text content preview"}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Content preview not available in admin view
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Slideshow Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Slideshow
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {slide.slideshow.title}
                  </p>
                  <p className="text-xs text-gray-500">Parent slideshow</p>
                </div>
              </div>
              <button
                onClick={() =>
                  router.push(`/admin/content/slideshows/${slide.slideshow_id}`)
                }
                className="mt-3 w-full text-sm text-blue-600 hover:text-blue-900"
              >
                View Slideshow →
              </button>
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Business
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {slide.business.name}
                  </p>
                  <p className="text-xs text-gray-500">Owner business</p>
                </div>
              </div>
            </div>

            {/* Created By */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Created By
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {slide.user.first_name} {slide.user.last_name}
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
                    {formatDate(slide.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatDate(slide.updated_at)}
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
