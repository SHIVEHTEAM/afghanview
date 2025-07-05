-- Function to get slides with images for a restaurant
-- Updated to match the actual database schema
CREATE OR REPLACE FUNCTION get_restaurant_slides(restaurant_uuid UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    type TEXT,
    title TEXT,
    subtitle TEXT,
    content JSONB,
    styling JSONB,
    duration INTEGER,
    order_index INTEGER,
    is_active BOOLEAN,
    is_published BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    images JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.type,
        s.title,
        s.subtitle,
        s.content,
        s.styling,
        s.duration,
        s.order_index,
        s.is_active,
        s.is_published,
        s.created_at,
        s.updated_at,
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', mf.id,
                    'image_url', mf.file_path,
                    'alt_text', mf.original_filename,
                    'sort_order', mci.order_index
                ) ORDER BY mci.order_index
            ) FROM public.media_collection_items mci
            JOIN public.media_files mf ON mf.id = mci.media_file_id
            WHERE mci.collection_id = s.id),
            '[]'::json
        ) as images
    FROM public.slides s
    WHERE s.restaurant_id = restaurant_uuid
    ORDER BY s.order_index, s.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 