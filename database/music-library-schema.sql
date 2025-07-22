-- Music Library Database Schema
-- This schema supports user uploads, shared library, playlists, and advanced music features

-- Music tracks table - stores all music files
CREATE TABLE IF NOT EXISTS music_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in seconds
    file_url TEXT NOT NULL,
    file_size INTEGER, -- in bytes
    file_type VARCHAR(50), -- mp3, wav, etc.
    category VARCHAR(100) NOT NULL,
    tags TEXT[], -- array of tags
    source VARCHAR(100) DEFAULT 'user_upload', -- 'user_upload', 'curated', 'api'
    uploaded_by UUID REFERENCES auth.users(id),
    is_public BOOLEAN DEFAULT true, -- whether other users can see this track
    is_approved BOOLEAN DEFAULT true, -- admin approval for public tracks
    play_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Music playlists table - for multiple tracks and advanced features
CREATE TABLE IF NOT EXISTS music_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    business_id UUID REFERENCES businesses(id),
    created_by UUID REFERENCES auth.users(id),
    is_public BOOLEAN DEFAULT false,
    play_mode VARCHAR(50) DEFAULT 'sequential', -- 'sequential', 'shuffle', 'random'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist tracks junction table
CREATE TABLE IF NOT EXISTS playlist_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID REFERENCES music_playlists(id) ON DELETE CASCADE,
    track_id UUID REFERENCES music_tracks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL, -- for ordering in sequential mode
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(playlist_id, track_id)
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES music_tracks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, track_id)
);

-- Music categories table
CREATE TABLE IF NOT EXISTS music_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50), -- icon name
    color_gradient VARCHAR(100), -- CSS gradient class
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO music_categories (name, description, icon, color_gradient, sort_order) VALUES
('All Music', 'Browse all available tracks', 'Music', 'from-blue-500 to-purple-600', 0),
('Afghan Traditional', 'Classic Afghan folk and traditional', 'Mic', 'from-orange-500 to-red-600', 1),
('Persian Classical', 'Traditional Persian melodies', 'Guitar', 'from-green-500 to-teal-600', 2),
('Pashto Traditional', 'Traditional Pashto music', 'Disc3', 'from-purple-500 to-indigo-600', 3),
('Ambient & Relaxing', 'Calming background music', 'Moon', 'from-indigo-500 to-blue-600', 4),
('Upbeat & Energetic', 'Energetic and positive vibes', 'Zap', 'from-yellow-500 to-orange-600', 5),
('Instrumental', 'Beautiful instrumental pieces', 'Waves', 'from-pink-500 to-rose-600', 6)
ON CONFLICT (name) DO NOTHING;

-- Update slideshows table to support playlists (only if columns don't exist)
DO $$
BEGIN
    -- Check if music_playlist_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'slideshows' AND column_name = 'music_playlist_id'
    ) THEN
        ALTER TABLE slideshows ADD COLUMN music_playlist_id UUID REFERENCES music_playlists(id);
    END IF;
    
    -- Check if music_play_mode column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'slideshows' AND column_name = 'music_play_mode'
    ) THEN
        ALTER TABLE slideshows ADD COLUMN music_play_mode VARCHAR(50) DEFAULT 'sequential';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_music_tracks_category ON music_tracks(category);
CREATE INDEX IF NOT EXISTS idx_music_tracks_uploaded_by ON music_tracks(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_music_tracks_is_public ON music_tracks(is_public);
CREATE INDEX IF NOT EXISTS idx_music_tracks_created_at ON music_tracks(created_at);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_position ON playlist_tracks(position);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_track_id ON user_favorites(track_id);

-- Create RLS policies
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public tracks are viewable by everyone" ON music_tracks;
DROP POLICY IF EXISTS "Users can view their own tracks" ON music_tracks;
DROP POLICY IF EXISTS "Users can insert their own tracks" ON music_tracks;
DROP POLICY IF EXISTS "Users can update their own tracks" ON music_tracks;
DROP POLICY IF EXISTS "Users can delete their own tracks" ON music_tracks;

DROP POLICY IF EXISTS "Users can view their own playlists" ON music_playlists;
DROP POLICY IF EXISTS "Users can insert their own playlists" ON music_playlists;
DROP POLICY IF EXISTS "Users can update their own playlists" ON music_playlists;
DROP POLICY IF EXISTS "Users can delete their own playlists" ON music_playlists;

DROP POLICY IF EXISTS "Users can view tracks in their playlists" ON playlist_tracks;
DROP POLICY IF EXISTS "Users can manage tracks in their playlists" ON playlist_tracks;

DROP POLICY IF EXISTS "Users can view their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can manage their own favorites" ON user_favorites;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON music_categories;

-- Music tracks policies
CREATE POLICY "Public tracks are viewable by everyone" ON music_tracks
    FOR SELECT USING (is_public = true AND is_approved = true);

CREATE POLICY "Users can view their own tracks" ON music_tracks
    FOR SELECT USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can insert their own tracks" ON music_tracks
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own tracks" ON music_tracks
    FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own tracks" ON music_tracks
    FOR DELETE USING (auth.uid() = uploaded_by);

-- Playlists policies
CREATE POLICY "Users can view their own playlists" ON music_playlists
    FOR SELECT USING (auth.uid() = created_by OR business_id IN (
        SELECT id FROM businesses WHERE created_by = auth.uid()
    ));

CREATE POLICY "Users can insert their own playlists" ON music_playlists
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own playlists" ON music_playlists
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own playlists" ON music_playlists
    FOR DELETE USING (auth.uid() = created_by);

-- Playlist tracks policies
CREATE POLICY "Users can view tracks in their playlists" ON playlist_tracks
    FOR SELECT USING (playlist_id IN (
        SELECT id FROM music_playlists WHERE created_by = auth.uid() OR business_id IN (
            SELECT id FROM businesses WHERE created_by = auth.uid()
        )
    ));

CREATE POLICY "Users can manage tracks in their playlists" ON playlist_tracks
    FOR ALL USING (playlist_id IN (
        SELECT id FROM music_playlists WHERE created_by = auth.uid()
    ));

-- User favorites policies
CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON music_categories
    FOR SELECT USING (is_active = true);

-- Functions for common operations
CREATE OR REPLACE FUNCTION increment_play_count(track_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE music_tracks 
    SET play_count = play_count + 1 
    WHERE id = track_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_favorite_count(track_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE music_tracks 
    SET favorite_count = favorite_count + 1 
    WHERE id = track_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_favorite_count(track_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE music_tracks 
    SET favorite_count = GREATEST(favorite_count - 1, 0)
    WHERE id = track_id;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_music_tracks_updated_at ON music_tracks;
DROP TRIGGER IF EXISTS update_music_playlists_updated_at ON music_playlists;
DROP TRIGGER IF EXISTS manage_favorite_count_trigger ON user_favorites;

CREATE TRIGGER update_music_tracks_updated_at
    BEFORE UPDATE ON music_tracks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_music_playlists_updated_at
    BEFORE UPDATE ON music_playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for favorite count management
CREATE OR REPLACE FUNCTION manage_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM increment_favorite_count(NEW.track_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM decrement_favorite_count(OLD.track_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER manage_favorite_count_trigger
    AFTER INSERT OR DELETE ON user_favorites
    FOR EACH ROW EXECUTE FUNCTION manage_favorite_count(); 