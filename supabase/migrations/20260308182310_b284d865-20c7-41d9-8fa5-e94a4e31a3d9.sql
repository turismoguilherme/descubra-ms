-- Fase 2: Restringir INSERT/CRUD público nas tabelas de cache e logs

-- guata_response_cache: trocar CRUD público por authenticated
DROP POLICY IF EXISTS "Allow cache inserts" ON public.guata_response_cache;
DROP POLICY IF EXISTS "Allow cache updates" ON public.guata_response_cache;
DROP POLICY IF EXISTS "Allow cache deletes" ON public.guata_response_cache;
CREATE POLICY "Authenticated can insert cache" ON public.guata_response_cache
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update cache" ON public.guata_response_cache
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete cache" ON public.guata_response_cache
  FOR DELETE TO authenticated USING (true);

-- koda_response_cache: trocar CRUD público por authenticated
DROP POLICY IF EXISTS "Allow cache inserts" ON public.koda_response_cache;
DROP POLICY IF EXISTS "Allow cache updates" ON public.koda_response_cache;
DROP POLICY IF EXISTS "Allow cache deletes" ON public.koda_response_cache;
CREATE POLICY "Authenticated can insert koda cache" ON public.koda_response_cache
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update koda cache" ON public.koda_response_cache
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete koda cache" ON public.koda_response_cache
  FOR DELETE TO authenticated USING (true);

-- ai_insights
DROP POLICY IF EXISTS "System can create ai insights" ON public.ai_insights;
CREATE POLICY "Authenticated can insert ai insights" ON public.ai_insights
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- ai_master_insights
DROP POLICY IF EXISTS "System can create ai insights" ON public.ai_master_insights;
CREATE POLICY "Authenticated can insert ai master insights" ON public.ai_master_insights
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- ai_proactive_insights
DROP POLICY IF EXISTS "Sistema pode criar insights" ON public.ai_proactive_insights;
CREATE POLICY "Authenticated can insert proactive insights" ON public.ai_proactive_insights
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- rag_query_logs (has 2 duplicate INSERT policies)
DROP POLICY IF EXISTS "System can create RAG query logs" ON public.rag_query_logs;
DROP POLICY IF EXISTS "p_rag_logs_ins" ON public.rag_query_logs;
CREATE POLICY "Authenticated can insert rag query logs" ON public.rag_query_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- rag_source_logs (has 2 duplicate INSERT policies)
DROP POLICY IF EXISTS "System can create RAG source logs" ON public.rag_source_logs;
DROP POLICY IF EXISTS "p_rag_sources_ins" ON public.rag_source_logs;
CREATE POLICY "Authenticated can insert rag source logs" ON public.rag_source_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- communication_logs
DROP POLICY IF EXISTS "System can create communication logs" ON public.communication_logs;
CREATE POLICY "Authenticated can insert communication logs" ON public.communication_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- inventory_analytics
DROP POLICY IF EXISTS "Analytics can be inserted by anyone" ON public.inventory_analytics;
CREATE POLICY "Authenticated can insert analytics" ON public.inventory_analytics
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- commercial_partner_metrics
DROP POLICY IF EXISTS "Sistema pode criar métricas" ON public.commercial_partner_metrics;
CREATE POLICY "Authenticated can insert partner metrics" ON public.commercial_partner_metrics
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- checkpoint_code_attempts
DROP POLICY IF EXISTS "System can insert code attempts" ON public.checkpoint_code_attempts;
CREATE POLICY "Authenticated can insert code attempts" ON public.checkpoint_code_attempts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
