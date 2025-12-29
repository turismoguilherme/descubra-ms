-- =====================================================
-- CRIAR TABELA DE POLÍTICAS DE CANCELAMENTO
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Tabela para políticas de cancelamento (padrão da plataforma + personalizadas por parceiro)
CREATE TABLE IF NOT EXISTS public.partner_cancellation_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.institutional_partners(id) ON DELETE CASCADE,
  -- Se partner_id for NULL, é a política padrão da plataforma
  name TEXT NOT NULL DEFAULT 'Política Padrão',
  description TEXT,
  -- Política: dias antes da reserva -> percentual de reembolso
  days_before_7_refund_percent NUMERIC(5,2) NOT NULL DEFAULT 100.00, -- 7+ dias: 100%
  days_before_1_2_refund_percent NUMERIC(5,2) NOT NULL DEFAULT 50.00,  -- 1-2 dias: 50%
  days_before_0_refund_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,     -- 0 dias ou após: 0%
  is_default BOOLEAN NOT NULL DEFAULT false, -- true apenas para política padrão (partner_id = NULL)
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  -- Garantir apenas uma política padrão
  CONSTRAINT unique_default_policy CHECK (
    (partner_id IS NULL AND is_default = true) OR 
    (partner_id IS NOT NULL)
  )
);

-- Comentários
COMMENT ON TABLE public.partner_cancellation_policies IS 'Políticas de cancelamento e reembolso para reservas de parceiros';
COMMENT ON COLUMN public.partner_cancellation_policies.partner_id IS 'NULL = política padrão da plataforma, UUID = política personalizada do parceiro';
COMMENT ON COLUMN public.partner_cancellation_policies.days_before_7_refund_percent IS 'Reembolso para cancelamentos com 7 ou mais dias de antecedência';
COMMENT ON COLUMN public.partner_cancellation_policies.days_before_1_2_refund_percent IS 'Reembolso para cancelamentos com 1-2 dias de antecedência';
COMMENT ON COLUMN public.partner_cancellation_policies.days_before_0_refund_percent IS 'Reembolso para cancelamentos no dia ou após a data da reserva';

-- Índices
CREATE INDEX IF NOT EXISTS idx_partner_cancellation_policies_partner_id ON public.partner_cancellation_policies(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_cancellation_policies_is_default ON public.partner_cancellation_policies(is_default);
CREATE INDEX IF NOT EXISTS idx_partner_cancellation_policies_is_active ON public.partner_cancellation_policies(is_active);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_partner_cancellation_policies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_partner_cancellation_policies_updated_at ON public.partner_cancellation_policies;
CREATE TRIGGER trigger_update_partner_cancellation_policies_updated_at
BEFORE UPDATE ON public.partner_cancellation_policies
FOR EACH ROW
EXECUTE FUNCTION update_partner_cancellation_policies_updated_at();

-- RLS
ALTER TABLE public.partner_cancellation_policies ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Partners can view their cancellation policies" ON public.partner_cancellation_policies;
DROP POLICY IF EXISTS "Partners can manage their cancellation policies" ON public.partner_cancellation_policies;
DROP POLICY IF EXISTS "Admins can manage all cancellation policies" ON public.partner_cancellation_policies;
DROP POLICY IF EXISTS "Public can view default cancellation policy" ON public.partner_cancellation_policies;

-- Política: Parceiros podem ver suas próprias políticas e a política padrão
CREATE POLICY "Partners can view cancellation policies"
ON public.partner_cancellation_policies
FOR SELECT
USING (
  -- Política padrão (pública)
  (partner_id IS NULL AND is_default = true AND is_active = true)
  OR
  -- Política do próprio parceiro
  (
    partner_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.institutional_partners ip
      WHERE ip.id = partner_cancellation_policies.partner_id
      AND ip.contact_email IS NOT NULL
      AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
    )
  )
  OR
  -- Admins podem ver todas
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'master_admin', 'tech')
  )
);

-- Política: Parceiros podem criar/atualizar suas próprias políticas
CREATE POLICY "Partners can manage their cancellation policies"
ON public.partner_cancellation_policies
FOR ALL
USING (
  partner_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_cancellation_policies.partner_id
    AND ip.contact_email IS NOT NULL
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
  )
)
WITH CHECK (
  partner_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.institutional_partners ip
    WHERE ip.id = partner_cancellation_policies.partner_id
    AND ip.contact_email IS NOT NULL
    AND LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(COALESCE((auth.jwt() ->> 'email')::TEXT, '')))
  )
);

-- Política: Admins podem gerenciar todas as políticas (incluindo padrão)
CREATE POLICY "Admins can manage all cancellation policies"
ON public.partner_cancellation_policies
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'master_admin', 'tech')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'master_admin', 'tech')
  )
);

-- Inserir política padrão inicial
INSERT INTO public.partner_cancellation_policies (
  partner_id,
  name,
  description,
  days_before_7_refund_percent,
  days_before_1_2_refund_percent,
  days_before_0_refund_percent,
  is_default,
  is_active
)
VALUES (
  NULL,
  'Política Padrão de Cancelamento',
  'Política padrão da plataforma: 100% de reembolso até 7 dias antes, 50% com 1-2 dias, sem reembolso no dia ou após',
  100.00,
  50.00,
  0.00,
  true,
  true
)
ON CONFLICT DO NOTHING;

-- Verificar política criada
SELECT 
  'Política padrão criada' as info,
  id,
  name,
  days_before_7_refund_percent,
  days_before_1_2_refund_percent,
  days_before_0_refund_percent
FROM public.partner_cancellation_policies
WHERE is_default = true AND partner_id IS NULL;


