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

async function createUserProfile(userId) {
  try {
    console.log(`🔍 Creating profile for user: ${userId}`);

    // First check if profile already exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, first_name, last_name")
      .eq("id", userId)
      .single();

    if (existingProfile) {
      console.log("✅ Profile already exists:", existingProfile);
      return existingProfile;
    }

    // Get user from auth
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser?.user) {
      console.error("❌ Error getting user from auth:", authError);
      return null;
    }

    console.log("🔍 Found user in auth:", {
      id: authUser.user.id,
      email: authUser.user.email,
      metadata: authUser.user.user_metadata,
    });

    // Create profile
    const profileData = {
      id: userId,
      first_name: authUser.user.user_metadata?.first_name || "",
      last_name: authUser.user.user_metadata?.last_name || "",
      roles: ["staff_member"],
    };

    console.log("🔍 Creating profile with data:", profileData);

    const { data: newProfile, error: createError } = await supabaseAdmin
      .from("profiles")
      .insert(profileData)
      .select("id, first_name, last_name, roles")
      .single();

    if (createError) {
      console.error("❌ Error creating profile:", createError);
      return null;
    }

    console.log("✅ Profile created successfully:", newProfile);
    return newProfile;
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return null;
  }
}

// Get the user ID from command line argument
const userId = process.argv[2];

if (!userId) {
  console.error("❌ Please provide a user ID as an argument");
  console.log("Usage: node scripts/create-user-profile.js <user-id>");
  console.log(
    "Example: node scripts/create-user-profile.js a1fc20a5-f7b0-42f1-b777-dcd0d1309a9e"
  );
  process.exit(1);
}

createUserProfile(userId).then(() => {
  console.log("🎉 Script completed!");
  process.exit(0);
});
