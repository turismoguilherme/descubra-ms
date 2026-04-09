-- master_admin: alinhar is_admin_user, templates de email e leitura de communication_logs
-- Corrige RLS onde só admin/tech tinham acesso; base de conhecimento e prompts usam is_admin_user.

CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id
      AND role IN ('admin', 'tech', 'master_admin')
  );
$$;

DROP POLICY IF EXISTS "Admins can manage message templates" ON public.message_templates;
CREATE POLICY "Admins can manage message templates" ON public.message_templates
FOR ALL
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all communication logs" ON public.communication_logs;
CREATE POLICY "Admins can view all communication logs" ON public.communication_logs
FOR SELECT
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
