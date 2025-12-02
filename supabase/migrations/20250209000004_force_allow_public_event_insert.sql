-- FORÇAR permissão de INSERT público para eventos
-- Esta migration remove TODAS as políticas e cria uma política muito simples
-- Data: 2025-02-09

-- PRIMEIRO: Listar todas as políticas existentes para debug
DO $$
DECLARE
  pol record;
BEGIN
  RAISE NOTICE '=== POLÍTICAS EXISTENTES NA TABELA events ===';
  FOR pol IN 
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies 
    WHERE tablename = 'events' AND schemaname = 'public'
  LOOP
    RAISE NOTICE 'Política: % | Comando: % | Roles: %', pol.policyname, pol.cmd, pol.roles;
  END LOOP;
END $$;

-- REMOVER TODAS as políticas de INSERT (não importa o nome)
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'events' 
    AND schemaname = 'public'
    AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.events', pol.policyname);
    RAISE NOTICE 'Política removida: %', pol.policyname;
  END LOOP;
END $$;

-- Garantir que RLS está habilitado
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Criar política MUITO SIMPLES que permite INSERT para qualquer um
-- SEM validações restritivas
CREATE POLICY "Allow public event insert - simple"
ON public.events
FOR INSERT
TO public
WITH CHECK (true);  -- Permite qualquer INSERT

-- Verificar se a política foi criada
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'events' 
    AND schemaname = 'public'
    AND policyname = 'Allow public event insert - simple'
  ) THEN
    RAISE NOTICE '✅ Política criada com sucesso!';
  ELSE
    RAISE EXCEPTION '❌ Erro: Política não foi criada';
  END IF;
END $$;

-- Garantir política de leitura
DROP POLICY IF EXISTS "Events are publicly readable" ON public.events;
DROP POLICY IF EXISTS "Permitir leitura pública de eventos" ON public.events;

CREATE POLICY "Events are publicly readable"
ON public.events
FOR SELECT
TO public
USING (true);  -- Permite leitura de todos os eventos

RAISE NOTICE '✅ Migration concluída com sucesso!';

