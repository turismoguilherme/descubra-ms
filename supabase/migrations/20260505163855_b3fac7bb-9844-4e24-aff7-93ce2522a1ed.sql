-- =============================================================================
-- 1) EVENTS — esconder contato_email/contato_telefone do público
-- =============================================================================
DROP POLICY IF EXISTS "Permitir leitura pública de eventos" ON public.events;

CREATE POLICY "Eventos: admins veem tudo"
ON public.events FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['admin'::text,'tech'::text,'master_admin'::text,'gestor_municipal'::text,'gestor_igr'::text,'diretor_estadual'::text])
  )
);

DROP VIEW IF EXISTS public.events_public CASCADE;
CREATE VIEW public.events_public
WITH (security_invoker = on) AS
SELECT
  id, external_id, titulo, descricao, data_inicio, data_fim, local, cidade, estado,
  categoria, tipo_entrada, organizador, fonte, site_oficial, link_inscricao,
  tags, imagem_principal, video_promocional, publico_alvo,
  processado_por_ia, confiabilidade, ultima_atualizacao,
  created_at, updated_at, is_visible, approval_status, is_sponsored,
  sponsor_tier, sponsor_start_date, sponsor_end_date, start_time, end_time
FROM public.events
WHERE COALESCE(is_visible, true) = true
  AND COALESCE(approval_status, 'approved') IN ('approved','aprovado');

GRANT SELECT ON public.events_public TO anon, authenticated;

-- =============================================================================
-- 2) COMMERCIAL_PARTNERS — esconder CNPJ e contatos
-- =============================================================================
DROP POLICY IF EXISTS "Approved partners visible to authenticated users" ON public.commercial_partners;

DROP VIEW IF EXISTS public.commercial_partners_public CASCADE;
CREATE VIEW public.commercial_partners_public
WITH (security_invoker = on) AS
SELECT
  id, company_name, trade_name, business_type, company_size,
  website_url, description, address, city, state, zip_code, latitude, longitude,
  logo_url, cover_image_url, gallery_images, services_offered, target_audience,
  price_range, operating_hours, seasonal_info, subscription_plan,
  total_views, total_clicks, featured, verified, status, created_at
FROM public.commercial_partners
WHERE status = 'approved' AND subscription_status = 'active';

GRANT SELECT ON public.commercial_partners_public TO anon, authenticated;

-- =============================================================================
-- 3) INSTITUTIONAL_PARTNERS — esconder CPF/CNPJ/Stripe do público
-- =============================================================================
DROP POLICY IF EXISTS "Todos podem ver parceiros aprovados" ON public.institutional_partners;
DROP POLICY IF EXISTS "Public can view approved partners" ON public.institutional_partners;

CREATE POLICY "Institutional partners: owner and admins"
ON public.institutional_partners FOR SELECT
TO authenticated
USING (
  (
    auth.uid() IS NOT NULL
    AND contact_email IS NOT NULL
    AND lower(trim(contact_email)) = lower(trim(COALESCE(auth.jwt() ->> 'email', '')))
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY (ARRAY['admin'::text,'master_admin'::text,'tech'::text])
  )
);

DROP VIEW IF EXISTS public.institutional_partners_public CASCADE;
CREATE VIEW public.institutional_partners_public
WITH (security_invoker = on) AS
SELECT
  id, name, logo_url, website_url, description,
  is_active, partner_type, status, gallery_images, youtube_url,
  discount_offer, address, created_at, updated_at, approved_at
FROM public.institutional_partners
WHERE status = 'approved' AND COALESCE(is_active, true) = true;

GRANT SELECT ON public.institutional_partners_public TO anon, authenticated;

-- =============================================================================
-- 4) AI_CONSULTANT_CONFIG — não expor gemini_api_key_encrypted aos gestores
-- =============================================================================
DROP POLICY IF EXISTS "Regional managers can view AI config for their region" ON public.ai_consultant_config;

DROP VIEW IF EXISTS public.ai_consultant_config_safe CASCADE;
CREATE VIEW public.ai_consultant_config_safe
WITH (security_invoker = on) AS
SELECT
  id, tenant_id, region_id, city_id, enabled, confidence_threshold,
  data_sources, custom_prompts, max_queries_per_day, created_at, updated_at
FROM public.ai_consultant_config;

GRANT SELECT ON public.ai_consultant_config_safe TO authenticated;

CREATE POLICY "Regional managers view AI config (no api key)"
ON public.ai_consultant_config FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = ANY (ARRAY['diretor_estadual'::text,'gestor_igr'::text,'gestor_municipal'::text])
      AND (ur.region_id IS NULL OR ur.region_id = ai_consultant_config.region_id OR ur.city_id = ai_consultant_config.city_id)
  )
);

REVOKE SELECT (gemini_api_key_encrypted) ON public.ai_consultant_config FROM authenticated, anon;

-- =============================================================================
-- 5) LEADS METADATA — exigir autenticação
-- =============================================================================
DROP POLICY IF EXISTS "Lead pipeline stages are viewable by everyone" ON public.lead_pipeline_stages;
CREATE POLICY "Lead pipeline stages viewable by authenticated"
ON public.lead_pipeline_stages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Lead pipelines are viewable by everyone" ON public.lead_pipelines;
CREATE POLICY "Lead pipelines viewable by authenticated"
ON public.lead_pipelines FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Lead sources are viewable by everyone" ON public.lead_sources;
CREATE POLICY "Lead sources viewable by authenticated"
ON public.lead_sources FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Lead statuses are viewable by everyone" ON public.lead_statuses;
CREATE POLICY "Lead statuses viewable by authenticated"
ON public.lead_statuses FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Lead priorities are viewable by everyone" ON public.lead_priorities;
CREATE POLICY "Lead priorities viewable by authenticated"
ON public.lead_priorities FOR SELECT TO authenticated USING (true);