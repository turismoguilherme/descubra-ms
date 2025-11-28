-- Tabela de memória do usuário para Machine Learning do Guatá
-- Armazena preferências, interações e dados de aprendizado

CREATE TABLE IF NOT EXISTS public.guata_user_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  session_id TEXT NOT NULL,
  memory_type TEXT NOT NULL, -- 'learning_data', 'user_preferences', 'feedback', etc.
  memory_key TEXT NOT NULL, -- Chave única para identificar o tipo de memória
  memory_value JSONB, -- Dados da memória em formato JSON
  expires_at TIMESTAMPTZ, -- Data de expiração (opcional)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, session_id, memory_type, memory_key)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS guata_user_memory_user_id_idx ON public.guata_user_memory(user_id);
CREATE INDEX IF NOT EXISTS guata_user_memory_session_id_idx ON public.guata_user_memory(session_id);
CREATE INDEX IF NOT EXISTS guata_user_memory_memory_type_idx ON public.guata_user_memory(memory_type);
CREATE INDEX IF NOT EXISTS guata_user_memory_expires_at_idx ON public.guata_user_memory(expires_at);
CREATE INDEX IF NOT EXISTS guata_user_memory_created_at_idx ON public.guata_user_memory(created_at DESC);

-- Comentários para documentação
COMMENT ON TABLE public.guata_user_memory IS 'Armazena memórias e dados de aprendizado do Guatá para personalização e ML';
COMMENT ON COLUMN public.guata_user_memory.memory_type IS 'Tipo de memória: learning_data, user_preferences, feedback, pattern, etc.';
COMMENT ON COLUMN public.guata_user_memory.memory_key IS 'Chave única para identificar o tipo específico de memória';
COMMENT ON COLUMN public.guata_user_memory.memory_value IS 'Dados da memória em formato JSON flexível';

