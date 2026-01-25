-- Adicionar campo return_domain na tabela events
-- Este campo armazena o domínio de origem quando o evento é criado
-- Permite redirecionar o usuário para o domínio correto após pagamento

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS return_domain TEXT;

COMMENT ON COLUMN public.events.return_domain IS 'Domínio de origem quando o evento foi criado (ex: https://descubrams.com ou https://viajartur.com). Usado para redirecionar após pagamento.';

