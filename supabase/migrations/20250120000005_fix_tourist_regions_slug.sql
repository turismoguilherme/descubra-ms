-- Migration: Corrigir coluna slug na tabela tourist_regions
-- Data: 2025-01-20
-- Descrição: Adiciona a coluna slug se ela não existir

-- Verificar se a tabela existe e adicionar coluna slug se não existir
DO $$ 
BEGIN
  -- Se a tabela não existe, criar completa
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tourist_regions') THEN
    CREATE TABLE tourist_regions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      color_hover TEXT,
      description TEXT NOT NULL,
      cities JSONB NOT NULL DEFAULT '[]'::jsonb,
      highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
      image_url TEXT,
      order_index INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
    );
  ELSE
    -- Se a tabela existe, adicionar coluna slug se não existir
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tourist_regions' AND column_name = 'slug'
    ) THEN
      ALTER TABLE tourist_regions ADD COLUMN slug TEXT;
      
      -- Gerar slugs baseados nos nomes existentes
      UPDATE tourist_regions 
      SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
      WHERE slug IS NULL;
      
      -- Tornar slug NOT NULL e UNIQUE após popular
      ALTER TABLE tourist_regions 
        ALTER COLUMN slug SET NOT NULL,
        ADD CONSTRAINT tourist_regions_slug_unique UNIQUE (slug);
    END IF;
    
    -- Adicionar outras colunas que possam estar faltando
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tourist_regions' AND column_name = 'color_hover'
    ) THEN
      ALTER TABLE tourist_regions ADD COLUMN color_hover TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tourist_regions' AND column_name = 'cities'
    ) THEN
      ALTER TABLE tourist_regions ADD COLUMN cities JSONB NOT NULL DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tourist_regions' AND column_name = 'highlights'
    ) THEN
      ALTER TABLE tourist_regions ADD COLUMN highlights JSONB NOT NULL DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tourist_regions' AND column_name = 'image_url'
    ) THEN
      ALTER TABLE tourist_regions ADD COLUMN image_url TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tourist_regions' AND column_name = 'order_index'
    ) THEN
      ALTER TABLE tourist_regions ADD COLUMN order_index INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tourist_regions' AND column_name = 'is_active'
    ) THEN
      ALTER TABLE tourist_regions ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tourist_regions' AND column_name = 'updated_by'
    ) THEN
      ALTER TABLE tourist_regions ADD COLUMN updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_tourist_regions_slug ON tourist_regions(slug);
CREATE INDEX IF NOT EXISTS idx_tourist_regions_is_active ON tourist_regions(is_active);
CREATE INDEX IF NOT EXISTS idx_tourist_regions_order_index ON tourist_regions(order_index);

-- Criar trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_tourist_regions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_tourist_regions_updated_at ON tourist_regions;
CREATE TRIGGER trigger_update_tourist_regions_updated_at
  BEFORE UPDATE ON tourist_regions
  FOR EACH ROW
  EXECUTE FUNCTION update_tourist_regions_updated_at();

-- Habilitar RLS se não estiver habilitado
ALTER TABLE tourist_regions ENABLE ROW LEVEL SECURITY;

-- Criar políticas se não existirem
DROP POLICY IF EXISTS "tourist_regions_select_active" ON tourist_regions;
CREATE POLICY "tourist_regions_select_active" ON tourist_regions
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "tourist_regions_select_all_admin" ON tourist_regions;
CREATE POLICY "tourist_regions_select_all_admin" ON tourist_regions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'tech', 'master_admin')
    )
  );

DROP POLICY IF EXISTS "tourist_regions_modify_admin" ON tourist_regions;
CREATE POLICY "tourist_regions_modify_admin" ON tourist_regions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'tech', 'master_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'tech', 'master_admin')
    )
  );

