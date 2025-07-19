-- Criar tabela de preferências de acessibilidade
CREATE TABLE IF NOT EXISTS user_accessibility_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_accessibility_preferences_user_id 
ON user_accessibility_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_user_accessibility_preferences_updated_at 
ON user_accessibility_preferences(updated_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_accessibility_preferences ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias preferências
CREATE POLICY "Users can view own accessibility preferences" ON user_accessibility_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários inserirem suas próprias preferências
CREATE POLICY "Users can insert own accessibility preferences" ON user_accessibility_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias preferências
CREATE POLICY "Users can update own accessibility preferences" ON user_accessibility_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários deletarem suas próprias preferências
CREATE POLICY "Users can delete own accessibility preferences" ON user_accessibility_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_accessibility_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp automaticamente
CREATE TRIGGER update_accessibility_preferences_updated_at
  BEFORE UPDATE ON user_accessibility_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_accessibility_preferences_updated_at();

-- Comentários para documentação
COMMENT ON TABLE user_accessibility_preferences IS 'Preferências de acessibilidade dos usuários';
COMMENT ON COLUMN user_accessibility_preferences.user_id IS 'ID do usuário';
COMMENT ON COLUMN user_accessibility_preferences.preferences IS 'JSON com as preferências de acessibilidade';
COMMENT ON COLUMN user_accessibility_preferences.created_at IS 'Data de criação';
COMMENT ON COLUMN user_accessibility_preferences.updated_at IS 'Data da última atualização'; 