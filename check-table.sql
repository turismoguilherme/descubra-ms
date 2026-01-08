-- Verificar se a tabela content_translations existe e sua estrutura
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'content_translations';

-- Verificar estrutura da tabela se existir
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'content_translations'
ORDER BY ordinal_position;
