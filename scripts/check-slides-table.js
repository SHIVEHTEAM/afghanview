const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateSlidesTable() {
  try {
    console.log("=== Checking Slides Table ===");

    // First, check if the slides table exists
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "slides");

    if (tablesError) {
      console.error("Error checking tables:", tablesError);
      return;
    }

    if (tables && tables.length > 0) {
      console.log("✅ Slides table exists");

      // Check the structure
      const { data: columns, error: columnsError } = await supabase
        .from("information_schema.columns")
        .select("column_name, data_type, is_nullable")
        .eq("table_schema", "public")
        .eq("table_name", "slides")
        .order("ordinal_position");

      if (columnsError) {
        console.error("Error checking columns:", columnsError);
      } else {
        console.log("📋 Slides table structure:");
        columns.forEach((col) => {
          console.log(
            `  - ${col.column_name}: ${col.data_type} (${
              col.is_nullable === "YES" ? "nullable" : "not null"
            })`
          );
        });
      }

      // Check if there are any slides
      const { count, error: countError } = await supabase
        .from("slides")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.error("Error counting slides:", countError);
      } else {
        console.log(`📊 Total slides in database: ${count}`);
      }

      // Check RLS policies
      const { data: policies, error: policiesError } = await supabase
        .from("pg_policies")
        .select("*")
        .eq("tablename", "slides");

      if (policiesError) {
        console.error("Error checking policies:", policiesError);
      } else {
        console.log(
          `🔒 RLS policies on slides table: ${policies?.length || 0}`
        );
        if (policies && policies.length > 0) {
          policies.forEach((policy) => {
            console.log(
              `  - ${policy.policyname}: ${policy.cmd} (${
                policy.roles?.join(", ") || "all"
              })`
            );
          });
        }
      }
    } else {
      console.log("❌ Slides table does not exist");
      console.log("Creating slides table...");

      // Create the slides table
      const createTableSQL = `
        CREATE TABLE public.slides (
          id uuid NOT NULL DEFAULT uuid_generate_v4(),
          restaurant_id uuid,
          template_id uuid,
          name text NOT NULL,
          type text NOT NULL CHECK (type = ANY (ARRAY['image'::text, 'menu'::text, 'promo'::text, 'quote'::text, 'hours'::text, 'custom'::text])),
          title text NOT NULL,
          subtitle text,
          content jsonb NOT NULL,
          styling jsonb DEFAULT '{}'::jsonb,
          duration integer DEFAULT 6000,
          order_index integer DEFAULT 0,
          is_active boolean DEFAULT true,
          is_published boolean DEFAULT false,
          published_at timestamp with time zone,
          published_by uuid,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now(),
          created_by uuid,
          updated_by uuid,
          is_locked boolean DEFAULT false,
          CONSTRAINT slides_pkey PRIMARY KEY (id)
        );
      `;

      const { error: createError } = await supabase.rpc("exec_sql", {
        sql: createTableSQL,
      });

      if (createError) {
        console.error("Error creating slides table:", createError);
      } else {
        console.log("✅ Slides table created successfully");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkAndCreateSlidesTable();
