require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables!");
  console.error(
    "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStorage() {
  console.log("🔍 Checking Supabase storage...");

  try {
    // List all buckets
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error("❌ Error listing buckets:", bucketsError);
      return;
    }

    console.log("📦 Available buckets:");
    buckets.forEach((bucket) => {
      console.log(
        `  - ${bucket.name} (${bucket.public ? "public" : "private"})`
      );
    });

    // Check slideshow-media bucket specifically
    console.log("\n🔍 Checking slideshow-media bucket...");
    const { data: files, error: filesError } = await supabase.storage
      .from("slideshow-media")
      .list("", { limit: 100 });

    if (filesError) {
      console.error("❌ Error listing files in slideshow-media:", filesError);
    } else {
      console.log("📁 Files in slideshow-media:");
      files.forEach((file) => {
        console.log(
          `  - ${file.name} (${file.metadata?.size || "unknown size"})`
        );
      });
    }

    // Check if the specific files exist
    console.log("\n🔍 Checking specific files...");
    const testFiles = [
      "e46a2c25-fe10-4fd2-a2bd-4c72969a898e/media/1751403747491-i5x4nk1xm.png",
      "e46a2c25-fe10-4fd2-a2bd-4c72969a898e/media/1751403750769-w1dswphs5.png",
    ];

    for (const filePath of testFiles) {
      const { data: file, error } = await supabase.storage
        .from("slideshow-media")
        .list(filePath.split("/").slice(0, -1).join("/"));

      if (error) {
        console.log(`❌ ${filePath}: ${error.message}`);
      } else {
        const fileName = filePath.split("/").pop();
        const exists = file.some((f) => f.name === fileName);
        console.log(
          `${exists ? "✅" : "❌"} ${filePath}: ${
            exists ? "Found" : "Not found"
          }`
        );
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkStorage();
