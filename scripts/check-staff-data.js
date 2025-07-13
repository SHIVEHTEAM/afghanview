require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables");
  console.log("Please make sure you have these in your .env.local file:");
  console.log("- NEXT_PUBLIC_SUPABASE_URL");
  console.log("- SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkStaffData() {
  try {
    console.log("🔍 Checking staff data...");

    // Check business_staff table
    const { data: staffMembers, error: staffError } = await supabaseAdmin
      .from("business_staff")
      .select("*");

    if (staffError) {
      console.error("❌ Error fetching staff members:", staffError);
      return;
    }

    console.log(`📊 Found ${staffMembers?.length || 0} staff members:`);
    if (staffMembers && staffMembers.length > 0) {
      staffMembers.forEach((staff, index) => {
        console.log(
          `  ${index + 1}. User: ${staff.user_id}, Business: ${
            staff.business_id
          }, Role: ${staff.role}, Active: ${staff.is_active}`
        );
      });
    }

    // Check staff_invitations table
    const { data: invitations, error: invitationError } = await supabaseAdmin
      .from("staff_invitations")
      .select("*");

    if (invitationError) {
      console.error("❌ Error fetching invitations:", invitationError);
      return;
    }

    console.log(`📧 Found ${invitations?.length || 0} invitations:`);
    if (invitations && invitations.length > 0) {
      invitations.forEach((invitation, index) => {
        console.log(
          `  ${index + 1}. Email: ${invitation.email}, Business: ${
            invitation.business_id
          }, Status: ${invitation.status}, Role: ${invitation.role}`
        );
      });
    }

    // Check specific business
    const businessId = "00e6b1a6-7c8a-4d1f-a7ea-1bdb82348039";
    console.log(`\n🏢 Checking business ${businessId}:`);

    const { data: businessStaff, error: businessStaffError } =
      await supabaseAdmin
        .from("business_staff")
        .select("*")
        .eq("business_id", businessId);

    if (businessStaffError) {
      console.error("❌ Error fetching business staff:", businessStaffError);
      return;
    }

    console.log(
      `📊 Business ${businessId} has ${
        businessStaff?.length || 0
      } staff members:`
    );
    if (businessStaff && businessStaff.length > 0) {
      businessStaff.forEach((staff, index) => {
        console.log(
          `  ${index + 1}. User: ${staff.user_id}, Role: ${
            staff.role
          }, Active: ${staff.is_active}, Business Type: ${staff.business_type}`
        );
      });
    }

    // Check business invitations
    const { data: businessInvitations, error: businessInvitationError } =
      await supabaseAdmin
        .from("staff_invitations")
        .select("*")
        .eq("business_id", businessId);

    if (businessInvitationError) {
      console.error(
        "❌ Error fetching business invitations:",
        businessInvitationError
      );
      return;
    }

    console.log(
      `📧 Business ${businessId} has ${
        businessInvitations?.length || 0
      } invitations:`
    );
    if (businessInvitations && businessInvitations.length > 0) {
      businessInvitations.forEach((invitation, index) => {
        console.log(
          `  ${index + 1}. Email: ${invitation.email}, Status: ${
            invitation.status
          }, Role: ${invitation.role}, Expires: ${invitation.expires_at}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkStaffData();
