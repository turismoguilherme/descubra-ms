-- Migration: Adicionar campos source e status para eventos (ViaJAR e Descubra MS)
-- Data: 2025-01-31
-- Descrição: Adiciona campos para diferenciar eventos do ViaJAR e Descubra MS, e controle de aprovação

-- Verificar se a tabela events existe
DO $$ 
BEGIN
  -- Adicionar campo source se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'source'
  ) THEN
    ALTER TABLE events ADD COLUMN source TEXT DEFAULT 'public' CHECK (source IN ('viajar', 'public'));
    COMMENT ON COLUMN events.source IS 'Origem do evento: viajar (enviado por empresa) ou public (cadastrado por secretaria)';
  END IF;

  -- Adicionar campo status se não existir (pode já existir, então verificar)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE events ADD COLUMN approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
    COMMENT ON COLUMN events.approval_status IS 'Status de aprovação: pending (aguardando), approved (aprovado), rejected (rejeitado)';
  END IF;

  -- Adicionar campo company_id se não existir (para eventos do ViaJAR)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE events ADD COLUMN company_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    COMMENT ON COLUMN events.company_id IS 'ID da empresa que enviou o evento (apenas para eventos do ViaJAR)';
  END IF;

  -- Adicionar campo submitted_by se não existir (para rastreamento)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'submitted_by'
  ) THEN
    ALTER TABLE events ADD COLUMN submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    COMMENT ON COLUMN events.submitted_by IS 'ID do usuário que cadastrou/enviou o evento';
  END IF;

  -- Adicionar campo approved_by se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE events ADD COLUMN approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    COMMENT ON COLUMN events.approval_status IS 'ID do admin que aprovou/rejeitou o evento';
  END IF;

  -- Adicionar campo rejection_reason se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE events ADD COLUMN rejection_reason TEXT;
    COMMENT ON COLUMN events.rejection_reason IS 'Motivo da rejeição (se aplicável)';
  END IF;

  -- Adicionar campo approved_at se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE events ADD COLUMN approved_at TIMESTAMPTZ;
    COMMENT ON COLUMN events.approved_at IS 'Data/hora da aprovação';
  END IF;
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);
CREATE INDEX IF NOT EXISTS idx_events_approval_status ON events(approval_status);
CREATE INDEX IF NOT EXISTS idx_events_company_id ON events(company_id);
CREATE INDEX IF NOT EXISTS idx_events_submitted_by ON events(submitted_by);

-- Índice composto para buscar eventos pendentes do ViaJAR
CREATE INDEX IF NOT EXISTS idx_events_viajar_pending ON events(source, approval_status) 
WHERE source = 'viajar' AND approval_status = 'pending';

-- Índice composto para buscar eventos aprovados para calendário público
CREATE INDEX IF NOT EXISTS idx_events_approved_public ON events(approval_status, start_date) 
WHERE approval_status = 'approved';

-- Comentário na tabela
COMMENT ON TABLE events IS 'Tabela de eventos turísticos - Suporta eventos do ViaJAR (empresas) e Descubra MS (secretarias)';

