import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface BusinessPermission {
  canViewSlides: boolean;
  canCreateSlides: boolean;
  canEditSlides: boolean;
  canDeleteSlides: boolean;
  canManageStaff: boolean;
  canInviteStaff: boolean;
  canRemoveStaff: boolean;
  canUpdateStaffRoles: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
  canPublishSlides: boolean;
}

export async function getUserBusinessPermissions(
  userId: string,
  businessId: string
): Promise<BusinessPermission | null> {
  try {
    const { data: staffMember, error } = await supabase
      .from("business_staff")
      .select("role, permissions")
      .eq("user_id", userId)
      .eq("business_id", businessId)
      .eq("is_active", true)
      .single();

    if (error || !staffMember) {
      return null;
    }

    return getPermissionsForRole(staffMember.role, staffMember.permissions);
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return null;
  }
}

export function getPermissionsForRole(
  role: "owner" | "manager" | "staff",
  customPermissions: any = {}
): BusinessPermission {
  const basePermissions: BusinessPermission = {
    canViewSlides: true,
    canCreateSlides: false,
    canEditSlides: false,
    canDeleteSlides: false,
    canManageStaff: false,
    canInviteStaff: false,
    canRemoveStaff: false,
    canUpdateStaffRoles: false,
    canViewAnalytics: false,
    canManageSettings: false,
    canPublishSlides: false,
  };

  switch (role) {
    case "owner":
      return {
        ...basePermissions,
        canCreateSlides: true,
        canEditSlides: true,
        canDeleteSlides: true,
        canManageStaff: true,
        canInviteStaff: true,
        canRemoveStaff: true,
        canUpdateStaffRoles: true,
        canViewAnalytics: true,
        canManageSettings: true,
        canPublishSlides: true,
      };

    case "manager":
      return {
        ...basePermissions,
        canCreateSlides: true,
        canEditSlides: true,
        canDeleteSlides: true,
        canInviteStaff: true,
        canViewAnalytics: true,
        canPublishSlides: true,
      };

    case "staff":
      return {
        ...basePermissions,
        canCreateSlides: true,
        canEditSlides: true,
      };

    default:
      return basePermissions;
  }
}

export function requireBusinessPermission(
  permission: keyof BusinessPermission
) {
  return async (req: any, res: any, businessId: string) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return false;
    }

    const permissions = await getUserBusinessPermissions(userId, businessId);
    if (!permissions) {
      res.status(403).json({ error: "Access denied to this business" });
      return false;
    }

    if (!permissions[permission]) {
      res.status(403).json({ error: "Insufficient permissions" });
      return false;
    }

    return true;
  };
}

export function requireBusinessAccess() {
  return async (req: any, res: any, businessId: string) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return false;
    }

    const permissions = await getUserBusinessPermissions(userId, businessId);
    if (!permissions) {
      res.status(403).json({ error: "Access denied to this business" });
      return false;
    }

    return true;
  };
}
