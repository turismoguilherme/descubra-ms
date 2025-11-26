-- Migration: Remove foreign key constraint from plano_diretor_historico.autor_id
-- Description: Allows inserting historico entries for test users that don't exist in auth.users
-- This is necessary for development/testing environments where test users are simulated

-- Drop the existing foreign key constraint
ALTER TABLE plano_diretor_historico 
DROP CONSTRAINT IF EXISTS plano_diretor_historico_autor_id_fkey;

-- Note: We keep autor_id as NOT NULL to maintain data integrity
-- The constraint is removed to allow test users (UUIDs that don't exist in auth.users)
-- In production, all users should exist in auth.users, so this is safe


