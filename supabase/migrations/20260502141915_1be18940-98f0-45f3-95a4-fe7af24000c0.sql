
-- 1. Fix master_* tables: remove permissive USING(true) policies
DROP POLICY IF EXISTS "Master users can manage all data" ON public.master_clients;
DROP POLICY IF EXISTS "Master users can manage all data" ON public.master_deals;
DROP POLICY IF EXISTS "Master users can manage all data" ON public.master_financial_records;
DROP POLICY IF EXISTS "Master users can manage all data" ON public.master_support_tickets;
DROP POLICY IF EXISTS "Master users can manage all data" ON public.master_system_metrics;
DROP POLICY IF EXISTS "Master users can manage all data" ON public.master_activity_logs;
DROP POLICY IF EXISTS "Master users can manage all data" ON public.master_platform_config;
DROP POLICY IF EXISTS "Master users can manage all data" ON public.master_ai_feedback;

CREATE POLICY "Only master admins can access master_clients" ON public.master_clients
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')));

CREATE POLICY "Only master admins can access master_deals" ON public.master_deals
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')));

CREATE POLICY "Only master admins can access master_support_tickets" ON public.master_support_tickets
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')));

CREATE POLICY "Only master admins can access master_system_metrics" ON public.master_system_metrics
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')));

CREATE POLICY "Only master admins can access master_activity_logs" ON public.master_activity_logs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')));

CREATE POLICY "Only master admins can access master_platform_config" ON public.master_platform_config
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')));

CREATE POLICY "Only master admins can access master_ai_feedback" ON public.master_ai_feedback
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech','master_admin')));

-- master_financial_records já tem política de admin; removemos só a permissiva
-- (DROP acima já removeu)

-- 2. Enable RLS on guata_search_stats
ALTER TABLE public.guata_search_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own search stats"
  ON public.guata_search_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all search stats"
  ON public.guata_search_stats FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','tech')));

CREATE POLICY "Anyone can insert search stats"
  ON public.guata_search_stats FOR INSERT
  TO public
  WITH CHECK (true);

-- 3. commercial_partners - remove public SELECT exposing sensitive data, create safe view
DROP POLICY IF EXISTS "Parceiros comerciais são visualizáveis por todos" ON public.commercial_partners;

-- Allow approved+active partners to be visible to authenticated users only (with all columns)
CREATE POLICY "Approved partners visible to authenticated users"
  ON public.commercial_partners FOR SELECT
  TO authenticated
  USING (status = 'approved' AND subscription_status = 'active');

-- Public-safe view (excludes CNPJ, phone, whatsapp, exact contact_person)
CREATE OR REPLACE VIEW public.commercial_partners_public AS
SELECT
  id, company_name, trade_name, business_type, company_size,
  contact_email, website_url, description, address, city, state, zip_code,
  latitude, longitude, logo_url, cover_image_url, gallery_images,
  services_offered, target_audience, price_range, operating_hours, seasonal_info,
  subscription_plan, total_views, total_clicks, featured, verified, status,
  created_at, updated_at
FROM public.commercial_partners
WHERE status = 'approved' AND subscription_status = 'active';

GRANT SELECT ON public.commercial_partners_public TO anon, authenticated;
