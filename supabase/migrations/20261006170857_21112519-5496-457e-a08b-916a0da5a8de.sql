-- Inserções restritas ao dono/participante ou administrador
DROP POLICY IF EXISTS "Authenticated can insert communication logs" ON public.communication_logs;
CREATE POLICY "Admins can insert communication logs" ON public.communication_logs
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Authenticated can insert ai insights" ON public.ai_insights;
CREATE POLICY "Admins can insert ai insights" ON public.ai_insights
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Authenticated can insert transactions" ON public.partner_transactions;
CREATE POLICY "Owner or admin can insert transactions" ON public.partner_transactions
  FOR INSERT TO authenticated WITH CHECK (public.is_partner_owner(partner_id) OR public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.partner_notifications;
CREATE POLICY "Owner or admin can insert notifications" ON public.partner_notifications
  FOR INSERT TO authenticated WITH CHECK (public.is_partner_owner(partner_id) OR public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Authenticated can insert term acceptances" ON public.partner_terms_acceptances;
CREATE POLICY "Owner or admin can insert term acceptances" ON public.partner_terms_acceptances
  FOR INSERT TO authenticated WITH CHECK (public.is_partner_owner(partner_id) OR public.is_admin_user(auth.uid()));

-- Mensagens: já existem políticas específicas para hóspede e parceiro
DROP POLICY IF EXISTS "Authenticated can insert messages" ON public.reservation_messages;

-- Eventos: já existe "Public can submit events" com restrições
DROP POLICY IF EXISTS "Permitir inserção de eventos para usuários autenticados" ON public.events;

-- Tabelas internas de CRM / configuração: só equipe
DROP POLICY IF EXISTS "Lead sources viewable by authenticated" ON public.lead_sources;
CREATE POLICY "Staff can view lead sources" ON public.lead_sources FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));
DROP POLICY IF EXISTS "Lead statuses viewable by authenticated" ON public.lead_statuses;
CREATE POLICY "Staff can view lead statuses" ON public.lead_statuses FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));
DROP POLICY IF EXISTS "Lead priorities viewable by authenticated" ON public.lead_priorities;
CREATE POLICY "Staff can view lead priorities" ON public.lead_priorities FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));
DROP POLICY IF EXISTS "Lead pipelines viewable by authenticated" ON public.lead_pipelines;
CREATE POLICY "Owner or staff can view lead pipelines" ON public.lead_pipelines FOR SELECT TO authenticated USING (created_by = auth.uid() OR public.is_admin_user(auth.uid()));
DROP POLICY IF EXISTS "Lead pipeline stages viewable by authenticated" ON public.lead_pipeline_stages;
CREATE POLICY "Owner or staff can view lead pipeline stages" ON public.lead_pipeline_stages FOR SELECT TO authenticated USING (
  public.is_admin_user(auth.uid()) OR EXISTS (SELECT 1 FROM public.lead_pipelines lp WHERE lp.id = lead_pipeline_stages.pipeline_id AND lp.created_by = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can read system config" ON public.system_fallback_config;
DROP POLICY IF EXISTS "Permitir leitura de logs de limpeza para autenticados" ON public.event_cleanup_logs;
CREATE POLICY "Admins can read event cleanup logs" ON public.event_cleanup_logs FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

-- Logos de eventos: cada usuário só envia na própria pasta
DROP POLICY IF EXISTS "Authenticated upload event-logos folder" ON storage.objects;
CREATE POLICY "Authenticated upload own event-logos folder" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'tourism-images' AND (storage.foldername(name))[1] = 'event-logos'
    AND (storage.foldername(name))[2] = (select auth.uid()::text));