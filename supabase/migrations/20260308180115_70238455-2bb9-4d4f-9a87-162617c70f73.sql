-- ============================================================
-- FASE 1: Habilitar RLS em tabelas CRÍTICAS
-- ============================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourism_inventory ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FASE 1: Corrigir políticas bugadas de plano_diretor_documents
-- ============================================================

DROP POLICY IF EXISTS "Creators can insert their own planos" ON public.plano_diretor_documents;
DROP POLICY IF EXISTS "Creators can update their own planos" ON public.plano_diretor_documents;
DROP POLICY IF EXISTS "Creators can view their own planos" ON public.plano_diretor_documents;
DROP POLICY IF EXISTS "Only creators can delete planos" ON public.plano_diretor_documents;

CREATE POLICY "Creators can insert their own planos" ON public.plano_diretor_documents
  FOR INSERT TO public
  WITH CHECK (auth.uid() IS NOT NULL AND criador_id = auth.uid());

CREATE POLICY "Creators can update their own planos" ON public.plano_diretor_documents
  FOR UPDATE TO public
  USING (auth.uid() IS NOT NULL AND criador_id = auth.uid());

CREATE POLICY "Creators can view their own planos" ON public.plano_diretor_documents
  FOR SELECT TO public
  USING (auth.uid() IS NOT NULL AND criador_id = auth.uid());

CREATE POLICY "Only creators can delete planos" ON public.plano_diretor_documents
  FOR DELETE TO public
  USING (auth.uid() IS NOT NULL AND criador_id = auth.uid());

-- ============================================================
-- FASE 1: Corrigir política pública de ai_consultant_config
-- ============================================================

DROP POLICY IF EXISTS "System can manage AI consultant config" ON public.ai_consultant_config;

CREATE POLICY "Service role can manage AI consultant config" ON public.ai_consultant_config
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- FASE 2: Habilitar RLS em tabelas com warnings
-- ============================================================

ALTER TABLE public.guata_user_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own memory" ON public.guata_user_memory
  FOR ALL TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

ALTER TABLE public.system_fallback_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage system config" ON public.system_fallback_config
  FOR ALL TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY "Authenticated users can read system config" ON public.system_fallback_config
  FOR SELECT TO authenticated
  USING (true);

ALTER TABLE public.viajar_employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage employees" ON public.viajar_employees
  FOR ALL TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY "Employees can view own record" ON public.viajar_employees
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- FASE 2: Restringir write em tabelas de config a admins
-- ============================================================

DROP POLICY IF EXISTS "Allow authenticated users to manage prompt configs" ON public.ai_prompt_configs;
CREATE POLICY "Admins can manage prompt configs" ON public.ai_prompt_configs
  FOR ALL TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Allow authenticated users to insert knowledge base entries" ON public.guata_knowledge_base;
DROP POLICY IF EXISTS "Allow authenticated users to update knowledge base entries" ON public.guata_knowledge_base;
CREATE POLICY "Admins can insert knowledge base entries" ON public.guata_knowledge_base
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY "Admins can update knowledge base entries" ON public.guata_knowledge_base
  FOR UPDATE TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));
CREATE POLICY "Admins can delete knowledge base entries" ON public.guata_knowledge_base
  FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Allow authenticated users to insert uploads" ON public.knowledge_base_uploads;
DROP POLICY IF EXISTS "Allow authenticated users to update uploads" ON public.knowledge_base_uploads;
DROP POLICY IF EXISTS "Allow authenticated users to delete uploads" ON public.knowledge_base_uploads;
DROP POLICY IF EXISTS "Allow authenticated users to view uploads" ON public.knowledge_base_uploads;
CREATE POLICY "Admins can manage uploads" ON public.knowledge_base_uploads
  FOR ALL TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can manage region cities" ON public.region_cities;
CREATE POLICY "Admins can manage region cities" ON public.region_cities
  FOR ALL TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));