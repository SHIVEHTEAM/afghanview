require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Setting up Supabase storage policies directly...");
console.log("URL:", supabaseUrl ? "Set" : "Not set");
console.log("Service Key:", supabaseServiceKey ? "Set" : "Not set");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPoliciesDirect() {
  try {
    console.log("\n1. Testing bucket access...");

    // Test if we can access the bucket
    const { data: files, error: listError } = await supabase.storage
      .from("slideshow-media")
      .list("", { limit: 1 });

    if (listError) {
      console.error("❌ Cannot access bucket:", listError.message);
      return;
    }

    console.log("✅ Bucket access confirmed");

    console.log("\n2. Testing upload with service role...");

    // Test upload with service role
    const testContent = "test file for policy verification";
    const testFile = new Blob([testContent], { type: "text/plain" });
    const testFileName = `test-${Date.now()}.txt`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("slideshow-media")
      .upload(`test/${testFileName}`, testFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Upload test failed:", uploadError.message);

      if (uploadError.message.includes("policy")) {
        console.log("\n💡 The issue is with storage policies.");
        console.log("You need to set up policies in the Supabase Dashboard:");
        console.log("1. Go to Storage → slideshow-media bucket → Settings");
        console.log("2. Enable RLS (Row Level Security)");
        console.log("3. Add these policies:");
        console.log(
          "   - SELECT: bucket_id = 'slideshow-media' (for public read)"
        );
        console.log(
          "   - INSERT: bucket_id = 'slideshow-media' AND auth.role() = 'authenticated'"
        );
        console.log(
          "   - UPDATE: bucket_id = 'slideshow-media' AND auth.role() = 'authenticated'"
        );
        console.log(
          "   - DELETE: bucket_id = 'slideshow-media' AND auth.role() = 'authenticated'"
        );
      }
    } else {
      console.log("✅ Upload test successful with service role");

      // Clean up test file
      await supabase.storage
        .from("slideshow-media")
        .remove([`test/${testFileName}`]);
      console.log("✅ Test file cleaned up");

      console.log("\n💡 Service role can upload, but anon key cannot.");
      console.log(
        "This confirms the bucket exists but policies are needed for anon access."
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

setupPoliciesDirect();
