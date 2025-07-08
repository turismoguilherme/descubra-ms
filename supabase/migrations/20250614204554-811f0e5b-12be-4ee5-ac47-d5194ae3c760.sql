
-- Criar tabela de perfis de usuário se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verificar se as tabelas mencionadas nos erros existem e habilitar RLS
DO $$
BEGIN
  -- Verificar e habilitar RLS para destinos se a tabela existir
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'destinations') THEN
    ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
    
    -- Política para permitir leitura pública dos destinos
    DROP POLICY IF EXISTS "Public read access for destinations" ON public.destinations;
    CREATE POLICY "Public read access for destinations" ON public.destinations
      FOR SELECT USING (true);
      
    -- Política para permitir edição apenas para usuários autenticados
    DROP POLICY IF EXISTS "Authenticated users can modify destinations" ON public.destinations;
    CREATE POLICY "Authenticated users can modify destinations" ON public.destinations
      FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;

  -- Verificar e habilitar RLS para eventos se a tabela existir
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    
    -- Política para permitir leitura pública dos eventos
    DROP POLICY IF EXISTS "Public read access for events" ON public.events;
    CREATE POLICY "Public read access for events" ON public.events
      FOR SELECT USING (true);
      
    -- Política para permitir edição apenas para usuários autenticados
    DROP POLICY IF EXISTS "Authenticated users can modify events" ON public.events;
    CREATE POLICY "Authenticated users can modify events" ON public.events
      FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;

  -- Verificar e habilitar RLS para locais_publicos se a tabela existir
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'locais_publicos') THEN
    ALTER TABLE public.locais_publicos ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Public read access for locais_publicos" ON public.locais_publicos;
    CREATE POLICY "Public read access for locais_publicos" ON public.locais_publicos
      FOR SELECT USING (true);
      
    DROP POLICY IF EXISTS "Authenticated users can modify locais_publicos" ON public.locais_publicos;
    CREATE POLICY "Authenticated users can modify locais_publicos" ON public.locais_publicos
      FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;

  -- Verificar e habilitar RLS para rotas se a tabela existir  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rotas') THEN
    ALTER TABLE public.rotas ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Public read access for rotas" ON public.rotas;
    CREATE POLICY "Public read access for rotas" ON public.rotas
      FOR SELECT USING (true);
      
    DROP POLICY IF EXISTS "Authenticated users can modify rotas" ON public.rotas;
    CREATE POLICY "Authenticated users can modify rotas" ON public.rotas
      FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;
