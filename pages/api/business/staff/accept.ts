import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";
import { validateInvitationToken } from "../../../../lib/email";
import { createClient } from "@supabase/supabase-js";

// Create a service role client for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Validate token and get invitation ID
    const invitationId = validateInvitationToken(token);
    if (!invitationId) {
      return res.status(400).json({ error: "Invalid invitation token" });
    }

    // Get invitation details using service role
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from("staff_invitations")
      .select(
        `
        *,
        business:businesses(id, name, user_id, type, business_type)
      `
      )
      .eq("id", invitationId)
      .single();

    if (invitationError || !invitation) {
      console.error("🔍 Debug: Invitation not found:", invitationError);
      return res.status(404).json({ error: "Invitation not found" });
    }

    console.log("🔍 Debug: Found invitation:", {
      id: invitation.id,
      business_id: invitation.business_id,
      email: invitation.email,
      role: invitation.role,
      business: invitation.business,
    });

    // Check if invitation is still valid
    if (invitation.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Invitation has already been used or expired" });
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(400).json({ error: "Invitation has expired" });
    }

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
        return res
          .status(401)
          .json({ error: "You must be logged in to accept this invitation" });
      }
      session = sessionData;
    }

    // Check if the email matches the invitation
    if (session.user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(403).json({
        error: "This invitation was sent to a different email address",
      });
    }

    // Check if user is already a staff member using service role
    const { data: existingStaff } = await supabaseAdmin
      .from("business_staff")
      .select("id")
      .eq("business_id", invitation.business_id)
      .eq("user_id", session.user.id)
      .eq("is_active", true)
      .single();

    if (existingStaff) {
      return res
        .status(400)
        .json({ error: "You are already a staff member of this business" });
    }

    // Create staff record using service role
    const staffData = {
      business_id: invitation.business_id,
      business_type:
        invitation.business.business_type ||
        invitation.business.type ||
        "restaurant",
      user_id: session.user.id,
      role: invitation.role,
      invited_by: invitation.invited_by,
      is_active: true,
    };

    console.log("🔍 Debug: Creating staff record with data:", staffData);

    const { data: staffMember, error: staffError } = await supabaseAdmin
      .from("business_staff")
      .insert(staffData)
      .select()
      .single();

    if (staffError) {
      console.error("🔍 Debug: Error creating staff member:", staffError);
      return res
        .status(500)
        .json({ error: "Failed to add you as staff member" });
    }

    console.log("🔍 Debug: Successfully created staff member:", staffMember);

    // Update invitation status using service role
    const { error: updateError } = await supabaseAdmin
      .from("staff_invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        accepted_by: session.user.id,
      })
      .eq("id", invitationId);

    if (updateError) {
      console.error("Error updating invitation status:", updateError);
      // Don't fail the request if this fails, as the staff member was already created
    }

    return res.status(200).json({
      success: true,
      message: `You have successfully joined ${invitation.business.name} as ${invitation.role}`,
      business: {
        id: invitation.business.id,
        name: invitation.business.name,
      },
      role: invitation.role,
    });
  } catch (error) {
    console.error("Error in staff acceptance API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
