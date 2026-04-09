-- Corrige "templates / respostas prontas sumiram" no admin:
-- 1) guata_knowledge_base: admins precisam de SELECT em TODAS as linhas (incl. ativo = false).
--    A política pública só expõe ativo = true; sem isto, entradas desativadas ficam invisíveis no painel.
-- 2) message_templates: leitura para gestores que já podem ver communication_logs (alinhado a 20260408140000),
--    mantendo INSERT/UPDATE/DELETE só para is_admin_user.

-- Requer função public.is_admin_user (migration 20260408140000).

DROP POLICY IF EXISTS "Admins can select all knowledge base entries" ON public.guata_knowledge_base;
CREATE POLICY "Admins can select all knowledge base entries"
ON public.guata_knowledge_base
FOR SELECT
TO authenticated
USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Staff can read message templates" ON public.message_templates;
CREATE POLICY "Staff can read message templates"
ON public.message_templates
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN (
        'admin',
        'tech',
        'master_admin',
        'municipal_manager',
        'gestor_igr',
        'diretor_estadual'
      )
  )
);
