
-- Criar todas as tabelas faltantes para restauração completa

-- 1. Tabela user_profiles (necessária para hooks)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Tabela user_benefits (necessária para useDigitalPassport)
CREATE TABLE IF NOT EXISTS public.user_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  benefit_type TEXT NOT NULL,
  benefit_name TEXT NOT NULL,
  description TEXT,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Adicionar campos faltantes nas tabelas existentes
ALTER TABLE public.institutional_partners 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- 4. Habilitar RLS nas novas tabelas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_benefits ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.user_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own benefits" 
  ON public.user_benefits 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own benefits" 
  ON public.user_benefits 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert benefits" 
  ON public.user_benefits 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_benefits_user_id ON public.user_benefits(user_id);
CREATE INDEX IF NOT EXISTS idx_institutional_partners_status ON public.institutional_partners(status);
CREATE INDEX IF NOT EXISTS idx_municipal_collaborators_city ON public.municipal_collaborators(city);
CREATE INDEX IF NOT EXISTS idx_municipal_collaborators_role ON public.municipal_collaborators(role);
