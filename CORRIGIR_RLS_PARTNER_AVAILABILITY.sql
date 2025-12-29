-- =====================================================
-- CORRIGIR POLÍTICAS RLS PARA PARTNER_AVAILABILITY
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Este script corrige as políticas RLS para usar auth.jwt() ->> 'email' 
-- em vez de consultar auth.users diretamente

-- 1. Criar tabela se não existir
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

DROP TRIGGER IF EXISTS trigger_update_partner_availability_updated_at ON public.partner_availability;
CREATE TRIGGER trigger_update_partner_availability_updated_at
BEFORE UPDATE ON public.partner_availability
FOR EACH ROW
EXECUTE FUNCTION update_partner_availability_updated_at();

-- 2. Habilitar RLS
ALTER TABLE public.partner_availability ENABLE ROW LEVEL SECURITY;

-- 3. Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "Partners can manage their availability" ON public.partner_availability;
DROP POLICY IF EXISTS "Authenticated users can view availability" ON public.partner_availability;
DROP POLICY IF EXISTS "Admins can view all availability" ON public.partner_availability;

-- 4. Criar política RLS para SELECT
-- Permite que:
-- - Parceiros vejam sua própria disponibilidade
-- - Usuários autenticados vejam disponibilidade ativa
-- - Admins vejam toda disponibilidade
CREATE POLICY "Partners can view their availability"
ON public.partner_availability
FOR SELECT
USING (
  -- Parceiro pode ver sua própria disponibilidade
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_availability.partner_id
    AND ip.contact_email IS NOT NULL
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
  )
  OR
  -- Usuários autenticados podem ver disponibilidade ativa
  (
    available = true
    AND auth.role() = 'authenticated'
  )
  OR
  -- Admins podem ver toda disponibilidade
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'master_admin', 'tech')
  )
);

-- 5. Criar política RLS para INSERT
CREATE POLICY "Partners can insert their availability"
ON public.partner_availability
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_availability.partner_id
    AND ip.contact_email IS NOT NULL
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
  )
);

-- 6. Criar política RLS para UPDATE
CREATE POLICY "Partners can update their availability"
ON public.partner_availability
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_availability.partner_id
    AND ip.contact_email IS NOT NULL
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_availability.partner_id
    AND ip.contact_email IS NOT NULL
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
  )
);

-- 7. Criar política RLS para DELETE
CREATE POLICY "Partners can delete their availability"
ON public.partner_availability
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_availability.partner_id
    AND ip.contact_email IS NOT NULL
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
  )
);

-- 8. Verificar políticas criadas
SELECT 
  'Políticas RLS criadas' as info,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'partner_availability'
ORDER BY cmd, policyname;


