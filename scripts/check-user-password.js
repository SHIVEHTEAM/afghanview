require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "❌ Missing environment variables. Please check your .env.local file."
  );
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserAndResetPassword(email) {
  try {
    console.log(`🔍 Checking user: ${email}`);

    // Check if user exists in auth
    const {
      data: { users },
      error: authError,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error("Error listing users:", authError);
      return;
    }

    const user = users.find((u) => u.email === email.toLowerCase());

    if (!user) {
      console.log("❌ User not found in auth");
      return;
    }

    console.log("✅ User found in auth:", user.id);
    console.log("📧 Email:", user.email);
    console.log("📅 Created:", user.created_at);
    console.log("✅ Email confirmed:", user.email_confirmed_at ? "Yes" : "No");

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.log("❌ No profile found:", profileError.message);
    } else {
      console.log("✅ Profile found:", profile);
    }

    // Generate a new temporary password
    const newPassword =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    console.log(`🔑 New temporary password: ${newPassword}`);

    // Update user password
    const { data: updateData, error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });

    if (updateError) {
      console.error("❌ Error updating password:", updateError);
      return;
    }

    console.log("✅ Password updated successfully");
    console.log(
      `📧 User can now sign in with email: ${email} and password: ${newPassword}`
    );
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log("Usage: node scripts/check-user-password.js <email>");
  console.log(
    "Example: node scripts/check-user-password.js a.seyarhasir@gmail.com"
  );
  process.exit(1);
}

checkUserAndResetPassword(email);
