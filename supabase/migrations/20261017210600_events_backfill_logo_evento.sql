-- Cadastros públicos antigos gravavam só imagem_principal; vitrine prioriza logo_evento.
UPDATE public.events
SET logo_evento = imagem_principal
WHERE (logo_evento IS NULL OR TRIM(logo_evento) = '')
  AND imagem_principal IS NOT NULL
  AND TRIM(imagem_principal) <> '';
