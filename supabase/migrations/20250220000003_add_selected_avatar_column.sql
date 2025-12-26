-- Migration: Add selected_avatar field to user_profiles
-- Description: Adiciona coluna para armazenar o avatar selecionado pelo usuário

-- Adicionar coluna selected_avatar se não existir
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS selected_avatar TEXT;

-- Comentário na coluna
COMMENT ON COLUMN public.user_profiles.selected_avatar IS 'ID do avatar do Pantanal selecionado pelo usuário';
