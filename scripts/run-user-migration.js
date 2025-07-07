#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

console.log("🚀 Starting User Migration to Supabase Auth...\n");

try {
  // Check if .env.local exists
  const fs = require("fs");
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local file not found!");
    console.error("Please create .env.local with your Supabase credentials:");
    console.error("NEXT_PUBLIC_SUPABASE_URL=your_supabase_url");
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key");
    console.error("SUPABASE_SERVICE_ROLE_KEY=your_service_role_key");
    process.exit(1);
  }

  // Run the migration script
  console.log("📋 Running migration script...\n");
  execSync("node scripts/migrate-users-to-supabase-auth.js", {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  console.log("\n✅ Migration completed successfully!");
  console.log("\n📧 Next steps:");
  console.log(
    '1. Users will need to reset their passwords using "Forgot Password"'
  );
  console.log("2. Or you can manually set passwords in Supabase Dashboard");
  console.log(
    "3. Consider sending email notifications to users about the migration"
  );
  console.log("4. Test the new authentication flow with a migrated user");
} catch (error) {
  console.error("\n❌ Migration failed:", error.message);
  process.exit(1);
}
