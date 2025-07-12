import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../lib/auth";
import { motion } from "framer-motion";
import { Building, ArrowRight, CheckCircle } from "lucide-react";

interface OnboardingGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function OnboardingGuard({
  children,
  redirectTo = "/onboarding",
}: OnboardingGuardProps) {
  const { user, loading, checkOnboardingStatus } = useAuth();
  const router = useRouter();
  const [onboardingStatus, setOnboardingStatus] = useState<{
    completed: boolean;
    restaurant: any;
    role?: string;
  } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user || loading) {
        setChecking(false);
        return;
      }

      try {
        const status = await checkOnboardingStatus(user.id);
        setOnboardingStatus(status);

        if (!status.completed) {
          // Only redirect if not already on onboarding page
          if (router.pathname !== "/onboarding") {
            router.push(redirectTo);
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // On error, assume onboarding is not complete
        setOnboardingStatus({ completed: false, restaurant: null });
        if (router.pathname !== "/onboarding") {
          router.push(redirectTo);
        }
      } finally {
        setChecking(false);
      }
    };

    checkOnboarding();
  }, [user, loading, checkOnboardingStatus, router, redirectTo]);

  // Show loading while checking
  if (loading || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-400 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Checking your setup...</p>
        </div>
      </div>
    );
  }

  // If no user, don't render anything (ProtectedRoute will handle this)
  if (!user) {
    return null;
  }

  // If onboarding not completed, show a message
  if (onboardingStatus && !onboardingStatus.completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-400 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Setup
            </h2>
            <p className="text-gray-600 mb-6">
              Please complete your business setup before accessing the
              dashboard.
            </p>
            <button
              onClick={() => router.push("/onboarding")}
              className="w-full flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue Setup
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // If onboarding is completed, render children
  return <>{children}</>;
}
