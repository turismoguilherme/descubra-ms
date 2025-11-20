-- Migration: Add SeTur (Sistema de Estatísticas de Turismo) fields
-- Description: Adiciona campos obrigatórios do padrão SeTur para conformidade nacional
-- Date: 2025-02-01

-- Adicionar campos SeTur na tabela tourism_inventory
DO $$ 
BEGIN
  -- Código SeTur único (formato: SETUR-{UF}-{CAT}-{SEQ})
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'setur_code'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN setur_code VARCHAR(50) UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_tourism_inventory_setur_code ON tourism_inventory(setur_code);
    COMMENT ON COLUMN tourism_inventory.setur_code IS 'Código único SeTur no formato SETUR-{UF}-{CAT}-{SEQ}';
  END IF;

  -- Código da categoria SeTur
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'setur_category_code'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN setur_category_code VARCHAR(10);
    COMMENT ON COLUMN tourism_inventory.setur_category_code IS 'Código da categoria conforme padrão SeTur';
  END IF;

  -- Razão social (para empresas)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'legal_name'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN legal_name VARCHAR(200);
    COMMENT ON COLUMN tourism_inventory.legal_name IS 'Razão social ou nome legal do estabelecimento';
  END IF;

  -- Número de registro (CNPJ/CPF)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'registration_number'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN registration_number VARCHAR(50);
    CREATE INDEX IF NOT EXISTS idx_tourism_inventory_registration ON tourism_inventory(registration_number);
    COMMENT ON COLUMN tourism_inventory.registration_number IS 'CNPJ ou CPF do estabelecimento';
  END IF;

  -- Número de licença/alvará
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'license_number'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN license_number VARCHAR(50);
    COMMENT ON COLUMN tourism_inventory.license_number IS 'Número de licença ou alvará de funcionamento';
  END IF;

  -- Data de validade da licença
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'license_expiry_date'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN license_expiry_date DATE;
    COMMENT ON COLUMN tourism_inventory.license_expiry_date IS 'Data de validade da licença ou alvará';
  END IF;

  -- Nome do responsável
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'responsible_name'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN responsible_name VARCHAR(200);
    COMMENT ON COLUMN tourism_inventory.responsible_name IS 'Nome do responsável legal pelo estabelecimento';
  END IF;

  -- CPF do responsável
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'responsible_cpf'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN responsible_cpf VARCHAR(14);
    COMMENT ON COLUMN tourism_inventory.responsible_cpf IS 'CPF do responsável legal';
  END IF;

  -- Email do responsável
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'responsible_email'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN responsible_email VARCHAR(100);
    COMMENT ON COLUMN tourism_inventory.responsible_email IS 'Email do responsável legal';
  END IF;

  -- Telefone do responsável
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'responsible_phone'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN responsible_phone VARCHAR(20);
    COMMENT ON COLUMN tourism_inventory.responsible_phone IS 'Telefone do responsável legal';
  END IF;

  -- Recursos de acessibilidade detalhados
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'accessibility_features'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN accessibility_features JSONB;
    COMMENT ON COLUMN tourism_inventory.accessibility_features IS 'Recursos de acessibilidade detalhados (rampa, banheiro adaptado, etc)';
  END IF;

  -- Detalhes de capacidade por tipo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'capacity_details'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN capacity_details JSONB;
    COMMENT ON COLUMN tourism_inventory.capacity_details IS 'Detalhes de capacidade por tipo (ex: quartos, mesas, lugares)';
  END IF;

  -- Formas de pagamento aceitas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'payment_methods'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN payment_methods JSONB;
    COMMENT ON COLUMN tourism_inventory.payment_methods IS 'Formas de pagamento aceitas (dinheiro, cartão, pix, etc)';
  END IF;

  -- Idiomas falados
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'languages_spoken'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN languages_spoken TEXT[];
    COMMENT ON COLUMN tourism_inventory.languages_spoken IS 'Idiomas falados pelos atendentes';
  END IF;

  -- Certificações
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'certifications'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN certifications JSONB;
    COMMENT ON COLUMN tourism_inventory.certifications IS 'Certificações (ISO, selos de qualidade, etc)';
  END IF;

  -- Última data de verificação
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'last_verified_date'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN last_verified_date DATE;
    COMMENT ON COLUMN tourism_inventory.last_verified_date IS 'Última data em que os dados foram verificados';
  END IF;

  -- Status da verificação
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN verification_status VARCHAR(20) DEFAULT 'pending';
    COMMENT ON COLUMN tourism_inventory.verification_status IS 'Status da verificação: pending, verified, expired, needs_update';
  END IF;

  -- Score de completude dos dados (0-100)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'data_completeness_score'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN data_completeness_score INTEGER DEFAULT 0;
    COMMENT ON COLUMN tourism_inventory.data_completeness_score IS 'Score de completude dos dados (0-100)';
  END IF;

  -- Score de conformidade SeTur (0-100)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tourism_inventory' AND column_name = 'setur_compliance_score'
  ) THEN
    ALTER TABLE tourism_inventory ADD COLUMN setur_compliance_score INTEGER DEFAULT 0;
    COMMENT ON COLUMN tourism_inventory.setur_compliance_score IS 'Score de conformidade com padrão SeTur (0-100)';
  END IF;
END $$;

-- Criar índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_verification_status ON tourism_inventory(verification_status);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_completeness_score ON tourism_inventory(data_completeness_score);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_compliance_score ON tourism_inventory(setur_compliance_score);
CREATE INDEX IF NOT EXISTS idx_tourism_inventory_last_verified ON tourism_inventory(last_verified_date);

-- Comentários na tabela
COMMENT ON TABLE tourism_inventory IS 'Inventário turístico conforme padrão SeTur (Sistema de Estatísticas de Turismo)';

