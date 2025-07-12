import React from "react";
import { motion } from "framer-motion";
import { usePremiumFeatures } from "../../lib/usePremiumFeatures";
import { Zap, Lock, Star, ArrowRight } from "lucide-react";

interface PremiumFeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  onUpgrade?: () => void;
}

export default function PremiumFeatureGuard({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  onUpgrade,
}: PremiumFeatureGuardProps) {
  const { hasFeature, isStarter, getPlanName } = usePremiumFeatures();

  if (hasFeature(feature as any)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 text-center"
    >
      <div className="flex items-center justify-center mb-4">
        <div className="p-3 bg-purple-100 rounded-full">
          <Lock className="w-6 h-6 text-purple-600" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Premium Feature
      </h3>

      <p className="text-gray-600 mb-4">
        This feature is available in our Professional and Unlimited plans. Your
        current plan: <span className="font-semibold">{getPlanName()}</span>
      </p>

      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center text-sm text-gray-500">
          <Zap className="w-4 h-4 mr-1" />
          <span>AI Credits</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Star className="w-4 h-4 mr-1" />
          <span>Advanced Features</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <ArrowRight className="w-4 h-4 mr-1" />
          <span>Priority Support</span>
        </div>
      </div>

      {/* {isStarter && onUpgrade && (
        <button
          onClick={onUpgrade}
          className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Upgrade Now
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      )} */}
    </motion.div>
  );
}

// Specific feature guards
export function AIContentGuard({
  children,
  ...props
}: Omit<PremiumFeatureGuardProps, "feature">) {
  return (
    <PremiumFeatureGuard feature="aiContentGeneration" {...props}>
      {children}
    </PremiumFeatureGuard>
  );
}

export function StaffManagementGuard({
  children,
  ...props
}: Omit<PremiumFeatureGuardProps, "feature">) {
  return (
    <PremiumFeatureGuard feature="staffManagement" {...props}>
      {children}
    </PremiumFeatureGuard>
  );
}

export function AdvancedAnalyticsGuard({
  children,
  ...props
}: Omit<PremiumFeatureGuardProps, "feature">) {
  return (
    <PremiumFeatureGuard feature="advancedAnalytics" {...props}>
      {children}
    </PremiumFeatureGuard>
  );
}

export function CustomBrandingGuard({
  children,
  ...props
}: Omit<PremiumFeatureGuardProps, "feature">) {
  return (
    <PremiumFeatureGuard feature="customBranding" {...props}>
      {children}
    </PremiumFeatureGuard>
  );
}
