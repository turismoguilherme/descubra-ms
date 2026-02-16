-- =====================================================
-- ADICIONAR COLUNA METADATA NA TABELA security_audit_log
-- =====================================================
-- Data: 16/02/2025
-- Descrição: Adiciona coluna metadata JSONB para armazenar
--            informações adicionais dos eventos de segurança
-- =====================================================

-- Adicionar coluna metadata se não existir
ALTER TABLE public.security_audit_log 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Criar índice GIN para buscas eficientes em JSONB
CREATE INDEX IF NOT EXISTS idx_security_audit_log_metadata 
ON public.security_audit_log USING gin (metadata);

-- Comentário na coluna
COMMENT ON COLUMN public.security_audit_log.metadata IS 
'Metadados adicionais do evento de segurança em formato JSON';

-- Verificar se foi criada corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'security_audit_log' 
AND column_name = 'metadata';

