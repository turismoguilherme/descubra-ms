-- Migration: Fix Foreign Key for Test Users
-- Remove foreign key constraints to allow test users

ALTER TABLE plano_diretor_documents 
DROP CONSTRAINT IF EXISTS plano_diretor_documents_criador_id_fkey;

ALTER TABLE plano_diretor_objetivos 
DROP CONSTRAINT IF EXISTS plano_diretor_objetivos_responsavel_id_fkey;

ALTER TABLE plano_diretor_estrategias 
DROP CONSTRAINT IF EXISTS plano_diretor_estrategias_responsavel_id_fkey;

ALTER TABLE plano_diretor_acoes 
DROP CONSTRAINT IF EXISTS plano_diretor_acoes_responsavel_id_fkey;
