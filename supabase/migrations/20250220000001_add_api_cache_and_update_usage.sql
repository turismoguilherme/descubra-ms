-- Adicionar colunas de OpenWeather e Places na tabela api_usage
ALTER TABLE api_usage
ADD COLUMN IF NOT EXISTS openweather_calls INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS google_places_calls INTEGER DEFAULT 0;

-- Criar tabela de cache de APIs (apenas Gemini e Google Search para economizar espaço)
CREATE TABLE IF NOT EXISTS api_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_type TEXT NOT NULL CHECK (api_type IN ('gemini', 'google_search')),
  request_hash TEXT NOT NULL,
  request TEXT NOT NULL,
  response TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  use_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_api_cache_type_hash ON api_cache(api_type, request_hash);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires ON api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_cache_type_expires ON api_cache(api_type, expires_at);

-- RLS (Row Level Security) - Cache é público (compartilhado)
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler (cache compartilhado)
CREATE POLICY "Anyone can read api cache" ON api_cache
  FOR SELECT USING (true);

-- Política: Apenas sistema pode inserir/atualizar
CREATE POLICY "System can manage api cache" ON api_cache
  FOR ALL USING (true); -- Em produção, usar service_role

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_api_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_api_cache_updated_at
  BEFORE UPDATE ON api_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_api_cache_updated_at();

-- Comentários
COMMENT ON TABLE api_cache IS 'Cache compartilhado de respostas de APIs para reduzir custos';
COMMENT ON COLUMN api_cache.api_type IS 'Tipo de API: gemini ou google_search';
COMMENT ON COLUMN api_cache.request_hash IS 'Hash MD5 da requisição normalizada';
COMMENT ON COLUMN api_cache.use_count IS 'Quantas vezes este cache foi usado';

