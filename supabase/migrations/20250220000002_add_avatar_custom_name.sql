-- Migration: Add avatar_custom_name field to user_profiles
-- Description: Permite que usuários personalizem o nome do avatar escolhido

-- Adicionar coluna avatar_custom_name
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS avatar_custom_name TEXT;

-- Comentário na coluna
COMMENT ON COLUMN public.user_profiles.avatar_custom_name IS 'Nome personalizado que o usuário escolheu para seu avatar do Pantanal (opcional)';
