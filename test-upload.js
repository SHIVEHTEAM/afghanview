require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Testing Supabase storage upload...");
console.log("URL:", supabaseUrl ? "Set" : "Not set");
console.log("Anon Key:", supabaseAnonKey ? "Set" : "Not set");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStorage() {
  try {
    console.log("\n1. Checking buckets...");
    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();

    if (bucketError) {
      console.error("❌ Error listing buckets:", bucketError);
      return;
    }

    console.log(
      "✅ Available buckets:",
      buckets.map((b) => b.id)
    );

    const mediaBucket = buckets.find((b) => b.id === "slideshow-media");
    if (!mediaBucket) {
      console.error("❌ slideshow-media bucket not found");
      return;
    }

    console.log("✅ slideshow-media bucket found:", mediaBucket);

    console.log("\n2. Testing file list...");
    const { data: files, error: listError } = await supabase.storage
      .from("slideshow-media")
      .list("slides");

    if (listError) {
      console.error("❌ Error listing files:", listError);
    } else {
      console.log("✅ Files in slides folder:", files?.length || 0);
    }

    console.log("\n3. Testing upload permissions...");
    // Create a simple test file
    const testContent = "This is a test file for upload verification";
    const testFile = new Blob([testContent], { type: "text/plain" });
    const testFileName = `test-${Date.now()}.txt`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("slideshow-media")
      .upload(`test/${testFileName}`, testFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Upload test failed:", uploadError);
      console.error("Error details:", uploadError.message);

      if (uploadError.message.includes("bucket")) {
        console.error("💡 Bucket not found - run storage setup");
      } else if (uploadError.message.includes("policy")) {
        console.error("💡 Storage policies not configured");
      } else if (uploadError.message.includes("authenticated")) {
        console.error("💡 Authentication required");
      }
    } else {
      console.log("✅ Upload test successful:", uploadData);

      // Clean up test file
      await supabase.storage
        .from("slideshow-media")
        .remove([`test/${testFileName}`]);
      console.log("✅ Test file cleaned up");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testStorage();
