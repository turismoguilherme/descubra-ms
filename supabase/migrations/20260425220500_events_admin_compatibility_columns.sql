-- Garantir compatibilidade do painel admin de eventos com o schema atual.
-- Algumas telas usam campos que podem não existir em alguns ambientes.

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS rejection_reason text;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS sponsor_tier text;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS sponsor_start_date date;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS sponsor_end_date date;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS sponsor_amount numeric(10,2);

COMMENT ON COLUMN public.events.rejection_reason IS 'Motivo da rejeição definido na moderação manual/automática.';
COMMENT ON COLUMN public.events.sponsor_tier IS 'Nível de destaque do evento patrocinado.';
COMMENT ON COLUMN public.events.approved_at IS 'Data/hora em que o evento foi aprovado.';
COMMENT ON COLUMN public.events.approved_by IS 'Usuário admin responsável pela aprovação/rejeição.';
