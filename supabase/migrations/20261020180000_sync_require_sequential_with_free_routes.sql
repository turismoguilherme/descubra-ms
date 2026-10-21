-- Alinha legado require_sequential com checkpoint_order_mode (ordem definida na aba Rotas)
UPDATE public.passport_configurations pc
SET require_sequential = false
FROM public.routes r
WHERE r.id = pc.route_id
  AND r.checkpoint_order_mode = 'free'
  AND COALESCE(pc.require_sequential, false) = true;
