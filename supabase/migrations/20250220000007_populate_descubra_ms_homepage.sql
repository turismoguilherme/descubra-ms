-- Migration: Popular conteúdo da homepage do Descubra MS
-- Description: Insere os textos atuais da página inicial no banco para edição

-- Hero Principal
INSERT INTO public.institutional_content (content_key, content_value, content_type, description, is_active)
VALUES
  ('ms_hero_title', 'Descubra Mato Grosso do Sul', 'text', 'Título principal do hero', true),
  ('ms_hero_subtitle', 'Explore destinos incríveis, crie roteiros únicos e viva experiências inesquecíveis', 'textarea', 'Subtítulo do hero', true),
  ('ms_hero_button_1', 'Explorar Destinos', 'text', 'Texto do botão 1 do hero', true),
  ('ms_hero_button_2', 'Ver Galerias', 'text', 'Texto do botão 2 do hero', true),
  ('ms_hero_button_3', 'Eventos', 'text', 'Texto do botão 3 do hero', true),
  
  -- Hero Universal
  ('ms_hero_universal_subtitle', 'Do Pantanal ao Cerrado, explore paisagens únicas e biodiversidade no coração da América do Sul', 'textarea', 'Subtítulo do hero universal', true),
  ('ms_hero_universal_button_1', 'Descubra Agora', 'text', 'Texto do botão 1 do hero universal', true),
  ('ms_hero_universal_button_2', 'Passaporte Digital', 'text', 'Texto do botão 2 do hero universal', true),
  ('ms_hero_universal_button_3', 'Converse com o Guatá', 'text', 'Texto do botão 3 do hero universal', true),
  
  -- Descrição Turística
  ('ms_tourism_title', '"Descubra Mato Grosso do Sul" – Viva essa experiência!', 'text', 'Título da seção de descrição turística', true),
  ('ms_tourism_paragraph_1', 'Prepare-se para descobrir o melhor de MS de um jeito inovador e inteligente. Com a ajuda do Guatá, seu guia virtual inspirado na cultura local, você explora atrativos como Bonito, Pantanal, Serra da Bodoquena e muito mais!', 'textarea', 'Parágrafo 1 da descrição turística', true),
  ('ms_tourism_paragraph_2', 'Crie seu passaporte digital, desbloqueie selos temáticos com animais do Cerrado e do Pantanal, participe de roteiros interativos, receba recompensas e viva momentos inesquecíveis! Cadastre-se para explorar mais e ajudar a melhorar o turismo local!', 'textarea', 'Parágrafo 2 da descrição turística', true),
  ('ms_tourism_button', 'Cadastre-se', 'text', 'Texto do botão da descrição turística', true),
  
  -- Destinos em Destaque
  ('ms_destinations_title', 'Destinos em Destaque', 'text', 'Título da seção de destinos', true),
  ('ms_destinations_description', 'Descubra os principais destinos turísticos de Mato Grosso do Sul', 'textarea', 'Descrição da seção de destinos', true),
  ('ms_destinations_button', 'Ver Todos os Destinos', 'text', 'Texto do botão da seção de destinos', true)
ON CONFLICT (content_key) DO UPDATE
SET content_value = EXCLUDED.content_value,
    updated_at = NOW();
