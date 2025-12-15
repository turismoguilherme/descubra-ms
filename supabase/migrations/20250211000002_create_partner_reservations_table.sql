-- Migration: Criar tabela de reservas de parceiros
-- Tabela: partner_reservations

CREATE TABLE IF NOT EXISTS public.partner_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.institutional_partners(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reservation_type TEXT NOT NULL CHECK (reservation_type IN ('hotel', 'restaurant', 'tour', 'transport', 'attraction', 'other')),
  service_name TEXT NOT NULL,
  check_in_date DATE,
  check_out_date DATE,
  reservation_date DATE NOT NULL,
  reservation_time TIME,
  guests INTEGER DEFAULT 1,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected')),
  reservation_code TEXT UNIQUE NOT NULL,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  special_requests TEXT,
  partner_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Comentários
COMMENT ON TABLE public.partner_reservations IS 'Reservas feitas através da plataforma para parceiros';
COMMENT ON COLUMN public.partner_reservations.reservation_code IS 'Código único da reserva (ex: RES-2025-001234)';
COMMENT ON COLUMN public.partner_reservations.commission_rate IS 'Percentual de comissão aplicado nesta reserva';
COMMENT ON COLUMN public.partner_reservations.commission_amount IS 'Valor da comissão calculada (total_amount * commission_rate / 100)';
COMMENT ON COLUMN public.partner_reservations.partner_notes IS 'Notas internas do parceiro sobre a reserva';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_partner_reservations_partner_id ON public.partner_reservations(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_reservations_user_id ON public.partner_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_reservations_status ON public.partner_reservations(status);
CREATE INDEX IF NOT EXISTS idx_partner_reservations_reservation_code ON public.partner_reservations(reservation_code);
CREATE INDEX IF NOT EXISTS idx_partner_reservations_reservation_date ON public.partner_reservations(reservation_date);

-- Função para gerar código único de reserva
CREATE OR REPLACE FUNCTION generate_reservation_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  year_part TEXT;
  seq_num INTEGER;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Buscar último número sequencial do ano
  SELECT COALESCE(MAX(CAST(SUBSTRING(reservation_code FROM 9) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.partner_reservations
  WHERE reservation_code LIKE 'RES-' || year_part || '-%';
  
  new_code := 'RES-' || year_part || '-' || LPAD(seq_num::TEXT, 6, '0');
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_partner_reservations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_partner_reservations_updated_at
BEFORE UPDATE ON public.partner_reservations
FOR EACH ROW
EXECUTE FUNCTION update_partner_reservations_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.partner_reservations ENABLE ROW LEVEL SECURITY;

-- Política: Parceiros podem ver suas próprias reservas
CREATE POLICY "Partners can view their own reservations"
ON public.partner_reservations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_reservations.partner_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Política: Parceiros podem atualizar status de suas reservas
CREATE POLICY "Partners can update their own reservations"
ON public.partner_reservations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_reservations.partner_id
    AND ip.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Política: Usuários autenticados podem criar reservas
CREATE POLICY "Authenticated users can create reservations"
ON public.partner_reservations
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Política: Admins podem ver todas as reservas
CREATE POLICY "Admins can view all reservations"
ON public.partner_reservations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

