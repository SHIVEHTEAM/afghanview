const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables!");
  console.error("Please check your .env.local file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log("🚀 Running database migrations...");

  try {
    // Migration 1: Add is_locked column
    console.log("📝 Migration 1: Adding is_locked column...");
    const { error: alterError } = await supabase.rpc("exec_sql", {
      sql: `
        ALTER TABLE public.slides 
        ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
        
        COMMENT ON COLUMN public.slides.is_locked IS 'Whether the slide is locked from client editing by admin';
      `,
    });

    if (alterError) {
      console.error("❌ Error adding is_locked column:", alterError);
    } else {
      console.log("✅ is_locked column added successfully");
    }

    // Migration 2: Add template slides support
    console.log("📝 Migration 2: Adding template slides support...");
    const { error: templateError } = await supabase.rpc("exec_sql", {
      sql: `
        -- Make restaurant_id nullable for template slides
        ALTER TABLE public.slides 
        ALTER COLUMN restaurant_id DROP NOT NULL;

        -- Add comment to explain the new behavior
        COMMENT ON COLUMN public.slides.restaurant_id IS 'Restaurant ID for specific slides, NULL for template slides available to all restaurants';

        -- Add a check constraint to ensure either restaurant_id or template_id is provided
        ALTER TABLE public.slides 
        ADD CONSTRAINT IF NOT EXISTS check_restaurant_or_template 
        CHECK (restaurant_id IS NOT NULL OR template_id IS NOT NULL);
      `,
    });

    if (templateError) {
      console.error("❌ Error adding template slides support:", templateError);
    } else {
      console.log("✅ Template slides support added successfully");
    }

    // Migration 3: Update RLS policies
    console.log("📝 Migration 3: Updating RLS policies...");
    const { error: policyError } = await supabase.rpc("exec_sql", {
      sql: `
        -- Drop existing policies
        DROP POLICY IF EXISTS "Anyone can view active slides" ON public.slides;
        DROP POLICY IF EXISTS "Restaurant owners can manage their slides" ON public.slides;

        -- New policy that allows viewing template slides and restaurant-specific slides
        CREATE POLICY "Users can view slides" ON public.slides
        FOR SELECT USING (
            is_active = true AND (
                restaurant_id IS NULL OR -- Template slides
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role = 'admin'
                ) OR
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND restaurant_id = slides.restaurant_id
                )
            )
        );

        -- Policy for admins to manage all slides including templates
        CREATE POLICY "Admins can manage all slides" ON public.slides
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role = 'admin'
            )
        );

        -- Policy for restaurant owners to manage their slides (but not templates)
        CREATE POLICY "Restaurant owners can manage their slides" ON public.slides
        FOR ALL USING (
            restaurant_id IS NOT NULL AND
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND restaurant_id = slides.restaurant_id
            ) AND is_locked = false
        );
      `,
    });

    if (policyError) {
      console.error("❌ Error updating RLS policies:", policyError);
    } else {
      console.log("✅ RLS policies updated successfully");
    }

    // Migration 4: Add indexes
    console.log("📝 Migration 4: Adding indexes...");
    const { error: indexError } = await supabase.rpc("exec_sql", {
      sql: `
        -- Add index for template slides
        CREATE INDEX IF NOT EXISTS idx_slides_template_slides ON public.slides(restaurant_id) WHERE restaurant_id IS NULL;

        -- Add index for restaurant slides
        CREATE INDEX IF NOT EXISTS idx_slides_restaurant_slides ON public.slides(restaurant_id) WHERE restaurant_id IS NOT NULL;

        -- Add index for locked slides
        CREATE INDEX IF NOT EXISTS idx_slides_is_locked ON public.slides(is_locked);
      `,
    });

    if (indexError) {
      console.error("❌ Error adding indexes:", indexError);
    } else {
      console.log("✅ Indexes added successfully");
    }

    console.log("🎉 All migrations completed successfully!");
    console.log("");
    console.log("📋 Summary of changes:");
    console.log("  ✅ Added is_locked column for admin slide locking");
    console.log("  ✅ Made restaurant_id nullable for template slides");
    console.log("  ✅ Updated RLS policies for template slides");
    console.log("  ✅ Added performance indexes");
    console.log("");
    console.log("🚀 Your admin dashboard is now production-ready!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
