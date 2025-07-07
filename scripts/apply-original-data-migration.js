const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyOriginalDataMigration() {
  try {
    console.log("🔄 Applying original_data column migration...");

    // First, let's check if the slideshows table exists
    const { data: tables, error: tableError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "slideshows");

    if (tableError) {
      console.error("❌ Error checking tables:", tableError);
      return;
    }

    if (tables.length === 0) {
      console.log(
        "❌ slideshows table does not exist. Please run the database setup first."
      );
      return;
    }

    console.log("✅ slideshows table found");

    // Check if original_data column already exists
    const { data: columns, error: columnError } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_schema", "public")
      .eq("table_name", "slideshows")
      .eq("column_name", "original_data");

    if (columnError) {
      console.error("❌ Error checking columns:", columnError);
      return;
    }

    if (columns.length > 0) {
      console.log("✅ original_data column already exists");
      return;
    }

    // Since we can't use exec_sql, let's try to add the column through a different approach
    // We'll need to manually add it through the Supabase dashboard or use a different method

    console.log("⚠️  Manual intervention required:");
    console.log(
      "📝 Please add the original_data column manually in your Supabase dashboard:"
    );
    console.log("   1. Go to your Supabase project dashboard");
    console.log("   2. Navigate to Database > Tables > slideshows");
    console.log("   3. Add a new column:");
    console.log("      - Name: original_data");
    console.log("      - Type: jsonb");
    console.log("      - Default: null");
    console.log("   4. Save the changes");
    console.log("");
    console.log(
      "🔍 After adding the column, you can continue with the implementation."
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
  }
}

applyOriginalDataMigration();
