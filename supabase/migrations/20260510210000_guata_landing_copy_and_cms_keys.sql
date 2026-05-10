-- Corrige textos antigos "ViajARTur" / "viajartur" no conteúdo institucional (só quando ainda contêm a marca antiga).
UPDATE public.institutional_content
SET content_value = 'Guatá Labs — IA que transforma a gestão do turismo',
    updated_at = now()
WHERE content_key = 'viajar_hero_title'
  AND (content_value ILIKE '%viajartur%' OR content_value ILIKE '%ViajARTur%');

UPDATE public.institutional_content
SET content_value = 'Junte-se a secretarias de turismo e empresários que confiam na Guatá Labs para decisões estratégicas com dados e IA.',
    updated_at = now()
WHERE content_key = 'viajar_cta_description'
  AND (content_value ILIKE '%viajartur%' OR content_value ILIKE '%ViajARTur%');

-- Novas chaves CMS (não sobrescreve content_value em re-execução — só metadados).
INSERT INTO public.institutional_content (content_key, content_value, content_type, description, is_active)
VALUES
  (
    'viajar_cases_section_intro',
    'Projetos reais em que unimos dados, IA e operação para secretarias de turismo, destinos e negócios do setor. Cada case mostra um pedaço do que a Guatá Labs constrói no dia a dia.',
    'text',
    'Landing — parágrafo introdutório da seção Cases (fundo claro)',
    true
  ),
  (
    'viajar_cases_subtitle',
    'Do estado ao chatbot internacional — veja onde já estamos.',
    'text',
    'Landing — subtítulo curto da seção Cases',
    true
  ),
  (
    'viajar_cases_page_lead',
    'Aqui você encontra implementações completas e produtos de IA aplicados ao turismo: plataformas para destinos, analytics para gestores e experiências conversacionais para viajantes. Cada projeto combina método, tecnologia e proximidade com quem opera o turismo no Brasil e no exterior.',
    'text',
    'Página /casos-sucesso — texto de apoio no hero',
    true
  ),
  (
    'viajar_sobre_page_lead',
    'Somos um ecossistema de software e inteligência artificial focado em turismo. Apoiamos secretarias, empresários e equipes técnicas com dados confiáveis, produtos modulares e implementação acompanhada — do diagnóstico ao uso no dia a dia.',
    'text',
    'Página /sobre — texto de apoio no hero',
    true
  )
ON CONFLICT (content_key) DO UPDATE SET
  description = EXCLUDED.description,
  content_type = EXCLUDED.content_type,
  is_active = EXCLUDED.is_active,
  updated_at = now();
