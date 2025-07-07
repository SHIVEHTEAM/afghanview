import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import AdminLayout from "../layout";
import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import { ProtectedRoute } from "../../../components/auth";
import {
  Settings,
  Save,
  Globe,
  CreditCard,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  Mail,
  Smartphone,
  Monitor,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Edit,
  Copy,
} from "lucide-react";

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [showApiKey, setShowApiKey] = useState(false);

  // Form states
  const [appName, setAppName] = useState("ShivehView");
  const [appVersion, setAppVersion] = useState("1.0.0");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultSlideDuration, setDefaultSlideDuration] = useState(6000);
  const [maxFileSize, setMaxFileSize] = useState(10);
  const [allowedFileTypes, setAllowedFileTypes] = useState("image/*,video/*");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [apiKey, setApiKey] = useState("sk-...");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("daily");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .order("key");

      if (error) throw error;

      setSettings(data || []);

      // Set form values from settings
      const appNameSetting = data?.find((s) => s.key === "app_name");
      const appVersionSetting = data?.find((s) => s.key === "app_version");
      const maintenanceSetting = data?.find(
        (s) => s.key === "maintenance_mode"
      );
      const slideDurationSetting = data?.find(
        (s) => s.key === "default_slide_duration"
      );
      const maxFileSizeSetting = data?.find((s) => s.key === "max_file_size");
      const allowedFileTypesSetting = data?.find(
        (s) => s.key === "allowed_file_types"
      );
      const smtpHostSetting = data?.find((s) => s.key === "smtp_host");
      const smtpPortSetting = data?.find((s) => s.key === "smtp_port");
      const smtpUserSetting = data?.find((s) => s.key === "smtp_user");
      const smtpPasswordSetting = data?.find((s) => s.key === "smtp_password");
      const apiKeySetting = data?.find((s) => s.key === "api_key");
      const webhookUrlSetting = data?.find((s) => s.key === "webhook_url");
      const analyticsSetting = data?.find((s) => s.key === "analytics_enabled");
      const backupSetting = data?.find((s) => s.key === "backup_enabled");
      const backupFreqSetting = data?.find((s) => s.key === "backup_frequency");

      if (appNameSetting) setAppName(appNameSetting.value);
      if (appVersionSetting) setAppVersion(appVersionSetting.value);
      if (maintenanceSetting) setMaintenanceMode(maintenanceSetting.value);
      if (slideDurationSetting)
        setDefaultSlideDuration(slideDurationSetting.value);
      if (maxFileSizeSetting) setMaxFileSize(maxFileSizeSetting.value);
      if (allowedFileTypesSetting)
        setAllowedFileTypes(allowedFileTypesSetting.value);
      if (smtpHostSetting) setSmtpHost(smtpHostSetting.value);
      if (smtpPortSetting) setSmtpPort(smtpPortSetting.value);
      if (smtpUserSetting) setSmtpUser(smtpUserSetting.value);
      if (smtpPasswordSetting) setSmtpPassword(smtpPasswordSetting.value);
      if (apiKeySetting) setApiKey(apiKeySetting.value);
      if (webhookUrlSetting) setWebhookUrl(webhookUrlSetting.value);
      if (analyticsSetting) setAnalyticsEnabled(analyticsSetting.value);
      if (backupSetting) setBackupEnabled(backupSetting.value);
      if (backupFreqSetting) setBackupFrequency(backupFreqSetting.value);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const settingsToUpdate = [
        { key: "app_name", value: appName },
        { key: "app_version", value: appVersion },
        { key: "maintenance_mode", value: maintenanceMode },
        { key: "default_slide_duration", value: defaultSlideDuration },
        { key: "max_file_size", value: maxFileSize },
        { key: "allowed_file_types", value: allowedFileTypes },
        { key: "smtp_host", value: smtpHost },
        { key: "smtp_port", value: smtpPort },
        { key: "smtp_user", value: smtpUser },
        { key: "smtp_password", value: smtpPassword },
        { key: "api_key", value: apiKey },
        { key: "webhook_url", value: webhookUrl },
        { key: "analytics_enabled", value: analyticsEnabled },
        { key: "backup_enabled", value: backupEnabled },
        { key: "backup_frequency", value: backupFrequency },
      ];

      for (const setting of settingsToUpdate) {
        const existingSetting = settings.find((s) => s.key === setting.key);
        if (existingSetting) {
          await supabase
            .from("system_settings")
            .update({
              value: setting.value,
              updated_at: new Date().toISOString(),
            })
            .eq("key", setting.key);
        } else {
          await supabase.from("system_settings").insert({
            key: setting.key,
            value: setting.value,
            description: `Setting for ${setting.key}`,
            is_public: false,
          });
        }
      }

      await fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const generateApiKey = () => {
    const newKey = `sk-${Math.random()
      .toString(36)
      .substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(newKey);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
  };

  const tabs = [
    { id: "general", name: "General", icon: Settings },
    { id: "billing", name: "Billing", icon: CreditCard },
    { id: "integrations", name: "Integrations", icon: Key },
    { id: "email", name: "Email", icon: Mail },
    { id: "security", name: "Security", icon: Shield },
    { id: "backup", name: "Backup", icon: Database },
  ];

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
          <title>Settings - Admin Dashboard</title>
          <meta name="description" content="Admin settings" />
        </Head>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                System Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Configure system-wide settings and preferences
              </p>
            </div>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-afghan-green hover:bg-afghan-green-dark disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? "border-afghan-green text-afghan-green"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow">
            {activeTab === "general" && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-medium text-gray-900">
                  General Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Application Name
                    </label>
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Application Version
                    </label>
                    <input
                      type="text"
                      value={appVersion}
                      onChange={(e) => setAppVersion(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Slide Duration (ms)
                    </label>
                    <input
                      type="number"
                      value={defaultSlideDuration}
                      onChange={(e) =>
                        setDefaultSlideDuration(Number(e.target.value))
                      }
                      min="1000"
                      step="500"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max File Size (MB)
                    </label>
                    <input
                      type="number"
                      value={maxFileSize}
                      onChange={(e) => setMaxFileSize(Number(e.target.value))}
                      min="1"
                      max="100"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allowed File Types
                    </label>
                    <input
                      type="text"
                      value={allowedFileTypes}
                      onChange={(e) => setAllowedFileTypes(e.target.value)}
                      placeholder="image/*,video/*"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Maintenance Mode
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      When enabled, only admins can access the system
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Billing Settings
                </h2>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Billing Configuration
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Configure payment gateways and subscription settings.
                        This section will be expanded with Stripe integration.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stripe Public Key
                    </label>
                    <input
                      type="text"
                      placeholder="pk_test_..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stripe Secret Key
                    </label>
                    <input
                      type="password"
                      placeholder="sk_test_..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "integrations" && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-medium text-gray-900">
                  API & Integrations
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={generateApiKey}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Generate
                      </button>
                      <button
                        onClick={copyApiKey}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Webhook URL
                    </label>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://your-domain.com/webhook"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      URL to receive webhook notifications for events
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Enable Analytics
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "email" && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Email Configuration
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(Number(e.target.value))}
                      placeholder="587"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Username
                    </label>
                    <input
                      type="email"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="your-email@gmail.com"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      placeholder="Your app password"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <Info className="h-5 w-5 text-blue-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Email Configuration
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Configure SMTP settings for sending emails. For Gmail,
                        use app passwords instead of your regular password.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Security Settings
                </h2>

                <div className="space-y-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <Shield className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Security Configuration
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                          Configure security settings, password policies, and
                          access controls.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Password Length
                      </label>
                      <input
                        type="number"
                        defaultValue={8}
                        min="6"
                        max="20"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        defaultValue={60}
                        min="15"
                        max="480"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Require Two-Factor Authentication for Admins
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Enable Rate Limiting
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Enable IP Whitelist
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "backup" && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Backup & Maintenance
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={backupEnabled}
                      onChange={(e) => setBackupEnabled(e.target.checked)}
                      className="rounded border-gray-300 text-afghan-green focus:ring-afghan-green"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Enable Automatic Backups
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Backup Frequency
                    </label>
                    <select
                      value={backupFrequency}
                      onChange={(e) => setBackupFrequency(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-afghan-green focus:border-afghan-green"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="flex space-x-3">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <Download className="h-4 w-4 mr-2" />
                      Download Backup
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <Upload className="h-4 w-4 mr-2" />
                      Restore Backup
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Create Manual Backup
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Recent Backups
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Backup_2024_01_15_14_30.sql</span>
                        <span className="text-gray-500">2 hours ago</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Backup_2024_01_15_10_30.sql</span>
                        <span className="text-gray-500">6 hours ago</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Backup_2024_01_14_14_30.sql</span>
                        <span className="text-gray-500">1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
