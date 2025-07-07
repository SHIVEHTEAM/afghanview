const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndFixAllConstraints() {
  console.log("🔧 Checking and fixing all foreign key constraints...");

  try {
    // 1. First, let's check what constraints exist on the slides table
    console.log("\n📋 Checking existing constraints on slides table...");

    // Try to get constraint information
    const { data: constraintInfo, error: constraintError } = await supabase
      .from("information_schema.key_column_usage")
      .select(
        "constraint_name, column_name, referenced_table_name, referenced_column_name"
      )
      .eq("table_name", "slides")
      .eq("table_schema", "public")
      .not("referenced_table_name", "is", null);

    if (constraintError) {
      console.log(
        "⚠️  Could not get constraint info via information_schema, trying alternative..."
      );
    } else {
      console.log("📋 Foreign key constraints found:", constraintInfo);
    }

    // 2. Check if the user exists in auth.users
    console.log("\n📋 Checking if user exists in auth.users...");
    const testUserId = "3420749c-dcaa-4245-8e61-2981f8e3e067";

    // Try to query auth.users (this might not work with service role)
    const { data: authUser, error: authError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", testUserId)
      .single();

    if (authError) {
      console.error("❌ Error checking auth user:", authError);
    } else {
      console.log("✅ User exists in profiles table:", authUser);
    }

    // 3. Check if the user exists in the old users table
    console.log("\n📋 Checking if user exists in old users table...");
    const { data: oldUser, error: oldUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", testUserId)
      .single();

    if (oldUserError) {
      console.log("✅ User does NOT exist in old users table (expected)");
    } else {
      console.log("⚠️  User exists in old users table:", oldUser);
    }

    // 4. Provide comprehensive SQL to fix all possible constraint issues
    console.log("\n📋 Comprehensive SQL to fix all constraint issues:");
    console.log(`
-- Step 1: Drop ALL possible foreign key constraints on slides table
ALTER TABLE public.slides DROP CONSTRAINT IF EXISTS slides_created_by_fkey;
ALTER TABLE public.slides DROP CONSTRAINT IF EXISTS slides_updated_by_fkey;
ALTER TABLE public.slides DROP CONSTRAINT IF EXISTS slides_published_by_fkey;

-- Step 2: Add new constraints that reference auth.users
ALTER TABLE public.slides 
ADD CONSTRAINT slides_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE public.slides 
ADD CONSTRAINT slides_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES auth.users(id);

ALTER TABLE public.slides 
ADD CONSTRAINT slides_published_by_fkey 
FOREIGN KEY (published_by) REFERENCES auth.users(id);

-- Step 3: Verify the constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='slides';
    `);

    // 5. Test if we can create a slide without the created_by field first
    console.log("\n🧪 Testing slide creation without created_by...");
    const testSlideDataWithoutUser = {
      restaurant_id: "e46a2c25-fe10-4fd2-a2bd-4c72969a898e",
      name: "Test Slide Without User",
      type: "image",
      title: "Test",
      content: { images: [] },
      // No created_by field
    };

    const { data: testSlideWithoutUser, error: testErrorWithoutUser } =
      await supabase
        .from("slides")
        .insert(testSlideDataWithoutUser)
        .select()
        .single();

    if (testErrorWithoutUser) {
      console.error(
        "❌ Test slide creation without user failed:",
        testErrorWithoutUser
      );
    } else {
      console.log("✅ Test slide created without user:", testSlideWithoutUser);

      // Clean up
      await supabase.from("slides").delete().eq("id", testSlideWithoutUser.id);
      console.log("🧹 Test slide cleaned up");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the script
checkAndFixAllConstraints();
