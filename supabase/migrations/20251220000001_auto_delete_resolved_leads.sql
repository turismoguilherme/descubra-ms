-- Migration: Auto-delete resolved leads after 90 days
-- Data: 2025-12-20
-- Descrição: Política de retenção de dados - apagar leads resolvidos após 90 dias

-- ============================================
-- FUNÇÃO: Auto-deletar leads resolvidos
-- ============================================
CREATE OR REPLACE FUNCTION auto_delete_resolved_leads()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
  v_resolved_status_id UUID := '8b8b8b8b-8b8b-8b8b-8b8b-8b8b8b8b8b8b'; -- Status "Resolvido"
BEGIN
  -- Deletar leads resolvidos há mais de 90 dias
  DELETE FROM leads
  WHERE status_id = v_resolved_status_id
    AND updated_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Log da operação (opcional - pode criar tabela de logs se necessário)
  RAISE NOTICE 'Leads resolvidos deletados: %', v_deleted_count;
END;
$$;

-- ============================================
-- TRIGGER: Executar limpeza ao atualizar lead para "Resolvido"
-- ============================================
CREATE OR REPLACE FUNCTION check_and_delete_old_resolved_leads()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_resolved_status_id UUID := '8b8b8b8b-8b8b-8b8b-8b8b-8b8b8b8b8b8b';
BEGIN
  -- Se o lead foi marcado como resolvido, verificar se há leads antigos para deletar
  IF NEW.status_id = v_resolved_status_id AND (OLD.status_id IS NULL OR OLD.status_id != v_resolved_status_id) THEN
    -- Executar limpeza de leads antigos (executa em background, não bloqueia)
    PERFORM pg_notify('delete_old_leads', '');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_check_resolved_leads ON leads;
CREATE TRIGGER trigger_check_resolved_leads
  AFTER UPDATE OF status_id ON leads
  FOR EACH ROW
  WHEN (NEW.status_id = '8b8b8b8b-8b8b-8b8b-8b8b-8b8b8b8b8b8b')
  EXECUTE FUNCTION check_and_delete_old_resolved_leads();

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON FUNCTION auto_delete_resolved_leads() IS 
'Deleta automaticamente leads com status "Resolvido" que foram atualizados há mais de 90 dias. 
Esta função deve ser executada periodicamente (ex: via cron job ou pg_cron).';

COMMENT ON FUNCTION check_and_delete_old_resolved_leads() IS 
'Trigger que notifica quando um lead é marcado como resolvido, permitindo limpeza assíncrona.';

-- ============================================
-- NOTA: Para execução automática periódica
-- ============================================
-- Se você tiver pg_cron instalado, pode criar um job:
-- SELECT cron.schedule(
--   'delete-old-resolved-leads',
--   '0 2 * * *', -- Todo dia às 2h da manhã
--   $$SELECT auto_delete_resolved_leads();$$
-- );
--
-- Ou executar manualmente quando necessário:
-- SELECT auto_delete_resolved_leads();

