-- Script para criar parceiro de teste para login
-- Execute este script no Supabase SQL Editor

-- Inserir parceiro de teste na tabela institutional_partners
INSERT INTO public.institutional_partners (
  name,
  description,
  contact_email,
  contact_phone,
  is_active,
  partner_type,
  status,
  created_at,
  updated_at
)
VALUES (
  'Parceiro de Teste',
  'Parceiro criado para testes do sistema de login',
  'parceiro.teste@descubrams.com.br',
  '(67) 99999-9999',
  true,
  'general',
  'approved',
  NOW(),
  NOW()
)
ON CONFLICT (contact_email) DO UPDATE
SET 
  status = 'approved',
  is_active = true,
  updated_at = NOW();

-- Verificar se o parceiro foi criado
SELECT 
  id,
  name,
  contact_email,
  is_active,
  created_at
FROM public.institutional_partners
WHERE contact_email = 'parceiro.teste@descubrams.com.br';




