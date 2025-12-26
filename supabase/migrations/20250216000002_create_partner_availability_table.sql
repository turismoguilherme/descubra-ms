-- Migration: Criar tabela de disponibilidade dos parceiros
-- Tabela: partner_availability

CREATE TABLE IF NOT EXISTS public.partner_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.institutional_partners(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.partner_pricing(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available BOOLEAN NOT NULL DEFAULT true,
  max_guests INTEGER,
  booked_guests INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(partner_id, service_id, date)
);

-- Comentários
COMMENT ON TABLE public.partner_availability IS 'Disponibilidade de serviços dos parceiros por data';
COMMENT ON COLUMN public.partner_availability.available IS 'Se false, data está bloqueada/indisponível';
COMMENT ON COLUMN public.partner_availability.max_guests IS 'Número máximo de hóspedes/pessoas para esta data';
COMMENT ON COLUMN public.partner_availability.booked_guests IS 'Número de hóspedes/pessoas já reservados';

-- Índices
CREATE INDEX IF NOT EXISTS idx_partner_availability_partner_id ON public.partner_availability(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_availability_service_id ON public.partner_availability(service_id);
CREATE INDEX IF NOT EXISTS idx_partner_availability_date ON public.partner_availability(date);
CREATE INDEX IF NOT EXISTS idx_partner_availability_available ON public.partner_availability(available);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_partner_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_partner_availability_updated_at
BEFORE UPDATE ON public.partner_availability
FOR EACH ROW
EXECUTE FUNCTION update_partner_availability_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.partner_availability ENABLE ROW LEVEL SECURITY;

-- Política: Parceiros podem gerenciar sua disponibilidade
CREATE POLICY "Partners can manage their availability"
ON public.partner_availability
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_availability.partner_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Política: Usuários autenticados podem ver disponibilidade
CREATE POLICY "Authenticated users can view availability"
ON public.partner_availability
FOR SELECT
USING (
  available = true
  AND auth.role() = 'authenticated'
);

-- Política: Admins podem ver toda disponibilidade
CREATE POLICY "Admins can view all availability"
ON public.partner_availability
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);
