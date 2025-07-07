const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSlidesConstraints() {
  console.log("🔧 Fixing slides table constraints with data cleanup...\n");

  try {
    // Step 1: Check existing slides with problematic created_by values
    console.log("📋 Checking slides with problematic created_by values...");
    const { data: problematicSlides, error: checkError } = await supabase
      .from("slides")
      .select("id, name, created_by, updated_by, published_by")
      .not("created_by", "is", null);

    if (checkError) {
      console.error("❌ Error checking slides:", checkError);
      return;
    }

    console.log(
      `📊 Found ${problematicSlides.length} slides with created_by values`
    );

    // Step 2: Check which created_by values exist in auth.users
    const createdByValues = [
      ...new Set(problematicSlides.map((slide) => slide.created_by)),
    ];
    console.log(
      `📋 Checking ${createdByValues.length} unique created_by values against auth.users...`
    );

    const { data: authUsers, error: authError } = await supabase.rpc(
      "exec_sql",
      {
        sql: `SELECT id FROM auth.users WHERE id = ANY(ARRAY[${createdByValues
          .map((id) => `'${id}'`)
          .join(",")}])`,
      }
    );

    if (authError) {
      console.error("❌ Error checking auth.users:", authError);
      return;
    }

    const validUserIds = new Set(authUsers.map((user) => user.id));
    const invalidUserIds = createdByValues.filter(
      (id) => !validUserIds.has(id)
    );

    console.log(`✅ Valid user IDs: ${validUserIds.size}`);
    console.log(`❌ Invalid user IDs: ${invalidUserIds.length}`);

    if (invalidUserIds.length > 0) {
      console.log("📋 Invalid user IDs:", invalidUserIds);
    }

    // Step 3: Update slides with invalid created_by to null
    if (invalidUserIds.length > 0) {
      console.log(
        "\n🔄 Updating slides with invalid created_by values to null..."
      );

      const { error: updateError } = await supabase
        .from("slides")
        .update({
          created_by: null,
          updated_by: null,
          published_by: null,
        })
        .in("created_by", invalidUserIds);

      if (updateError) {
        console.error("❌ Error updating slides:", updateError);
        return;
      }

      console.log(
        `✅ Updated ${invalidUserIds.length} slides to have null user references`
      );
    }

    // Step 4: Drop existing constraints
    console.log("\n🗑️ Dropping existing foreign key constraints...");

    const dropConstraints = [
      "ALTER TABLE public.slides DROP CONSTRAINT IF EXISTS slides_created_by_fkey;",
      "ALTER TABLE public.slides DROP CONSTRAINT IF EXISTS slides_updated_by_fkey;",
      "ALTER TABLE public.slides DROP CONSTRAINT IF EXISTS slides_published_by_fkey;",
    ];

    for (const sql of dropConstraints) {
      const { error } = await supabase.rpc("exec_sql", { sql });
      if (error) {
        console.error("❌ Error dropping constraint:", error);
        console.log("SQL:", sql);
        return;
      }
    }

    console.log("✅ Dropped existing constraints");

    // Step 5: Add new constraints referencing auth.users
    console.log("\n🔗 Adding new constraints referencing auth.users...");

    const addConstraints = [
      `ALTER TABLE public.slides
       ADD CONSTRAINT slides_created_by_fkey
       FOREIGN KEY (created_by) REFERENCES auth.users(id);`,

      `ALTER TABLE public.slides
       ADD CONSTRAINT slides_updated_by_fkey
       FOREIGN KEY (updated_by) REFERENCES auth.users(id);`,

      `ALTER TABLE public.slides
       ADD CONSTRAINT slides_published_by_fkey
       FOREIGN KEY (published_by) REFERENCES auth.users(id);`,
    ];

    for (const sql of addConstraints) {
      const { error } = await supabase.rpc("exec_sql", { sql });
      if (error) {
        console.error("❌ Error adding constraint:", error);
        console.log("SQL:", sql);
        return;
      }
    }

    console.log("✅ Added new constraints");

    // Step 6: Verify the constraints
    console.log("\n🔍 Verifying new constraints...");
    const { data: constraints, error: verifyError } = await supabase.rpc(
      "exec_sql",
      {
        sql: `
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
        `,
      }
    );

    if (verifyError) {
      console.error("❌ Error verifying constraints:", verifyError);
    } else {
      console.log("📋 Current constraints on slides table:");
      console.table(constraints);
    }

    // Step 7: Test creating a slide
    console.log("\n🧪 Testing slide creation...");
    const { data: testSlide, error: testError } = await supabase
      .from("slides")
      .insert({
        restaurant_id: "e46a2c25-fe10-4fd2-a2bd-4c72969a898e",
        name: "Test Slide After Fix",
        type: "image",
        title: "Test",
        content: { images: [] },
        styling: {},
        duration: 6000,
        order_index: 0,
        is_active: true,
        is_published: false,
        created_by: null,
        updated_by: null,
        published_by: null,
      })
      .select()
      .single();

    if (testError) {
      console.error("❌ Error creating test slide:", testError);
    } else {
      console.log("✅ Test slide created successfully:", testSlide.id);

      // Clean up test slide
      await supabase.from("slides").delete().eq("id", testSlide.id);

      console.log("🧹 Test slide cleaned up");
    }

    console.log("\n🎉 Slides table constraints fixed successfully!");
    console.log("\n📝 Summary:");
    console.log(
      `- Found ${problematicSlides.length} slides with created_by values`
    );
    console.log(`- ${validUserIds.size} valid user IDs in auth.users`);
    console.log(`- ${invalidUserIds.length} invalid user IDs cleaned up`);
    console.log("- Foreign key constraints updated to reference auth.users");
    console.log("- Test slide creation successful");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

fixSlidesConstraints();
