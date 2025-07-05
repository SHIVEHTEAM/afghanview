const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables!");
  console.error("Please check your .env.local file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addIsLockedColumn() {
  console.log("🔧 Adding is_locked column to slides table...");

  try {
    // Add the is_locked column
    const { error: alterError } = await supabase.rpc("exec_sql", {
      sql: `
        ALTER TABLE public.slides 
        ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
      `,
    });

    if (alterError) {
      console.error("❌ Error adding is_locked column:", alterError);
      return;
    }

    // Add comment
    const { error: commentError } = await supabase.rpc("exec_sql", {
      sql: `
        COMMENT ON COLUMN public.slides.is_locked IS 'Whether the slide is locked from client editing by admin';
      `,
    });

    if (commentError) {
      console.log(
        "⚠️  Could not add comment (non-critical):",
        commentError.message
      );
    }

    // Create index
    const { error: indexError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_slides_is_locked ON public.slides(is_locked);
      `,
    });

    if (indexError) {
      console.log(
        "⚠️  Could not create index (non-critical):",
        indexError.message
      );
    }

    console.log("✅ Successfully added is_locked column to slides table!");
    console.log("📋 What was added:");
    console.log("   ✅ is_locked BOOLEAN column (default: false)");
    console.log("   ✅ Database comment for documentation");
    console.log("   ✅ Performance index for locked slides");
    console.log("");
    console.log("🔒 Admin locking functionality is now available!");
  } catch (error) {
    console.error("❌ Error during migration:", error);
  }
}

// Run the migration
addIsLockedColumn();
