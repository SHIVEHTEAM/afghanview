-- Add original_data column to slideshows table
-- This will store the original structured data for each slideshow type

ALTER TABLE slideshows 
ADD COLUMN original_data JSONB DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN slideshows.original_data IS 'Stores original structured data for slideshow types (menu items, facts, deals, text slides, etc.)';

-- Create index for better query performance
CREATE INDEX idx_slideshows_original_data ON slideshows USING GIN (original_data); 