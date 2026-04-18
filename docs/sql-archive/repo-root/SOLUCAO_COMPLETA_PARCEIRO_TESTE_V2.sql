-- =====================================================
-- SOLUÇÃO COMPLETA PARA PARCEIRO DE TESTE (VERSÃO CORRIGIDA)
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Este script faz TUDO necessário para o parceiro de teste funcionar:
-- 1. Adiciona colunas de aprovação se não existirem
-- 2. Cria/atualiza o parceiro
-- 3. Aprova o parceiro (dar baixa manual)
-- 4. Garante que está ativo
-- 5. Verifica correspondência de emails

-- =====================================================
-- PASSO 1: ADICIONAR COLUNAS DE APROVAÇÃO (SE NÃO EXISTIREM)
-- =====================================================

-- Adicionar coluna approved_at (data/hora da aprovação)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'institutional_partners' 
    AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE public.institutional_partners
    ADD COLUMN approved_at TIMESTAMPTZ;
    
    COMMENT ON COLUMN public.institutional_partners.approved_at IS 'Data/hora da aprovação do parceiro';
    
    RAISE NOTICE '✅ Coluna approved_at adicionada';
  ELSE
    RAISE NOTICE '✅ Coluna approved_at já existe';
  END IF;
END $$;

-- Adicionar coluna approved_by (quem aprovou)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'institutional_partners' 
    AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE public.institutional_partners
    ADD COLUMN approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    
    COMMENT ON COLUMN public.institutional_partners.approved_by IS 'ID do usuário que aprovou o parceiro';
    
    RAISE NOTICE '✅ Coluna approved_by adicionada';
  ELSE
    RAISE NOTICE '✅ Coluna approved_by já existe';
  END IF;
END $$;

-- =====================================================
-- PASSO 2: PROCESSAR PARCEIRO DE TESTE
-- =====================================================

DO $$
DECLARE
  partner_record RECORD;
  user_record RECORD;
  test_email TEXT := 'parceiro.teste@descubrams.com.br';
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SOLUÇÃO COMPLETA PARA PARCEIRO DE TESTE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- =====================================================
  -- 1. VERIFICAR/CRIAR PARCEIRO
  -- =====================================================
  SELECT * INTO partner_record
  FROM institutional_partners
  WHERE LOWER(TRIM(contact_email)) = LOWER(TRIM(test_email));
  
  IF NOT FOUND THEN
    RAISE NOTICE '📝 Criando parceiro de teste...';
    
    INSERT INTO institutional_partners (
      name,
      description,
      contact_email,
      is_active,
      status,
      partner_type,
      created_at,
      updated_at
    ) VALUES (
      'Parceiro de Teste',
      'Parceiro criado para testes do sistema',
      test_email,
      true,
      'approved',
      'hotel',
      NOW(),
      NOW()
    )
    RETURNING * INTO partner_record;
    
    RAISE NOTICE '✅ Parceiro criado: % (ID: %)', partner_record.name, partner_record.id;
  ELSE
    RAISE NOTICE '✅ Parceiro encontrado: % (ID: %)', partner_record.name, partner_record.id;
  END IF;
  
  -- =====================================================
  -- 2. APROVAR PARCEIRO (DAR BAIXA MANUAL)
  -- =====================================================
  RAISE NOTICE '';
  RAISE NOTICE '📝 Aprovando parceiro (dar baixa manual)...';
  
  -- Atualizar parceiro (colunas já foram criadas no início)
  UPDATE institutional_partners
  SET 
    status = 'approved',
    is_active = true,
    approved_at = NOW(),
    updated_at = NOW()
  WHERE id = partner_record.id;
  
  RAISE NOTICE '✅ Parceiro aprovado e ativado';
  
  -- =====================================================
  -- 3. VERIFICAR USUÁRIO DE AUTENTICAÇÃO
  -- =====================================================
  RAISE NOTICE '';
  RAISE NOTICE '📝 Verificando usuário de autenticação...';
  
  SELECT * INTO user_record
  FROM auth.users
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(test_email));
  
  IF NOT FOUND THEN
    RAISE NOTICE '⚠️  Usuário não encontrado na tabela auth.users';
    RAISE NOTICE '';
    RAISE NOTICE 'AÇÃO NECESSÁRIA:';
    RAISE NOTICE '1. Acesse o painel do Supabase';
    RAISE NOTICE '2. Vá em Authentication > Users';
    RAISE NOTICE '3. Clique em "Add user" > "Create new user"';
    RAISE NOTICE '4. Preencha:';
    RAISE NOTICE '   - Email: %', test_email;
    RAISE NOTICE '   - Password: ParceiroTeste2025!';
    RAISE NOTICE '   - Marque "Auto Confirm User"';
    RAISE NOTICE '5. Execute este script novamente após criar o usuário';
  ELSE
    RAISE NOTICE '✅ Usuário encontrado: % (ID: %)', user_record.email, user_record.id;
    
    -- Verificar confirmação de email
    IF user_record.email_confirmed_at IS NULL THEN
      RAISE NOTICE '⚠️  Email não confirmado!';
      RAISE NOTICE '   Marque "Auto Confirm User" no painel do Supabase';
    ELSE
      RAISE NOTICE '✅ Email confirmado';
    END IF;
    
    -- Verificar correspondência de emails
    IF LOWER(TRIM(partner_record.contact_email)) != LOWER(TRIM(user_record.email)) THEN
      RAISE NOTICE '⚠️  Emails não correspondem exatamente!';
      RAISE NOTICE '   Partner: %', partner_record.contact_email;
      RAISE NOTICE '   User: %', user_record.email;
      RAISE NOTICE '   Corrigindo...';
      
      UPDATE institutional_partners
      SET contact_email = user_record.email
      WHERE id = partner_record.id;
      
      RAISE NOTICE '✅ Email do parceiro atualizado';
    ELSE
      RAISE NOTICE '✅ Emails correspondem corretamente';
    END IF;
  END IF;
  
  -- =====================================================
  -- 4. RESUMO FINAL
  -- =====================================================
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RESUMO FINAL';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Parceiro: %', CASE WHEN partner_record IS NOT NULL THEN '✅ Configurado' ELSE '❌ Não encontrado' END;
  RAISE NOTICE 'Status: approved';
  RAISE NOTICE 'Ativo: true';
  RAISE NOTICE 'Usuário: %', CASE WHEN user_record IS NOT NULL THEN '✅ Encontrado' ELSE '❌ Não encontrado' END;
  RAISE NOTICE 'Email confirmado: %', CASE WHEN user_record.email_confirmed_at IS NOT NULL THEN '✅ Sim' ELSE '❌ Não' END;
  RAISE NOTICE '';
  RAISE NOTICE 'Credenciais de login:';
  RAISE NOTICE '  Email: %', test_email;
  RAISE NOTICE '  Senha: ParceiroTeste2025!';
  RAISE NOTICE '';
  RAISE NOTICE 'URLs de acesso:';
  RAISE NOTICE '  Dashboard do parceiro: /partner/dashboard';
  RAISE NOTICE '  Login do parceiro: /partner/login';
  RAISE NOTICE '';
  
END $$;

-- Verificação final completa
SELECT 
  'VERIFICAÇÃO FINAL' as tipo,
  ip.id as partner_id,
  ip.name as partner_name,
  ip.contact_email as partner_email,
  ip.status as partner_status,
  ip.is_active as partner_is_active,
  ip.approved_at,
  au.id as user_id,
  au.email as user_email,
  au.email_confirmed_at,
  CASE 
    WHEN LOWER(TRIM(ip.contact_email)) = LOWER(TRIM(au.email)) THEN '✅'
    ELSE '❌'
  END as emails_match,
  CASE 
    WHEN ip.status = 'approved' AND ip.is_active = true AND au.email_confirmed_at IS NOT NULL THEN '✅ PRONTO'
    ELSE '⚠️  CONFIGURAÇÃO INCOMPLETA'
  END as status_geral
FROM institutional_partners ip
LEFT JOIN auth.users au ON LOWER(TRIM(au.email)) = LOWER(TRIM(ip.contact_email))
WHERE LOWER(TRIM(ip.contact_email)) = LOWER(TRIM('parceiro.teste@descubrams.com.br'))
   OR LOWER(TRIM(au.email)) = LOWER(TRIM('parceiro.teste@descubrams.com.br'));


