-- Migration: Criar tabela tourist_regions
-- Data: 2025-01-20
-- Descrição: Tabela para armazenar regiões turísticas editáveis pelo admin

CREATE TABLE IF NOT EXISTS tourist_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL, -- Hex color
  color_hover TEXT, -- Hex color para hover
  description TEXT NOT NULL,
  cities JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de strings com nomes das cidades
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de strings com destaques
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tourist_regions_slug ON tourist_regions(slug);
CREATE INDEX IF NOT EXISTS idx_tourist_regions_is_active ON tourist_regions(is_active);
CREATE INDEX IF NOT EXISTS idx_tourist_regions_order_index ON tourist_regions(order_index);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_tourist_regions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tourist_regions_updated_at
  BEFORE UPDATE ON tourist_regions
  FOR EACH ROW
  EXECUTE FUNCTION update_tourist_regions_updated_at();

-- Comentários
COMMENT ON TABLE tourist_regions IS 'Regiões turísticas de Mato Grosso do Sul editáveis pelo admin';
COMMENT ON COLUMN tourist_regions.cities IS 'Array JSON com nomes das cidades da região';
COMMENT ON COLUMN tourist_regions.highlights IS 'Array JSON com destaques da região (ex: "Flutuação", "Pesca esportiva")';
COMMENT ON COLUMN tourist_regions.order_index IS 'Ordem de exibição das regiões (menor = primeiro)';
COMMENT ON COLUMN tourist_regions.is_active IS 'Se a região está ativa e deve aparecer no mapa';

-- RLS Policies
ALTER TABLE tourist_regions ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode ler regiões ativas
CREATE POLICY "tourist_regions_select_active" ON tourist_regions
  FOR SELECT
  USING (is_active = true);

-- Política: Apenas admins podem ler todas as regiões
CREATE POLICY "tourist_regions_select_all_admin" ON tourist_regions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'tech', 'master_admin')
    )
  );

-- Política: Apenas admins podem inserir/atualizar/deletar
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

