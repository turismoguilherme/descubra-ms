-- Seed: conteúdo Guatá Labs (landing ViaJAR / mascote). Imagens vazias = fallback no frontend (logo).
-- Textos em PT-BR. ON CONFLICT atualiza valor e descrição.

INSERT INTO public.institutional_content (content_key, content_value, content_type, description, is_active)
VALUES
  ('guata_mascot_hero', '', 'image', 'Guatá Labs — hero mascote (URL pública ou upload admin)', true),
  ('guata_mascot_floating', '', 'image', 'Guatá Labs — avatar flutuante', true),
  ('guata_mascot_about', '', 'image', 'Guatá Labs — sobre/benefícios', true),
  ('guata_mascot_404', '', 'image', 'Guatá Labs — reserva 404', true),
  ('guata_mascot_cta', '', 'image', 'Guatá Labs — reserva CTA', true),
  ('guata_msg_floating_home', 'Olá! Sou o Guatá. Que tal uma demonstração da nossa plataforma?', 'text', 'Guatá Labs — balão flutuante home', true),
  ('guata_msg_floating_casos', 'Quer ver como outros destinos usam a Guatá Labs?', 'text', 'Guatá Labs — balão flutuante cases', true),
  ('guata_msg_floating_contato', 'Estamos por aqui — envie sua mensagem ou agende uma demo.', 'text', 'Guatá Labs — balão flutuante contato', true),
  ('guata_tip_hero', 'Tecnologia e turismo a serviço de quem decide.', 'text', 'Guatá Labs — dica hero', true),
  ('guata_tip_what_we_do', 'Da gestão pública ao empresário: soluções modulares para o turismo.', 'text', 'Guatá Labs — dica o que fazemos', true),
  ('guata_tip_benefits', 'Cada módulo foi pensado para gestores e empresários do turismo.', 'text', 'Guatá Labs — dica benefícios', true),
  ('guata_tip_how_it_works', 'Implementação guiada, do diagnóstico ao uso no dia a dia.', 'text', 'Guatá Labs — dica como funciona', true),
  ('guata_tip_success', 'Cases reais: do estado ao chatbot internacional.', 'text', 'Guatá Labs — dica cases', true),
  ('guata_brand_name', 'Guatá Labs', 'text', 'Guatá Labs — nome da marca', true),
  ('guata_brand_tagline', 'Ecossistema inteligente de turismo com IA.', 'text', 'Guatá Labs — tagline', true)
ON CONFLICT (content_key) DO UPDATE SET
  content_value = EXCLUDED.content_value,
  description = EXCLUDED.description,
  content_type = EXCLUDED.content_type,
  is_active = EXCLUDED.is_active,
  updated_at = now();
