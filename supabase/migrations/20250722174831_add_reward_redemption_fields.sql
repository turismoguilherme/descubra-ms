-- Adiciona as colunas local_resgate e instrucoes_resgate à tabela rewards
ALTER TABLE public.rewards
ADD COLUMN local_resgate text,
ADD COLUMN instrucoes_resgate text;

-- Opcional: Adicionar um índice se a coluna for frequentemente usada em buscas
-- CREATE INDEX IF NOT EXISTS idx_rewards_local_resgate ON public.rewards(local_resgate);

-- Para rollback (desfazer a migração)
-- ALTER TABLE public.rewards
-- DROP COLUMN instrucoes_resgate,
-- DROP COLUMN local_resgate;
