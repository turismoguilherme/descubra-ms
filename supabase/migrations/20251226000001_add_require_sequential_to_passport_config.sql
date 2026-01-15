-- Migration: Adicionar campo require_sequential em passport_configurations
-- Data: 2025-12-26
-- Descrição: Permite configurar se checkpoints devem ser visitados em ordem sequencial

-- Adicionar coluna require_sequential
ALTER TABLE passport_configurations 
ADD COLUMN IF NOT EXISTS require_sequential BOOLEAN DEFAULT false;

COMMENT ON COLUMN passport_configurations.require_sequential IS 'Se true, checkpoints devem ser visitados em ordem sequencial (1, 2, 3...). Se false, permite ordem livre.';

-- Atualizar updated_at quando a coluna for modificada (já deve ter trigger, mas garantindo)
-- Trigger já deve existir, então apenas comentamos aqui


