-- Create content_translations table for dynamic content translation
CREATE TABLE content_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_key TEXT NOT NULL,
    language_code TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    platform TEXT,
    section TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique combination of content_key and language_code
    UNIQUE(content_key, language_code, platform, section)
);

-- Enable RLS
ALTER TABLE content_translations ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_content_translations_content_key ON content_translations(content_key);
CREATE INDEX idx_content_translations_language_code ON content_translations(language_code);
CREATE INDEX idx_content_translations_platform ON content_translations(platform);
CREATE INDEX idx_content_translations_section ON content_translations(section);

-- RLS Policies - public read, admin write
CREATE POLICY "Content translations are viewable by everyone"
  ON content_translations FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can manage content translations"
  ON content_translations FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'master_admin')
    )
  );

-- Create trigger to update updated_at
CREATE TRIGGER update_content_translations_updated_at
    BEFORE UPDATE ON content_translations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
