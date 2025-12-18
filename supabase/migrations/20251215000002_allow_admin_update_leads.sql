-- Consolidar políticas RLS de UPDATE para leads
-- Remove políticas antigas conflitantes e cria uma única política consolidada
-- Necessário para que admins possam marcar leads como resolvidos
-- Data: 2025-12-15

-- Remover TODAS as políticas antigas de UPDATE para evitar conflitos
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads assigned to them" ON public.leads;
DROP POLICY IF EXISTS "Admins can update any lead" ON public.leads;

-- Criar UMA ÚNICA política consolidada de UPDATE
-- Esta política permite:
-- 1. Admins/tech atualizarem qualquer lead
-- 2. Usuários atualizarem leads que criaram
-- 3. Usuários atualizarem leads atribuídos a eles
CREATE POLICY "Consolidated leads update policy"
ON public.leads
FOR UPDATE
TO public
USING (
  -- Permitir se for admin, tech ou master_admin (pode atualizar qualquer lead)
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'tech', 'master_admin')
  )
  -- OU se o usuário criou o lead
  OR created_by = auth.uid()
  -- OU se o lead está atribuído ao usuário
  OR assigned_to = auth.uid()
)
WITH CHECK (
  -- Mesmas condições para o WITH CHECK (validação dos dados após UPDATE)
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'tech', 'master_admin')
  )
  OR created_by = auth.uid()
  OR assigned_to = auth.uid()
);

-- Garantir que RLS está habilitado
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Comentário
COMMENT ON POLICY "Consolidated leads update policy" ON public.leads IS 
'Política consolidada que permite: (1) admins atualizarem qualquer lead, (2) usuários atualizarem leads que criaram, (3) usuários atualizarem leads atribuídos a eles';

-- Log de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Política RLS consolidada de UPDATE para leads criada com sucesso';
END $$;
