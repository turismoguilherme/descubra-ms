-- ============================================================
-- LIMPEZA DE ESPACO (segura) — Descubra MS
-- Nao apaga usuarios, eventos, cartilhas, passport, partners.
-- Caches regeneram sozinhos. Logs antigos sao descartaveis.
-- Cole TUDO no SQL Editor e rode uma vez.
-- ============================================================

-- ---------- A) Ver o que mais ocupa (resultado 1) ----------
SELECT
  n.nspname AS schema,
  c.relname AS relation,
  pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
  pg_total_relation_size(c.oid) AS bytes
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'm', 'i')
ORDER BY pg_total_relation_size(c.oid) DESC
LIMIT 40;

-- ---------- B) Limpeza ----------
DO $$
DECLARE
  r bigint;
BEGIN
  -- 1) Caches de IA (podem zerar — recriam nas proximas perguntas)
  IF to_regclass('public.guata_response_cache') IS NOT NULL THEN
    SELECT COUNT(*) INTO r FROM public.guata_response_cache;
    TRUNCATE TABLE public.guata_response_cache;
    RAISE NOTICE 'guata_response_cache: truncated % rows', r;
  END IF;

  IF to_regclass('public.koda_response_cache') IS NOT NULL THEN
    SELECT COUNT(*) INTO r FROM public.koda_response_cache;
    TRUNCATE TABLE public.koda_response_cache;
    RAISE NOTICE 'koda_response_cache: truncated % rows', r;
  END IF;

  IF to_regclass('public.api_cache') IS NOT NULL THEN
    SELECT COUNT(*) INTO r FROM public.api_cache;
    TRUNCATE TABLE public.api_cache;
    RAISE NOTICE 'api_cache: truncated % rows', r;
  END IF;

  -- 2) Logs (mantem so 7 dias recentes quando houver created_at)
  IF to_regclass('public.communication_logs') IS NOT NULL THEN
    DELETE FROM public.communication_logs
    WHERE created_at < NOW() - INTERVAL '7 days';
    GET DIAGNOSTICS r = ROW_COUNT;
    RAISE NOTICE 'communication_logs: deleted % old rows', r;
  END IF;

  IF to_regclass('public.security_audit_log') IS NOT NULL THEN
    DELETE FROM public.security_audit_log
    WHERE created_at < NOW() - INTERVAL '7 days';
    GET DIAGNOSTICS r = ROW_COUNT;
    RAISE NOTICE 'security_audit_log: deleted % old rows', r;
  END IF;

  IF to_regclass('public.rag_query_logs') IS NOT NULL
     OR to_regclass('public.rag_source_logs') IS NOT NULL THEN
    -- Truncar juntas por causa da FK rag_source_logs -> rag_query_logs
    IF to_regclass('public.rag_source_logs') IS NOT NULL
       AND to_regclass('public.rag_query_logs') IS NOT NULL THEN
      TRUNCATE TABLE public.rag_source_logs, public.rag_query_logs;
      RAISE NOTICE 'rag_source_logs + rag_query_logs: truncated together';
    ELSIF to_regclass('public.rag_source_logs') IS NOT NULL THEN
      TRUNCATE TABLE public.rag_source_logs;
      RAISE NOTICE 'rag_source_logs: truncated';
    ELSE
      TRUNCATE TABLE public.rag_query_logs;
      RAISE NOTICE 'rag_query_logs: truncated';
    END IF;
  END IF;

  IF to_regclass('public.platform_performance_metrics') IS NOT NULL THEN
    SELECT COUNT(*) INTO r FROM public.platform_performance_metrics;
    TRUNCATE TABLE public.platform_performance_metrics;
    RAISE NOTICE 'platform_performance_metrics: truncated % rows', r;
  END IF;

  IF to_regclass('public.ai_feedback_log') IS NOT NULL THEN
    DELETE FROM public.ai_feedback_log
    WHERE created_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS r = ROW_COUNT;
    RAISE NOTICE 'ai_feedback_log: deleted % old rows', r;
  END IF;

  IF to_regclass('public.app_push_log') IS NOT NULL THEN
    DELETE FROM public.app_push_log
    WHERE created_at < NOW() - INTERVAL '14 days';
    GET DIAGNOSTICS r = ROW_COUNT;
    RAISE NOTICE 'app_push_log: deleted % old rows', r;
  END IF;

  -- 3) Fila de e-mail ja enviada/falha antiga
  IF to_regclass('public.pending_emails') IS NOT NULL THEN
    DELETE FROM public.pending_emails
    WHERE status IN ('sent', 'failed')
      AND created_at < NOW() - INTERVAL '7 days';
    GET DIAGNOSTICS r = ROW_COUNT;
    RAISE NOTICE 'pending_emails: deleted % old sent/failed', r;
  END IF;

  -- 4) Event cleanup logs (auditoria de cron)
  IF to_regclass('public.event_cleanup_logs') IS NOT NULL THEN
    SELECT COUNT(*) INTO r FROM public.event_cleanup_logs;
    TRUNCATE TABLE public.event_cleanup_logs;
    RAISE NOTICE 'event_cleanup_logs: truncated % rows', r;
  END IF;

  -- 5) Knowledge uploads orfaos / falhos antigos (nao mexe em guata_knowledge_base)
  IF to_regclass('public.knowledge_base_uploads') IS NOT NULL THEN
    DELETE FROM public.knowledge_base_uploads
    WHERE COALESCE(uploaded_at, processed_at, NOW()) < NOW() - INTERVAL '60 days'
      AND COALESCE(status, '') IN ('failed', 'error', 'deleted', 'cancelled');
    GET DIAGNOSTICS r = ROW_COUNT;
    RAISE NOTICE 'knowledge_base_uploads: deleted % failed/old', r;
  END IF;
END $$;

-- ---------- C) Storage ----------
-- Supabase bloqueia DELETE direto em storage.objects (use Storage API / Dashboard).
-- Para liberar arquivos: Dashboard → Storage → abra o bucket → apague manualmente.
-- Buckets candidatos a revisao (se existirem e estiverem vazios/inuteis):
--   data-sale-reports, viajar-reports, site-assets
-- NAO apague sem olhar: tourism-images, documents, guata-cartilhas, user-uploads, event-images.

-- ---------- D) Tamanhos depois (resultado 2) ----------
SELECT
  n.nspname AS schema,
  c.relname AS relation,
  pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
  pg_total_relation_size(c.oid) AS bytes
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'm', 'i')
ORDER BY pg_total_relation_size(c.oid) DESC
LIMIT 40;

-- Observacao:
-- document_chunks / documents (RAG) NAO foram truncados de proposito —
-- isso afetaria respostas do Guata ate um novo crawl. Se quiser liberar
-- MUITO espaco e aceitar reprocessar o RAG depois, rode a parte E abaixo.

-- ---------- E) OPCIONAL (descomente so se aceitar reprocessar RAG) ----------
-- TRUNCATE TABLE public.document_chunks;
-- TRUNCATE TABLE public.documents CASCADE;
-- (depois rode o crawler/ingest de novo no admin)
