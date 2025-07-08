
-- Adicionar campos ausentes na tabela user_profiles necessários para o cadastro completo

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS sexuality_identity TEXT,
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS time_in_city TEXT,
  ADD COLUMN IF NOT EXISTS travel_organization TEXT;

-- Opcional: garantir que as colunas já existentes aceitarem nulo, caso algum cadastro anterior não tenha esses campos preenchidos.
