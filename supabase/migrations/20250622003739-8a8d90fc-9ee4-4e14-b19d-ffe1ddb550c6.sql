
-- Corrigir o erro da migração anterior
-- Primeiro, vamos remover o valor padrão da coluna category, depois alterar o tipo, e recriar o padrão

-- 1. Verificar se o tipo já existe antes de criar
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_category') THEN
        CREATE TYPE partner_category AS ENUM ('local', 'regional', 'estadual');
    END IF;
END $$;

-- 2. Alterar tabela institutional_partners de forma segura
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'institutional_partners' 
               AND column_name = 'category' 
               AND data_type = 'text') THEN
        -- Remover o valor padrão primeiro
        ALTER TABLE public.institutional_partners ALTER COLUMN category DROP DEFAULT;
        -- Alterar o tipo
        ALTER TABLE public.institutional_partners 
        ALTER COLUMN category TYPE partner_category USING category::partner_category;
        -- Recriar o valor padrão
        ALTER TABLE public.institutional_partners ALTER COLUMN category SET DEFAULT 'local'::partner_category;
    END IF;
END $$;

-- 3. Criar as tabelas faltantes apenas se não existirem
CREATE TABLE IF NOT EXISTS public.route_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.tourist_routes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  required_time_minutes INTEGER DEFAULT 10,
  promotional_text TEXT,
  validation_radius_meters INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_route_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES public.tourist_routes(id) ON DELETE CASCADE,
  checkpoint_id UUID REFERENCES public.route_checkpoints(id) ON DELETE CASCADE,
  checkin_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  latitude NUMERIC,
  longitude NUMERIC,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_id UUID REFERENCES public.tourist_routes(id) ON DELETE CASCADE,
  city_id UUID REFERENCES public.region_cities(id) ON DELETE CASCADE,
  region_id UUID REFERENCES public.tourist_regions(id) ON DELETE CASCADE,
  stamp_name TEXT NOT NULL,
  stamp_icon_url TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completion_percentage INTEGER DEFAULT 100,
  cultural_phrase TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Habilitar RLS (apenas se as tabelas foram criadas)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'route_checkpoints') THEN
        ALTER TABLE public.route_checkpoints ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_route_checkins') THEN
        ALTER TABLE public.user_route_checkins ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_stamps') THEN
        ALTER TABLE public.user_stamps ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 5. Criar políticas apenas se não existirem
DO $$
BEGIN
    -- Políticas para route_checkpoints
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view route checkpoints') THEN
        CREATE POLICY "Anyone can view route checkpoints" 
          ON public.route_checkpoints 
          FOR SELECT 
          TO public 
          USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can manage route checkpoints') THEN
        CREATE POLICY "Authenticated users can manage route checkpoints" 
          ON public.route_checkpoints 
          FOR ALL 
          TO authenticated 
          USING (true);
    END IF;
    
    -- Políticas para user_route_checkins
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own checkins') THEN
        CREATE POLICY "Users can view their own checkins" 
          ON public.user_route_checkins 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create their own checkins') THEN
        CREATE POLICY "Users can create their own checkins" 
          ON public.user_route_checkins 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own checkins') THEN
        CREATE POLICY "Users can update their own checkins" 
          ON public.user_route_checkins 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    -- Políticas para user_stamps
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own stamps') THEN
        CREATE POLICY "Users can view their own stamps" 
          ON public.user_stamps 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create their own stamps') THEN
        CREATE POLICY "Users can create their own stamps" 
          ON public.user_stamps 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own stamps') THEN
        CREATE POLICY "Users can update their own stamps" 
          ON public.user_stamps 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_route_checkpoints_route_id ON public.route_checkpoints(route_id);
CREATE INDEX IF NOT EXISTS idx_user_route_checkins_user_id ON public.user_route_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_route_checkins_route_id ON public.user_route_checkins(route_id);
CREATE INDEX IF NOT EXISTS idx_user_stamps_user_id ON public.user_stamps(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stamps_route_id ON public.user_stamps(route_id);
