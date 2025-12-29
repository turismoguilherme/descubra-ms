-- Script para corrigir parceiro de teste - Definir status como 'approved'
-- Execute este script no Supabase SQL Editor

-- Atualizar o parceiro de teste para ter status 'approved'
UPDATE public.institutional_partners
SET 
  status = 'approved',
  is_active = true,
  updated_at = NOW()
WHERE contact_email = 'parceiro.teste@descubrams.com.br';

-- Verificar se foi atualizado corretamente
SELECT 
  id,
  name,
  contact_email,
  status,
  is_active,
  created_at,
  updated_at
FROM public.institutional_partners
WHERE contact_email = 'parceiro.teste@descubrams.com.br';
















