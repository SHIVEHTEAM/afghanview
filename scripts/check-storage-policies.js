const { createClient } = require("@supabase/supabase-js");

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

async function checkStoragePolicies() {
  console.log("🔍 Checking Supabase Storage Policies...");

  try {
    // Test if we can list the bucket
    console.log("📂 Testing bucket access...");
    const { data: bucketList, error: bucketError } =
      await supabase.storage.listBuckets();

    if (bucketError) {
      console.error("❌ Error listing buckets:", bucketError);
      return;
    }

    console.log(
      "✅ Available buckets:",
      bucketList.map((b) => b.name)
    );

    // Check if slideshow-media bucket exists
    const slideshowBucket = bucketList.find(
      (b) => b.name === "slideshow-media"
    );
    if (!slideshowBucket) {
      console.error("❌ slideshow-media bucket not found!");
      console.log("📋 Creating slideshow-media bucket...");

      const { data: newBucket, error: createError } =
        await supabase.storage.createBucket("slideshow-media", {
          public: true,
          allowedMimeTypes: [
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/ogg",
            "audio/aac",
            "audio/m4a",
            "audio/flac",
            "audio/webm",
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "video/mp4",
            "video/webm",
            "video/ogg",
          ],
          fileSizeLimit: 52428800, // 50MB
        });

      if (createError) {
        console.error("❌ Error creating bucket:", createError);
        return;
      }

      console.log("✅ Created slideshow-media bucket");
    } else {
      console.log("✅ slideshow-media bucket exists");
    }

    // Test file upload with a small test file
    console.log("🧪 Testing file upload...");

    // Create a small test audio file (1 byte)
    const testBuffer = Buffer.from([0]);
    const testFile = new File([testBuffer], "test.mp3", { type: "audio/mpeg" });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("slideshow-media")
      .upload("test/test.mp3", testFile, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Upload test failed:", uploadError);
      console.log("🔧 This might indicate a storage policy issue");

      // Try to get more details about the error
      if (uploadError.message.includes("mime type")) {
        console.log(
          "💡 MIME type issue detected. Checking bucket configuration..."
        );

        // Try to update bucket settings
        const { error: updateError } = await supabase.storage.updateBucket(
          "slideshow-media",
          {
            allowedMimeTypes: [
              "audio/mpeg",
              "audio/mp3",
              "audio/wav",
              "audio/ogg",
              "audio/aac",
              "audio/m4a",
              "audio/flac",
              "audio/webm",
              "image/jpeg",
              "image/png",
              "image/gif",
              "image/webp",
              "video/mp4",
              "video/webm",
              "video/ogg",
            ],
          }
        );

        if (updateError) {
          console.error("❌ Error updating bucket:", updateError);
        } else {
          console.log("✅ Updated bucket MIME type settings");
        }
      }
    } else {
      console.log("✅ Upload test successful");

      // Clean up test file
      await supabase.storage.from("slideshow-media").remove(["test/test.mp3"]);

      console.log("🧹 Cleaned up test file");
    }

    // List existing files in music folder
    console.log("📁 Checking existing music files...");
    const { data: musicFiles, error: listError } = await supabase.storage
      .from("slideshow-media")
      .list("music", {
        limit: 10,
        offset: 0,
      });

    if (listError) {
      console.error("❌ Error listing music files:", listError);
    } else {
      console.log(`📋 Found ${musicFiles?.length || 0} music files`);
      if (musicFiles && musicFiles.length > 0) {
        musicFiles.forEach((file) => {
          console.log(
            `  - ${file.name} (${file.metadata?.mimetype || "unknown type"})`
          );
        });
      }
    }

    console.log("");
    console.log("🎯 Storage Policy Check Complete!");
    console.log("");
    console.log("📋 Next steps:");
    console.log(
      "  1. If upload test failed, check Supabase Dashboard → Storage"
    );
    console.log(
      "  2. Ensure slideshow-media bucket has correct MIME type settings"
    );
    console.log("  3. Check RLS policies for the storage bucket");
    console.log("  4. Try uploading a music file through the UI again");
  } catch (error) {
    console.error("❌ Error checking storage policies:", error);
    process.exit(1);
  }
}

// Run the check
checkStoragePolicies();
