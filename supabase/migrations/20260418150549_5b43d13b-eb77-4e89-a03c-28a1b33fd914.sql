-- 1. Seed da política partner_terms (se não existir)
INSERT INTO public.platform_policies (key, title, content, platform, is_published, version)
SELECT 'partner_terms', 'Termo de Parceria', '# Termo de Parceria\n\nConteúdo a ser definido pelo administrador.', 'descubra_ms', false, 1
WHERE NOT EXISTS (
  SELECT 1 FROM public.platform_policies WHERE key = 'partner_terms'
);

-- 2. RLS para platform_policies (admin/tech podem tudo, público lê apenas publicadas)
ALTER TABLE public.platform_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published policies" ON public.platform_policies;
DROP POLICY IF EXISTS "Admins can insert policies" ON public.platform_policies;
DROP POLICY IF EXISTS "Admins can update policies" ON public.platform_policies;
DROP POLICY IF EXISTS "Admins can delete policies" ON public.platform_policies;
DROP POLICY IF EXISTS "Admins can read all policies" ON public.platform_policies;

CREATE POLICY "Public can read published policies"
  ON public.platform_policies FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can read all policies"
  ON public.platform_policies FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can insert policies"
  ON public.platform_policies FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update policies"
  ON public.platform_policies FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete policies"
  ON public.platform_policies FOR DELETE
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- 3. Limpeza de dados mortos
DELETE FROM public.security_audit_log WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM public.koda_response_cache WHERE expires_at < NOW();
DELETE FROM public.guata_response_cache WHERE expires_at < NOW();
DELETE FROM public.system_health_checks WHERE checked_at < NOW() - INTERVAL '30 days';
DELETE FROM public.event_cleanup_logs WHERE created_at < NOW() - INTERVAL '60 days';