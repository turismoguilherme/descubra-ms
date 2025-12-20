-- Migration: Criar tabela de preços dos parceiros
-- Tabela: partner_pricing

CREATE TABLE IF NOT EXISTS public.partner_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.institutional_partners(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('hotel', 'restaurant', 'tour', 'transport', 'attraction', 'other')),
  service_name TEXT NOT NULL,
  pricing_type TEXT NOT NULL CHECK (pricing_type IN ('fixed', 'per_person', 'per_night', 'package')),
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_per_person NUMERIC(10,2),
  price_per_night NUMERIC(10,2),
  min_guests INTEGER DEFAULT 1,
  max_guests INTEGER,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comentários
COMMENT ON TABLE public.partner_pricing IS 'Preços dos serviços oferecidos pelos parceiros';
COMMENT ON COLUMN public.partner_pricing.pricing_type IS 'Tipo de preço: fixed (fixo), per_person (por pessoa), per_night (por noite), package (pacote)';
COMMENT ON COLUMN public.partner_pricing.base_price IS 'Preço base (para fixed) ou preço inicial (para outros tipos)';
COMMENT ON COLUMN public.partner_pricing.price_per_person IS 'Preço por pessoa (quando pricing_type = per_person)';
COMMENT ON COLUMN public.partner_pricing.price_per_night IS 'Preço por noite (quando pricing_type = per_night)';

-- Índices
CREATE INDEX IF NOT EXISTS idx_partner_pricing_partner_id ON public.partner_pricing(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_pricing_service_type ON public.partner_pricing(service_type);
CREATE INDEX IF NOT EXISTS idx_partner_pricing_is_active ON public.partner_pricing(is_active);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_partner_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_partner_pricing_updated_at
BEFORE UPDATE ON public.partner_pricing
FOR EACH ROW
EXECUTE FUNCTION update_partner_pricing_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.partner_pricing ENABLE ROW LEVEL SECURITY;

-- Política: Parceiros podem ver seus próprios preços
CREATE POLICY "Partners can view their own pricing"
ON public.partner_pricing
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_pricing.partner_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Política: Parceiros podem gerenciar seus próprios preços
CREATE POLICY "Partners can manage their own pricing"
ON public.partner_pricing
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_pricing.partner_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Política: Usuários autenticados podem ver preços ativos
CREATE POLICY "Authenticated users can view active pricing"
ON public.partner_pricing
FOR SELECT
USING (
  is_active = true
  AND auth.role() = 'authenticated'
);

-- Política: Admins podem ver todos os preços
CREATE POLICY "Admins can view all pricing"
ON public.partner_pricing
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);
