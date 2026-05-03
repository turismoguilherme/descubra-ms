-- RLS: parceiros não podem usar subquery em auth.users dentro de políticas (403 no REST).
-- Usa created_by = auth.uid() OU e-mail do JWT comparado a contact_email.

CREATE OR REPLACE FUNCTION public.partner_row_is_mine(p_partner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.institutional_partners ip
    WHERE ip.id = p_partner_id
      AND (
        (ip.created_by IS NOT NULL AND ip.created_by = auth.uid())
        OR (
          coalesce(nullif(trim(ip.contact_email), ''), '') <> ''
          AND lower(trim(ip.contact_email)) = lower(trim(coalesce((select auth.jwt())->>'email', '')))
        )
      )
  );
$$;

COMMENT ON FUNCTION public.partner_row_is_mine(uuid) IS
  'True se o usuário for o criador do parceiro (created_by) ou se o e-mail do JWT bater com contact_email.';

GRANT EXECUTE ON FUNCTION public.partner_row_is_mine(uuid) TO authenticated;

-- partner_reservations
DROP POLICY IF EXISTS "Partners can view their own reservations" ON public.partner_reservations;
CREATE POLICY "Partners can view their own reservations"
ON public.partner_reservations
FOR SELECT
USING (public.partner_row_is_mine(partner_id));

DROP POLICY IF EXISTS "Partners can update their own reservations" ON public.partner_reservations;
CREATE POLICY "Partners can update their own reservations"
ON public.partner_reservations
FOR UPDATE
USING (public.partner_row_is_mine(partner_id));

-- partner_notifications
DROP POLICY IF EXISTS "Partners can view their own notifications" ON public.partner_notifications;
CREATE POLICY "Partners can view their own notifications"
ON public.partner_notifications
FOR SELECT
USING (public.partner_row_is_mine(partner_id));

DROP POLICY IF EXISTS "Partners can update their own notifications" ON public.partner_notifications;
CREATE POLICY "Partners can update their own notifications"
ON public.partner_notifications
FOR UPDATE
USING (public.partner_row_is_mine(partner_id));

-- partner_terms_acceptances
DROP POLICY IF EXISTS "Partners can view their own term acceptances" ON public.partner_terms_acceptances;
CREATE POLICY "Partners can view their own term acceptances"
ON public.partner_terms_acceptances
FOR SELECT
USING (public.partner_row_is_mine(partner_id));
