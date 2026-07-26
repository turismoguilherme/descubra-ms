-- Passo 1: limpar caches/logs expirados (nao remove schema em uso)
-- Passo 2: dropar tabelas sem uso no app (somente se vazias)
-- Usa nome em texto (nao regclass) para nao falhar se a tabela nao existir

-- ========== PASSO 1: espaco (seguro) ==========
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'clean_expired_guata_cache'
  ) THEN
    PERFORM public.clean_expired_guata_cache();
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'clean_expired_koda_cache'
  ) THEN
    PERFORM public.clean_expired_koda_cache();
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'api_cache'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'api_cache' AND column_name = 'expires_at'
    ) THEN
      EXECUTE 'DELETE FROM public.api_cache WHERE expires_at < NOW()';
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'communication_logs'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'communication_logs' AND column_name = 'created_at'
  ) THEN
    EXECUTE $q$DELETE FROM public.communication_logs WHERE created_at < NOW() - INTERVAL '30 days'$q$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'rag_query_logs'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rag_query_logs' AND column_name = 'created_at'
  ) THEN
    EXECUTE $q$DELETE FROM public.rag_query_logs WHERE created_at < NOW() - INTERVAL '30 days'$q$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'rag_source_logs'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rag_source_logs' AND column_name = 'created_at'
  ) THEN
    EXECUTE $q$DELETE FROM public.rag_source_logs WHERE created_at < NOW() - INTERVAL '30 days'$q$;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'platform_performance_metrics'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'platform_performance_metrics' AND column_name = 'created_at'
  ) THEN
    EXECUTE $q$DELETE FROM public.platform_performance_metrics WHERE created_at < NOW() - INTERVAL '30 days'$q$;
  END IF;
END $$;

-- ========== PASSO 2: dropar tabelas mortas SOMENTE se vazias ==========
CREATE OR REPLACE FUNCTION public._drop_if_empty(p_schema text, p_table text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  n bigint;
  fq text := format('%I.%I', p_schema, p_table);
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = p_schema AND table_name = p_table
  ) THEN
    RETURN format('skip missing %s', fq);
  END IF;

  EXECUTE format('SELECT COUNT(*) FROM %I.%I', p_schema, p_table) INTO n;

  IF n = 0 THEN
    EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE', p_schema, p_table);
    RETURN format('dropped empty %s', fq);
  END IF;

  RETURN format('kept %s (%s rows)', fq, n);
END;
$$;

-- Remove versao antiga (regclass) se ainda existir
DROP FUNCTION IF EXISTS public._drop_if_empty(regclass);

SELECT public._drop_if_empty('public', 'community_moderation_log');
SELECT public._drop_if_empty('public', 'community_comments');
SELECT public._drop_if_empty('public', 'community_votes');
SELECT public._drop_if_empty('public', 'community_suggestions');

SELECT public._drop_if_empty('public', 'report_schedules');
SELECT public._drop_if_empty('public', 'report_data');
SELECT public._drop_if_empty('public', 'report_templates');
SELECT public._drop_if_empty('public', 'report_categories');

SELECT public._drop_if_empty('public', 'overflow_one_users');
SELECT public._drop_if_empty('public', 'partner_translations');
SELECT public._drop_if_empty('public', 'public_reports');
SELECT public._drop_if_empty('public', 'tourist_interactions');
SELECT public._drop_if_empty('public', 'secretary_files');

SELECT public._drop_if_empty('public', 'guata_search_stats');
SELECT public._drop_if_empty('public', 'guata_verified_partners');
SELECT public._drop_if_empty('public', 'guata_tourist_attractions');
SELECT public._drop_if_empty('public', 'guata_itineraries');
SELECT public._drop_if_empty('public', 'guata_events');

SELECT public._drop_if_empty('public', 'commercial_partner_metrics');
SELECT public._drop_if_empty('public', 'commercial_subscription_plans');
SELECT public._drop_if_empty('public', 'inventory_analytics');
SELECT public._drop_if_empty('public', 'ai_seo_improvements');

SELECT public._drop_if_empty('public', 'master_support_tickets');
SELECT public._drop_if_empty('public', 'master_system_metrics');
SELECT public._drop_if_empty('public', 'master_platform_config');
SELECT public._drop_if_empty('public', 'master_ai_feedback');

SELECT public._drop_if_empty('public', 'flowtrip_onboarding_steps');
SELECT public._drop_if_empty('public', 'flowtrip_white_label_configs');
SELECT public._drop_if_empty('public', 'flowtrip_support_tickets');
SELECT public._drop_if_empty('public', 'flowtrip_state_features');

SELECT public._drop_if_empty('public', 'ai_consultant_feedback');
SELECT public._drop_if_empty('public', 'ai_consultant_logs');
SELECT public._drop_if_empty('public', 'ai_proactive_insights');
SELECT public._drop_if_empty('public', 'ai_master_insights');
SELECT public._drop_if_empty('public', 'ai_consultant_config');

DROP FUNCTION IF EXISTS public._drop_if_empty(text, text);
