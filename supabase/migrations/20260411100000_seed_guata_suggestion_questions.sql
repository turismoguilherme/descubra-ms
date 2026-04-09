-- Sugestões do chat Guatá (balões): valor editável em Admin → Conteúdo da plataforma → Guatá (chat)
INSERT INTO public.institutional_content (content_key, content_value, content_type, description, is_active)
VALUES (
  'guata_chat_suggestion_questions',
  '[
    "Quais são os melhores passeios em Bonito?",
    "Melhor época para visitar o Pantanal?",
    "Me conte sobre a comida típica de MS",
    "O que fazer em Corumbá?",
    "O que fazer em Campo Grande?",
    "Quais são os principais pontos turísticos de Campo Grande?"
  ]',
  'json',
  'Array JSON de strings: cada item vira um botão de sugestão no Guatá (/guata e /chatguata).',
  true
)
ON CONFLICT (content_key) DO NOTHING;
