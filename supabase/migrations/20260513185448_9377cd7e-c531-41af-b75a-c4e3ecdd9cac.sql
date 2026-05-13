
DROP VIEW IF EXISTS public.ai_consultant_config_safe;

DROP POLICY IF EXISTS "Regional managers view AI config (no api key)" ON public.ai_consultant_config;

CREATE VIEW public.ai_consultant_config_safe
WITH (security_invoker = true) AS
SELECT id, tenant_id, region_id, city_id,
       max_queries_per_day, confidence_threshold, enabled,
       custom_prompts, data_sources, created_at, updated_at
FROM public.ai_consultant_config;

GRANT SELECT ON public.ai_consultant_config_safe TO authenticated;

REVOKE SELECT (gemini_api_key_encrypted) ON public.ai_consultant_config FROM authenticated, anon;

CREATE POLICY "Regional managers read AI config (cols restricted)"
ON public.ai_consultant_config
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = ANY (ARRAY['diretor_estadual','gestor_igr','gestor_municipal'])
      AND (ur.region_id IS NULL OR ur.region_id = ai_consultant_config.region_id OR ur.city_id = ai_consultant_config.city_id)
  )
);

DROP POLICY IF EXISTS "Permitir atualização de eventos para usuários autenticados" ON public.events;

REVOKE SELECT (contact_info) ON public.guata_verified_partners FROM anon, authenticated;

DROP POLICY IF EXISTS "Allow public read access to active prompt configs" ON public.ai_prompt_configs;
CREATE POLICY "Authenticated read active prompt configs"
ON public.ai_prompt_configs FOR SELECT TO authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Permitir atualização de documentos" ON storage.objects;
CREATE POLICY "Admins atualizam documentos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'documents' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ANY (ARRAY['admin','tech'])))
WITH CHECK (bucket_id = 'documents' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = ANY (ARRAY['admin','tech'])));

DROP POLICY IF EXISTS "Allow authenticated users to delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own files" ON storage.objects;

CREATE POLICY "Users delete their own user-uploads files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update their own user-uploads files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
