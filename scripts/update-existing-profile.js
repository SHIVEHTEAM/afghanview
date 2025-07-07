const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateExistingProfile() {
  console.log("🔄 Updating existing profile for shivehteam@gmail.com...");

  try {
    // User ID from the JSON you provided
    const userId = "cdd43cf3-0628-4ff3-a912-15bb3ec27ffd";

    // First, let's see what's currently in the profile
    const { data: existingProfile, error: fetchProfileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchProfileError) {
      console.error("❌ Error fetching existing profile:", fetchProfileError);
      return;
    }

    console.log("📋 Current profile data:", existingProfile);

    // Get the original user data
    const { data: oldUser, error: fetchError } = await supabase
      .from("users")
      .select(
        `
        *,
        user_roles!user_roles_user_id_fkey(
          roles(name)
        )
      `
      )
      .eq("email", "shivehteam@gmail.com")
      .single();

    if (fetchError || !oldUser) {
      console.error("❌ Error fetching original user data:", fetchError);
      return;
    }

    console.log("✅ Found original user data:", oldUser);

    // Extract roles
    const roles =
      oldUser.user_roles?.map((ur) => ur.roles?.name).filter(Boolean) || [];

    console.log("📋 Roles found:", roles);

    // Update the existing profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: oldUser.first_name,
        last_name: oldUser.last_name,
        phone: oldUser.phone,
        roles: roles,
        migrated_from_old_system: true,
        original_user_id: oldUser.id,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("❌ Failed to update profile:", updateError);
      return;
    }

    console.log("✅ Successfully updated profile for shivehteam@gmail.com");
    console.log(`   - User ID: ${userId}`);
    console.log(`   - Name: ${oldUser.first_name} ${oldUser.last_name}`);
    console.log(`   - Roles: ${roles.join(", ")}`);

    // Verify the update
    const { data: updatedProfile, error: verifyError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (verifyError) {
      console.error("❌ Error verifying update:", verifyError);
      return;
    }

    console.log("\n📋 Updated profile data:", updatedProfile);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the script
updateExistingProfile();
