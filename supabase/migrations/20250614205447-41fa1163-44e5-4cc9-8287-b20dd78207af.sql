
-- Habilitar RLS e criar políticas para as tabelas que estão com problemas

-- Para locais_publicos (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'locais_publicos') THEN
    ALTER TABLE public.locais_publicos ENABLE ROW LEVEL SECURITY;
    
    -- Política para permitir leitura pública
    DROP POLICY IF EXISTS "Public read access for locais_publicos" ON public.locais_publicos;
    CREATE POLICY "Public read access for locais_publicos" ON public.locais_publicos
      FOR SELECT USING (true);
      
    -- Política para permitir edição apenas para usuários autenticados
    DROP POLICY IF EXISTS "Authenticated users can modify locais_publicos" ON public.locais_publicos;
    CREATE POLICY "Authenticated users can modify locais_publicos" ON public.locais_publicos
      FOR ALL USING (auth.uid() IS NOT NULL);
  ELSE
    -- Criar a tabela se não existir
    CREATE TABLE public.locais_publicos (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      description text,
      latitude numeric,
      longitude numeric,
      address text,
      city text,
      category text,
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now()
    );
    
    ALTER TABLE public.locais_publicos ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Public read access for locais_publicos" ON public.locais_publicos
      FOR SELECT USING (true);
      
    CREATE POLICY "Authenticated users can modify locais_publicos" ON public.locais_publicos
      FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;

-- Para destinos de rota pública (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'destinos_de_rota_publica') THEN
    ALTER TABLE public.destinos_de_rota_publica ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Public read access for destinos_de_rota_publica" ON public.destinos_de_rota_publica;
    CREATE POLICY "Public read access for destinos_de_rota_publica" ON public.destinos_de_rota_publica
      FOR SELECT USING (true);
      
    DROP POLICY IF EXISTS "Authenticated users can modify destinos_de_rota_publica" ON public.destinos_de_rota_publica;
    CREATE POLICY "Authenticated users can modify destinos_de_rota_publica" ON public.destinos_de_rota_publica
      FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;

-- Para rotas públicas (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rotas_publicas') THEN
    ALTER TABLE public.rotas_publicas ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Public read access for rotas_publicas" ON public.rotas_publicas;
    CREATE POLICY "Public read access for rotas_publicas" ON public.rotas_publicas
      FOR SELECT USING (true);
      
    DROP POLICY IF EXISTS "Authenticated users can modify rotas_publicas" ON public.rotas_publicas;
    CREATE POLICY "Authenticated users can modify rotas_publicas" ON public.rotas_publicas
      FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;

-- Verificar todas as tabelas existentes e habilitar RLS onde necessário
DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- Percorrer todas as tabelas do schema public
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('profiles', 'destinations', 'events') -- Excluir tabelas já configuradas
    LOOP
        -- Verificar se RLS está desabilitado
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE c.relname = table_record.tablename
            AND n.nspname = 'public'
            AND c.relrowsecurity = true
        ) THEN
            -- Habilitar RLS
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
            
            -- Criar política de leitura pública básica
            EXECUTE format('
                CREATE POLICY "Public read access for %I" ON public.%I
                FOR SELECT USING (true)
            ', table_record.tablename, table_record.tablename);
            
            -- Criar política de modificação para usuários autenticados
            EXECUTE format('
                CREATE POLICY "Authenticated users can modify %I" ON public.%I
                FOR ALL USING (auth.uid() IS NOT NULL)
            ', table_record.tablename, table_record.tablename);
        END IF;
    END LOOP;
END
$$;
