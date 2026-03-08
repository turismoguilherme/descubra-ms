-- Fase 1: Restringir INSERT público nas tabelas de risco médio para exigir autenticação

-- events: trocar WITH CHECK (true) por auth.uid() IS NOT NULL
DROP POLICY IF EXISTS "Allow public event insert - simple" ON public.events;
CREATE POLICY "Authenticated users can insert events" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- partner_transactions
DROP POLICY IF EXISTS "Service role can insert transactions" ON public.partner_transactions;
CREATE POLICY "Authenticated can insert transactions" ON public.partner_transactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- partner_notifications
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.partner_notifications;
CREATE POLICY "Authenticated can insert notifications" ON public.partner_notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- reservation_messages: trocar a política "Service role can insert messages"
DROP POLICY IF EXISTS "Service role can insert messages" ON public.reservation_messages;
CREATE POLICY "Authenticated can insert messages" ON public.reservation_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- user_passports
DROP POLICY IF EXISTS "System can create passports for users" ON public.user_passports;
CREATE POLICY "Authenticated users can create own passport" ON public.user_passports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- user_rewards
DROP POLICY IF EXISTS "System can insert rewards for users" ON public.user_rewards;
CREATE POLICY "Authenticated users can insert own rewards" ON public.user_rewards
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- partner_terms_acceptances
DROP POLICY IF EXISTS "System can insert term acceptances" ON public.partner_terms_acceptances;
CREATE POLICY "Authenticated can insert term acceptances" ON public.partner_terms_acceptances
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
