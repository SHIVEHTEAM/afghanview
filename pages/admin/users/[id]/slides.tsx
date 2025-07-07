import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
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
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Download,
  Share,
  Copy,
  Star,
  Image as ImageIcon,
  Video,
  FileText,
  User,
} from "lucide-react";
import { ProtectedRoute } from "../../../../components/auth";
import AdminLayout from "../../layout";
import { useAuth } from "../../../../lib/auth";
import SimpleImageViewer from "../../../../components/slideshow/SimpleImageViewer";
import { supabase } from "../../../../lib/supabase";

interface Slide {
  id: string;
  name: string;
  type: string;
  title: string;
  subtitle?: string;
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
  published_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  restaurant_id?: string;
}

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export default function AdminUserSlides() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [showViewer, setShowViewer] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<Slide | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "published"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "created" | "type">("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchUserData();
      fetchUserSlides();
    }
  }, [id]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchUserSlides = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/slides");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch slides");
      }

      const data = await response.json();

      // Filter slides: show template slides + user's own slides
      const templateSlides = data.filter(
        (slide: Slide) => !slide.restaurant_id
      );
      const userSlides = data.filter((slide: Slide) => slide.created_by === id);

      // Combine and remove duplicates
      const allSlides = [...templateSlides, ...userSlides];
      const uniqueSlides = allSlides.filter(
        (slide: Slide, index: number, self: Slide[]) =>
          index === self.findIndex((s: Slide) => s.id === slide.id)
      );

      setSlides(uniqueSlides || []);
    } catch (error) {
      console.error("Error fetching slides:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySlide = (slide: Slide) => {
    setCurrentSlide(slide);
    setShowViewer(true);
  };

  const handleDuplicateSlide = async (slide: Slide) => {
    try {
      const duplicateData = {
        ...slide,
        name: `${slide.name} (Copy)`,
        title: `${slide.title} (Copy)`,
        is_published: false,
        published_at: null,
        published_by: null,
        created_by: id, // Set to the user we're viewing
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

      alert("Slide duplicated successfully!");
      fetchUserSlides(); // Refresh the list
    } catch (error) {
      console.error("Error duplicating slide:", error);
      alert(
        error instanceof Error ? error.message : "Failed to duplicate slide"
      );
    }
  };

  const filteredSlides = slides.filter((slide) => {
    const matchesSearch =
      slide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slide.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && slide.is_active) ||
      (filterStatus === "published" && slide.is_published);

    return matchesSearch && matchesStatus;
  });

  const sortedSlides = [...filteredSlides].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "created":
        comparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case "type":
        comparison = a.type.localeCompare(b.type);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

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
        return "bg-green-100 text-green-800";
      case "promo":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-afghan-green"></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <Head>
          <title>User Slides - Admin Dashboard</title>
          <meta name="description" content="View and manage user slides" />
        </Head>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  User Slides
                </h1>
                <div className="flex items-center space-x-2 text-gray-600 mt-1">
                  <User className="h-4 w-4" />
                  <p>
                    {userData
                      ? `${userData.first_name} ${userData.last_name} (${userData.email})`
                      : "Loading..."}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/admin/slides/create?userId=${id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Slide for User
              </Link>
            </div>
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
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-afghan-green focus:border-afghan-green"
                >
                  <option value="all">All Slides</option>
                  <option value="active">Active</option>
                  <option value="published">Published</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-afghan-green focus:border-afghan-green"
                >
                  <option value="created">Created Date</option>
                  <option value="name">Name</option>
                  <option value="type">Type</option>
                </select>

                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </button>

                <button
                  onClick={() =>
                    setViewMode(viewMode === "grid" ? "list" : "grid")
                  }
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {viewMode === "grid" ? (
                    <List className="h-4 w-4" />
                  ) : (
                    <Grid className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Slides Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedSlides.map((slide) => (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Slide Preview */}
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {slide.content.images && slide.content.images.length > 0 ? (
                      <img
                        src={slide.content.images[0].url}
                        alt={slide.content.images[0].alt}
                        className="w-full h-full object-cover"
                      />
                    ) : slide.content.videos &&
                      slide.content.videos.length > 0 ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <div className="text-center text-white">
                          <Video className="h-12 w-12 mx-auto mb-2" />
                          <p className="text-sm">Video Slide</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📺</div>
                          <p className="text-sm text-gray-500">No Preview</p>
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          slide.is_published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {slide.is_published ? "Published" : "Draft"}
                      </span>
                    </div>

                    {/* Media Count */}
                    {slide.content.mediaCount > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        +{slide.content.mediaCount - 1}
                      </div>
                    )}
                  </div>

                  {/* Slide Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate flex-1">
                        {slide.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${getSlideTypeColor(
                          slide.type
                        )}`}
                      >
                        {getSlideTypeIcon(slide.type)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {slide.title}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>Duration: {slide.duration / 1000}s</span>
                      <span>
                        {new Date(slide.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePlaySlide(slide)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Play
                      </button>
                      <button
                        onClick={() => handleDuplicateSlide(slide)}
                        className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  {sortedSlides.map((slide) => (
                    <tr key={slide.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {slide.content.images &&
                            slide.content.images.length > 0 ? (
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={slide.content.images[0].url}
                                alt={slide.content.images[0].alt}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
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
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSlideTypeColor(
                            slide.type
                          )}`}
                        >
                          {getSlideTypeIcon(slide.type)}
                          <span className="ml-1 capitalize">{slide.type}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            slide.is_published
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {slide.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(slide.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePlaySlide(slide)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Play
                          </button>
                          <button
                            onClick={() => handleDuplicateSlide(slide)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {sortedSlides.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📺</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No slides found
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "This user hasn't created any slides yet"}
              </p>
            </div>
          )}
        </div>

        {/* Slide Viewer */}
        {showViewer && currentSlide && (
          <SimpleImageViewer
            images={[
              ...currentSlide.content.images.map((img, index) => ({
                id: img.id || `img-${index}`,
                name: img.alt || `Image ${index + 1}`,
                url: img.url,
                file_path: img.file_path,
                type: "image" as const,
              })),
              ...currentSlide.content.videos.map((vid, index) => ({
                id: vid.id || `vid-${index}`,
                name: vid.alt || `Video ${index + 1}`,
                url: vid.url,
                file_path: vid.file_path,
                type: "video" as const,
              })),
            ]}
            settings={{
              duration: currentSlide.duration || 5000,
              transition: currentSlide.content.animation?.type || "fade",
              autoPlay: true,
              showControls: true,
              tvMode: false,
            }}
            onClose={() => {
              setShowViewer(false);
              setCurrentSlide(null);
            }}
          />
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
