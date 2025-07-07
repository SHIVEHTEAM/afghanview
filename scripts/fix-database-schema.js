const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabaseSchema() {
  console.log("🔧 Fixing database schema issues...");

  try {
    // 1. First, let's check the current profiles table structure
    console.log("\n📋 Checking current profiles table...");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .limit(5);

    if (profilesError) {
      console.error("❌ Error fetching profiles:", profilesError);
    } else {
      console.log("✅ Current profiles:", profiles);
    }

    // 2. Check if there are any foreign key constraint issues
    console.log("\n🔍 Checking for foreign key issues...");

    // Try to update a profile to see if there are constraint issues
    const { error: testUpdateError } = await supabase
      .from("profiles")
      .update({
        first_name: "TEST",
        roles: ["admin"],
      })
      .eq("id", "cdd43cf3-0628-4ff3-a912-15bb3ec27ffd");

    if (testUpdateError) {
      console.error("❌ Profile update error:", testUpdateError);

      // If it's a JSON error, let's try with proper array format
      if (testUpdateError.code === "22P02") {
        console.log("🔄 Trying with proper array format...");
        const { error: arrayUpdateError } = await supabase
          .from("profiles")
          .update({
            first_name: "TEST",
            roles: ["admin"], // This should be a proper array
          })
          .eq("id", "cdd43cf3-0628-4ff3-a912-15bb3ec27ffd");

        if (arrayUpdateError) {
          console.error("❌ Array update error:", arrayUpdateError);
        } else {
          console.log("✅ Array update successful");
        }
      }
    } else {
      console.log("✅ Profile update successful");
    }

    // 3. Check the actual database schema for the profiles table
    console.log("\n📊 Checking profiles table schema...");
    const { data: schemaInfo, error: schemaError } = await supabase.rpc(
      "get_table_info",
      { table_name: "profiles" }
    );

    if (schemaError) {
      console.log(
        "⚠️  Could not get schema info via RPC, trying direct query..."
      );

      // Try a different approach to check the schema
      const { data: columns, error: columnsError } = await supabase
        .from("information_schema.columns")
        .select("column_name, data_type, is_nullable, column_default")
        .eq("table_name", "profiles")
        .eq("table_schema", "public");

      if (columnsError) {
        console.error("❌ Error checking columns:", columnsError);
      } else {
        console.log("📋 Profiles table columns:", columns);
      }
    } else {
      console.log("📋 Schema info:", schemaInfo);
    }

    // 4. Let's also check what's actually in the profiles table
    console.log("\n🔍 Checking specific profile data...");
    const { data: specificProfile, error: specificError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", "cdd43cf3-0628-4ff3-a912-15bb3ec27ffd")
      .single();

    if (specificError) {
      console.error("❌ Error fetching specific profile:", specificError);
    } else {
      console.log("📋 Specific profile data:", specificProfile);
      console.log("📋 Roles type:", typeof specificProfile.roles);
      console.log("📋 Roles value:", specificProfile.roles);
    }

    // 5. Try to fix the roles field if it's corrupted
    if (specificProfile && typeof specificProfile.roles === "string") {
      console.log("\n🔄 Fixing corrupted roles field...");
      try {
        const parsedRoles = JSON.parse(specificProfile.roles);
        const { error: fixError } = await supabase
          .from("profiles")
          .update({ roles: parsedRoles })
          .eq("id", "cdd43cf3-0628-4ff3-a912-15bb3ec27ffd");

        if (fixError) {
          console.error("❌ Error fixing roles:", fixError);
        } else {
          console.log("✅ Roles field fixed");
        }
      } catch (parseError) {
        console.error("❌ Error parsing roles:", parseError);

        // If parsing fails, set to empty array
        const { error: resetError } = await supabase
          .from("profiles")
          .update({ roles: [] })
          .eq("id", "cdd43cf3-0628-4ff3-a912-15bb3ec27ffd");

        if (resetError) {
          console.error("❌ Error resetting roles:", resetError);
        } else {
          console.log("✅ Roles field reset to empty array");
        }
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the script
fixDatabaseSchema();
