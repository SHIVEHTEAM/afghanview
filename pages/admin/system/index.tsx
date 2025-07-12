import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Database,
  Server,
  Globe,
  Shield,
  Bell,
  Mail,
  CreditCard,
  Users,
  Building,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Wrench,
  HardDrive,
  Cpu,
  Network,
} from "lucide-react";

import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import AdminLayout from "../layout";

interface SystemHealth {
  database: "healthy" | "warning" | "critical";
  api: "healthy" | "warning" | "critical";
  storage: "healthy" | "warning" | "critical";
  email: "healthy" | "warning" | "critical";
  payments: "healthy" | "warning" | "critical";
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  databaseConnections: number;
}

interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  startedAt: string;
  completedAt?: string;
}

export default function AdminSystem() {
  const router = useRouter();
  const { user } = useAuth();
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: "healthy",
    api: "healthy",
    storage: "healthy",
    email: "healthy",
    payments: "healthy",
  });
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkLatency: 0,
    activeConnections: 0,
    databaseConnections: 0,
  });
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSystemData();
    }
  }, [user]);

  const fetchSystemData = async () => {
    try {
      setLoading(true);

      // Simulate fetching system data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock system health data
      setSystemHealth({
        database: "healthy",
        api: "healthy",
        storage: "warning",
        email: "healthy",
        payments: "healthy",
      });

      // Mock metrics data
      setMetrics({
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: 75 + Math.random() * 20,
        networkLatency: Math.random() * 100,
        activeConnections: Math.floor(Math.random() * 1000),
        databaseConnections: Math.floor(Math.random() * 100),
      });

      // Mock maintenance tasks
      setMaintenanceTasks([
        {
          id: "1",
          name: "Database Backup",
          description: "Creating daily backup of all databases",
          status: "completed",
          progress: 100,
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          completedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Log Cleanup",
          description: "Cleaning up old log files",
          status: "running",
          progress: 65,
          startedAt: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: "3",
          name: "Cache Refresh",
          description: "Refreshing application cache",
          status: "pending",
          progress: 0,
          startedAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error fetching system data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSystemData();
    setRefreshing(false);
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      case "critical":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage < 50) return "text-green-600";
    if (usage < 80) return "text-yellow-600";
    return "text-red-600";
  };

  const formatBytes = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading system data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>System Management - Admin Dashboard</title>
        <meta name="description" content="System health and maintenance" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              System Management
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor system health and perform maintenance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
              <Wrench className="w-4 h-4" />
              <span>Run Maintenance</span>
            </button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Database</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(
                      systemHealth.database
                    )}`}
                  >
                    {getHealthIcon(systemHealth.database)}
                    <span className="ml-1">{systemHealth.database}</span>
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  API Services
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(
                      systemHealth.api
                    )}`}
                  >
                    {getHealthIcon(systemHealth.api)}
                    <span className="ml-1">{systemHealth.api}</span>
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Server className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(
                      systemHealth.storage
                    )}`}
                  >
                    {getHealthIcon(systemHealth.storage)}
                    <span className="ml-1">{systemHealth.storage}</span>
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Email Service
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(
                      systemHealth.email
                    )}`}
                  >
                    {getHealthIcon(systemHealth.email)}
                    <span className="ml-1">{systemHealth.email}</span>
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Payments</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(
                      systemHealth.payments
                    )}`}
                  >
                    {getHealthIcon(systemHealth.payments)}
                    <span className="ml-1">{systemHealth.payments}</span>
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Metrics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    CPU Usage
                  </span>
                  <span
                    className={`text-sm font-medium ${getUsageColor(
                      metrics.cpuUsage
                    )}`}
                  >
                    {metrics.cpuUsage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(
                      metrics.cpuUsage
                    ).replace("text-", "bg-")}`}
                    style={{ width: `${metrics.cpuUsage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Memory Usage
                  </span>
                  <span
                    className={`text-sm font-medium ${getUsageColor(
                      metrics.memoryUsage
                    )}`}
                  >
                    {metrics.memoryUsage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(
                      metrics.memoryUsage
                    ).replace("text-", "bg-")}`}
                    style={{ width: `${metrics.memoryUsage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Disk Usage
                  </span>
                  <span
                    className={`text-sm font-medium ${getUsageColor(
                      metrics.diskUsage
                    )}`}
                  >
                    {metrics.diskUsage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(
                      metrics.diskUsage
                    ).replace("text-", "bg-")}`}
                    style={{ width: `${metrics.diskUsage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Network Latency
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics.networkLatency.toFixed(1)}ms
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Connection Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Network className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Active Connections
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {metrics.activeConnections}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Database Connections
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {metrics.databaseConnections}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Online Users
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">247</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Active Businesses
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">89</span>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Maintenance Tasks
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All Tasks
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {maintenanceTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {task.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {task.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {task.status === "completed"
                          ? "Completed"
                          : task.status === "running"
                          ? "Running"
                          : task.status === "failed"
                          ? "Failed"
                          : "Pending"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {task.progress}% complete
                      </div>
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          task.status === "completed"
                            ? "bg-green-500"
                            : task.status === "running"
                            ? "bg-blue-500"
                            : task.status === "failed"
                            ? "bg-red-500"
                            : "bg-gray-400"
                        }`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
