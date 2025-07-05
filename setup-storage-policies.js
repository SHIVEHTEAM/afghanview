require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Setting up Supabase storage policies...");
console.log("URL:", supabaseUrl ? "Set" : "Not set");
console.log("Service Key:", supabaseServiceKey ? "Set" : "Not set");

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPolicies() {
  try {
    console.log("\n1. Enabling RLS on storage.objects...");

    // Enable RLS
    const { error: rlsError } = await supabase.rpc("exec_sql", {
      sql: "ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;",
    });

    if (rlsError) {
      console.log("RLS setup note:", rlsError.message);
    } else {
      console.log("✅ RLS enabled");
    }

    console.log("\n2. Creating storage policies...");

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
        name: "Authenticated users can update slideshow media",
        sql: `CREATE POLICY "Authenticated users can update slideshow media" ON storage.objects FOR UPDATE USING (bucket_id = 'slideshow-media' AND auth.role() = 'authenticated');`,
      },
      {
        name: "Authenticated users can delete slideshow media",
        sql: `CREATE POLICY "Authenticated users can delete slideshow media" ON storage.objects FOR DELETE USING (bucket_id = 'slideshow-media' AND auth.role() = 'authenticated');`,
      },
    ];

    for (const policy of policies) {
      try {
        // Drop existing policy first
        await supabase.rpc("exec_sql", {
          sql: `DROP POLICY IF EXISTS "${policy.name}" ON storage.objects;`,
        });

        // Create new policy
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

    console.log("\n✅ Storage policies setup completed!");
    console.log("\nNext steps:");
    console.log("1. Try uploading a file in your app");
    console.log("2. If it still fails, check the error message");
  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

setupPolicies();
