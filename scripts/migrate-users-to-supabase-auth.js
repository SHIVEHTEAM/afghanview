const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateUsers() {
  console.log("🔄 Starting user migration to Supabase Auth...");

  try {
    // 1. Get all users from the old users table
    const { data: oldUsers, error: fetchError } = await supabase
      .from("users")
      .select(
        `
        *,
        user_roles!user_roles_user_id_fkey(
          roles(name)
        )
      `
      )
      .eq("is_active", true);

    if (fetchError) {
      console.error("❌ Error fetching users:", fetchError);
      return;
    }

    console.log(`📊 Found ${oldUsers.length} users to migrate`);

    console.log("\n📋 Migration Instructions:");
    console.log(
      "Since Supabase Auth admin APIs have compatibility issues, please follow these steps:"
    );
    console.log("\n1. MANUALLY create users in Supabase Dashboard:");
    console.log("   - Go to Authentication > Users");
    console.log('   - Click "Add User" for each user below');
    console.log("   - Use the temporary passwords provided");
    console.log(
      "\n2. After creating users, run this script again to sync profiles"
    );

    console.log("\n📝 Users to create manually:");
    oldUsers.forEach((user, index) => {
      const roles =
        user.user_roles?.map((ur) => ur.roles?.name).filter(Boolean) || [];

      console.log(`\n${index + 1}. ${user.email}`);
      console.log(`   - Name: ${user.first_name} ${user.last_name}`);
      console.log(`   - Roles: ${roles.join(", ")}`);
      console.log(
        `   - Temp Password: TempPass${Math.random()
          .toString(36)
          .substring(2)}!`
      );
      console.log(`   - Original User ID: ${user.id}`);
    });

    console.log("\n🔄 Next steps:");
    console.log("1. Create the users manually in Supabase Dashboard");
    console.log("2. Run this script again to sync profile data");
    console.log('3. Users can then reset passwords using "Forgot Password"');
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

// Run migration
migrateUsers();
