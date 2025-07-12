import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Upload,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Eye,
  MoreVertical,
  Database,
  HardDrive,
  Cloud,
  ArrowUpDown,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

interface BackupData {
  id: string;
  name: string;
  type: "full" | "slideshows" | "settings" | "analytics";
  size: string;
  createdAt: string;
  status: "completed" | "failed" | "in_progress";
  downloadUrl?: string;
}

interface ImportData {
  id: string;
  name: string;
  type: "full" | "slideshows" | "settings";
  size: string;
  uploadedAt: string;
  status: "pending" | "completed" | "failed";
  progress?: number;
}

export default function ExportImport() {
  const { user } = useAuth();
  const [backups, setBackups] = useState<BackupData[]>([]);
  const [imports, setImports] = useState<ImportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, return empty arrays since we don't have export/import tables yet
      // In a real implementation, this would fetch from backup and import tables
      setBackups([]);
      setImports([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);

      // In a real implementation, this would upload to Supabase storage
      // and create an import record in the database

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Add to imports list
      const newImport: ImportData = {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: "full",
        size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString(),
        status: "pending",
        progress: 0,
      };

      setImports((prev) => [newImport, ...prev]);
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async (
    type: "full" | "slideshows" | "settings" | "analytics"
  ) => {
    try {
      // In a real implementation, this would:
      // 1. Create a backup record in the database
      // 2. Export data based on type
      // 3. Generate download URL
      // 4. Update backup status

      const newBackup: BackupData = {
        id: Date.now().toString(),
        name: `${type}_backup_${new Date().toISOString().split("T")[0]}`,
        type,
        size: "0 MB",
        createdAt: new Date().toISOString(),
        status: "in_progress",
      };

      setBackups((prev) => [newBackup, ...prev]);

      // Simulate export process
      setTimeout(() => {
        setBackups((prev) =>
          prev.map((b) =>
            b.id === newBackup.id
              ? { ...b, status: "completed", size: "2.5 MB", downloadUrl: "#" }
              : b
          )
        );
      }, 3000);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleDeleteBackup = async (id: string) => {
    if (!confirm("Are you sure you want to delete this backup?")) return;

    try {
      // In a real implementation, this would delete from database and storage
      setBackups((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleDeleteImport = async (id: string) => {
    if (!confirm("Are you sure you want to delete this import?")) return;

    try {
      // In a real implementation, this would delete from database
      setImports((prev) => prev.filter((i) => i.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "in_progress":
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "in_progress":
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading export/import data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Export & Import</h1>
        <p className="text-gray-600 mt-2">
          Backup your data and restore from previous exports
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        <button
          onClick={() => setActiveTab("export")}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === "export"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Download className="w-4 h-4 inline mr-2" />
          Export Data
        </button>
        <button
          onClick={() => setActiveTab("import")}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === "import"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Import Data
        </button>
      </div>

      {activeTab === "export" && (
        <div className="space-y-8">
          {/* Export Options */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create Backup
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => handleExport("full")}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <Database className="w-8 h-8 text-blue-600 mb-2" />
                <h3 className="font-medium text-gray-900">Full Backup</h3>
                <p className="text-sm text-gray-600">All data and settings</p>
              </button>

              <button
                onClick={() => handleExport("slideshows")}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <FileText className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-medium text-gray-900">Slideshows Only</h3>
                <p className="text-sm text-gray-600">All slideshow content</p>
              </button>

              <button
                onClick={() => handleExport("settings")}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <HardDrive className="w-8 h-8 text-purple-600 mb-2" />
                <h3 className="font-medium text-gray-900">Settings Only</h3>
                <p className="text-sm text-gray-600">Business configuration</p>
              </button>

              <button
                onClick={() => handleExport("analytics")}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <BarChart3 className="w-8 h-8 text-orange-600 mb-2" />
                <h3 className="font-medium text-gray-900">Analytics Data</h3>
                <p className="text-sm text-gray-600">Performance metrics</p>
              </button>
            </div>
          </div>

          {/* Backup History */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Backup History
              </h2>
              <button
                onClick={fetchData}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {backups.length === 0 ? (
              <div className="text-center py-8">
                <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No backups yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Create your first backup to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {backups.map((backup) => (
                  <motion.div
                    key={backup.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {backup.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(backup.createdAt).toLocaleDateString()} •{" "}
                          {backup.size}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          backup.status
                        )}`}
                      >
                        {backup.status.replace("_", " ")}
                      </span>

                      {backup.status === "completed" && backup.downloadUrl && (
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                          <Download className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteBackup(backup.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "import" && (
        <div className="space-y-8">
          {/* Upload Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Import Data
            </h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload backup file
              </h3>
              <p className="text-gray-600 mb-4">
                Select a backup file (.json, .zip) to restore your data
              </p>

              <input
                id="file-upload"
                type="file"
                accept=".json,.zip"
                onChange={handleFileSelect}
                className="hidden"
              />

              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </label>

              {selectedFile && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Selected: {selectedFile.name}
                  </p>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Start Import"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Import History */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Import History
              </h2>
              <button
                onClick={fetchData}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {imports.length === 0 ? (
              <div className="text-center py-8">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No imports yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Upload a backup file to see import history
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {imports.map((importItem) => (
                  <motion.div
                    key={importItem.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {importItem.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(importItem.uploadedAt).toLocaleDateString()}{" "}
                          • {importItem.size}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          importItem.status
                        )}`}
                      >
                        {importItem.status}
                      </span>

                      {importItem.progress !== undefined &&
                        importItem.progress < 100 && (
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${importItem.progress}%` }}
                            ></div>
                          </div>
                        )}

                      <button
                        onClick={() => handleDeleteImport(importItem.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
