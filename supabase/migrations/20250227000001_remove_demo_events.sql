-- Remover eventos mockados/demo da tabela events
-- Estes eventos foram criados apenas para demonstração e não devem mais existir

DELETE FROM events 
WHERE external_id IN ('demo-1', 'demo-2') 
   OR fonte = 'demo'
   OR (external_id LIKE 'demo-%' OR external_id LIKE 'alumia-%');

-- Comentário para documentação
COMMENT ON TABLE events IS 'Tabela principal de eventos do sistema inteligente - eventos demo removidos em 2025-02-27';

