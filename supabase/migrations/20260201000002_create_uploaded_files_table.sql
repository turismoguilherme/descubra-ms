-- Migration: Create uploaded files table
-- Description: Stores information about files uploaded to knowledge base

CREATE TABLE IF NOT EXISTS knowledge_base_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Informações do arquivo
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('txt', 'csv', 'json', 'pdf', 'docx')),
    file_size INTEGER, -- em bytes
    original_path TEXT, -- caminho original se armazenado
    
    -- Processamento
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'deleted')),
    items_created INTEGER DEFAULT 0, -- quantos itens foram criados
    items_failed INTEGER DEFAULT 0, -- quantos itens falharam
    error_message TEXT, -- mensagem de erro se falhou
    
    -- Metadados
    chatbot_target TEXT CHECK (chatbot_target IN ('guata', 'koda', 'ambos')),
    metadata JSONB DEFAULT '{}'::jsonb, -- metadados adicionais
    
    -- Auditoria
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_kb_uploads_status ON knowledge_base_uploads(status);
CREATE INDEX IF NOT EXISTS idx_kb_uploads_chatbot ON knowledge_base_uploads(chatbot_target);
CREATE INDEX IF NOT EXISTS idx_kb_uploads_uploaded_at ON knowledge_base_uploads(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_kb_uploads_uploaded_by ON knowledge_base_uploads(uploaded_by);

-- RLS
ALTER TABLE knowledge_base_uploads ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Allow authenticated users to view uploads"
    ON knowledge_base_uploads
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert uploads"
    ON knowledge_base_uploads
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update uploads"
    ON knowledge_base_uploads
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete uploads"
    ON knowledge_base_uploads
    FOR DELETE
    TO authenticated
    USING (true);

-- Comentários
COMMENT ON TABLE knowledge_base_uploads IS 'Stores information about files uploaded to knowledge base';
COMMENT ON COLUMN knowledge_base_uploads.status IS 'Status: processing, completed, failed, deleted';
COMMENT ON COLUMN knowledge_base_uploads.items_created IS 'Number of knowledge base items created from this file';
COMMENT ON COLUMN knowledge_base_uploads.items_failed IS 'Number of items that failed to create';

