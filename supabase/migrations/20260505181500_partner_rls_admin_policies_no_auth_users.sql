-- Políticas de admin em partner_reservations / partner_notifications ainda usavam
-- EXISTS (SELECT 1 FROM auth.users ...), o que gera 42501 "permission denied for table users"
-- para qualquer role authenticated — a consulta do parceiro falha inteira (403 no REST).
-- Alinhar com partner_terms_acceptances: usar apenas public.user_roles.

DROP POLICY IF EXISTS "Admins can view all reservations" ON public.partner_reservations;
CREATE POLICY "Admins can view all reservations"
ON public.partner_reservations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = ANY (ARRAY['admin', 'tech', 'master_admin'])
  )
);

DROP POLICY IF EXISTS "Admins can view all notifications" ON public.partner_notifications;
CREATE POLICY "Admins can view all notifications"
ON public.partner_notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = ANY (ARRAY['admin', 'tech', 'master_admin'])
  )
);
