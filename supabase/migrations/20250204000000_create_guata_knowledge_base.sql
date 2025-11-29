-- Migration: Create Guatá Knowledge Base table
-- Description: Creates a persistent knowledge base for storing curated answers to frequent questions

-- Create table for knowledge base
CREATE TABLE IF NOT EXISTS guata_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pergunta TEXT NOT NULL,
    pergunta_normalizada TEXT NOT NULL,
    resposta TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'geral' CHECK (tipo IN ('conceito', 'local', 'pessoa', 'evento', 'geral')),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    fonte TEXT NOT NULL DEFAULT 'manual' CHECK (fonte IN ('manual', 'gemini', 'web')),
    ativo BOOLEAN NOT NULL DEFAULT true,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usado_por INTEGER DEFAULT 0
);

-- Create indexes for efficient searching
CREATE INDEX IF NOT EXISTS idx_guata_kb_pergunta_normalizada ON guata_knowledge_base(pergunta_normalizada);
CREATE INDEX IF NOT EXISTS idx_guata_kb_tipo ON guata_knowledge_base(tipo);
CREATE INDEX IF NOT EXISTS idx_guata_kb_ativo ON guata_knowledge_base(ativo) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_guata_kb_tags ON guata_knowledge_base USING GIN(tags);

-- Create function to update ultima_atualizacao timestamp
CREATE OR REPLACE FUNCTION update_guata_kb_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_atualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp
CREATE TRIGGER trigger_update_guata_kb_timestamp
    BEFORE UPDATE ON guata_knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_guata_kb_timestamp();

-- Create function to increment usage counter
CREATE OR REPLACE FUNCTION increment_guata_kb_usage(kb_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE guata_knowledge_base
    SET usado_por = usado_por + 1
    WHERE id = kb_id;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS (Row Level Security)
ALTER TABLE guata_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow public read access to active entries
CREATE POLICY "Allow public read access to active knowledge base entries"
    ON guata_knowledge_base
    FOR SELECT
    USING (ativo = true);

-- Create policy: Allow authenticated users to insert (for future admin panel)
CREATE POLICY "Allow authenticated users to insert knowledge base entries"
    ON guata_knowledge_base
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy: Allow authenticated users to update (for future admin panel)
CREATE POLICY "Allow authenticated users to update knowledge base entries"
    ON guata_knowledge_base
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE guata_knowledge_base IS 'Persistent knowledge base for Guatá chatbot - stores curated answers to frequent questions';
COMMENT ON COLUMN guata_knowledge_base.pergunta_normalizada IS 'Normalized question for efficient searching (lowercase, no accents, no punctuation)';
COMMENT ON COLUMN guata_knowledge_base.tipo IS 'Type of knowledge: conceito, local, pessoa, evento, geral';
COMMENT ON COLUMN guata_knowledge_base.fonte IS 'Source of the answer: manual, gemini, web';
COMMENT ON COLUMN guata_knowledge_base.usado_por IS 'Counter of how many times this entry was used';

