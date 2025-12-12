-- Migration: Criar tabela site_settings
-- Descrição: Armazena configurações do site como footer, contatos, redes sociais
-- Data: 2025-02-10

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('ms', 'viajar')),
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Garantir que não há duplicatas de platform + setting_key
  UNIQUE(platform, setting_key)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_site_settings_platform ON site_settings(platform);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);

-- Comentários
COMMENT ON TABLE site_settings IS 'Configurações do site por plataforma (footer, contatos, redes sociais, etc)';
COMMENT ON COLUMN site_settings.platform IS 'Plataforma: ms (Descubra MS) ou viajar (ViaJAR)';
COMMENT ON COLUMN site_settings.setting_key IS 'Chave da configuração (ex: footer, contact, social_media)';
COMMENT ON COLUMN site_settings.setting_value IS 'Valor da configuração em formato JSON';

-- Habilitar RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler (público)
DROP POLICY IF EXISTS "Site settings are publicly readable" ON site_settings;
CREATE POLICY "Site settings are publicly readable"
ON site_settings
FOR SELECT
TO public
USING (true);

-- Política: Apenas admins podem inserir/atualizar/deletar
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
CREATE POLICY "Admins can manage site settings"
ON site_settings
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'tech')
  )
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_site_settings_updated_at ON site_settings;
CREATE TRIGGER trigger_update_site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION update_site_settings_updated_at();

