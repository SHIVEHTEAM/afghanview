const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createProfileManually() {
  console.log("🔄 Creating profile manually for shivehteam@gmail.com...");

  try {
    // User ID from the JSON you provided
    const userId = "cdd43cf3-0628-4ff3-a912-15bb3ec27ffd";

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

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      first_name: oldUser.first_name,
      last_name: oldUser.last_name,
      phone: oldUser.phone,
      roles: roles,
      migrated_from_old_system: true,
      original_user_id: oldUser.id,
    });

    if (profileError) {
      console.error("❌ Failed to create profile:", profileError);
      return;
    }

    console.log("✅ Successfully created profile for shivehteam@gmail.com");
    console.log(`   - User ID: ${userId}`);
    console.log(`   - Name: ${oldUser.first_name} ${oldUser.last_name}`);
    console.log(`   - Roles: ${roles.join(", ")}`);

    console.log("\n🔄 Now creating profile for ahmadseyarhasir@gmail.com...");

    // Get the second user data
    const { data: oldUser2, error: fetchError2 } = await supabase
      .from("users")
      .select(
        `
        *,
        user_roles!user_roles_user_id_fkey(
          roles(name)
        )
      `
      )
      .eq("email", "ahmadseyarhasir@gmail.com")
      .single();

    if (fetchError2 || !oldUser2) {
      console.error("❌ Error fetching second user data:", fetchError2);
      return;
    }

    // For the second user, we need to get their Supabase Auth user ID
    // Since we can't query auth.users directly, let's create a profile with a placeholder
    // You'll need to replace this with the actual user ID from Supabase Dashboard

    console.log("⚠️  For ahmadseyarhasir@gmail.com, you need to:");
    console.log("1. Go to Supabase Dashboard > Authentication > Users");
    console.log("2. Find ahmadseyarhasir@gmail.com and copy their User ID");
    console.log("3. Update the script with the correct User ID");

    console.log("\n📋 User data for ahmadseyarhasir@gmail.com:");
    console.log(`   - Name: ${oldUser2.first_name} ${oldUser2.last_name}`);
    console.log(
      `   - Roles: ${oldUser2.user_roles
        ?.map((ur) => ur.roles?.name)
        .filter(Boolean)
        .join(", ")}`
    );
    console.log(`   - Original User ID: ${oldUser2.id}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the script
createProfileManually();
