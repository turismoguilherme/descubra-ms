-- Migration: Create region_translations table
-- Description: Creates table to store translations for tourist regions

-- Table for region translations
CREATE TABLE IF NOT EXISTS region_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID NOT NULL REFERENCES tourist_regions(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT,
  description TEXT,
  highlights TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(region_id, language_code)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_region_translations_region_id ON region_translations(region_id);
CREATE INDEX IF NOT EXISTS idx_region_translations_language_code ON region_translations(language_code);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_region_translations_updated_at
  BEFORE UPDATE ON region_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE region_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access
CREATE POLICY "Allow public read access to region_translations"
  ON region_translations FOR SELECT
  TO public
  USING (true);

-- RLS Policy: Allow authenticated users to insert/update
CREATE POLICY "Allow authenticated users to manage region_translations"
  ON region_translations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);




