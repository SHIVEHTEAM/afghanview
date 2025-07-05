const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testStorage() {
  console.log("Testing Supabase Storage...");
  console.log(
    "Supabase URL:",
    process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set"
  );
  console.log(
    "Service Key:",
    process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set"
  );

  try {
    // Check slideshow-media bucket
    console.log("\n📁 Checking slideshow-media bucket:");
    const { data: slideshowFiles, error: slideshowError } =
      await supabase.storage.from("slideshow-media").list("", { limit: 100 });

    if (slideshowError) {
      console.error(
        "❌ Error accessing slideshow-media bucket:",
        slideshowError
      );
    } else {
      console.log(
        "✅ slideshow-media bucket files:",
        slideshowFiles?.length || 0
      );
      if (slideshowFiles && slideshowFiles.length > 0) {
        slideshowFiles.forEach((file) => console.log("  -", file.name));
      }
    }

    // Check images bucket
    console.log("\n📁 Checking images bucket:");
    const { data: imageFiles, error: imageError } = await supabase.storage
      .from("images")
      .list("", { limit: 100 });

    if (imageError) {
      console.error("❌ Error accessing images bucket:", imageError);
    } else {
      console.log("✅ images bucket files:", imageFiles?.length || 0);
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((file) => console.log("  -", file.name));
      }
    }

    // Check media_files table
    console.log("\n📊 Checking media_files table:");
    const { data: mediaFiles, error: mediaError } = await supabase
      .from("media_files")
      .select("*")
      .limit(10);

    if (mediaError) {
      console.error("❌ Error accessing media_files table:", mediaError);
    } else {
      console.log("✅ media_files table records:", mediaFiles?.length || 0);
      if (mediaFiles && mediaFiles.length > 0) {
        mediaFiles.forEach((file) => {
          console.log("  - ID:", file.id);
          console.log("    Name:", file.original_filename);
          console.log("    Path:", file.file_path);
          console.log("    Type:", file.media_type);
          console.log("    Size:", file.file_size);
          console.log("    ---");
        });
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testStorage();
