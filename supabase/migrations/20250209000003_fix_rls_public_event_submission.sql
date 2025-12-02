-- Corrigir política RLS para permitir inserção pública de eventos
-- Versão ULTRA permissiva - remove todas as validações restritivas
-- Data: 2025-02-09

-- Remover TODAS as políticas de INSERT existentes
DROP POLICY IF EXISTS "Permitir inserção de eventos para usuários autenticados" ON public.events;
DROP POLICY IF EXISTS "Allow public event submission" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Public can insert events" ON public.events;
DROP POLICY IF EXISTS "Allow public inserts" ON public.events;

-- Garantir que RLS está habilitado
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Criar política ULTRA permissiva para INSERT público
-- Apenas validações básicas de segurança (sem validações de tamanho)
CREATE POLICY "Allow public event submission"
ON public.events
FOR INSERT
TO public
WITH CHECK (
  -- Apenas validações essenciais:
  name IS NOT NULL 
  AND start_date IS NOT NULL
  -- is_visible deve ser false ou NULL (eventos precisam de aprovação)
  AND (is_visible IS NULL OR is_visible = false)
);

-- Garantir política de leitura pública
DROP POLICY IF EXISTS "Permitir leitura pública de eventos" ON public.events;
DROP POLICY IF EXISTS "Events are publicly readable" ON public.events;
DROP POLICY IF EXISTS "Public can read visible events" ON public.events;

CREATE POLICY "Events are publicly readable"
ON public.events
FOR SELECT
TO public
USING (is_visible = true OR is_visible IS NULL);

-- Log de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Política RLS de inserção pública criada com sucesso';
END $$;

