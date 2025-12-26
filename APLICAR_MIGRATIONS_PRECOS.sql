-- =====================================================
-- MIGRATIONS PARA SISTEMA DE PREÇOS E RESERVA DIRETA
-- Execute este arquivo no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. Tabela de Preços dos Parceiros
-- =====================================================
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

DROP TRIGGER IF EXISTS trigger_update_partner_pricing_updated_at ON public.partner_pricing;
CREATE TRIGGER trigger_update_partner_pricing_updated_at
BEFORE UPDATE ON public.partner_pricing
FOR EACH ROW
EXECUTE FUNCTION update_partner_pricing_updated_at();

-- RLS
ALTER TABLE public.partner_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can view their own pricing" ON public.partner_pricing;
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

DROP POLICY IF EXISTS "Partners can manage their own pricing" ON public.partner_pricing;
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

DROP POLICY IF EXISTS "Authenticated users can view active pricing" ON public.partner_pricing;
CREATE POLICY "Authenticated users can view active pricing"
ON public.partner_pricing
FOR SELECT
USING (
  is_active = true
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admins can view all pricing" ON public.partner_pricing;
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

-- =====================================================
-- 2. Tabela de Disponibilidade (Opcional - para futuro)
-- =====================================================
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

DROP TRIGGER IF EXISTS trigger_update_partner_availability_updated_at ON public.partner_availability;
CREATE TRIGGER trigger_update_partner_availability_updated_at
BEFORE UPDATE ON public.partner_availability
FOR EACH ROW
EXECUTE FUNCTION update_partner_availability_updated_at();

-- RLS
ALTER TABLE public.partner_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can manage their availability" ON public.partner_availability;
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

DROP POLICY IF EXISTS "Authenticated users can view availability" ON public.partner_availability;
CREATE POLICY "Authenticated users can view availability"
ON public.partner_availability
FOR SELECT
USING (
  available = true
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admins can view all availability" ON public.partner_availability;
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

-- =====================================================
-- FIM DAS MIGRATIONS
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 
  'partner_pricing' as tabela,
  COUNT(*) as registros
FROM public.partner_pricing
UNION ALL
SELECT 
  'partner_availability' as tabela,
  COUNT(*) as registros
FROM public.partner_availability;
