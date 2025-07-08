
-- Adicionar todas as colunas necessárias na tabela user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('turista', 'morador')),
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS sexuality_identity TEXT,
ADD COLUMN IF NOT EXISTS accessibility_preference TEXT DEFAULT 'nenhuma',
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS travel_organization TEXT,
ADD COLUMN IF NOT EXISTS stay_duration TEXT,
ADD COLUMN IF NOT EXISTS travel_motives TEXT[],
ADD COLUMN IF NOT EXISTS other_motive TEXT,
ADD COLUMN IF NOT EXISTS residence_city TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS time_in_city TEXT;

-- Criar índices para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON public.user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Adicionar constraint única para user_id (só se não existir)
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
