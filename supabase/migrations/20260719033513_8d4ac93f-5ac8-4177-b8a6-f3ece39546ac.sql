
-- 1) events_public: security_invoker
DROP VIEW IF EXISTS public.events_public CASCADE;
CREATE VIEW public.events_public
WITH (security_invoker = on) AS
SELECT id, external_id, titulo, descricao, data_inicio, data_fim, local, cidade, estado,
       categoria, tipo_entrada, organizador, fonte, site_oficial, link_inscricao, tags,
       imagem_principal, logo_evento, video_promocional, publico_alvo, processado_por_ia,
       confiabilidade, ultima_atualizacao, created_at, updated_at, is_visible,
       approval_status, is_sponsored, sponsor_tier, sponsor_start_date, sponsor_end_date,
       sponsor_payment_status, start_time, end_time
FROM public.events
WHERE COALESCE(is_visible, true) = true
  AND (COALESCE(approval_status, 'approved'::text) = ANY (ARRAY['approved'::text,'aprovado'::text]));
GRANT SELECT ON public.events_public TO anon, authenticated;

-- 2) Revoke EXECUTE em funções SECURITY DEFINER perigosas / triggers
DO $$
DECLARE
  fn text;
  fns text[] := ARRAY[
    'audit_table_changes()',
    'auto_expire_events()',
    'check_events_to_cleanup()',
    'cleanup_expired_events()',
    'cleanup_all_events_with_logging()',
    'cleanup_old_ai_logs()',
    'cleanup_rejected_events()',
    'commercial_partners_protect_moderation()',
    'create_plano_diretor_historico_entry()',
    'tourism_inventory_protect_moderation()',
    'update_commercial_partners_updated_at()',
    'validate_commercial_partner_insert()',
    'log_event_cleanup(integer,integer,integer,uuid[],jsonb)',
    'assign_user_role(uuid,text,uuid,uuid)',
    'create_attendant_user(text,text,uuid,text,boolean)',
    'create_initial_admin_if_needed(text,uuid)',
    'create_initial_admin_user(text,text,text)',
    'create_test_user_profiles()',
    'elevate_to_admin(text)',
    'ensure_admin_exists()',
    'fix_incomplete_profiles()',
    'get_user_statistics()',
    'get_users_by_role(text)',
    'get_users_with_details()',
    'promote_user_to_role(text,text)',
    'secure_ai_consultant_operation(text,uuid,uuid)',
    'secure_update_user_role(uuid,text,uuid)',
    'decrease_booked_guests(uuid,uuid,date,integer)',
    'delete_passport_stamps_by_route(uuid)',
    'reset_user_route_progress(uuid,uuid)',
    'log_document_access(uuid,text,uuid)',
    'log_enhanced_admin_operation(text,text,uuid,jsonb)',
    'log_enhanced_security_event(text,uuid,boolean,text,jsonb)',
    'log_security_event(text,uuid,boolean,text,text,text)',
    'detect_suspicious_activity(uuid)',
    'get_ai_consultant_stats(character varying,uuid,uuid,integer)',
    'get_checkpoint_code_stats(uuid,integer)',
    'guata_try_consume_gemini_budget(integer)',
    'calculate_system_uptime_24h(text)'
  ];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', fn);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'skip missing fn: %', fn;
    END;
  END LOOP;
END $$;

-- 3) RLS: substituir USING(true) em escrita
DROP POLICY IF EXISTS "Service role can manage AI consultant config" ON public.ai_consultant_config;
DROP POLICY IF EXISTS "Service role manages action logs" ON public.guata_action_logs;

-- guata_response_cache
DROP POLICY IF EXISTS "Authenticated can insert cache" ON public.guata_response_cache;
DROP POLICY IF EXISTS "Authenticated can update cache" ON public.guata_response_cache;
DROP POLICY IF EXISTS "Authenticated can delete cache" ON public.guata_response_cache;
CREATE POLICY "Authenticated can insert own cache" ON public.guata_response_cache
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Authenticated can update own cache" ON public.guata_response_cache
  FOR UPDATE TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid())
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Authenticated can delete own cache" ON public.guata_response_cache
  FOR DELETE TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

-- koda_response_cache
DROP POLICY IF EXISTS "Authenticated can insert koda cache" ON public.koda_response_cache;
DROP POLICY IF EXISTS "Authenticated can update koda cache" ON public.koda_response_cache;
DROP POLICY IF EXISTS "Authenticated can delete koda cache" ON public.koda_response_cache;
CREATE POLICY "Authenticated can insert own koda cache" ON public.koda_response_cache
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Authenticated can update own koda cache" ON public.koda_response_cache
  FOR UPDATE TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid())
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Authenticated can delete own koda cache" ON public.koda_response_cache
  FOR DELETE TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

-- guata_search_stats
DROP POLICY IF EXISTS "Anyone can insert search stats" ON public.guata_search_stats;
CREATE POLICY "Anyone can insert valid search stats" ON public.guata_search_stats
  FOR INSERT TO anon, authenticated
  WITH CHECK (query IS NOT NULL AND length(query) BETWEEN 1 AND 500);

-- newsletter_subscribers
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe with valid email" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND platform IS NOT NULL
  );

-- rag_query_logs (user_id é TEXT)
DROP POLICY IF EXISTS "Authenticated can insert rag query logs" ON public.rag_query_logs;
CREATE POLICY "Authenticated can insert own rag query logs" ON public.rag_query_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = (auth.uid())::text);

-- rag_source_logs: apenas admins podem inserir
DROP POLICY IF EXISTS "Authenticated can insert rag source logs" ON public.rag_source_logs;
CREATE POLICY "Only admins insert rag source logs" ON public.rag_source_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

-- 4) Storage: remover SELECT amplo
DROP POLICY IF EXISTS "Permitir leitura pública de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de imagens de eventos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de imagens de parceiros" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública de imagens de turismo" ON storage.objects;
DROP POLICY IF EXISTS "view_partner_images" ON storage.objects;
