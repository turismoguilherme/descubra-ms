-- Migration: Enhance knowledge base for file uploads
-- Description: Adds fields to support file uploads and better organization

-- Adicionar colunas à tabela guata_knowledge_base se não existirem
DO $$ 
BEGIN
    -- Coluna para chatbot específico
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guata_knowledge_base' AND column_name = 'chatbot') THEN
        ALTER TABLE guata_knowledge_base 
        ADD COLUMN chatbot TEXT DEFAULT 'guata' CHECK (chatbot IN ('guata', 'koda', 'ambos'));
    END IF;

    -- Coluna para título (além de pergunta)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guata_knowledge_base' AND column_name = 'titulo') THEN
        ALTER TABLE guata_knowledge_base 
        ADD COLUMN titulo TEXT;
    END IF;

    -- Coluna para categoria
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guata_knowledge_base' AND column_name = 'categoria') THEN
        ALTER TABLE guata_knowledge_base 
        ADD COLUMN categoria TEXT DEFAULT 'geral';
    END IF;

    -- Coluna para região
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guata_knowledge_base' AND column_name = 'regiao') THEN
        ALTER TABLE guata_knowledge_base 
        ADD COLUMN regiao TEXT;
    END IF;

    -- Coluna para prioridade
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guata_knowledge_base' AND column_name = 'prioridade') THEN
        ALTER TABLE guata_knowledge_base 
        ADD COLUMN prioridade INTEGER DEFAULT 5 CHECK (prioridade BETWEEN 1 AND 10);
    END IF;

    -- Coluna para arquivo original (se veio de upload)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guata_knowledge_base' AND column_name = 'arquivo_original') THEN
        ALTER TABLE guata_knowledge_base 
        ADD COLUMN arquivo_original TEXT; -- Nome do arquivo original
    END IF;

    -- Coluna para tipo de upload
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guata_knowledge_base' AND column_name = 'tipo_upload') THEN
        ALTER TABLE guata_knowledge_base 
        ADD COLUMN tipo_upload TEXT CHECK (tipo_upload IN ('manual', 'pdf', 'txt', 'docx', 'csv', 'json'));
    END IF;

    -- Coluna para metadados do arquivo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guata_knowledge_base' AND column_name = 'metadata_arquivo') THEN
        ALTER TABLE guata_knowledge_base 
        ADD COLUMN metadata_arquivo JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Coluna para criado por
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guata_knowledge_base' AND column_name = 'criado_por') THEN
        ALTER TABLE guata_knowledge_base 
        ADD COLUMN criado_por UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Criar índices para novas colunas
CREATE INDEX IF NOT EXISTS idx_guata_kb_chatbot ON guata_knowledge_base(chatbot);
CREATE INDEX IF NOT EXISTS idx_guata_kb_categoria ON guata_knowledge_base(categoria);
CREATE INDEX IF NOT EXISTS idx_guata_kb_regiao ON guata_knowledge_base(regiao);
CREATE INDEX IF NOT EXISTS idx_guata_kb_prioridade ON guata_knowledge_base(prioridade);

-- Comentários
COMMENT ON COLUMN guata_knowledge_base.chatbot IS 'Which chatbot can use this: guata, koda, or ambos';
COMMENT ON COLUMN guata_knowledge_base.titulo IS 'Title or topic of the knowledge entry';
COMMENT ON COLUMN guata_knowledge_base.categoria IS 'Category: destinos, eventos, gastronomia, informações, etc';
COMMENT ON COLUMN guata_knowledge_base.regiao IS 'Region: MS, Canadá, global, etc';
COMMENT ON COLUMN guata_knowledge_base.prioridade IS 'Priority 1-10 (higher = more important)';
COMMENT ON COLUMN guata_knowledge_base.arquivo_original IS 'Original filename if imported from file';
COMMENT ON COLUMN guata_knowledge_base.tipo_upload IS 'Type of upload: manual, pdf, txt, docx, csv, json';
COMMENT ON COLUMN guata_knowledge_base.metadata_arquivo IS 'JSON metadata about the uploaded file';

