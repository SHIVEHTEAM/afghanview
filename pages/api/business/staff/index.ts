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
        .select("business_id, role, is_active")
        .eq("user_id", user.id)
        .eq("business_id", business_id)
        .eq("is_active", true)
        .single();

      // User must either own the business or be an active staff member
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

      console.log("🔍 Debug: Staff query result:", {
        business_id,
        staffMembers: staffMembers?.length || 0,
        error: staffError,
      });

      if (staffError) {
        console.error("Error fetching staff:", staffError);
        return res.status(500).json({ error: "Failed to fetch staff" });
      }

      // Then get user profiles for each staff member
      const staffWithProfiles = await Promise.all(
        (staffMembers || []).map(async (staffMember) => {
          console.log(
            `🔍 Debug: Processing staff member: ${staffMember.user_id}`
          );

          // Get user profile
          let { data: userProfile, error: profileError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .eq("id", staffMember.user_id)
            .single();

          console.log(`🔍 Debug: Profile query result:`, {
            user_id: staffMember.user_id,
            userProfile,
            profileError: profileError?.message,
          });

          // If profile not found, try to get user from auth and create profile
          if (!userProfile && profileError?.code === "PGRST116") {
            console.log(
              `🔍 Debug: Profile not found for user ${staffMember.user_id}, checking auth...`
            );

            // Get user from auth
            const { data: authUser, error: authError } =
              await supabase.auth.admin.getUserById(staffMember.user_id);

            console.log(`🔍 Debug: Auth user query result:`, {
              user_id: staffMember.user_id,
              authUser: authUser?.user
                ? {
                    id: authUser.user.id,
                    email: authUser.user.email,
                    metadata: authUser.user.user_metadata,
                  }
                : null,
              authError: authError?.message,
            });

            if (authUser?.user && !authError) {
              console.log(
                `🔍 Debug: Found user in auth: ${authUser.user.email}`
              );

              // Create profile for the user
              const profileData = {
                id: staffMember.user_id,
                first_name: authUser.user.user_metadata?.first_name || "",
                last_name: authUser.user.user_metadata?.last_name || "",
                roles: ["staff_member"],
              };

              console.log(`🔍 Debug: Creating profile with data:`, profileData);

              const { data: newProfile, error: createError } = await supabase
                .from("profiles")
                .insert(profileData)
                .select("id, first_name, last_name")
                .single();

              console.log(`🔍 Debug: Profile creation result:`, {
                newProfile,
                createError: createError?.message,
              });

              if (newProfile && !createError) {
                userProfile = newProfile;
                console.log(
                  `🔍 Debug: Created profile for user: ${authUser.user.email}`
                );
              } else {
                console.error("Error creating profile:", createError);
              }
            } else {
              console.error("Error getting user from auth:", authError);
            }
          }

          // Get user email from auth
          let userEmail = "unknown@example.com";
          if (!userProfile) {
            // Try to get email from auth if profile doesn't exist
            const { data: authUser } = await supabase.auth.admin.getUserById(
              staffMember.user_id
            );
            if (authUser?.user) {
              userEmail = authUser.user.email || "unknown@example.com";
            }
          } else {
            // Get email from auth for existing profile
            const { data: authUser } = await supabase.auth.admin.getUserById(
              staffMember.user_id
            );
            if (authUser?.user) {
              userEmail = authUser.user.email || "unknown@example.com";
            }
          }

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

          const result = {
            ...staffMember,
            user: userProfile || {
              id: staffMember.user_id,
              first_name: "Unknown",
              last_name: "User",
              email: userEmail,
            },
            invited_by: invitedByProfile,
          };

          console.log(`🔍 Debug: Final staff member result:`, {
            user_id: staffMember.user_id,
            user: result.user,
            has_profile: !!userProfile,
          });

          return result;
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
      let { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("id", staff.user_id)
        .single();

      // If profile not found, try to get user from auth and create profile
      if (!userProfile && profileError?.code === "PGRST116") {
        console.log(
          `🔍 Debug: Profile not found for user ${staff.user_id}, checking auth...`
        );

        // Get user from auth
        const { data: authUser, error: authError } =
          await supabase.auth.admin.getUserById(staff.user_id);

        if (authUser?.user && !authError) {
          console.log(`🔍 Debug: Found user in auth: ${authUser.user.email}`);

          // Create profile for the user
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: staff.user_id,
              email: authUser.user.email,
              first_name: authUser.user.user_metadata?.first_name || "",
              last_name: authUser.user.user_metadata?.last_name || "",
              roles: ["staff_member"],
            })
            .select("id, first_name, last_name, email")
            .single();

          if (newProfile && !createError) {
            userProfile = newProfile;
            console.log(
              `🔍 Debug: Created profile for user: ${userProfile.email}`
            );
          } else {
            console.error("Error creating profile:", createError);
          }
        } else {
          console.error("Error getting user from auth:", authError);
        }
      }

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
      let { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("id", staff.user_id)
        .single();

      // If profile not found, try to get user from auth and create profile
      if (!userProfile && profileError?.code === "PGRST116") {
        console.log(
          `🔍 Debug: Profile not found for user ${staff.user_id}, checking auth...`
        );

        // Get user from auth
        const { data: authUser, error: authError } =
          await supabase.auth.admin.getUserById(staff.user_id);

        if (authUser?.user && !authError) {
          console.log(`🔍 Debug: Found user in auth: ${authUser.user.email}`);

          // Create profile for the user
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: staff.user_id,
              email: authUser.user.email,
              first_name: authUser.user.user_metadata?.first_name || "",
              last_name: authUser.user.user_metadata?.last_name || "",
              roles: ["staff_member"],
            })
            .select("id, first_name, last_name, email")
            .single();

          if (newProfile && !createError) {
            userProfile = newProfile;
            console.log(
              `🔍 Debug: Created profile for user: ${userProfile.email}`
            );
          } else {
            console.error("Error creating profile:", createError);
          }
        } else {
          console.error("Error getting user from auth:", authError);
        }
      }

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
