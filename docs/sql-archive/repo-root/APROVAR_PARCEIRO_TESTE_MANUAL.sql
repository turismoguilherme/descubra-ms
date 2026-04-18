-- =====================================================
-- APROVAR PARCEIRO DE TESTE MANUALMENTE (BAIXA MANUAL)
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Este script aprova o parceiro de teste diretamente no banco de dados
-- Equivale a "dar baixa" manualmente no sistema

DO $$
DECLARE
  partner_record RECORD;
  test_email TEXT := 'parceiro.teste@descubrams.com.br';
BEGIN
  -- Encontrar o parceiro
  SELECT * INTO partner_record
  FROM institutional_partners
  WHERE LOWER(TRIM(contact_email)) = LOWER(TRIM(test_email));
  
  IF NOT FOUND THEN
    RAISE NOTICE '❌ Parceiro não encontrado: %', test_email;
    RAISE NOTICE '   Execute primeiro o script CRIAR_PARCEIRO_TESTE.sql';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Parceiro encontrado: % (ID: %)', partner_record.name, partner_record.id;
  RAISE NOTICE '   Status atual: %', partner_record.status;
  RAISE NOTICE '   Ativo: %', partner_record.is_active;
  
  -- Aprovar o parceiro (dar baixa)
  -- Verificar se coluna approved_at existe antes de usar
  DECLARE
    has_approved_at BOOLEAN;
  BEGIN
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'institutional_partners' 
      AND column_name = 'approved_at'
    ) INTO has_approved_at;
    
    IF has_approved_at THEN
      UPDATE institutional_partners
      SET 
        status = 'approved',
        is_active = true,
        approved_at = NOW(),
        updated_at = NOW()
      WHERE id = partner_record.id;
    ELSE
      UPDATE institutional_partners
      SET 
        status = 'approved',
        is_active = true,
        updated_at = NOW()
      WHERE id = partner_record.id;
    END IF;
  END;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ PARCEIRO APROVADO COM SUCESSO!';
  RAISE NOTICE '';
  RAISE NOTICE 'Status atualizado:';
  RAISE NOTICE '  - status: approved';
  RAISE NOTICE '  - is_active: true';
  RAISE NOTICE '  - approved_at: %', NOW();
  
END $$;

-- Verificar resultado
SELECT 
  'Verificação' as etapa,
  id,
  name,
  contact_email,
  status,
  is_active,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'institutional_partners' 
      AND column_name = 'approved_at'
    ) THEN (SELECT approved_at FROM institutional_partners WHERE LOWER(TRIM(contact_email)) = LOWER(TRIM('parceiro.teste@descubrams.com.br')))
    ELSE NULL
  END as approved_at,
  created_at
FROM institutional_partners
WHERE LOWER(TRIM(contact_email)) = LOWER(TRIM('parceiro.teste@descubrams.com.br'));

