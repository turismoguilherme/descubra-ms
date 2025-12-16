-- Migration: Melhorias no Passaporte Digital
-- Adiciona wallpaper por rota e expande temas de carimbos
-- Data: 2025-02-15

-- Adicionar campo de wallpaper/background por rota
ALTER TABLE routes 
ADD COLUMN IF NOT EXISTS wallpaper_url TEXT,
ADD COLUMN IF NOT EXISTS wallpaper_style JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN routes.wallpaper_url IS 'URL da imagem de fundo/papel de parede para esta rota';
COMMENT ON COLUMN routes.wallpaper_style IS 'Estilo do wallpaper (opacity, blend-mode, etc) em JSON';

-- Criar tabela para temas de carimbos customizados
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

-- Inserir temas padrão
INSERT INTO stamp_themes (theme_key, theme_name, emoji, color_primary, color_secondary, description) VALUES
  ('onca', 'Onça-Pintada', '🐆', '#8B4513', '#D2691E', 'Tema inspirado na onça-pintada, símbolo do Pantanal'),
  ('tuiuiu', 'Tuiuiú', '🦅', '#4169E1', '#87CEEB', 'Tema inspirado no tuiuiú, ave símbolo do Pantanal'),
  ('jacare', 'Jacaré', '🐊', '#228B22', '#32CD32', 'Tema inspirado no jacaré, réptil característico do Pantanal'),
  ('arara', 'Arara-Azul', '🦜', '#0000FF', '#00BFFF', 'Tema inspirado na arara-azul, ave ameaçada de extinção')
ON CONFLICT (theme_key) DO NOTHING;

-- Expandir constraint de stamp_theme para aceitar qualquer tema da tabela stamp_themes
-- Primeiro, remover a constraint antiga
ALTER TABLE passport_configurations 
DROP CONSTRAINT IF EXISTS passport_configurations_stamp_theme_check;

-- Criar nova constraint que permite temas da tabela stamp_themes OU os antigos
ALTER TABLE passport_configurations
ALTER COLUMN stamp_theme TYPE VARCHAR(50);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_stamp_themes_active ON stamp_themes(is_active);

-- RLS para stamp_themes
ALTER TABLE stamp_themes ENABLE ROW LEVEL SECURITY;

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

-- Trigger para updated_at
CREATE TRIGGER update_stamp_themes_updated_at
  BEFORE UPDATE ON stamp_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


