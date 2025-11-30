-- Migration: Create Guatá Response Cache table
-- Description: Creates a persistent cache for storing Gemini API responses to avoid repeated API calls

-- Create table for response cache
CREATE TABLE IF NOT EXISTS guata_response_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_hash VARCHAR(255) NOT NULL, -- Hash da pergunta normalizada
    question TEXT NOT NULL, -- Pergunta original (para debug e similaridade)
    answer TEXT NOT NULL, -- Resposta do Gemini
    cache_type VARCHAR(20) NOT NULL DEFAULT 'shared' CHECK (cache_type IN ('shared', 'individual')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    used_count INTEGER DEFAULT 1, -- Quantas vezes foi usado
    is_suggestion BOOLEAN DEFAULT false, -- Se é pergunta de sugestão (balão)
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Quando expira
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_guata_cache_question_hash ON guata_response_cache(question_hash);
CREATE INDEX IF NOT EXISTS idx_guata_cache_type ON guata_response_cache(cache_type);
CREATE INDEX IF NOT EXISTS idx_guata_cache_user_session ON guata_response_cache(user_id, session_id) WHERE cache_type = 'individual';
-- Índice sem predicado WHERE (NOW() não pode ser usado em índices parciais)
CREATE INDEX IF NOT EXISTS idx_guata_cache_expires ON guata_response_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_guata_cache_question_text ON guata_response_cache USING GIN(to_tsvector('portuguese', question));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_guata_cache_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp
CREATE TRIGGER trigger_update_guata_cache_timestamp
    BEFORE UPDATE ON guata_response_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_guata_cache_timestamp();

-- Create function to increment usage counter
CREATE OR REPLACE FUNCTION increment_guata_cache_usage(cache_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE guata_response_cache
    SET used_count = used_count + 1,
        updated_at = NOW()
    WHERE id = cache_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_guata_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM guata_response_cache
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE guata_response_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read cache entries (they're public responses)
CREATE POLICY "Cache entries are readable by everyone"
    ON guata_response_cache
    FOR SELECT
    USING (true);

-- Policy: Allow inserts for both shared and individual cache
-- Shared cache can be inserted by anyone (system via service role)
-- Individual cache can be inserted by authenticated users or system
CREATE POLICY "Allow cache inserts"
    ON guata_response_cache
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow updates (system can update via service role)
-- Users can't update cache entries directly, but system can
CREATE POLICY "Allow cache updates"
    ON guata_response_cache
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Policy: Allow deletes (for cleanup of expired entries)
CREATE POLICY "Allow cache deletes"
    ON guata_response_cache
    FOR DELETE
    USING (true);
