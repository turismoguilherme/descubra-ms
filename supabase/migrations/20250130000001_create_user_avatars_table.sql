-- Criar tabela para avatares desbloqueados pelos usuários
CREATE TABLE IF NOT EXISTS user_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_id UUID NOT NULL REFERENCES pantanal_avatars(id) ON DELETE CASCADE,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL, -- rota que deu a recompensa
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Impedir que usuário tenha o mesmo avatar duplicado
  UNIQUE(user_id, avatar_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_avatars_user_id ON user_avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_user_avatars_avatar_id ON user_avatars(avatar_id);
CREATE INDEX IF NOT EXISTS idx_user_avatars_route_id ON user_avatars(route_id);

-- Habilitar RLS
ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view their own avatars" ON user_avatars
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own avatars" ON user_avatars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gatilho para updated_at
CREATE OR REPLACE FUNCTION update_user_avatars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_avatars_updated_at
  BEFORE UPDATE ON user_avatars
  FOR EACH ROW EXECUTE FUNCTION update_user_avatars_updated_at();
