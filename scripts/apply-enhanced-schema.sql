-- Enhanced Facts and Auto-Generation Schema
-- This script applies the enhanced schema for AI-generated facts and auto-generation

-- Facts table to store AI-generated content
CREATE TABLE IF NOT EXISTS facts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    prompt TEXT NOT NULL,
    background_color VARCHAR(7) DEFAULT '#1f2937',
    font_size INTEGER DEFAULT 28,
    animation_type VARCHAR(50) DEFAULT 'fade',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Auto-generation settings table
CREATE TABLE IF NOT EXISTS auto_generation_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    generation_interval_hours INTEGER DEFAULT 24,
    categories TEXT[] DEFAULT ARRAY['Afghan Culture', 'Afghan Cuisine', 'Afghan Hospitality'],
    max_facts_per_generation INTEGER DEFAULT 3,
    auto_create_slides BOOLEAN DEFAULT true,
    background_music_url TEXT,
    last_generation_at TIMESTAMP WITH TIME ZONE,
    next_generation_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fact slides table (auto-generated slides from facts)
CREATE TABLE IF NOT EXISTS fact_slides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fact_id UUID REFERENCES facts(id) ON DELETE CASCADE,
    slide_id UUID REFERENCES slides(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced slides table with new fields
DO $$ 
BEGIN
    -- Add background_music_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'slides' AND column_name = 'background_music_url') THEN
        ALTER TABLE slides ADD COLUMN background_music_url TEXT;
    END IF;
    
    -- Add is_auto_generated column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'slides' AND column_name = 'is_auto_generated') THEN
        ALTER TABLE slides ADD COLUMN is_auto_generated BOOLEAN DEFAULT false;
    END IF;
    
    -- Add auto_generation_source column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'slides' AND column_name = 'auto_generation_source') THEN
        ALTER TABLE slides ADD COLUMN auto_generation_source VARCHAR(50);
    END IF;
END $$;

-- Content analytics table
CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slide_id UUID REFERENCES slides(id) ON DELETE CASCADE,
    fact_id UUID REFERENCES facts(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0,
    play_count INTEGER DEFAULT 0,
    engagement_score DECIMAL(3,2) DEFAULT 0.00,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_facts_category ON facts(category);
CREATE INDEX IF NOT EXISTS idx_facts_created_at ON facts(created_at);
CREATE INDEX IF NOT EXISTS idx_facts_is_active ON facts(is_active);
CREATE INDEX IF NOT EXISTS idx_auto_gen_settings_user_id ON auto_generation_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_gen_settings_next_generation ON auto_generation_settings(next_generation_at);
CREATE INDEX IF NOT EXISTS idx_fact_slides_fact_id ON fact_slides(fact_id);
CREATE INDEX IF NOT EXISTS idx_fact_slides_slide_id ON fact_slides(slide_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_slide_id ON content_analytics(slide_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_fact_id ON content_analytics(fact_id);

-- Row Level Security (RLS) policies
ALTER TABLE facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_generation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- Facts policies
DROP POLICY IF EXISTS "Users can view all active facts" ON facts;
CREATE POLICY "Users can view all active facts" ON facts
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can create facts" ON facts;
CREATE POLICY "Users can create facts" ON facts
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own facts" ON facts;
CREATE POLICY "Users can update their own facts" ON facts
    FOR UPDATE USING (auth.uid() = created_by);

-- Auto-generation settings policies
DROP POLICY IF EXISTS "Users can view their own settings" ON auto_generation_settings;
CREATE POLICY "Users can view their own settings" ON auto_generation_settings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own settings" ON auto_generation_settings;
CREATE POLICY "Users can manage their own settings" ON auto_generation_settings
    FOR ALL USING (auth.uid() = user_id);

-- Fact slides policies
DROP POLICY IF EXISTS "Users can view fact slides" ON fact_slides;
CREATE POLICY "Users can view fact slides" ON fact_slides
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can create fact slides" ON fact_slides;
CREATE POLICY "System can create fact slides" ON fact_slides
    FOR INSERT WITH CHECK (true);

-- Content analytics policies
DROP POLICY IF EXISTS "Users can view analytics" ON content_analytics;
CREATE POLICY "Users can view analytics" ON content_analytics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can update analytics" ON content_analytics;
CREATE POLICY "System can update analytics" ON content_analytics
    FOR UPDATE USING (true);

-- Functions for auto-generation
CREATE OR REPLACE FUNCTION generate_facts_for_user(user_uuid UUID)
RETURNS TABLE(fact_id UUID, slide_id UUID) AS $$
DECLARE
    setting_record RECORD;
    new_fact RECORD;
    new_slide RECORD;
    fact_count INTEGER := 0;
BEGIN
    -- Get user's auto-generation settings
    SELECT * INTO setting_record 
    FROM auto_generation_settings 
    WHERE user_id = user_uuid AND is_enabled = true;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Generate facts for each category
    FOR setting_record.category IN SELECT unnest(setting_record.categories)
    LOOP
        -- Call AI API to generate fact (this would be implemented in application code)
        -- For now, we'll create a placeholder fact
        INSERT INTO facts (text, category, prompt, background_color, created_by)
        VALUES (
            'Auto-generated fact for ' || setting_record.category,
            setting_record.category,
            'Auto-generation for ' || setting_record.category,
            '#1f2937',
            user_uuid
        ) RETURNING * INTO new_fact;
        
        -- Create slide from fact if auto_create_slides is enabled
        IF setting_record.auto_create_slides THEN
            INSERT INTO slides (
                name,
                type,
                title,
                content,
                styling,
                duration,
                is_active,
                is_auto_generated,
                auto_generation_source,
                created_by
            ) VALUES (
                'Fact: ' || new_fact.category,
                'text',
                new_fact.text,
                jsonb_build_object(
                    'text', jsonb_build_object(
                        'title', new_fact.text,
                        'subtitle', new_fact.category,
                        'description', ''
                    ),
                    'styling', jsonb_build_object(
                        'backgroundColor', new_fact.background_color,
                        'textColor', '#ffffff',
                        'fontSize', new_fact.font_size
                    )
                ),
                5000,
                true,
                true,
                'fact_generation',
                user_uuid
            ) RETURNING * INTO new_slide;
            
            -- Link fact to slide
            INSERT INTO fact_slides (fact_id, slide_id)
            VALUES (new_fact.id, new_slide.id);
            
            fact_count := fact_count + 1;
            
            -- Return the generated fact and slide
            RETURN QUERY SELECT new_fact.id, new_slide.id;
        END IF;
        
        -- Stop if we've reached the maximum facts per generation
        IF fact_count >= setting_record.max_facts_per_generation THEN
            EXIT;
        END IF;
    END LOOP;
    
    -- Update last generation time
    UPDATE auto_generation_settings 
    SET last_generation_at = NOW(),
        next_generation_at = NOW() + (setting_record.generation_interval_hours || ' hours')::INTERVAL
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers if they don't exist
DO $$
BEGIN
    -- Create trigger for facts table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_facts_updated_at') THEN
        CREATE TRIGGER update_facts_updated_at
            BEFORE UPDATE ON facts
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Create trigger for auto_generation_settings table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_auto_generation_settings_updated_at') THEN
        CREATE TRIGGER update_auto_generation_settings_updated_at
            BEFORE UPDATE ON auto_generation_settings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Success message
SELECT 'Enhanced facts and auto-generation schema applied successfully!' as message; 