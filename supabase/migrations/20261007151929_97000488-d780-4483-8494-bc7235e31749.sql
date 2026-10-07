CREATE TABLE IF NOT EXISTS public.partner_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.institutional_partners(id) ON DELETE CASCADE,
  partner_name TEXT NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('desconto','brinde','experiencia','outros')),
  reward_description TEXT NOT NULL,
  discount_percentage NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  max_uses INTEGER,
  uses_count INTEGER NOT NULL DEFAULT 0,
  admin_notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_rewards TO authenticated;
GRANT ALL ON public.partner_rewards TO service_role;
ALTER TABLE public.partner_rewards ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_partner_rewards_partner_id ON public.partner_rewards(partner_id);

CREATE POLICY "Partner or admin view rewards" ON public.partner_rewards FOR SELECT TO authenticated
  USING (public.is_partner_owner(partner_id) OR public.is_admin_user(auth.uid()));
CREATE POLICY "Partner inserts own pending rewards" ON public.partner_rewards FOR INSERT TO authenticated
  WITH CHECK (public.is_partner_owner(partner_id) AND status = 'pending' AND uses_count = 0);
CREATE POLICY "Partner deletes own pending rewards" ON public.partner_rewards FOR DELETE TO authenticated
  USING (public.is_partner_owner(partner_id) OR public.is_admin_user(auth.uid()));
CREATE POLICY "Admins update rewards" ON public.partner_rewards FOR UPDATE TO authenticated
  USING (public.is_admin_user(auth.uid())) WITH CHECK (public.is_admin_user(auth.uid()));

CREATE OR REPLACE FUNCTION public.partner_rewards_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.valid_until < NEW.valid_from THEN
    RAISE EXCEPTION 'A data final deve ser igual ou posterior à data inicial';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER trg_partner_rewards_validate BEFORE INSERT OR UPDATE ON public.partner_rewards
  FOR EACH ROW EXECUTE FUNCTION public.partner_rewards_validate();