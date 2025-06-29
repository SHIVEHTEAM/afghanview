import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "restaurant_owner";
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/auth/signin",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
        return;
      }

      if (requiredRole && !user.roles?.includes(requiredRole)) {
        // Redirect to appropriate dashboard based on user role
        if (user.roles?.includes("admin")) {
          router.push("/admin");
        } else if (user.roles?.includes("restaurant_owner")) {
          router.push("/client");
        } else {
          router.push("/");
        }
        return;
      }
    }
  }, [user, loading, requiredRole, redirectTo, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-afghan-green via-afghan-red to-afghan-gold flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && !user.roles?.includes(requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
