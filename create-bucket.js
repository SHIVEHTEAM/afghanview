require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Creating Supabase storage bucket...");
console.log("URL:", supabaseUrl ? "Set" : "Not set");
console.log("Service Key:", supabaseServiceKey ? "Set" : "Not set");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBucket() {
  try {
    console.log("\n1. Checking existing buckets...");
    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();

    if (bucketError) {
      console.error("❌ Error listing buckets:", bucketError);
      return;
    }

    console.log(
      "Current buckets:",
      buckets.map((b) => b.id)
    );

    const mediaBucket = buckets.find((b) => b.id === "slideshow-media");
    if (mediaBucket) {
      console.log("✅ slideshow-media bucket already exists");
      return;
    }

    console.log("\n2. Creating slideshow-media bucket...");
    const { data, error } = await supabase.storage.createBucket(
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
        ],
        fileSizeLimit: 52428800, // 50MB
      }
    );

    if (error) {
      console.error("❌ Error creating bucket:", error);
      return;
    }

    console.log("✅ slideshow-media bucket created successfully:", data);

    console.log("\n3. Setting up storage policies...");

    // Create policies using SQL
    const policies = [
      {
        name: "Public read access for slideshow media",
        sql: `CREATE POLICY "Public read access for slideshow media" ON storage.objects FOR SELECT USING (bucket_id = 'slideshow-media');`,
      },
      {
        name: "Authenticated users can upload slideshow media",
        sql: `CREATE POLICY "Authenticated users can upload slideshow media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'slideshow-media' AND auth.role() = 'authenticated');`,
      },
      {
        name: "Users can update their own slideshow media",
        sql: `CREATE POLICY "Users can update their own slideshow media" ON storage.objects FOR UPDATE USING (bucket_id = 'slideshow-media' AND auth.uid()::text = (storage.foldername(name))[1]);`,
      },
      {
        name: "Users can delete their own slideshow media",
        sql: `CREATE POLICY "Users can delete their own slideshow media" ON storage.objects FOR DELETE USING (bucket_id = 'slideshow-media' AND auth.uid()::text = (storage.foldername(name))[1]);`,
      },
    ];

    for (const policy of policies) {
      try {
        const { error: policyError } = await supabase.rpc("exec_sql", {
          sql: policy.sql,
        });
        if (policyError) {
          console.log(
            `⚠️  Policy "${policy.name}" setup note:`,
            policyError.message
          );
        } else {
          console.log(`✅ Policy "${policy.name}" created`);
        }
      } catch (err) {
        console.log(`⚠️  Policy "${policy.name}" setup note:`, err.message);
      }
    }

    console.log("\n✅ Storage setup completed!");
  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

createBucket();
