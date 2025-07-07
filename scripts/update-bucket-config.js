const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error(
    "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateBucketConfig() {
  try {
    console.log("Updating slideshow-media bucket configuration...");

    // Update the bucket configuration
    const { data, error } = await supabase.storage.updateBucket(
      "slideshow-media",
      {
        public: true,
        allowedMimeTypes: [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
          "video/mp4",
          "video/webm",
          "video/mov",
          "video/avi",
          "video/quicktime",
          "video/x-msvideo",
          "video/x-matroska",
        ],
        fileSizeLimit: 52428800, // 50MB limit
      }
    );

    if (error) {
      console.error("Error updating bucket:", error);
      return;
    }

    console.log("✅ slideshow-media bucket configuration updated successfully");
    console.log("Updated configuration:", data);
  } catch (error) {
    console.error("Update failed:", error);
  }
}

// Run the update
updateBucketConfig();
