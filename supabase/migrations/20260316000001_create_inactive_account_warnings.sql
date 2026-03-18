-- Tabela para registrar avisos de conta inativa (Descubra MS).
-- Usada pelo job de inatividade: aviso por e-mail e, após prazo, exclusão da conta.
-- Não afeta usuários ViajarTur (viajar_employees) nem admins (user_roles).

CREATE TABLE IF NOT EXISTS public.inactive_account_warnings (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  warned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inactive_account_warnings_warned_at
  ON public.inactive_account_warnings(warned_at);

COMMENT ON TABLE public.inactive_account_warnings IS 'Avisos enviados a usuários inativos do Descubra MS antes da exclusão da conta.';

ALTER TABLE public.inactive_account_warnings ENABLE ROW LEVEL SECURITY;

-- Apenas service_role / backend deve inserir/ler; sem políticas para anon/authenticated.
-- A Edge Function usa SUPABASE_SERVICE_ROLE_KEY para acessar.
