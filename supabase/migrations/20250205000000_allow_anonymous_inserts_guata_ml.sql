-- Permitir INSERT anônimo para Machine Learning e Feedback do Guatá
-- Permite que usuários não autenticados salvem feedback, interações e memórias
-- para que o Guatá possa aprender e melhorar continuamente

-- ============================================
-- 1. GUATA_FEEDBACK - Permitir INSERT anônimo
-- ============================================

-- Verificar se RLS está habilitado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'guata_feedback'
  ) THEN
    RAISE NOTICE 'Tabela guata_feedback não existe ainda';
  ELSE
    -- Habilitar RLS se não estiver habilitado
    ALTER TABLE public.guata_feedback ENABLE ROW LEVEL SECURITY;
    
    -- Remover política antiga de INSERT que só permitia usuários autenticados
    -- (mantém políticas de SELECT existentes)
    DROP POLICY IF EXISTS "Allow anonymous inserts on guata_feedback" ON public.guata_feedback;
    DROP POLICY IF EXISTS "Users can create their own feedback" ON public.guata_feedback;
    
    -- Criar política para permitir INSERT anônimo (com validações de segurança)
    CREATE POLICY "Allow anonymous inserts on guata_feedback"
    ON public.guata_feedback
    FOR INSERT
    TO anon
    WITH CHECK (
      -- Validações de segurança:
      -- 1. session_id deve existir (obrigatório para rastreamento)
      session_id IS NOT NULL AND length(session_id) > 0 AND length(session_id) <= 255
      -- 2. question não pode ser vazio
      AND question IS NOT NULL AND length(trim(question)) > 0 AND length(question) <= 5000
      -- 3. answer pode ser null mas se existir, deve ter tamanho razoável
      AND (answer IS NULL OR (length(answer) <= 10000))
      -- 4. correction pode ser null mas se existir, deve ter tamanho razoável
      AND (correction IS NULL OR (length(correction) <= 5000))
      -- 5. user_id deve ser null para anônimos (não podem usar user_id de outros)
      AND user_id IS NULL
    );
    
    -- Criar política para usuários autenticados também poderem inserir
    CREATE POLICY "Authenticated users can create feedback"
    ON public.guata_feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (
      -- Usuários autenticados podem inserir com user_id deles ou null
      (user_id IS NULL OR user_id = auth.uid())
      AND (
        session_id IS NULL OR 
        (length(session_id) > 0 AND length(session_id) <= 255)
      )
      AND question IS NOT NULL AND length(trim(question)) > 0 AND length(question) <= 5000
      AND (answer IS NULL OR (length(answer) <= 10000))
      AND (correction IS NULL OR (length(correction) <= 5000))
    );
    
    -- Garantir que anônimos NÃO podem fazer SELECT, UPDATE ou DELETE
    -- (já está protegido por padrão, mas vamos garantir)
    DROP POLICY IF EXISTS "Deny anonymous select on guata_feedback" ON public.guata_feedback;
    DROP POLICY IF EXISTS "Deny anonymous update on guata_feedback" ON public.guata_feedback;
    DROP POLICY IF EXISTS "Deny anonymous delete on guata_feedback" ON public.guata_feedback;
  END IF;
END $$;

-- ============================================
-- 2. GUATA_USER_MEMORY - Permitir INSERT anônimo
-- ============================================

-- Verificar se tabela existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'guata_user_memory'
  ) THEN
    RAISE NOTICE 'Tabela guata_user_memory não existe ainda';
  ELSE
    -- Habilitar RLS se não estiver habilitado
    ALTER TABLE public.guata_user_memory ENABLE ROW LEVEL SECURITY;
    
    -- Remover política antiga se existir
    DROP POLICY IF EXISTS "Allow anonymous inserts on guata_user_memory" ON public.guata_user_memory;
    
    -- Criar política para permitir INSERT anônimo
    CREATE POLICY "Allow anonymous inserts on guata_user_memory"
    ON public.guata_user_memory
    FOR INSERT
    TO anon
    WITH CHECK (
      -- Validações de segurança:
      -- 1. session_id é obrigatório (para rastreamento de usuários anônimos)
      session_id IS NOT NULL AND length(session_id) > 0 AND length(session_id) <= 255
      -- 2. memory_type deve existir e ter tamanho razoável
      AND memory_type IS NOT NULL AND length(trim(memory_type)) > 0 AND length(memory_type) <= 100
      -- 3. memory_key deve existir e ter tamanho razoável
      AND memory_key IS NOT NULL AND length(trim(memory_key)) > 0 AND length(memory_key) <= 255
      -- 4. memory_value pode ser null mas se existir, deve ser JSON válido (validado pelo tipo JSONB)
      -- 5. user_id pode ser null (para usuários anônimos)
      AND (user_id IS NULL OR length(user_id) <= 255)
    );
    
    -- Garantir que anônimos NÃO podem fazer SELECT, UPDATE ou DELETE
    -- (já está protegido por padrão, mas vamos garantir)
    DROP POLICY IF EXISTS "Deny anonymous select on guata_user_memory" ON public.guata_user_memory;
    DROP POLICY IF EXISTS "Deny anonymous update on guata_user_memory" ON public.guata_user_memory;
    DROP POLICY IF EXISTS "Deny anonymous delete on guata_user_memory" ON public.guata_user_memory;
  END IF;
END $$;

-- ============================================
-- 3. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON POLICY "Allow anonymous inserts on guata_feedback" ON public.guata_feedback IS 
'Permite que usuários não autenticados salvem feedback para que o Guatá possa aprender e melhorar. Validações de segurança aplicadas: session_id obrigatório, tamanhos máximos de campos.';

COMMENT ON POLICY "Allow anonymous inserts on guata_user_memory" ON public.guata_user_memory IS 
'Permite que usuários não autenticados salvem interações e preferências (via session_id) para Machine Learning. Validações de segurança aplicadas: session_id obrigatório, tamanhos máximos de campos.';

