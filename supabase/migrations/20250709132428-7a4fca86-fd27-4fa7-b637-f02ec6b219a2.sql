-- Adicionar campos faltantes na tabela user_profiles para completar o perfil do usuário
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS sexuality_identity TEXT,
ADD COLUMN IF NOT EXISTS accessibility_preference TEXT DEFAULT 'nenhuma',
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS travel_organization TEXT,
ADD COLUMN IF NOT EXISTS custom_travel_organization TEXT,
ADD COLUMN IF NOT EXISTS stay_duration TEXT,
ADD COLUMN IF NOT EXISTS travel_motives TEXT[],
ADD COLUMN IF NOT EXISTS other_motive TEXT,
ADD COLUMN IF NOT EXISTS residence_city TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS custom_neighborhood TEXT,
ADD COLUMN IF NOT EXISTS time_in_city TEXT,
ADD COLUMN IF NOT EXISTS wants_to_collaborate BOOLEAN DEFAULT false;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON public.user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_country ON public.user_profiles(country);
CREATE INDEX IF NOT EXISTS idx_user_profiles_state ON public.user_profiles(state);
CREATE INDEX IF NOT EXISTS idx_user_profiles_residence_city ON public.user_profiles(residence_city);

-- Adicionar constraint única para user_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_user_profiles_user_id' 
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD CONSTRAINT unique_user_profiles_user_id UNIQUE (user_id);
  END IF;
END $$;