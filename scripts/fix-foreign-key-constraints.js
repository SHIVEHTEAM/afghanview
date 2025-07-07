const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixForeignKeyConstraints() {
  console.log("🔧 Fixing foreign key constraints...");

  try {
    // 1. First, let's check what foreign key constraints exist
    console.log("\n📋 Checking current foreign key constraints...");

    const { data: constraints, error: constraintsError } = await supabase.rpc(
      "get_foreign_key_constraints"
    );

    if (constraintsError) {
      console.log(
        "⚠️  Could not get constraints via RPC, trying direct query..."
      );

      // Try a different approach to check constraints
      const { data: infoConstraints, error: infoError } = await supabase
        .from("information_schema.table_constraints")
        .select("constraint_name, table_name, constraint_type")
        .eq("constraint_type", "FOREIGN KEY")
        .like("table_name", "slides");

      if (infoError) {
        console.error("❌ Error checking constraints:", infoError);
      } else {
        console.log(
          "📋 Foreign key constraints on slides table:",
          infoConstraints
        );
      }
    } else {
      console.log("📋 Foreign key constraints:", constraints);
    }

    // 2. Check the slides table structure
    console.log("\n📋 Checking slides table structure...");
    const { data: slidesColumns, error: slidesError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable, column_default")
      .eq("table_name", "slides")
      .eq("table_schema", "public");

    if (slidesError) {
      console.error("❌ Error checking slides columns:", slidesError);
    } else {
      console.log("📋 Slides table columns:", slidesColumns);
    }

    // 3. Check if there are any slides with created_by that don't exist in auth.users
    console.log("\n📋 Checking for orphaned slides...");
    const { data: orphanedSlides, error: orphanedError } = await supabase
      .from("slides")
      .select("id, name, created_by")
      .not("created_by", "is", null);

    if (orphanedError) {
      console.error("❌ Error checking orphaned slides:", orphanedError);
    } else {
      console.log("📋 Slides with created_by:", orphanedSlides);
    }

    // 4. Try to create a test slide to see the exact error
    console.log("\n🧪 Testing slide creation...");
    const testSlideData = {
      restaurant_id: "e46a2c25-fe10-4fd2-a2bd-4c72969a898e",
      name: "Test Slide",
      type: "image",
      title: "Test",
      content: { images: [] },
      created_by: "3420749c-dcaa-4245-8e61-2981f8e3e067", // This is the user ID from the error
    };

    const { data: testSlide, error: testError } = await supabase
      .from("slides")
      .insert(testSlideData)
      .select()
      .single();

    if (testError) {
      console.error("❌ Test slide creation error:", testError);

      // If it's a foreign key error, we need to fix the constraint
      if (testError.code === "23503") {
        console.log("\n🔧 Need to fix foreign key constraint...");
        console.log(
          "💡 The slides.created_by column should reference auth.users(id) instead of public.users(id)"
        );

        // Provide the SQL to fix this
        console.log("\n📋 SQL to fix the constraint:");
        console.log(`
-- Drop the old foreign key constraint
ALTER TABLE public.slides DROP CONSTRAINT IF EXISTS slides_created_by_fkey;

-- Add the new foreign key constraint to auth.users
ALTER TABLE public.slides 
ADD CONSTRAINT slides_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id);
        `);
      }
    } else {
      console.log("✅ Test slide created successfully:", testSlide);

      // Clean up the test slide
      await supabase.from("slides").delete().eq("id", testSlide.id);
      console.log("🧹 Test slide cleaned up");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the script
fixForeignKeyConstraints();
