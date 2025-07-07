const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncProfiles() {
  console.log("🔄 Starting profile sync after user migration...");

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

    console.log(`📊 Found ${oldUsers.length} users to sync profiles for`);

    let successCount = 0;
    let errorCount = 0;

    for (const oldUser of oldUsers) {
      try {
        console.log(`\n🔄 Syncing profile for: ${oldUser.email}`);

        // 2. Find the corresponding Supabase Auth user by email
        const { data: authUsers, error: authError } = await supabase
          .from("auth.users")
          .select("id, email")
          .eq("email", oldUser.email);

        if (authError || !authUsers || authUsers.length === 0) {
          console.log(
            `⚠️  No Supabase Auth user found for ${oldUser.email}, skipping...`
          );
          errorCount++;
          continue;
        }

        const authUser = authUsers[0];
        console.log(`✅ Found Supabase Auth user: ${authUser.id}`);

        // 3. Extract roles from user_roles
        const roles =
          oldUser.user_roles?.map((ur) => ur.roles?.name).filter(Boolean) || [];

        // 4. Get restaurant data if user is a restaurant owner
        let restaurant = null;
        if (roles.includes("restaurant_owner")) {
          const { data: restaurantData } = await supabase
            .from("restaurants")
            .select("*")
            .eq("created_by", oldUser.id)
            .single();

          if (restaurantData) {
            restaurant = restaurantData;
          }
        }

        // 5. Check if profile already exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", authUser.id)
          .single();

        if (existingProfile) {
          console.log(
            `⚠️  Profile already exists for ${oldUser.email}, updating...`
          );

          // Update existing profile
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              first_name: oldUser.first_name,
              last_name: oldUser.last_name,
              phone: oldUser.phone,
              roles: roles,
              restaurant: restaurant,
              migrated_from_old_system: true,
              original_user_id: oldUser.id,
            })
            .eq("id", authUser.id);

          if (updateError) {
            console.error(
              `❌ Failed to update profile for ${oldUser.email}:`,
              updateError
            );
            errorCount++;
            continue;
          }
        } else {
          // Create new profile
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: authUser.id,
              first_name: oldUser.first_name,
              last_name: oldUser.last_name,
              phone: oldUser.phone,
              roles: roles,
              restaurant: restaurant,
              migrated_from_old_system: true,
              original_user_id: oldUser.id,
            });

          if (profileError) {
            console.error(
              `❌ Failed to create profile for ${oldUser.email}:`,
              profileError
            );
            errorCount++;
            continue;
          }
        }

        // 6. Update restaurant created_by if needed
        if (restaurant && roles.includes("restaurant_owner")) {
          const { error: updateError } = await supabase
            .from("restaurants")
            .update({ created_by: authUser.id })
            .eq("id", restaurant.id);

          if (updateError) {
            console.warn(
              `⚠️  Failed to update restaurant created_by for ${oldUser.email}:`,
              updateError
            );
          }
        }

        console.log(`✅ Successfully synced profile for ${oldUser.email}`);
        console.log(`   - Auth User ID: ${authUser.id}`);
        console.log(`   - Roles: ${roles.join(", ")}`);

        successCount++;
      } catch (error) {
        console.error(`❌ Error syncing profile for ${oldUser.email}:`, error);
        errorCount++;
      }
    }

    console.log(`\n🎉 Profile sync completed!`);
    console.log(`✅ Successfully synced: ${successCount} profiles`);
    console.log(`❌ Failed to sync: ${errorCount} profiles`);

    if (successCount > 0) {
      console.log(`\n📧 Next steps:`);
      console.log(`1. Test the new authentication flow with migrated users`);
      console.log(`2. Users can reset passwords using "Forgot Password"`);
      console.log(`3. Uploads to Supabase Storage should now work with RLS`);
    }
  } catch (error) {
    console.error("❌ Profile sync failed:", error);
  }
}

// Run profile sync
syncProfiles();
