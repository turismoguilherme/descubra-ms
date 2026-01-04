-- Migration: Simplificar menu ViajARTur (marketing-first)
-- Description: Remove itens do menu principal, mantendo apenas 4 itens focados em conversão
-- Date: 2025-02-20

-- Desativar itens removidos do menu principal (mas mantê-los no banco para o footer)
UPDATE public.dynamic_menus
SET is_active = false
WHERE platform = 'viajar' 
  AND menu_type = 'main'
  AND label IN ('Início', 'Dados de Turismo', 'Sobre');

-- Garantir que os 4 itens principais estejam ativos
UPDATE public.dynamic_menus
SET is_active = true, order_index = CASE
  WHEN label = 'Soluções' THEN 0
  WHEN label = 'Cases' THEN 1
  WHEN label = 'Preços' THEN 2
  WHEN label = 'Contato' THEN 3
  ELSE order_index
END
WHERE platform = 'viajar' 
  AND menu_type = 'main'
  AND label IN ('Soluções', 'Cases', 'Preços', 'Contato');

-- Comentário
COMMENT ON TABLE public.dynamic_menus IS 'Menu simplificado: apenas 4 itens principais (Soluções, Cases, Preços, Contato). Outros links no footer.';

