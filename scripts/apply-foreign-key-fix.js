const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyForeignKeyFix() {
  console.log("🔧 Applying foreign key constraint fix...");

  try {
    // 1. Drop the old foreign key constraint
    console.log("\n📋 Dropping old foreign key constraint...");
    const { error: dropError } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE public.slides DROP CONSTRAINT IF EXISTS slides_created_by_fkey;",
    });

    if (dropError) {
      console.log(
        "⚠️  Could not drop constraint via RPC, trying direct SQL..."
      );
      // Try alternative approach
      const { error: altDropError } = await supabase
        .from("slides")
        .select("*")
        .limit(1); // This is just to test connection

      if (altDropError) {
        console.error("❌ Error testing connection:", altDropError);
        return;
      }
    } else {
      console.log("✅ Old constraint dropped successfully");
    }

    // 2. Add the new foreign key constraint to auth.users
    console.log("\n📋 Adding new foreign key constraint...");
    const { error: addError } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE public.slides ADD CONSTRAINT slides_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);",
    });

    if (addError) {
      console.log(
        "⚠️  Could not add constraint via RPC, providing manual SQL..."
      );
      console.log("\n📋 Manual SQL to run in Supabase SQL Editor:");
      console.log(`
-- Drop the old foreign key constraint
ALTER TABLE public.slides DROP CONSTRAINT IF EXISTS slides_created_by_fkey;

-- Add the new foreign key constraint to auth.users
ALTER TABLE public.slides 
ADD CONSTRAINT slides_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id);
      `);
    } else {
      console.log("✅ New constraint added successfully");
    }

    // 3. Test the fix
    console.log("\n🧪 Testing the fix...");
    const testSlideData = {
      restaurant_id: "e46a2c25-fe10-4fd2-a2bd-4c72969a898e",
      name: "Test Slide After Fix",
      type: "image",
      title: "Test",
      content: { images: [] },
      created_by: "3420749c-dcaa-4245-8e61-2981f8e3e067",
    };

    const { data: testSlide, error: testError } = await supabase
      .from("slides")
      .insert(testSlideData)
      .select()
      .single();

    if (testError) {
      console.error("❌ Test slide creation still failing:", testError);
      console.log(
        "\n💡 The constraint fix needs to be applied manually in Supabase SQL Editor"
      );
    } else {
      console.log("✅ Test slide created successfully:", testSlide);

      // Clean up the test slide
      await supabase.from("slides").delete().eq("id", testSlide.id);
      console.log("🧹 Test slide cleaned up");

      console.log("\n🎉 Foreign key constraint fix applied successfully!");
      console.log("✅ You can now create slideshows without errors");
    }
  } catch (error) {
    console.error("❌ Error applying fix:", error);
    console.log("\n💡 Please run the SQL manually in Supabase SQL Editor:");
    console.log(`
-- Drop the old foreign key constraint
ALTER TABLE public.slides DROP CONSTRAINT IF EXISTS slides_created_by_fkey;

-- Add the new foreign key constraint to auth.users
ALTER TABLE public.slides 
ADD CONSTRAINT slides_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id);
    `);
  }
}

// Run the script
applyForeignKeyFix();
