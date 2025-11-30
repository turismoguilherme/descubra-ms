-- Migration: Adicionar campos de monetização/patrocínio para eventos
-- Data: 2025-05-30

-- Campos de patrocínio/destaque pago
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT false;

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS sponsor_tier TEXT DEFAULT 'destaque';

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS sponsor_start_date DATE;

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS sponsor_end_date DATE;

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS sponsor_amount DECIMAL(10,2);

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS sponsor_payment_status TEXT DEFAULT 'pending' CHECK (sponsor_payment_status IN ('pending', 'paid', 'expired', 'cancelled'));

-- Campos adicionais do organizador
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS organizador_nome TEXT;

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS organizador_email TEXT;

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS organizador_telefone TEXT;

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS organizador_empresa TEXT;

-- Galeria de imagens (array)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS galeria_imagens TEXT[] DEFAULT '{}';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_events_is_sponsored ON public.events(is_sponsored);
CREATE INDEX IF NOT EXISTS idx_events_sponsor_tier ON public.events(sponsor_tier);
CREATE INDEX IF NOT EXISTS idx_events_sponsor_payment_status ON public.events(sponsor_payment_status);

-- Comentários
COMMENT ON COLUMN public.events.is_sponsored IS 'Indica se o evento é patrocinado/pago para destaque';
COMMENT ON COLUMN public.events.sponsor_tier IS 'Nível do patrocínio: destaque, premium ou patrocinado';
COMMENT ON COLUMN public.events.sponsor_amount IS 'Valor pago pelo patrocínio';
COMMENT ON COLUMN public.events.sponsor_payment_status IS 'Status do pagamento: pending, paid, expired, cancelled';

