-- Migration: Fix Pantanal Avatars ID Default
-- Description: Garantir que o ID seja gerado automaticamente

-- Verificar se a tabela existe e corrigir o DEFAULT se necessário
DO $$
BEGIN
  -- Se a tabela existe mas o DEFAULT não está funcionando, recriar a coluna
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pantanal_avatars') THEN
    -- Garantir que o DEFAULT está correto
    ALTER TABLE pantanal_avatars 
    ALTER COLUMN id SET DEFAULT gen_random_uuid();
    
    -- Se a coluna não permite NULL mas não tem DEFAULT, adicionar
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'pantanal_avatars' 
      AND column_name = 'id' 
      AND column_default IS NOT NULL
    ) THEN
      ALTER TABLE pantanal_avatars 
      ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
  END IF;
END $$;

-- Garantir que a extensão uuid está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
