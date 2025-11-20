-- Migration: Melhorar tabela attendant_checkins
-- Data: 2025-01-31
-- Descrição: Adiciona campos distance_from_cat e device_info para melhor rastreamento

DO $$ 
BEGIN
  -- Adicionar campo distance_from_cat se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'attendant_checkins' AND column_name = 'distance_from_cat'
  ) THEN
    ALTER TABLE attendant_checkins ADD COLUMN distance_from_cat DECIMAL(10, 2);
    COMMENT ON COLUMN attendant_checkins.distance_from_cat IS 'Distância em metros do atendente até o CAT no momento do check-in';
  END IF;

  -- Adicionar campo device_info se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'attendant_checkins' AND column_name = 'device_info'
  ) THEN
    ALTER TABLE attendant_checkins ADD COLUMN device_info JSONB;
    COMMENT ON COLUMN attendant_checkins.device_info IS 'Informações do dispositivo: user_agent, platform, etc.';
  END IF;
END $$;

-- Criar índice para distance_from_cat
CREATE INDEX IF NOT EXISTS idx_attendant_checkins_distance ON attendant_checkins(distance_from_cat);

