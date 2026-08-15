-- 1) Stable partner ownership helper
CREATE OR REPLACE FUNCTION public.is_partner_owner(p_partner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = p_partner_id
      AND auth.uid() IS NOT NULL
      AND (
        ip.created_by = auth.uid()
        OR (
          ip.created_by IS NULL
          AND ip.contact_email IS NOT NULL
          AND lower(trim(ip.contact_email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.is_partner_owner(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_partner_owner(uuid) TO authenticated, service_role;

-- 2) institutional_partners
DROP POLICY IF EXISTS "Institutional partners: owner and admins" ON public.institutional_partners;
CREATE POLICY "Institutional partners: owner and admins"
ON public.institutional_partners FOR SELECT TO authenticated
USING (public.is_partner_owner(id) OR public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Partners can update their own data" ON public.institutional_partners;
CREATE POLICY "Partners can update their own data"
ON public.institutional_partners FOR UPDATE TO authenticated
USING (public.is_partner_owner(id))
WITH CHECK (public.is_partner_owner(id));

-- 3) partner_pricing
DROP POLICY IF EXISTS "Partners can view their own pricing" ON public.partner_pricing;
CREATE POLICY "Partners can view their own pricing"
ON public.partner_pricing FOR SELECT TO authenticated
USING (public.is_partner_owner(partner_id) OR public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Partners can insert their own pricing" ON public.partner_pricing;
CREATE POLICY "Partners can insert their own pricing"
ON public.partner_pricing FOR INSERT TO authenticated
WITH CHECK (public.is_partner_owner(partner_id));

DROP POLICY IF EXISTS "Partners can update their own pricing" ON public.partner_pricing;
CREATE POLICY "Partners can update their own pricing"
ON public.partner_pricing FOR UPDATE TO authenticated
USING (public.is_partner_owner(partner_id))
WITH CHECK (public.is_partner_owner(partner_id));

DROP POLICY IF EXISTS "Partners can delete their own pricing" ON public.partner_pricing;
CREATE POLICY "Partners can delete their own pricing"
ON public.partner_pricing FOR DELETE TO authenticated
USING (public.is_partner_owner(partner_id));

-- 4) partner_availability
DROP POLICY IF EXISTS "Partners can view their availability" ON public.partner_availability;
CREATE POLICY "Partners can view their availability"
ON public.partner_availability FOR SELECT TO authenticated
USING (public.is_partner_owner(partner_id) OR available = true OR public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Partners can insert their availability" ON public.partner_availability;
CREATE POLICY "Partners can insert their availability"
ON public.partner_availability FOR INSERT TO authenticated
WITH CHECK (public.is_partner_owner(partner_id));

DROP POLICY IF EXISTS "Partners can update their availability" ON public.partner_availability;
CREATE POLICY "Partners can update their availability"
ON public.partner_availability FOR UPDATE TO authenticated
USING (public.is_partner_owner(partner_id))
WITH CHECK (public.is_partner_owner(partner_id));

DROP POLICY IF EXISTS "Partners can delete their availability" ON public.partner_availability;
CREATE POLICY "Partners can delete their availability"
ON public.partner_availability FOR DELETE TO authenticated
USING (public.is_partner_owner(partner_id));

-- 5) partner_cancellation_policies
DROP POLICY IF EXISTS "Partners can view cancellation policies" ON public.partner_cancellation_policies;
CREATE POLICY "Partners can view cancellation policies"
ON public.partner_cancellation_policies FOR SELECT TO authenticated
USING (
  (partner_id IS NULL AND is_default = true AND is_active = true)
  OR (partner_id IS NOT NULL AND public.is_partner_owner(partner_id))
  OR public.is_admin_user(auth.uid())
);

DROP POLICY IF EXISTS "Partners can manage their cancellation policies" ON public.partner_cancellation_policies;
CREATE POLICY "Partners can manage their cancellation policies"
ON public.partner_cancellation_policies FOR ALL TO authenticated
USING (partner_id IS NOT NULL AND public.is_partner_owner(partner_id))
WITH CHECK (partner_id IS NOT NULL AND public.is_partner_owner(partner_id));

-- 6) partner_transactions
DROP POLICY IF EXISTS "Partners can view their own transactions" ON public.partner_transactions;
CREATE POLICY "Partners can view their own transactions"
ON public.partner_transactions FOR SELECT TO authenticated
USING (public.is_partner_owner(partner_id) OR public.is_admin_user(auth.uid()));

-- 7) pending_refunds
DROP POLICY IF EXISTS "Partners can view their own pending refunds" ON public.pending_refunds;
CREATE POLICY "Partners can view their own pending refunds"
ON public.pending_refunds FOR SELECT TO authenticated
USING (public.is_partner_owner(partner_id) OR public.is_admin_user(auth.uid()));

-- 8) reservation_messages
DROP POLICY IF EXISTS "Partners can view messages of their reservations" ON public.reservation_messages;
CREATE POLICY "Partners can view messages of their reservations"
ON public.reservation_messages FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.partner_reservations pr
  WHERE pr.id = reservation_messages.reservation_id
    AND public.is_partner_owner(pr.partner_id)
));

DROP POLICY IF EXISTS "Partners can send messages to their reservations" ON public.reservation_messages;
CREATE POLICY "Partners can send messages to their reservations"
ON public.reservation_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_type = 'partner'
  AND EXISTS (
    SELECT 1 FROM public.partner_reservations pr
    WHERE pr.id = reservation_messages.reservation_id
      AND public.is_partner_owner(pr.partner_id)
  )
);

-- 9) Revoke anon EXECUTE on internal ranking helpers
REVOKE ALL ON FUNCTION public.count_consecutive_months_in_top(integer, integer) FROM anon;
REVOKE ALL ON FUNCTION public.user_is_regional_monthly_leader() FROM anon;
GRANT EXECUTE ON FUNCTION public.count_consecutive_months_in_top(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_is_regional_monthly_leader() TO authenticated;

-- 10) Password reset token creation is server-side only
REVOKE ALL ON FUNCTION public.create_password_reset_token(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_password_reset_token(text) TO service_role;

-- 11) Points can only be granted to self (or by admins)
CREATE OR REPLACE FUNCTION public.update_user_points(p_user_id uuid, p_state_id uuid, p_points integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_user_id <> auth.uid() AND NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Not allowed to change points of another user';
  END IF;

  IF p_points IS NULL OR p_points < 0 OR p_points > 10000 THEN
    RAISE EXCEPTION 'Invalid points value';
  END IF;

  INSERT INTO public.user_levels (user_id, state_id, current_level, total_points, level_name)
  VALUES (p_user_id, p_state_id, 1, p_points, 'Iniciante')
  ON CONFLICT (user_id, state_id) DO UPDATE
    SET total_points = public.user_levels.total_points + p_points,
        updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.update_user_points(uuid, uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_user_points(uuid, uuid, integer) TO authenticated, service_role;