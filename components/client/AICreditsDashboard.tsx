import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  Info,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

interface AICredits {
  total: number;
  used: number;
  remaining: number;
  resetDate: string;
}

interface UsageHistory {
  id: string;
  type: string;
  credits: number;
  description: string;
  timestamp: string;
}

export default function AICreditsDashboard() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<AICredits | null>(null);
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch AI credits data
  useEffect(() => {
    const fetchCredits = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        // For now, we'll use a simple credits system
        // In a real app, this would come from a dedicated AI credits table
        const mockCredits: AICredits = {
          total: 100,
          used: 35,
          remaining: 65,
          resetDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days from now
        };

        setCredits(mockCredits);

        // Mock usage history - in real app, this would come from AI usage logs
        const mockHistory: UsageHistory[] = [
          {
            id: "1",
            type: "fact_generation",
            credits: 5,
            description: "Generated 10 AI facts for slideshow",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          },
          {
            id: "2",
            type: "content_creation",
            credits: 10,
            description: "Created AI-powered menu content",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          },
          {
            id: "3",
            type: "image_enhancement",
            credits: 3,
            description: "Enhanced 5 images with AI",
            timestamp: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(), // 3 days ago
          },
        ];

        setUsageHistory(mockHistory);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch credits data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, [user?.id]);

  const handleRefresh = () => {
    setLoading(true);
    // Re-fetch data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getUsagePercentage = () => {
    if (!credits) return 0;
    return (credits.used / credits.total) * 100;
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage < 50) return "text-green-600 bg-green-100";
    if (percentage < 80) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI credits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading credits
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!credits) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No credits data
          </h3>
          <p className="text-gray-600">
            Contact support to set up your AI credits
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Credits</h1>
          <p className="text-gray-600 mt-2">
            Manage your AI-powered features and usage
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Credits Overview */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Credits Overview
          </h2>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${getUsageColor()}`}
          >
            {getUsagePercentage().toFixed(1)}% used
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {credits.total}
            </div>
            <div className="text-sm text-gray-600">Total Credits</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {credits.used}
            </div>
            <div className="text-sm text-gray-600">Used Credits</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {credits.remaining}
            </div>
            <div className="text-sm text-gray-600">Remaining Credits</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${getUsagePercentage()}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Credits reset on {new Date(credits.resetDate).toLocaleDateString()}
          </span>
          <span>{credits.remaining} credits remaining</span>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-blue-50 rounded-xl p-6 mb-8">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">AI Credits Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• AI fact generation uses 5 credits per batch</li>
              <li>• Content creation uses 10 credits per session</li>
              <li>• Image enhancement uses 3 credits per image</li>
              <li>• Credits reset monthly with your subscription</li>
              <li>• Upgrade your plan for more credits</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage History */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Recent Usage
        </h2>

        {usageHistory.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No usage history yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {usageHistory.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(item.timestamp).toLocaleDateString()} at{" "}
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">
                    -{item.credits} credits
                  </p>
                  <p className="text-xs text-gray-600 capitalize">
                    {item.type.replace("_", " ")}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upgrade CTA */}
      {credits.remaining < 20 && (
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Running low on credits?
              </h3>
              <p className="text-blue-100">
                Upgrade your plan to get more AI credits and unlock advanced
                features.
              </p>
            </div>
            <button className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100">
              Upgrade Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
