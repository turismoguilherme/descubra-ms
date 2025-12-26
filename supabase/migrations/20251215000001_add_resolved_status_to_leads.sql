-- Adicionar status "Resolvido" para leads do formulário de contato
-- Permite marcar leads como resolvidos quando o atendimento foi concluído
-- Data: 2025-12-15

-- Inserir novo status "Resolvido" na tabela lead_statuses
-- ID: 8b8b8b8b-8b8b-8b8b-8b8b-8b8b8b8b8b8b
-- Ordem: 8 (após "Lost")
-- is_final: TRUE (status final, não requer mais ação)
INSERT INTO lead_statuses (id, name, description, color, order_index, is_final) 
VALUES (
  '8b8b8b8b-8b8b-8b8b-8b8b-8b8b8b8b8b8b', 
  'Resolved', 
  'Lead resolvido - atendimento concluído', 
  '#10B981', 
  8, 
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Log de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Status "Resolvido" adicionado com sucesso à tabela lead_statuses';
END $$;
