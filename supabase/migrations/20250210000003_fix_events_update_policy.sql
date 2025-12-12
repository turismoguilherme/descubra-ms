-- Migration: Garantir política RLS para UPDATE de eventos por admins
-- Descrição: Adiciona política que permite admins atualizarem eventos (aprovar/rejeitar)
-- Data: 2025-02-10

-- Remover políticas antigas de UPDATE se existirem
DROP POLICY IF EXISTS "Permitir atualização de eventos para usuários autenticados" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Allow admin event updates" ON public.events;

-- Criar política de UPDATE para admins
CREATE POLICY "Admins can update events"
ON public.events
FOR UPDATE
TO public
USING (
  -- Permitir se for admin, tech ou master_admin
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'tech', 'master_admin')
  )
  -- OU se o usuário criou o evento (para permitir edição própria)
  OR created_by = auth.uid()
)
WITH CHECK (
  -- Mesmas condições para o WITH CHECK
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'tech', 'master_admin')
  )
  OR created_by = auth.uid()
);

-- Garantir que RLS está habilitado
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Comentário
COMMENT ON POLICY "Admins can update events" ON public.events IS 
'Permite que admins e criadores de eventos atualizem eventos (incluindo aprovação/rejeição)';

