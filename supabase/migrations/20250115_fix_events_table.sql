-- Corrigir tabela de eventos para o sistema inteligente
-- Data: 2025-01-15

-- Remover tabela existente se houver problemas
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS event_details CASCADE;

-- Criar tabela principal de eventos
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,
  local TEXT,
  cidade TEXT,
  estado TEXT DEFAULT 'Mato Grosso do Sul',
  categoria TEXT,
  tipo_entrada TEXT,
  organizador TEXT,
  fonte TEXT,
  site_oficial TEXT,
  link_inscricao TEXT,
  contato_telefone TEXT,
  contato_email TEXT,
  tags TEXT[],
  imagem_principal TEXT,
  video_promocional TEXT,
  publico_alvo TEXT,
  processado_por_ia BOOLEAN DEFAULT false,
  confiabilidade INTEGER DEFAULT 0,
  ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_events_data_inicio ON events(data_inicio);
CREATE INDEX idx_events_categoria ON events(categoria);
CREATE INDEX idx_events_cidade ON events(cidade);
CREATE INDEX idx_events_external_id ON events(external_id);
CREATE INDEX idx_events_fonte ON events(fonte);

-- Habilitar RLS (Row Level Security)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de eventos" ON events
  FOR SELECT USING (true);

-- Política para permitir inserção/atualização para usuários autenticados
CREATE POLICY "Permitir inserção de eventos para usuários autenticados" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de eventos para usuários autenticados" ON events
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns eventos de exemplo
INSERT INTO events (
  external_id, titulo, descricao, data_inicio, data_fim, 
  local, cidade, categoria, tipo_entrada, organizador, fonte, tags
) VALUES 
(
  'demo-1',
  'Festival de Inverno de Bonito 2024',
  'Celebre a temporada de inverno com música, gastronomia e aventuras em Bonito. Um dos maiores eventos culturais do estado.',
  '2024-07-15 18:00:00+00',
  '2024-07-20 23:59:59+00',
  'Centro de Bonito',
  'Bonito',
  'cultural',
  'gratuito',
  'Prefeitura de Bonito',
  'demo',
  ARRAY['festival', 'inverno', 'cultura', 'turismo']
),
(
  'demo-2',
  'Exposição Pantanal em Foco',
  'Exposição fotográfica sobre a biodiversidade do Pantanal, com obras de fotógrafos locais e nacionais.',
  '2024-08-01 09:00:00+00',
  '2024-08-31 18:00:00+00',
  'Museu da Imagem e do Som',
  'Campo Grande',
  'cultural',
  'gratuito',
  'Museu da Imagem e do Som',
  'demo',
  ARRAY['exposição', 'fotografia', 'pantanal', 'cultura']
);

-- Comentários para documentação
COMMENT ON TABLE events IS 'Tabela principal de eventos do sistema inteligente';
COMMENT ON COLUMN events.external_id IS 'ID externo do evento (ex: google-search-1)';
COMMENT ON COLUMN events.processado_por_ia IS 'Indica se o evento foi processado por IA';
COMMENT ON COLUMN events.confiabilidade IS 'Nível de confiabilidade do evento (0-100)';

