-- Migration: Criar tabela para membros da equipe (página Sobre)
-- Description: Tabela para gerenciar membros da equipe que aparecem na página Sobre da ViajARTur

CREATE TABLE IF NOT EXISTS viajar_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informações básicas
  name TEXT NOT NULL,
  position TEXT NOT NULL, -- Cargo/Posição
  bio TEXT, -- Biografia curta (2-3 linhas)
  
  -- Foto
  photo_url TEXT,
  
  -- Redes sociais
  instagram_url TEXT,
  linkedin_url TEXT,
  
  -- Ordenação e status
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_viajar_team_members_active ON viajar_team_members(is_active, display_order);

-- RLS (Row Level Security)
ALTER TABLE viajar_team_members ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler membros ativos
CREATE POLICY "Anyone can view active team members"
  ON viajar_team_members
  FOR SELECT
  USING (is_active = true);

-- Política: Apenas admins podem gerenciar
CREATE POLICY "Admins can manage team members"
  ON viajar_team_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.raw_user_meta_data->>'role' = 'master_admin'
        OR auth.users.raw_user_meta_data->>'role' = 'tech'
        OR auth.users.raw_user_meta_data->>'role' = 'master admin'
        OR auth.users.raw_user_meta_data->>'role' = 'tech admin'
      )
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_viajar_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_viajar_team_members_updated_at
  BEFORE UPDATE ON viajar_team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_viajar_team_members_updated_at();

