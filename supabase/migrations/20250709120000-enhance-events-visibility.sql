-- Enhance events table with visibility controls
ALTER TABLE events 
ADD COLUMN visibility_end_date TIMESTAMPTZ,
ADD COLUMN is_visible BOOLEAN DEFAULT true,
ADD COLUMN auto_hide BOOLEAN DEFAULT true;

-- Create index for better query performance
CREATE INDEX idx_events_visibility ON events(is_visible, visibility_end_date, start_date);

-- Create function to automatically hide expired events
CREATE OR REPLACE FUNCTION hide_expired_events()
RETURNS void AS $$
BEGIN
  UPDATE events 
  SET is_visible = false 
  WHERE auto_hide = true 
    AND visibility_end_date IS NOT NULL 
    AND visibility_end_date < NOW() 
    AND is_visible = true;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled function that runs daily to hide expired events
-- This would typically be set up as a cron job or scheduled function in production
COMMENT ON FUNCTION hide_expired_events() IS 'Function to automatically hide events that have passed their visibility end date';

-- Update existing events to have default visibility settings
UPDATE events 
SET is_visible = true, 
    auto_hide = true 
WHERE is_visible IS NULL;