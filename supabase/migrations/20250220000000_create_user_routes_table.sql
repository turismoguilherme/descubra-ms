-- Migration: Criar tabela para salvar roteiros personalizados gerados
-- Data: 2025-02-20
-- Descrição: Armazena roteiros gerados pelos usuários para histórico e reutilização

CREATE TABLE IF NOT EXISTS public.user_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados de entrada do roteiro
  input_data JSONB NOT NULL, -- cidade, duracao, interesses, etc.
  
  -- Roteiro gerado
  route_data JSONB NOT NULL, -- roteiro completo gerado pela IA
  
  -- Metadados
  title TEXT, -- Título personalizado do roteiro
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  
  -- Estatísticas
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_routes_user_id ON public.user_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_routes_created_at ON public.user_routes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_routes_is_favorite ON public.user_routes(user_id, is_favorite) WHERE is_favorite = true;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_routes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_routes_updated_at
  BEFORE UPDATE ON public.user_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_user_routes_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.user_routes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own routes"
  ON public.user_routes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own routes"
  ON public.user_routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes"
  ON public.user_routes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes"
  ON public.user_routes FOR DELETE
  USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE public.user_routes IS 'Roteiros personalizados gerados pelos usuários';
COMMENT ON COLUMN public.user_routes.input_data IS 'Dados de entrada usados para gerar o roteiro (cidade, duracao, interesses, etc.)';
COMMENT ON COLUMN public.user_routes.route_data IS 'Roteiro completo gerado pela IA (dias, atividades, parceiros, etc.)';
COMMENT ON COLUMN public.user_routes.title IS 'Título personalizado dado pelo usuário ao roteiro';













