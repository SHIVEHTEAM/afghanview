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

async function resetUserPassword(email) {
  try {
    console.log(`🔍 Looking for user: ${email}`);

    // Find user by email
    const {
      data: { users },
      error: listError,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("❌ Error listing users:", listError);
      return;
    }

    const user = users.find((u) => u.email === email.toLowerCase());

    if (!user) {
      console.log("❌ User not found in Supabase Auth");
      console.log("📧 Available users:");
      users.forEach((u) => console.log(`  - ${u.email} (${u.id})`));
      return;
    }

    console.log("✅ User found:", user.id);
    console.log("📧 Email:", user.email);
    console.log("📅 Created:", user.created_at);

    // Generate new password
    const newPassword =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    console.log(`🔑 New password: ${newPassword}`);

    // Update password
    const { data: updateData, error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });

    if (updateError) {
      console.error("❌ Error updating password:", updateError);
      return;
    }

    console.log("✅ Password updated successfully!");
    console.log("\n📋 Login Credentials:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log("\n🔗 You can now use these credentials to sign in at:");
    console.log("   http://localhost:3000/invitation/accept?token=YOUR_TOKEN");
    console.log("\n⚠️  Remember to change your password after signing in!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log("❌ Please provide an email address");
  console.log("Usage: node scripts/reset-user-password.js <email>");
  console.log("Example: node scripts/reset-user-password.js user@example.com");
  process.exit(1);
}

resetUserPassword(email);
