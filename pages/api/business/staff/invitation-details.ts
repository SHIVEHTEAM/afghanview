import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { validateInvitationToken } from "../../../../lib/email";

// Create a service role client for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Token is required" });
    }

    console.log("🔍 Debug: Token received:", token);

    // Validate token and get invitation ID
    const invitationId = validateInvitationToken(token);
    console.log("🔍 Debug: Invitation ID from token:", invitationId);

    if (!invitationId) {
      return res.status(400).json({ error: "Invalid invitation token" });
    }

    // Get invitation details using service role
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from("staff_invitations")
      .select(
        `
        *,
        business:businesses(id, name)
      `
      )
      .eq("id", invitationId)
      .single();

    console.log("🔍 Debug: Database query result:", {
      invitation,
      error: invitationError,
    });

    if (invitationError || !invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    // Get inviter profile separately
    let inviter = null;
    if (invitation.invited_by) {
      const { data: inviterData, error: inviterError } = await supabaseAdmin
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("id", invitation.invited_by)
        .single();

      if (!inviterError && inviterData) {
        inviter = inviterData;
      }
    }

    // Check if invitation is still valid
    if (invitation.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Invitation has already been used or expired" });
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(400).json({ error: "Invitation has expired" });
    }

    return res.status(200).json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expires_at: invitation.expires_at,
        business: invitation.business,
        inviter: inviter,
      },
    });
  } catch (error) {
    console.error("Error fetching invitation details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
