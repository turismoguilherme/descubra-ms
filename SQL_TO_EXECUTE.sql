-- ============================================
-- SQL PARA EXECUTAR NO SUPABASE
-- ============================================
-- Execute este SQL no editor SQL do Supabase
-- ou através da interface de migrations

-- ============================================
-- 1. Adicionar coluna selected_avatar
-- ============================================
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS selected_avatar TEXT;

COMMENT ON COLUMN public.user_profiles.selected_avatar IS 'ID do avatar do Pantanal selecionado pelo usuário';

-- ============================================
-- 2. Adicionar coluna avatar_custom_name
-- ============================================
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS avatar_custom_name TEXT;

COMMENT ON COLUMN public.user_profiles.avatar_custom_name IS 'Nome personalizado que o usuário escolheu para seu avatar do Pantanal (opcional)';

-- ============================================
-- 3. Verificar se as colunas foram criadas
-- ============================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
  AND column_name IN ('selected_avatar', 'avatar_custom_name')
ORDER BY column_name;

-- ============================================
-- 4. Popular menu do ViajARTur (se não existir)
-- ============================================
-- Insere os itens do menu principal do ViajARTur no banco de dados
INSERT INTO public.dynamic_menus (platform, menu_type, label, path, icon, order_index, is_active, requires_auth, parent_id)
VALUES
  ('viajar', 'main', 'Início', '/', NULL, 0, true, false, NULL),
  ('viajar', 'main', 'Soluções', '/solucoes', NULL, 1, true, false, NULL),
  ('viajar', 'main', 'Cases', '/casos-sucesso', NULL, 2, true, false, NULL),
  ('viajar', 'main', 'Preços', '/precos', NULL, 3, true, false, NULL),
  ('viajar', 'main', 'Dados de Turismo', '/dados-turismo', NULL, 4, true, false, NULL),
  ('viajar', 'main', 'Sobre', '/sobre', NULL, 5, true, false, NULL),
  ('viajar', 'main', 'Contato', '/contato', NULL, 6, true, false, NULL)
ON CONFLICT DO NOTHING;
