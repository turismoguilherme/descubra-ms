-- Migration: Create translation tables for dynamic content
-- Description: Creates tables to store translations for destinations, events, routes, partners, and editable content

-- Table for destination translations
CREATE TABLE IF NOT EXISTS destination_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT,
  description TEXT,
  promotional_text TEXT,
  highlights TEXT[],
  how_to_get_there TEXT,
  best_time_to_visit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(destination_id, language_code)
);

-- Table for event translations
CREATE TABLE IF NOT EXISTS event_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT,
  description TEXT,
  location TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, language_code)
);

-- Table for route translations
CREATE TABLE IF NOT EXISTS route_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(route_id, language_code)
);

-- Table for partner translations
CREATE TABLE IF NOT EXISTS partner_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT,
  description TEXT,
  services TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, language_code)
);

-- Table for editable content translations (homepage sections, etc)
CREATE TABLE IF NOT EXISTS content_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key TEXT NOT NULL,
  platform TEXT NOT NULL,
  section TEXT NOT NULL,
  language_code TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_key, platform, section, language_code)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_destination_translations_destination_id ON destination_translations(destination_id);
CREATE INDEX IF NOT EXISTS idx_destination_translations_language_code ON destination_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_event_translations_event_id ON event_translations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_translations_language_code ON event_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_route_translations_route_id ON route_translations(route_id);
CREATE INDEX IF NOT EXISTS idx_route_translations_language_code ON route_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_partner_translations_partner_id ON partner_translations(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_translations_language_code ON partner_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_content_translations_content_key ON content_translations(content_key, platform, section);
CREATE INDEX IF NOT EXISTS idx_content_translations_language_code ON content_translations(language_code);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_destination_translations_updated_at
  BEFORE UPDATE ON destination_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_translations_updated_at
  BEFORE UPDATE ON event_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_translations_updated_at
  BEFORE UPDATE ON route_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_translations_updated_at
  BEFORE UPDATE ON partner_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_translations_updated_at
  BEFORE UPDATE ON content_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE destination_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access
CREATE POLICY "Allow public read access to destination_translations"
  ON destination_translations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to event_translations"
  ON event_translations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to route_translations"
  ON route_translations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to partner_translations"
  ON partner_translations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to content_translations"
  ON content_translations FOR SELECT
  TO public
  USING (true);

-- RLS Policies: Allow authenticated users to insert/update
CREATE POLICY "Allow authenticated users to manage destination_translations"
  ON destination_translations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage event_translations"
  ON event_translations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage route_translations"
  ON route_translations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage partner_translations"
  ON partner_translations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage content_translations"
  ON content_translations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

