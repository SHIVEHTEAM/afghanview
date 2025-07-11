import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple authentication function
async function authenticateRequest(req: NextApiRequest, res: NextApiResponse) {
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

    return user;
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Authenticate all requests
  const user = await authenticateRequest(req, res);
  if (!user) return;

  if (req.method === "GET") {
    try {
      const { business_id } = req.query;

      if (!business_id) {
        return res.status(400).json({ error: "Missing business_id parameter" });
      }

      // Check if user owns this business
      const { data: ownedBusiness } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .eq("id", business_id)
        .eq("is_active", true)
        .single();

      // Check if user is staff member of this business
      const { data: staffMember } = await supabase
        .from("business_staff")
        .select("business_id, role")
        .eq("user_id", user.id)
        .eq("business_id", business_id)
        .eq("is_active", true)
        .single();

      // User must either own the business or be a staff member
      if (!ownedBusiness && !staffMember) {
        return res
          .status(403)
          .json({ error: "Access denied to this business" });
      }

      // First get all staff members
      const { data: staffMembers, error: staffError } = await supabase
        .from("business_staff")
        .select("*")
        .eq("business_id", business_id)
        .eq("is_active", true)
        .order("joined_at", { ascending: false });

      if (staffError) {
        console.error("Error fetching staff:", staffError);
        return res.status(500).json({ error: "Failed to fetch staff" });
      }

      // Then get user profiles for each staff member
      const staffWithProfiles = await Promise.all(
        (staffMembers || []).map(async (staffMember) => {
          // Get user profile
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email")
            .eq("id", staffMember.user_id)
            .single();

          // Get invited by profile
          let invitedByProfile = null;
          if (staffMember.invited_by) {
            const { data: inviterProfile } = await supabase
              .from("profiles")
              .select("first_name, last_name, email")
              .eq("id", staffMember.invited_by)
              .single();
            invitedByProfile = inviterProfile;
          }

          return {
            ...staffMember,
            user: userProfile || {
              id: staffMember.user_id,
              first_name: "Unknown",
              last_name: "User",
              email: "unknown@example.com",
            },
            invited_by: invitedByProfile,
          };
        })
      );

      return res.status(200).json(staffWithProfiles);
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { email, role, permissions } = req.body;
      const { business_id } = req.query;

      if (!email || !role || !business_id) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if user owns this business
      const { data: ownedBusiness } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .eq("id", business_id)
        .eq("is_active", true)
        .single();

      if (!ownedBusiness) {
        return res
          .status(403)
          .json({ error: "Only business owners can invite staff" });
      }

      // Find user by email
      const { data: targetUser, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (userError || !targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user is already a staff member
      const { data: existingStaff, error: existingError } = await supabase
        .from("business_staff")
        .select("id")
        .eq("business_id", business_id)
        .eq("user_id", targetUser.id)
        .eq("is_active", true)
        .single();

      if (existingStaff) {
        return res
          .status(400)
          .json({ error: "User is already a staff member" });
      }

      // Create staff record
      const { data: staff, error } = await supabase
        .from("business_staff")
        .insert({
          business_id,
          user_id: targetUser.id,
          role,
          permissions: permissions || {},
          invited_by: user.id,
          is_active: true,
        })
        .select("*")
        .single();

      if (error) {
        console.error("Error creating staff record:", error);
        return res.status(500).json({ error: "Failed to create staff record" });
      }

      // Get user profile for the created staff member
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("id", staff.user_id)
        .single();

      const staffWithProfile = {
        ...staff,
        user: userProfile || {
          id: staff.user_id,
          first_name: "Unknown",
          last_name: "User",
          email: "unknown@example.com",
        },
      };

      return res.status(201).json(staffWithProfile);
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { staff_id, role, is_active } = req.body;
      const { business_id } = req.query;

      if (!staff_id || !business_id) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if user owns this business
      const { data: ownedBusiness } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .eq("id", business_id)
        .eq("is_active", true)
        .single();

      if (!ownedBusiness) {
        return res
          .status(403)
          .json({ error: "Only business owners can update staff" });
      }

      const { data: staff, error } = await supabase
        .from("business_staff")
        .update({
          role,
          is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", staff_id)
        .eq("business_id", business_id)
        .select("*")
        .single();

      if (error) {
        console.error("Error updating staff:", error);
        return res.status(500).json({ error: "Failed to update staff" });
      }

      // Get user profile for the updated staff member
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("id", staff.user_id)
        .single();

      const staffWithProfile = {
        ...staff,
        user: userProfile || {
          id: staff.user_id,
          first_name: "Unknown",
          last_name: "User",
          email: "unknown@example.com",
        },
      };

      return res.status(200).json(staffWithProfile);
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { staff_id } = req.query;
      const { business_id } = req.query;

      if (!staff_id || !business_id) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      // Check if user owns this business
      const { data: ownedBusiness } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .eq("id", business_id)
        .eq("is_active", true)
        .single();

      if (!ownedBusiness) {
        return res
          .status(403)
          .json({ error: "Only business owners can remove staff" });
      }

      const { error } = await supabase
        .from("business_staff")
        .update({ is_active: false })
        .eq("id", staff_id)
        .eq("business_id", business_id);

      if (error) {
        console.error("Error removing staff:", error);
        return res.status(500).json({ error: "Failed to remove staff" });
      }

      return res.status(200).json({ message: "Staff removed successfully" });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
