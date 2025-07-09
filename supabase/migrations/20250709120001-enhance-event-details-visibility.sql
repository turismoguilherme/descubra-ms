-- Add visibility control fields to event_details table
ALTER TABLE event_details 
ADD COLUMN IF NOT EXISTS visibility_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_hide BOOLEAN DEFAULT true;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_event_details_visibility ON event_details(visibility_end_date, auto_hide);

-- Update existing event_details to have default visibility settings
UPDATE event_details 
SET auto_hide = true 
WHERE auto_hide IS NULL;