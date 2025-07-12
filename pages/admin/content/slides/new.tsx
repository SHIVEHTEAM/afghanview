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
  Info,
} from "lucide-react";

import { useAuth } from "../../../../lib/auth";
import { supabase } from "../../../../lib/supabase";
import AdminLayout from "../../layout";

interface Slideshow {
  id: string;
  title: string;
  business: {
    id: string;
    name: string;
  };
}

export default function AdminCreateSlide() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [slideshows, setSlideshows] = useState<Slideshow[]>([]);
  const [selectedSlideshow, setSelectedSlideshow] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchSlideshows();
    }
  }, [user]);

  const fetchSlideshows = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("slideshows")
        .select(
          `
          id,
          title,
          business:businesses(id, name)
        `
        )
        .eq("is_active", true)
        .order("title");

      if (error) throw error;

      const processedSlideshows = (data || []).map((slideshow: any) => ({
        id: slideshow.id,
        title: slideshow.title,
        business: slideshow.business?.[0] || { id: "", name: "" },
      }));

      setSlideshows(processedSlideshows);
    } catch (error) {
      console.error("Error fetching slideshows:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlideshowSelected = (slideshowId: string) => {
    // Redirect to the slideshow creator to add slides
    router.push(`/slideshow-creator?slideshow=${slideshowId}&mode=add-slides`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading slideshows...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Add Slides - Admin Dashboard</title>
        <meta name="description" content="Add slides to existing slideshows" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold text-gray-900">Add Slides</h1>
              <p className="text-gray-600 mt-2">
                Add slides to existing slideshows using the slideshow creator
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Using Slideshow Creator
              </h3>
              <p className="text-sm text-blue-700">
                To add slides, select a slideshow below. You'll be redirected to
                the slideshow creator where you can add new slides using the
                existing, fully-featured creation tools.
              </p>
            </div>
          </div>
        </div>

        {/* Slideshow Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Select Slideshow
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Choose which slideshow you want to add slides to
            </p>
          </div>
          <div className="p-6">
            {slideshows.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slideshows.map((slideshow) => (
                  <button
                    key={slideshow.id}
                    onClick={() => handleSlideshowSelected(slideshow.id)}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Plus className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {slideshow.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {slideshow.business.name}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Slideshows Available
                </h3>
                <p className="text-gray-600 mb-4">
                  You need to create slideshows first before adding slides.
                </p>
                <button
                  onClick={() => router.push("/admin/content/slideshows/new")}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Slideshow
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Alternative Actions */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Other Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push("/admin/content/slideshows/new")}
              className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-white transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Create New Slideshow
                  </p>
                  <p className="text-sm text-gray-600">
                    Start a new slideshow from scratch
                  </p>
                </div>
              </div>
            </button>
            <button
              onClick={() => router.push("/slideshow-creator")}
              className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-white transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Open Slideshow Creator
                  </p>
                  <p className="text-sm text-gray-600">
                    Use the full slideshow creator
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
