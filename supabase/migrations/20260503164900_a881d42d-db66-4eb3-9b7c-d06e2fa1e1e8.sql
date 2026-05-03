-- 1) Multi-dia em rotas e checkpoints do Passaporte Digital
ALTER TABLE public.route_checkpoints
  ADD COLUMN IF NOT EXISTS day_number INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS day_title TEXT NULL;

ALTER TABLE public.routes
  ADD COLUMN IF NOT EXISTS total_days INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_route_checkpoints_route_day
  ON public.route_checkpoints(route_id, day_number, order_sequence);

-- 2) Corrigir RLS de partner_terms_acceptances para incluir master_admin
DROP POLICY IF EXISTS "Admins can view all term acceptances" ON public.partner_terms_acceptances;
CREATE POLICY "Admins can view all term acceptances"
ON public.partner_terms_acceptances
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY (ARRAY['admin','tech','master_admin'])
  )
);

-- Garantir policy de UPDATE para admins (aprovar/rejeitar/solicitar ajuste)
DROP POLICY IF EXISTS "Admins can update term acceptances" ON public.partner_terms_acceptances;
CREATE POLICY "Admins can update term acceptances"
ON public.partner_terms_acceptances
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY (ARRAY['admin','tech','master_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = ANY (ARRAY['admin','tech','master_admin'])
  )
);