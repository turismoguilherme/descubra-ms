-- Migration: Adicionar coluna approval_status à tabela events
-- Descrição: Adiciona campo para controle de aprovação de eventos
-- Data: 2025-02-10

-- Adicionar coluna approval_status se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name = 'approval_status'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.events 
    ADD COLUMN approval_status TEXT DEFAULT 'pending' 
    CHECK (approval_status IN ('pending', 'approved', 'rejected'));
    
    COMMENT ON COLUMN public.events.approval_status IS 
    'Status de aprovação: pending (aguardando), approved (aprovado), rejected (rejeitado)';
    
    -- Atualizar eventos existentes que estão visíveis como aprovados
    UPDATE public.events 
    SET approval_status = 'approved' 
    WHERE is_visible = true AND approval_status IS NULL;
    
    -- Atualizar eventos existentes que não estão visíveis como pendentes
    UPDATE public.events 
    SET approval_status = 'pending' 
    WHERE is_visible = false AND approval_status IS NULL;
    
    RAISE NOTICE 'Coluna approval_status adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna approval_status já existe';
  END IF;
END $$;

-- Criar índice para melhorar performance de queries por status
CREATE INDEX IF NOT EXISTS idx_events_approval_status ON public.events(approval_status);

