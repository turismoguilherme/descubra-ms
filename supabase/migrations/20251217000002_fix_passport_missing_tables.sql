-- Migration: Corrigir tabelas faltantes do Passaporte Digital
-- Data: 2025-12-17
-- Descrição: Garante que stamp_themes e coluna partner_code existam

-- ============================================
-- 1. CRIAR TABELA stamp_themes SE NÃO EXISTIR
-- ============================================

CREATE TABLE IF NOT EXISTS stamp_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_key VARCHAR(50) UNIQUE NOT NULL,
  theme_name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  color_primary VARCHAR(20),
  color_secondary VARCHAR(20),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir temas padrão se não existirem
INSERT INTO stamp_themes (theme_key, theme_name, emoji, color_primary, color_secondary, description) VALUES
  ('onca', 'Onça-Pintada', '🐆', '#8B4513', '#D2691E', 'Tema inspirado na onça-pintada, símbolo do Pantanal'),
  ('tuiuiu', 'Tuiuiú', '🦅', '#4169E1', '#87CEEB', 'Tema inspirado no tuiuiú, ave símbolo do Pantanal'),
  ('jacare', 'Jacaré', '🐊', '#228B22', '#32CD32', 'Tema inspirado no jacaré, réptil característico do Pantanal'),
  ('arara', 'Arara-Azul', '🦜', '#0000FF', '#00BFFF', 'Tema inspirado na arara-azul, ave ameaçada de extinção')
ON CONFLICT (theme_key) DO NOTHING;

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_stamp_themes_active ON stamp_themes(is_active);

-- RLS para stamp_themes
ALTER TABLE stamp_themes ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Anyone can view active stamp themes" ON stamp_themes;
DROP POLICY IF EXISTS "Admins can manage stamp themes" ON stamp_themes;

-- Criar políticas RLS
CREATE POLICY "Anyone can view active stamp themes" ON stamp_themes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage stamp themes" ON stamp_themes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'tech')
    )
  );

-- Trigger para updated_at (verificar se função existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column'
  ) THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS update_stamp_themes_updated_at ON stamp_themes;
CREATE TRIGGER update_stamp_themes_updated_at
  BEFORE UPDATE ON stamp_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. ADICIONAR COLUNA partner_code SE NÃO EXISTIR
-- ============================================

ALTER TABLE route_checkpoints 
ADD COLUMN IF NOT EXISTS partner_code VARCHAR(20);

COMMENT ON COLUMN route_checkpoints.partner_code IS 'Código curto informado pelo parceiro para validação de check-in';

-- ============================================
-- 3. GARANTIR OUTRAS COLUNAS NECESSÁRIAS
-- ============================================

ALTER TABLE route_checkpoints 
ADD COLUMN IF NOT EXISTS stamp_fragment_number INTEGER,
ADD COLUMN IF NOT EXISTS geofence_radius INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS requires_photo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS validation_mode VARCHAR(20) DEFAULT 'geofence';

COMMENT ON COLUMN route_checkpoints.stamp_fragment_number IS 'Número do fragmento do carimbo (1, 2, 3...)';
COMMENT ON COLUMN route_checkpoints.geofence_radius IS 'Raio de validação geográfica em metros';
COMMENT ON COLUMN route_checkpoints.requires_photo IS 'Se foto é obrigatória para check-in';
COMMENT ON COLUMN route_checkpoints.validation_mode IS 'Modo de validação: geofence, code, mixed';
