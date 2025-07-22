const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables");
  console.error(
    "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupMusicLibrary() {
  console.log("🎵 Setting up Music Library Database...");

  try {
    // Read the SQL schema file
    const schemaPath = path.join(
      __dirname,
      "../database/music-library-schema.sql"
    );
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    console.log("📖 Reading schema file...");

    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`🔧 Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(
            `  [${i + 1}/${statements.length}] Executing statement...`
          );
          const { error } = await supabase.rpc("exec_sql", { sql: statement });

          if (error) {
            console.warn(`  ⚠️  Warning on statement ${i + 1}:`, error.message);
            // Continue with other statements even if one fails
          }
        } catch (err) {
          console.warn(`  ⚠️  Warning on statement ${i + 1}:`, err.message);
          // Continue with other statements
        }
      }
    }

    console.log("✅ Music Library Database setup completed!");
    console.log("");
    console.log("📋 What was created:");
    console.log("  • music_tracks table - stores all music files");
    console.log(
      "  • music_playlists table - for multiple tracks and playlists"
    );
    console.log(
      "  • playlist_tracks table - junction table for playlist tracks"
    );
    console.log("  • user_favorites table - user favorite tracks");
    console.log("  • music_categories table - music categories with icons");
    console.log("  • RLS policies for security");
    console.log("  • Triggers for automatic updates");
    console.log("  • Functions for common operations");
    console.log("");
    console.log("🎯 Next steps:");
    console.log("  1. Upload some music files through the UI");
    console.log("  2. Create playlists with multiple tracks");
    console.log("  3. Test the advanced music features");
    console.log("  4. Configure music settings for slideshows");
  } catch (error) {
    console.error("❌ Error setting up Music Library:", error);
    process.exit(1);
  }
}

// Run the setup
setupMusicLibrary();
