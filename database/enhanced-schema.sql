-- =====================================================
-- Enhanced ShivehView Database Schema
-- Supports multiple images, admin locking, and reordering
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE slide_type AS ENUM ('image', 'video', 'text');
CREATE TYPE user_role AS ENUM ('admin', 'client', 'viewer');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'client',
    restaurant_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slides table with enhanced features
CREATE TABLE IF NOT EXISTS public.slides (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    description TEXT,
    slide_type slide_type DEFAULT 'image',
    content TEXT, -- For text slides
    video_url TEXT, -- For video slides
    duration INTEGER DEFAULT 5000, -- Duration in milliseconds
    is_active BOOLEAN DEFAULT true,
    is_locked BOOLEAN DEFAULT false, -- Admin can lock slides to prevent client edits
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slide images table (supports multiple images per slide)
CREATE TABLE IF NOT EXISTS public.slide_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slide_id UUID REFERENCES public.slides(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissions table for fine-grained access control
CREATE TABLE IF NOT EXISTS public.slide_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slide_id UUID REFERENCES public.slides(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_reorder BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(slide_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_slides_restaurant_id ON public.slides(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_slides_sort_order ON public.slides(restaurant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_slides_is_active ON public.slides(restaurant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_slide_images_slide_id ON public.slide_images(slide_id);
CREATE INDEX IF NOT EXISTS idx_slide_images_sort_order ON public.slide_images(slide_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_slide_permissions_slide_id ON public.slide_permissions(slide_id);
CREATE INDEX IF NOT EXISTS idx_slide_permissions_user_id ON public.slide_permissions(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slide_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slide_permissions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Restaurants policies
CREATE POLICY "Anyone can view restaurants" ON public.restaurants
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage restaurants" ON public.restaurants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Restaurant owners can manage their restaurant" ON public.restaurants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND restaurant_id = restaurants.id
        )
    );

-- Slides policies
CREATE POLICY "Anyone can view active slides" ON public.slides
    FOR SELECT USING (is_active = true);

CREATE POLICY "Restaurant owners can view their slides" ON public.slides
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND restaurant_id = slides.restaurant_id
        )
    );

CREATE POLICY "Admins can manage all slides" ON public.slides
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Restaurant owners can manage their slides" ON public.slides
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND restaurant_id = slides.restaurant_id
        ) AND is_locked = false
    );

-- Slide images policies
CREATE POLICY "Anyone can view slide images" ON public.slide_images
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage slide images" ON public.slide_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Restaurant owners can manage their slide images" ON public.slide_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.slides s
            JOIN public.profiles p ON p.restaurant_id = s.restaurant_id
            WHERE p.id = auth.uid() AND s.id = slide_images.slide_id AND s.is_locked = false
        )
    );

-- Slide permissions policies
CREATE POLICY "Users can view their own permissions" ON public.slide_permissions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all permissions" ON public.slide_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON public.slides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get slides with images for a restaurant
CREATE OR REPLACE FUNCTION get_restaurant_slides(restaurant_uuid UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    slide_type slide_type,
    content TEXT,
    video_url TEXT,
    duration INTEGER,
    is_active BOOLEAN,
    is_locked BOOLEAN,
    sort_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    images JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        s.description,
        s.slide_type,
        s.content,
        s.video_url,
        s.duration,
        s.is_active,
        s.is_locked,
        s.sort_order,
        s.created_at,
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', si.id,
                    'image_url', si.image_url,
                    'alt_text', si.alt_text,
                    'sort_order', si.sort_order
                ) ORDER BY si.sort_order
            ) FROM public.slide_images si WHERE si.slide_id = s.id),
            '[]'::json
        ) as images
    FROM public.slides s
    WHERE s.restaurant_id = restaurant_uuid
    ORDER BY s.sort_order, s.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user permissions for a slide
CREATE OR REPLACE FUNCTION check_slide_permission(slide_uuid UUID, permission_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role_val user_role;
    restaurant_id_val UUID;
    has_permission BOOLEAN := false;
BEGIN
    -- Get user role and restaurant
    SELECT role, restaurant_id INTO user_role_val, restaurant_id_val
    FROM public.profiles WHERE id = auth.uid();
    
    -- Admins have all permissions
    IF user_role_val = 'admin' THEN
        RETURN true;
    END IF;
    
    -- Check specific permission
    IF permission_type = 'edit' THEN
        SELECT can_edit INTO has_permission
        FROM public.slide_permissions
        WHERE slide_id = slide_uuid AND user_id = auth.uid();
        
        -- Restaurant owners have edit permission for their slides (unless locked)
        IF NOT has_permission AND restaurant_id_val IS NOT NULL THEN
            SELECT EXISTS(
                SELECT 1 FROM public.slides 
                WHERE id = slide_uuid 
                AND restaurant_id = restaurant_id_val 
                AND is_locked = false
            ) INTO has_permission;
        END IF;
    ELSIF permission_type = 'delete' THEN
        SELECT can_delete INTO has_permission
        FROM public.slide_permissions
        WHERE slide_id = slide_uuid AND user_id = auth.uid();
        
        -- Restaurant owners have delete permission for their slides (unless locked)
        IF NOT has_permission AND restaurant_id_val IS NOT NULL THEN
            SELECT EXISTS(
                SELECT 1 FROM public.slides 
                WHERE id = slide_uuid 
                AND restaurant_id = restaurant_id_val 
                AND is_locked = false
            ) INTO has_permission;
        END IF;
    ELSIF permission_type = 'reorder' THEN
        SELECT can_reorder INTO has_permission
        FROM public.slide_permissions
        WHERE slide_id = slide_uuid AND user_id = auth.uid();
        
        -- Restaurant owners have reorder permission for their slides (unless locked)
        IF NOT has_permission AND restaurant_id_val IS NOT NULL THEN
            SELECT EXISTS(
                SELECT 1 FROM public.slides 
                WHERE id = slide_uuid 
                AND restaurant_id = restaurant_id_val 
                AND is_locked = false
            ) INTO has_permission;
        END IF;
    END IF;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE slide_images IS 'Stores multiple images for each slide with ordering';
COMMENT ON TABLE slide_permissions IS 'Manages user permissions for slide editing';
COMMENT ON TABLE slides IS 'Slides table with enhanced features';
COMMENT ON COLUMN slides.is_locked IS 'Whether the slide is locked from client editing';
COMMENT ON COLUMN slides.sort_order IS 'Order for drag & drop reordering'; 