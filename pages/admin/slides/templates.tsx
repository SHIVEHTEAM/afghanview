import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import AdminLayout from "../layout";
import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  Star,
  Settings,
  Image as ImageIcon,
  Video,
  FileText,
  Quote,
  Clock,
  Palette,
  Type,
  Layout,
  Download,
  Upload,
  Grid,
  List,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ProtectedRoute } from "../../../components/auth";

interface SlideTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  thumbnail_url: string;
  template_data: any;
  is_active: boolean;
  is_system: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
  created_by_user: {
    first_name: string;
    last_name: string;
  };
}

export default function SlideTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<SlideTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("slide_templates")
        .select(
          `
          *,
          created_by_user:users!slide_templates_created_by_fkey(first_name, last_name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || template.type === selectedType;
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && template.is_active) ||
      (selectedStatus === "system" && template.is_system);

    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  const handleBulkAction = async () => {
    if (!selectedTemplates.length || !bulkAction) return;

    try {
      switch (bulkAction) {
        case "activate":
          await supabase
            .from("slide_templates")
            .update({ is_active: true })
            .in("id", selectedTemplates);
          break;
        case "deactivate":
          await supabase
            .from("slide_templates")
            .update({ is_active: false })
            .in("id", selectedTemplates);
          break;
        case "delete":
          await supabase
            .from("slide_templates")
            .delete()
            .in("id", selectedTemplates);
          break;
      }

      setSelectedTemplates([]);
      setBulkAction("");
      fetchTemplates();
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const getTemplateTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "menu":
        return <FileText className="h-5 w-5" />;
      case "promo":
        return <Star className="h-5 w-5" />;
      case "quote":
        return <Quote className="h-5 w-5" />;
      case "hours":
        return <Clock className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "bg-blue-100 text-blue-800";
      case "video":
        return "bg-purple-100 text-purple-800";
      case "menu":
        return "bg-green-100 text-green-800";
      case "promo":
        return "bg-yellow-100 text-yellow-800";
      case "quote":
        return "bg-indigo-100 text-indigo-800";
      case "hours":
        return "bg-pink-100 text-pink-800";
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

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <Head>
          <title>Slide Templates - Admin Dashboard</title>
          <meta name="description" content="Manage slide templates" />
        </Head>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Slide Templates
              </h1>
              <p className="text-gray-600 mt-1">
                Create and manage reusable slide templates for restaurants
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/admin/slides/templates/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afghan-green"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Link>
              <Link
                href="/admin/slides/templates/import"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afghan-green"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
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
                  <Layout className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Templates
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {templates.length}
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
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {templates.filter((t) => t.is_active).length}
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
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {templates.filter((t) => t.is_system).length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow"
            >
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Download className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Usage
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {templates.reduce((sum, t) => sum + t.usage_count, 0)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-afghan-green focus:border-afghan-green"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-afghan-green text-white"
                        : "text-gray-500"
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list"
                        ? "bg-afghan-green text-white"
                        : "text-gray-500"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
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
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    >
                      <option value="all">All Categories</option>
                      <option value="business">Business</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="promotional">Promotional</option>
                      <option value="informational">Informational</option>
                      <option value="seasonal">Seasonal</option>
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
                      <option value="system">System</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedTemplates.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  {selectedTemplates.length} template(s) selected
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
                    onClick={() => setSelectedTemplates([])}
                    className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Templates Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    {template.thumbnail_url ? (
                      <img
                        src={template.thumbnail_url}
                        alt={template.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                        {getTemplateTypeIcon(template.type)}
                      </div>
                    )}

                    <div className="absolute top-2 right-2">
                      <input
                        type="checkbox"
                        checked={selectedTemplates.includes(template.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTemplates([
                              ...selectedTemplates,
                              template.id,
                            ]);
                          } else {
                            setSelectedTemplates(
                              selectedTemplates.filter(
                                (id) => id !== template.id
                              )
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                      />
                    </div>

                    {template.is_system && (
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Star className="h-3 w-3 mr-1" />
                          System
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {template.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTemplateTypeColor(
                          template.type
                        )}`}
                      >
                        {getTemplateTypeIcon(template.type)}
                        <span className="ml-1">{template.type}</span>
                      </span>
                    </div>

                    {template.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>Used {template.usage_count} times</span>
                      <span>{template.category}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {template.is_active ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm text-gray-500">
                          {template.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Link
                          href={`/admin/slides/templates/${template.id}`}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/slides/templates/${template.id}/edit`}
                          className="p-1 text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            // Handle copy template
                          }}
                          className="p-1 text-gray-600 hover:text-gray-900"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={
                            selectedTemplates.length ===
                              filteredTemplates.length &&
                            filteredTemplates.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTemplates(
                                filteredTemplates.map((t) => t.id)
                              );
                            } else {
                              setSelectedTemplates([]);
                            }
                          }}
                          className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Template
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage
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
                    {filteredTemplates.map((template) => (
                      <motion.tr
                        key={template.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedTemplates.includes(template.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTemplates([
                                  ...selectedTemplates,
                                  template.id,
                                ]);
                              } else {
                                setSelectedTemplates(
                                  selectedTemplates.filter(
                                    (id) => id !== template.id
                                  )
                                );
                              }
                            }}
                            className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {template.thumbnail_url ? (
                                <img
                                  src={template.thumbnail_url}
                                  alt={template.name}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  {getTemplateTypeIcon(template.type)}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {template.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {template.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTemplateTypeColor(
                              template.type
                            )}`}
                          >
                            {getTemplateTypeIcon(template.type)}
                            <span className="ml-1">{template.type}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {template.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {template.usage_count} times
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {template.is_active ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </span>
                            )}
                            {template.is_system && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Star className="h-3 w-3 mr-1" />
                                System
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(template.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/admin/slides/templates/${template.id}`}
                              className="text-afghan-green hover:text-afghan-green-dark"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/slides/templates/${template.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => {
                                // Handle copy template
                              }}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Layout className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No templates found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ||
                selectedType !== "all" ||
                selectedCategory !== "all" ||
                selectedStatus !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "Get started by creating a new template."}
              </p>
              {!searchTerm &&
                selectedType === "all" &&
                selectedCategory === "all" &&
                selectedStatus === "all" && (
                  <div className="mt-6">
                    <Link
                      href="/admin/slides/templates/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afghan-green"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Link>
                  </div>
                )}
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
