import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Upload,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Key,
  Mail,
  Phone,
  MapPin,
  Building,
} from "lucide-react";
import { ProtectedRoute } from "../../components/auth";
import ClientLayout from "./layout";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState({
    profile: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      company: "Afghan Palace",
      address: "123 Main Street, New York, NY 10001",
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: true,
      newFeatures: false,
    },
    appearance: {
      theme: "light",
      language: "en",
      timezone: "America/New_York",
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordChangeRequired: false,
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "security", name: "Security", icon: Shield },
  ];

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem("client-settings", JSON.stringify(settings));
    alert("Settings saved successfully!");
  };

  const handleExportData = () => {
    const data = localStorage.getItem("client-slideshows");
    if (data) {
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "slideshows-backup.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          localStorage.setItem("client-slideshows", JSON.stringify(data));
          alert("Data imported successfully!");
          window.location.reload();
        } catch (error) {
          alert("Invalid file format!");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      localStorage.removeItem("client-slideshows");
      alert("All data cleared successfully!");
      window.location.reload();
    }
  };

  return (
    <ProtectedRoute requiredRole="restaurant_owner">
      <ClientLayout>
        <Head>
          <title>Settings - ShivehView</title>
          <meta name="description" content="Manage your account settings" />
        </Head>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account preferences and settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <tab.icon className="mr-3 h-5 w-5" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              {activeTab === "profile" && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">
                    Profile Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={settings.profile.name}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            profile: {
                              ...settings.profile,
                              name: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            profile: {
                              ...settings.profile,
                              email: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            profile: {
                              ...settings.profile,
                              phone: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={settings.profile.company}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            profile: {
                              ...settings.profile,
                              company: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 bg-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        value={settings.profile.address}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            profile: {
                              ...settings.profile,
                              address: e.target.value,
                            },
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">
                    Notification Preferences
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(settings.notifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 capitalize">
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Receive notifications about{" "}
                              {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setSettings({
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  [key]: !value,
                                },
                              })
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? "bg-green-600" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">
                    Appearance Settings
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <select
                        value={settings.appearance.theme}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            appearance: {
                              ...settings.appearance,
                              theme: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 bg-white"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.appearance.language}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            appearance: {
                              ...settings.appearance,
                              language: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 bg-white"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.appearance.timezone}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            appearance: {
                              ...settings.appearance,
                              timezone: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 bg-white"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">
                          Pacific Time
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">
                    Security Settings
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">
                        Change Password
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) =>
                                setCurrentPassword(e.target.value)
                              }
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 bg-white"
                          />
                        </div>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">
                        Data Management
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">
                              Export Data
                            </h5>
                            <p className="text-sm text-gray-500">
                              Download all your slideshows as backup
                            </p>
                          </div>
                          <button
                            onClick={handleExportData}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Export
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">
                              Import Data
                            </h5>
                            <p className="text-sm text-gray-500">
                              Restore slideshows from backup file
                            </p>
                          </div>
                          <label className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2 cursor-pointer">
                            <Upload className="w-4 h-4" />
                            Import
                            <input
                              type="file"
                              accept=".json"
                              onChange={handleImportData}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">
                              Clear All Data
                            </h5>
                            <p className="text-sm text-gray-500">
                              Permanently delete all slideshows
                            </p>
                          </div>
                          <button
                            onClick={handleClearData}
                            className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={handleSaveSettings}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </ClientLayout>
    </ProtectedRoute>
  );
}
