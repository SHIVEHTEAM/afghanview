require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Testing upload with anon key (what your app uses)...");
console.log("URL:", supabaseUrl ? "Set" : "Not set");
console.log("Anon Key:", supabaseAnonKey ? "Set" : "Not set");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpload() {
  try {
    console.log("\n1. Testing upload with anon key...");

    // Create a simple image-like blob (PNG header)
    const pngHeader = new Uint8Array([
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a, // PNG signature
      0x00,
      0x00,
      0x00,
      0x0d, // IHDR chunk length
      0x49,
      0x48,
      0x44,
      0x52, // IHDR
      0x00,
      0x00,
      0x00,
      0x01, // width: 1
      0x00,
      0x00,
      0x00,
      0x01, // height: 1
      0x08,
      0x02,
      0x00,
      0x00,
      0x00, // bit depth, color type, etc.
    ]);

    const testFile = new Blob([pngHeader], { type: "image/png" });
    const testFileName = `test-${Date.now()}.png`;

    console.log("Attempting upload...");

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("slideshow-media")
      .upload(`test/${testFileName}`, testFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Upload failed:", uploadError.message);

      if (
        uploadError.message.includes("policy") ||
        uploadError.message.includes("permission")
      ) {
        console.log("\n💡 This confirms the issue is with storage policies.");
        console.log("\n🔧 To fix this, you need to:");
        console.log("1. Go to your Supabase Dashboard");
        console.log("2. Navigate to Storage → slideshow-media bucket");
        console.log("3. Click on Settings (gear icon)");
        console.log("4. Enable 'Row Level Security (RLS)'");
        console.log("5. Add these policies:");
        console.log("   - Policy Name: 'Public read access'");
        console.log("     Operation: SELECT");
        console.log("     Target: public");
        console.log("     Expression: bucket_id = 'slideshow-media'");
        console.log("");
        console.log("   - Policy Name: 'Authenticated upload'");
        console.log("     Operation: INSERT");
        console.log("     Target: authenticated");
        console.log("     Expression: bucket_id = 'slideshow-media'");
        console.log("");
        console.log("   - Policy Name: 'Authenticated update'");
        console.log("     Operation: UPDATE");
        console.log("     Target: authenticated");
        console.log("     Expression: bucket_id = 'slideshow-media'");
        console.log("");
        console.log("   - Policy Name: 'Authenticated delete'");
        console.log("     Operation: DELETE");
        console.log("     Target: authenticated");
        console.log("     Expression: bucket_id = 'slideshow-media'");
      }
    } else {
      console.log("✅ Upload successful!");
      console.log("Upload data:", uploadData);

      // Clean up
      await supabase.storage
        .from("slideshow-media")
        .remove([`test/${testFileName}`]);
      console.log("✅ Test file cleaned up");

      console.log("\n🎉 Upload is working! Your app should work now.");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testUpload();
