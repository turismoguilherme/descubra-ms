-- Corrigir política RLS para permitir inserção pública de eventos
-- Versão simplificada e mais permissiva
-- Data: 2025-02-09

-- Remover todas as políticas de INSERT existentes para eventos
DROP POLICY IF EXISTS "Permitir inserção de eventos para usuários autenticados" ON public.events;
DROP POLICY IF EXISTS "Allow public event submission" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;

-- Criar política simplificada para permitir INSERT público
-- Validações básicas apenas para segurança
CREATE POLICY "Allow public event submission"
ON public.events
FOR INSERT
TO public
WITH CHECK (
  -- Validações básicas de segurança
  name IS NOT NULL 
  AND length(trim(name)) >= 3
  AND start_date IS NOT NULL
  AND (is_visible IS NULL OR is_visible = false)
);

-- Garantir que a política de leitura pública existe
DROP POLICY IF EXISTS "Permitir leitura pública de eventos" ON public.events;
DROP POLICY IF EXISTS "Events are publicly readable" ON public.events;

CREATE POLICY "Events are publicly readable"
ON public.events
FOR SELECT
TO public
USING (is_visible = true OR is_visible IS NULL);

