-- Adicionar coluna category na tabela events se não existir
-- Data: 2025-02-09

DO $$ 
BEGIN
  -- Campo category
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'events' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.events ADD COLUMN category TEXT;
    COMMENT ON COLUMN public.events.category IS 'Categoria do evento: cultural, gastronomico, esportivo, musical, religioso, empresarial, educativo, festival, outro';
    
    -- Criar índice para melhor performance
    CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
    
    RAISE NOTICE 'Coluna category adicionada à tabela events';
  ELSE
    RAISE NOTICE 'Coluna category já existe na tabela events';
  END IF;
END $$;

