import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";
import {
  sendStaffInvitationEmail,
  generateInvitationToken,
} from "../../../../lib/email";
import { createClient } from "@supabase/supabase-js";

// Create a service role client for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate a secure temporary password
function generateTemporaryPassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user session from Bearer token or session
    let session;

    // Check for Bearer token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ error: "Invalid token" });
      }
      // Create a session-like object for compatibility
      session = { user };
    } else {
      // Fallback to session cookie
      const {
        data: { session: sessionData },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !sessionData) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      session = sessionData;
    }

    const { email, role, business_id, firstName, lastName } = req.body;

    if (!email || !role || !business_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user owns this business or is a manager using service role
    const { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .select("id, name, user_id")
      .eq("id", business_id)
      .eq("is_active", true)
      .single();

    if (businessError || !business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Check if user is owner or manager using service role
    const isOwner = business.user_id === session.user.id;
    const { data: staffMember } = await supabaseAdmin
      .from("business_staff")
      .select("role")
      .eq("business_id", business_id)
      .eq("user_id", session.user.id)
      .eq("is_active", true)
      .single();

    const isManager = staffMember?.role === "manager";
    const canInvite = isOwner || isManager;

    if (!canInvite) {
      return res
        .status(403)
        .json({ error: "Only business owners and managers can invite staff" });
    }

    // Check if user already exists by looking in profiles table
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    // Also check if user exists in auth.users
    let existingUser = null;
    try {
      const { data: authUser, error: authError } =
        await supabaseAdmin.auth.admin.listUsers();
      if (!authError && authUser.users) {
        existingUser = authUser.users.find(
          (user) => user.email?.toLowerCase() === email.toLowerCase()
        );
      }
    } catch (error) {
      console.log(
        "Could not check auth.users, proceeding with profile check only"
      );
    }

    if (existingProfile || existingUser) {
      // User already exists, check if they're already staff
      const userId = existingProfile?.id || existingUser?.id;
      const { data: existingStaff } = await supabaseAdmin
        .from("business_staff")
        .select("id, role")
        .eq("business_id", business_id)
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      if (existingStaff) {
        return res.status(400).json({
          error: "User is already a staff member",
          details: `${email} is already a ${existingStaff.role} at this business`,
        });
      }
    }

    // Check if invitation already exists using service role
    const { data: existingInvitation, error: existingError } =
      await supabaseAdmin
        .from("staff_invitations")
        .select("id, status, invited_at")
        .eq("business_id", business_id)
        .eq("email", email.toLowerCase())
        .single();

    if (existingInvitation) {
      if (existingInvitation.status === "pending") {
        return res.status(400).json({
          error: "Invitation already sent to this email",
          details: `An invitation was sent to ${email} on ${new Date(
            existingInvitation.invited_at
          ).toLocaleDateString()}`,
        });
      } else if (existingInvitation.status === "accepted") {
        return res.status(400).json({
          error: "This email has already accepted an invitation",
          details: "The user has already joined this business",
        });
      } else if (existingInvitation.status === "expired") {
        // Allow creating a new invitation if the previous one expired
        console.log("Previous invitation expired, creating new one");
      }
    }

    // Get inviter's name using service role
    const { data: inviterProfile } = await supabaseAdmin
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", session.user.id)
      .single();

    const inviterName = inviterProfile
      ? `${inviterProfile.first_name} ${inviterProfile.last_name}`.trim()
      : session.user.email || "Unknown User";

    let staffUserId: string;
    let temporaryPassword = "";
    let isNewUser = false;

    if (existingUser) {
      // User exists in auth, use their ID
      staffUserId = existingUser.id;
      console.log("🔍 Debug: Using existing auth user:", staffUserId);

      if (!existingProfile) {
        // Create profile for the existing user
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .insert({
            id: staffUserId,
            first_name: firstName || "",
            last_name: lastName || "",
            roles: ["staff_member"],
          });

        if (profileError) {
          console.error(
            "Error creating profile for existing user:",
            profileError
          );
          // Don't fail here, profile can be created later
        }
      }
    } else {
      // User does not exist in auth, create them (even if profile exists)
      isNewUser = true;
      temporaryPassword = generateTemporaryPassword();
      console.log(
        "🔍 Debug: Creating new auth user with password:",
        temporaryPassword
      );

      const { data: newUser, error: createUserError } =
        await supabaseAdmin.auth.admin.createUser({
          email: email.toLowerCase(),
          password: temporaryPassword,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            first_name: firstName || "",
            last_name: lastName || "",
            is_staff_member: true,
          },
        });

      if (createUserError || !newUser.user) {
        console.error("Error creating user:", createUserError);
        return res.status(500).json({ error: "Failed to create user account" });
      }

      staffUserId = newUser.user.id;
      console.log("🔍 Debug: Created new auth user:", staffUserId);

      if (!existingProfile) {
        // Create profile for the new user
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .insert({
            id: staffUserId,
            first_name: firstName || "",
            last_name: lastName || "",
            roles: ["staff_member"],
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          // Don't fail here, profile can be created later
        }
      }
    }

    // Create invitation using service role
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    let invitation;
    let invitationError;

    if (existingInvitation && existingInvitation.status === "expired") {
      // Update the expired invitation
      const { data: updatedInvitation, error: updateError } =
        await supabaseAdmin
          .from("staff_invitations")
          .update({
            role,
            invited_by: session.user.id,
            status: "pending",
            expires_at: expiresAt,
            invited_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingInvitation.id)
          .select()
          .single();

      invitation = updatedInvitation;
      invitationError = updateError;
    } else {
      // Create new invitation
      const { data: newInvitation, error: createError } = await supabaseAdmin
        .from("staff_invitations")
        .insert({
          business_id,
          email: email.toLowerCase(),
          role,
          invited_by: session.user.id,
          status: "pending",
          expires_at: expiresAt,
        })
        .select()
        .single();

      invitation = newInvitation;
      invitationError = createError;
    }

    if (invitationError) {
      console.error("Error creating invitation:", invitationError);
      return res.status(500).json({ error: "Failed to create invitation" });
    }

    // Generate invitation token and URL
    const token = generateInvitationToken(invitation.id);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const acceptUrl = `${siteUrl}/invitation/accept?token=${token}`;

    console.log("🔍 Debug: Generated token:", token);
    console.log("🔍 Debug: Invitation ID:", invitation.id);
    console.log("🔍 Debug: Accept URL:", acceptUrl);

    // Send invitation email with login credentials
    const emailData = {
      invitationId: invitation.id,
      businessName: business.name,
      inviterName,
      role,
      acceptUrl,
      expiresAt,
      email: email.toLowerCase(),
      password: temporaryPassword,
      firstName: firstName || "",
      lastName: lastName || "",
      isNewUser,
    };

    console.log(
      "🔍 Debug: Email data for",
      email,
      "isNewUser:",
      isNewUser,
      "password:",
      temporaryPassword
    );

    const emailResult = await sendStaffInvitationEmail(email, emailData);

    if (!emailResult.success) {
      console.error("Failed to send invitation email:", emailResult.error);
      return res.status(500).json({
        error: "Invitation created but failed to send email",
        details: emailResult.error,
      });
    }

    return res.status(201).json({
      success: true,
      message: `Invitation sent to ${email}`,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expires_at: invitation.expires_at,
      },
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
