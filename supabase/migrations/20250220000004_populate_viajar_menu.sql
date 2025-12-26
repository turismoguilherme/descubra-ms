-- Migration: Popular menu do ViajARTur com itens atuais
-- Description: Insere os itens do menu principal do ViajARTur no banco de dados

-- Inserir itens do menu principal do ViajARTur
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

-- Comentário
COMMENT ON TABLE public.dynamic_menus IS 'Tabela para armazenar menus dinâmicos das plataformas ViajARTur e Descubra MS';
