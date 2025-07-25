import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    business_id?: string;
    staff_role?: "owner" | "manager" | "staff";
  };
}

export async function authenticateRequest(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthenticatedRequest | null> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });
      return null;
    }

    const token = authHeader.substring(7);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: "Invalid token" });
      return null;
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      res.status(401).json({ error: "User profile not found" });
      return null;
    }

    // Get user's business information
    const { data: staffMember, error: staffError } = await supabase
      .from("business_staff")
      .select("business_id, role")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = {
      id: user.id,
      email: user.email!,
      name: profile.full_name || `${profile.first_name} ${profile.last_name}`,
      role: profile.role,
      business_id: staffMember?.business_id,
      staff_role: staffMember?.role as "owner" | "manager" | "staff",
    };

    return authenticatedReq;
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
    return null;
  }
}

export function requireRole(role: string) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authenticatedReq = await authenticateRequest(req, res);
    if (!authenticatedReq) return null;

    if (authenticatedReq.user?.role !== role) {
      res.status(403).json({ error: "Insufficient permissions" });
      return null;
    }

    return authenticatedReq;
  };
}

export function requireAdmin() {
  return requireRole("admin");
}

export function requireBusinessOwner() {
  return requireRole("business_owner");
}
