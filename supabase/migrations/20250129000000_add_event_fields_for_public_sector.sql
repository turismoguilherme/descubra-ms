-- Migration: Adicionar campos faltantes na tabela events para setor público
-- Data: 2025-01-29
-- Descrição: Adiciona campos necessários para gestão completa de eventos no dashboard do setor público

-- Adicionar campos se não existirem
DO $$ 
BEGIN
  -- Campo category
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'category'
  ) THEN
    ALTER TABLE events ADD COLUMN category TEXT;
    COMMENT ON COLUMN events.category IS 'Categoria do evento: cultural, gastronomic, sports, religious, entertainment, business';
  END IF;

  -- Campo status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'status'
  ) THEN
    ALTER TABLE events ADD COLUMN status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled'));
    COMMENT ON COLUMN events.status IS 'Status do evento: planned, active, completed, cancelled';
  END IF;

  -- Campo expected_audience
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'expected_audience'
  ) THEN
    ALTER TABLE events ADD COLUMN expected_audience INTEGER;
    COMMENT ON COLUMN events.expected_audience IS 'Público esperado do evento';
  END IF;

  -- Campo budget
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'budget'
  ) THEN
    ALTER TABLE events ADD COLUMN budget DECIMAL(10, 2);
    COMMENT ON COLUMN events.budget IS 'Orçamento do evento em reais';
  END IF;

  -- Campo contact_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE events ADD COLUMN contact_phone TEXT;
    COMMENT ON COLUMN events.contact_phone IS 'Telefone de contato do evento';
  END IF;

  -- Campo contact_email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE events ADD COLUMN contact_email TEXT;
    COMMENT ON COLUMN events.contact_email IS 'Email de contato do evento';
  END IF;

  -- Campo contact_website
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'contact_website'
  ) THEN
    ALTER TABLE events ADD COLUMN contact_website TEXT;
    COMMENT ON COLUMN events.contact_website IS 'Website do evento';
  END IF;

  -- Campo features (array de características)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'features'
  ) THEN
    ALTER TABLE events ADD COLUMN features TEXT[];
    COMMENT ON COLUMN events.features IS 'Array de características do evento (ex: estacionamento, acessibilidade, etc)';
  END IF;

  -- Campo images (array de URLs de imagens)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'images'
  ) THEN
    ALTER TABLE events ADD COLUMN images TEXT[];
    COMMENT ON COLUMN events.images IS 'Array de URLs de imagens do evento';
  END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);

-- Comentário na tabela
COMMENT ON TABLE events IS 'Tabela de eventos turísticos - Gestão do setor público';

