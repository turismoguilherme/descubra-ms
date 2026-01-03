-- Migration: Create Koda Response Cache table
-- Description: Creates a persistent cache for storing Gemini API responses for Koda to avoid repeated API calls

-- Create table for Koda response cache
CREATE TABLE IF NOT EXISTS koda_response_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_hash VARCHAR(255) NOT NULL, -- Hash da pergunta normalizada
    question TEXT NOT NULL, -- Pergunta original (para debug e similaridade)
    answer TEXT NOT NULL, -- Resposta do Gemini
    language VARCHAR(10) NOT NULL DEFAULT 'en', -- Idioma da resposta (en, fr, pt, es, hi)
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
CREATE INDEX IF NOT EXISTS idx_koda_cache_question_hash ON koda_response_cache(question_hash);
CREATE INDEX IF NOT EXISTS idx_koda_cache_type ON koda_response_cache(cache_type);
CREATE INDEX IF NOT EXISTS idx_koda_cache_language ON koda_response_cache(language);
CREATE INDEX IF NOT EXISTS idx_koda_cache_user_session ON koda_response_cache(user_id, session_id) WHERE cache_type = 'individual';
CREATE INDEX IF NOT EXISTS idx_koda_cache_expires ON koda_response_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_koda_cache_question_text ON koda_response_cache USING GIN(to_tsvector('english', question));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_koda_cache_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp (drop if exists first)
DROP TRIGGER IF EXISTS trigger_update_koda_cache_timestamp ON koda_response_cache;
CREATE TRIGGER trigger_update_koda_cache_timestamp
    BEFORE UPDATE ON koda_response_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_koda_cache_timestamp();

-- Create function to increment usage counter
CREATE OR REPLACE FUNCTION increment_koda_cache_usage(cache_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE koda_response_cache
    SET used_count = used_count + 1,
        updated_at = NOW()
    WHERE id = cache_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_koda_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM koda_response_cache
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE koda_response_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read shared cache" ON koda_response_cache;
DROP POLICY IF EXISTS "Users can read own individual cache" ON koda_response_cache;
DROP POLICY IF EXISTS "Allow cache inserts" ON koda_response_cache;
DROP POLICY IF EXISTS "Allow cache updates" ON koda_response_cache;
DROP POLICY IF EXISTS "Allow cache deletes" ON koda_response_cache;

-- Policy: Anyone can read shared cache entries
CREATE POLICY "Anyone can read shared cache"
    ON koda_response_cache
    FOR SELECT
    USING (cache_type = 'shared');

-- Policy: Authenticated users can read their own individual cache
CREATE POLICY "Users can read own individual cache"
    ON koda_response_cache
    FOR SELECT
    USING (
        cache_type = 'individual' AND 
        (auth.uid() = user_id OR session_id IS NOT NULL)
    );

-- Policy: Allow inserts for both shared and individual cache
CREATE POLICY "Allow cache inserts"
    ON koda_response_cache
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow updates (system can update via service role or anon)
CREATE POLICY "Allow cache updates"
    ON koda_response_cache
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Policy: Allow deletes (for cleanup of expired entries)
CREATE POLICY "Allow cache deletes"
    ON koda_response_cache
    FOR DELETE
    USING (true);

-- Add comment
COMMENT ON TABLE koda_response_cache IS 'Cache persistente para respostas do Koda (chatbot canadense) para reduzir chamadas à API Gemini';

