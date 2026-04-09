-- Moderação de eventos: origem da decisão e timestamp (evita depender só de tabelas separadas)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS moderation_decision_source text;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS moderated_at timestamptz;

COMMENT ON COLUMN public.events.moderation_decision_source IS
  'Última decisão de moderação: system (automático via Edge Function) ou admin (manual no painel).';

COMMENT ON COLUMN public.events.moderated_at IS
  'Data/hora da última decisão de moderação (aprovação ou rejeição).';

-- Valores esperados: system | admin (sem CHECK rígido para compatibilidade com dados legados)
