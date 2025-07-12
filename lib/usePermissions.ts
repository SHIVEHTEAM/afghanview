import { useState, useEffect } from "react";
import { useAuth } from "./auth";
import { getUserBusinessPermissions, BusinessPermission } from "./permissions";

export function useBusinessPermissions(businessId: string) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<BusinessPermission | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !businessId) {
      setPermissions(null);
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError(null);

        const userPermissions = await getUserBusinessPermissions(
          user.id,
          businessId
        );
        setPermissions(userPermissions);
      } catch (err) {
        console.error("Error fetching permissions:", err);
        setError("Failed to load permissions");
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user, businessId]);

  const hasPermission = (permission: keyof BusinessPermission): boolean => {
    return permissions?.[permission] || false;
  };

  const canViewSlides = hasPermission("canViewSlides");
  const canCreateSlides = hasPermission("canCreateSlides");
  const canEditSlides = hasPermission("canEditSlides");
  const canDeleteSlides = hasPermission("canDeleteSlides");
  const canManageStaff = hasPermission("canManageStaff");
  const canInviteStaff = hasPermission("canInviteStaff");
  const canRemoveStaff = hasPermission("canRemoveStaff");
  const canUpdateStaffRoles = hasPermission("canUpdateStaffRoles");
  const canViewAnalytics = hasPermission("canViewAnalytics");
  const canManageSettings = hasPermission("canManageSettings");
  const canPublishSlides = hasPermission("canPublishSlides");

  return {
    permissions,
    loading,
    error,
    hasPermission,
    canViewSlides,
    canCreateSlides,
    canEditSlides,
    canDeleteSlides,
    canManageStaff,
    canInviteStaff,
    canRemoveStaff,
    canUpdateStaffRoles,
    canViewAnalytics,
    canManageSettings,
    canPublishSlides,
  };
}
