-- Adicionar política RLS para DELETE de eventos por admins
-- Descrição: Permite que admins excluam eventos permanentemente
-- Data: 2025-02-03

-- Remover políticas antigas de DELETE se existirem
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
DROP POLICY IF EXISTS "Permitir exclusão de eventos para admins" ON public.events;

-- Criar política de DELETE para admins
CREATE POLICY "Admins can delete events"
ON public.events
FOR DELETE
TO public
USING (
  -- Permitir se for admin, tech ou master_admin
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'tech', 'master_admin')
  )
  -- OU se o usuário criou o evento (para permitir exclusão própria)
  OR created_by = auth.uid()
);

-- Garantir que RLS está habilitado
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Comentário
COMMENT ON POLICY "Admins can delete events" ON public.events IS 
'Permite que admins e criadores de eventos excluam eventos permanentemente';

