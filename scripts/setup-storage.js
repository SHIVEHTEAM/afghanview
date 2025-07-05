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

async function setupStorage() {
  try {
    console.log("Setting up Supabase storage...");

    // Create media bucket if it doesn't exist
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error("Error listing buckets:", listError);
      return;
    }

    const slideshowMediaBucketExists = buckets.some(
      (bucket) => bucket.name === "slideshow-media"
    );

    if (!slideshowMediaBucketExists) {
      console.log("Creating slideshow-media bucket...");
      const { data, error } = await supabase.storage.createBucket(
        "slideshow-media",
        {
          public: true, // Public bucket for easier access
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
          ],
          fileSizeLimit: 52428800, // 50MB limit
        }
      );

      if (error) {
        console.error("Error creating bucket:", error);
        return;
      }

      console.log("slideshow-media bucket created successfully");
    } else {
      console.log("slideshow-media bucket already exists");
    }

    // Set up RLS policies for the slideshow-media bucket
    console.log("Setting up storage policies...");

    // Policy to allow authenticated users to upload files
    const { error: uploadPolicyError } = await supabase.rpc(
      "create_storage_policy",
      {
        bucket_name: "media",
        policy_name: "allow_authenticated_upload",
        policy_definition: `
        CREATE POLICY "allow_authenticated_upload" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'media' AND
          auth.role() = 'authenticated'
        );
      `,
      }
    );

    if (uploadPolicyError) {
      console.log("Upload policy setup note:", uploadPolicyError.message);
    }

    // Policy to allow authenticated users to read files
    const { error: readPolicyError } = await supabase.rpc(
      "create_storage_policy",
      {
        bucket_name: "media",
        policy_name: "allow_authenticated_read",
        policy_definition: `
        CREATE POLICY "allow_authenticated_read" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'media' AND
          auth.role() = 'authenticated'
        );
      `,
      }
    );

    if (readPolicyError) {
      console.log("Read policy setup note:", readPolicyError.message);
    }

    console.log("Storage setup completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Make sure your environment variables are set:");
    console.log("   - NEXT_PUBLIC_SUPABASE_URL");
    console.log("   - SUPABASE_SERVICE_ROLE_KEY");
    console.log("2. Run your Next.js development server");
    console.log("3. Test image uploads in the slideshow editor");
  } catch (error) {
    console.error("Setup failed:", error);
  }
}

// Run the setup
setupStorage();
