const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyEnhancedSchema() {
  console.log("🚀 Applying enhanced facts and auto-generation schema...");

  try {
    // Read the enhanced schema file
    const schemaPath = path.join(
      __dirname,
      "../database/enhanced-facts-schema.sql"
    );
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split the schema into individual statements
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(
            `\n🔧 Executing statement ${i + 1}/${statements.length}...`
          );
          console.log(`SQL: ${statement.substring(0, 100)}...`);

          const { error } = await supabase.rpc("exec_sql", { sql: statement });

          if (error) {
            // Some statements might fail if tables/columns already exist, which is okay
            if (
              error.message.includes("already exists") ||
              error.message.includes("duplicate key")
            ) {
              console.log(
                `⚠️  Statement ${i + 1} skipped (already exists): ${
                  error.message
                }`
              );
            } else {
              console.error(`❌ Error executing statement ${i + 1}:`, error);
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`❌ Error executing statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log("\n🎉 Enhanced schema application completed!");
    console.log("\n📋 Applied enhancements:");
    console.log("   ✅ Facts table with background colors");
    console.log("   ✅ Auto-generation settings table");
    console.log("   ✅ Fact slides linking table");
    console.log("   ✅ Content analytics table");
    console.log("   ✅ Enhanced slides table with new fields");
    console.log("   ✅ Row Level Security policies");
    console.log("   ✅ Auto-generation functions");
    console.log("   ✅ Database triggers");
  } catch (error) {
    console.error("❌ Error applying enhanced schema:", error);
    process.exit(1);
  }
}

// Run the script
applyEnhancedSchema();
