-- =====================================================
-- CORRIGIR ACESSO DO PARCEIRO DE TESTE
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Verificar e corrigir o parceiro de teste
DO $$
DECLARE
  partner_record RECORD;
  user_record RECORD;
BEGIN
  -- Verificar se o parceiro existe
  SELECT * INTO partner_record
  FROM institutional_partners
  WHERE LOWER(TRIM(contact_email)) = LOWER(TRIM('parceiro.teste@descubrams.com.br'));
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Parceiro não encontrado. Criando...';
    
    INSERT INTO institutional_partners (
      name,
      description,
      contact_email,
      is_active,
      status,
      partner_type
    ) VALUES (
      'Parceiro de Teste',
      'Parceiro criado para testes do sistema',
      'parceiro.teste@descubrams.com.br',
      true,
      'approved',
      'hotel'
    );
    
    RAISE NOTICE 'Parceiro criado com sucesso!';
  ELSE
    RAISE NOTICE 'Parceiro encontrado. Verificando configurações...';
    
    -- Garantir que está ativo e aprovado
    UPDATE institutional_partners
    SET 
      is_active = true,
      status = 'approved'
    WHERE id = partner_record.id
    AND (is_active = false OR status != 'approved');
    
    RAISE NOTICE 'Parceiro atualizado para ativo e aprovado.';
  END IF;
  
  -- Verificar se o usuário existe
  SELECT * INTO user_record
  FROM auth.users
  WHERE LOWER(TRIM(email)) = LOWER(TRIM('parceiro.teste@descubrams.com.br'));
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Usuário não encontrado na tabela auth.users.';
    RAISE NOTICE 'Você precisa criar o usuário manualmente no painel do Supabase:';
    RAISE NOTICE '  - Email: parceiro.teste@descubrams.com.br';
    RAISE NOTICE '  - Senha: ParceiroTeste2025!';
    RAISE NOTICE '  - Marque "Auto Confirm User"';
  ELSE
    RAISE NOTICE 'Usuário encontrado. Verificando confirmação de email...';
    
    IF user_record.email_confirmed_at IS NULL THEN
      RAISE NOTICE 'ATENÇÃO: Email não confirmado!';
      RAISE NOTICE 'Marque "Auto Confirm User" no painel do Supabase ou confirme manualmente.';
    ELSE
      RAISE NOTICE 'Email confirmado.';
    END IF;
  END IF;
  
  -- Verificar correspondência de emails
  IF FOUND AND partner_record IS NOT NULL THEN
    IF LOWER(TRIM(partner_record.contact_email)) != LOWER(TRIM(user_record.email)) THEN
      RAISE NOTICE 'ATENÇÃO: Emails não correspondem exatamente!';
      RAISE NOTICE '  Partner email: %', partner_record.contact_email;
      RAISE NOTICE '  User email: %', user_record.email;
      RAISE NOTICE 'Corrigindo email do parceiro para corresponder ao usuário...';
      
      UPDATE institutional_partners
      SET contact_email = user_record.email
      WHERE id = partner_record.id;
      
      RAISE NOTICE 'Email do parceiro atualizado.';
    ELSE
      RAISE NOTICE '✅ Emails correspondem corretamente.';
    END IF;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RESUMO:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Parceiro: %', CASE WHEN partner_record IS NOT NULL THEN 'Encontrado' ELSE 'Não encontrado' END;
  RAISE NOTICE 'Usuário: %', CASE WHEN user_record IS NOT NULL THEN 'Encontrado' ELSE 'Não encontrado' END;
  RAISE NOTICE 'Email confirmado: %', CASE WHEN user_record.email_confirmed_at IS NOT NULL THEN 'Sim' ELSE 'Não' END;
  RAISE NOTICE 'Parceiro ativo: %', CASE WHEN partner_record.is_active THEN 'Sim' ELSE 'Não' END;
  RAISE NOTICE 'Status: %', partner_record.status;
  
END $$;

-- Verificar políticas RLS
SELECT 
  'Políticas RLS para institutional_partners:' as info,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'institutional_partners';


