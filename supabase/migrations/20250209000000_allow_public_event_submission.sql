-- Permitir INSERT público para cadastro de eventos
-- Permite que usuários não autenticados cadastrem eventos para aprovação
-- Data: 2025-02-09

-- Verificar se tabela events existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'events'
  ) THEN
    RAISE NOTICE 'Tabela events não existe ainda';
  ELSE
    -- Habilitar RLS se não estiver habilitado
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    
    -- Remover política antiga de INSERT que só permitia usuários autenticados (se existir)
    DROP POLICY IF EXISTS "Permitir inserção de eventos para usuários autenticados" ON public.events;
    DROP POLICY IF EXISTS "Allow public event submission" ON public.events;
    
    -- Criar política para permitir INSERT público (com validações de segurança)
    CREATE POLICY "Allow public event submission"
    ON public.events
    FOR INSERT
    TO public
    WITH CHECK (
      -- Validações de segurança:
      -- 1. name é obrigatório e tem tamanho razoável
      name IS NOT NULL AND length(trim(name)) >= 5 AND length(name) <= 500
      -- 2. description deve existir e ter tamanho razoável
      AND description IS NOT NULL AND length(trim(description)) >= 30 AND length(description) <= 5000
      -- 3. start_date é obrigatório
      AND start_date IS NOT NULL
      -- 4. location deve existir e ter tamanho razoável
      AND location IS NOT NULL AND length(trim(location)) >= 3 AND length(location) <= 500
      -- 5. organizador_email deve ser válido se fornecido
      AND (organizador_email IS NULL OR organizador_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
      -- 6. is_visible deve ser false (eventos precisam de aprovação)
      AND (is_visible IS NULL OR is_visible = false)
      -- 7. image_url deve ser uma URL válida se fornecido
      AND (image_url IS NULL OR image_url ~* '^https?://')
      -- 8. site_oficial deve ser uma URL válida se fornecido
      AND (site_oficial IS NULL OR site_oficial ~* '^https?://')
      -- 9. video_url deve ser uma URL válida se fornecido
      AND (video_url IS NULL OR video_url ~* '^https?://')
    );
    
    -- Garantir que a política de leitura pública existe
    DROP POLICY IF EXISTS "Permitir leitura pública de eventos" ON public.events;
    CREATE POLICY "Permitir leitura pública de eventos"
    ON public.events
    FOR SELECT
    TO public
    USING (is_visible = true);
    
    RAISE NOTICE 'Política de inserção pública de eventos criada com sucesso';
  END IF;
END $$;

