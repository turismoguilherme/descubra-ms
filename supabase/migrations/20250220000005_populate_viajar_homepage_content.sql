-- Migration: Popular conteúdo da homepage do ViajARTur
-- Description: Insere os textos atuais da página inicial no banco para edição

-- Hero Section
INSERT INTO public.institutional_content (content_key, content_value, content_type, description, is_active)
VALUES
  ('viajar_hero_badge', 'Plataforma #1 de Turismo Inteligente', 'text', 'Badge exibido acima do título no hero', true),
  ('viajar_hero_title', 'ViajARTur', 'text', 'Título principal do hero', true),
  ('viajar_hero_subtitle', 'Ecossistema inteligente de turismo', 'text', 'Subtítulo do hero', true),
  ('viajar_hero_description', 'Transforme dados em decisões estratégicas. Analytics avançado e IA para o setor público e privado.', 'textarea', 'Descrição do hero', true),
  ('viajar_hero_cta_primary', 'Acessar Plataforma', 'text', 'Texto do botão principal', true),
  ('viajar_hero_cta_secondary', 'Agendar Demo', 'text', 'Texto do botão secundário', true),
  
  -- Features Section
  ('viajar_features_title', 'Soluções Inteligentes', 'text', 'Título da seção de funcionalidades', true),
  ('viajar_features_subtitle', 'Tecnologia de ponta para transformar a gestão do turismo', 'textarea', 'Subtítulo da seção de funcionalidades', true),
  ('viajar_features_items', '[
    {"icon": "Brain", "title": "Guilherme IA", "description": "Assistente inteligente especializado em turismo com insights estratégicos personalizados.", "gradient": "from-purple-500 to-violet-600"},
    {"icon": "TrendingUp", "title": "Revenue Optimizer", "description": "Precificação dinâmica com IA que maximiza receita baseado em demanda e sazonalidade.", "gradient": "from-emerald-500 to-teal-600"},
    {"icon": "BarChart3", "title": "Market Intelligence", "description": "Análise de mercado: origem dos turistas, perfil de clientes e benchmarking competitivo.", "gradient": "from-blue-500 to-cyan-600"},
    {"icon": "Map", "title": "Inventário Turístico", "description": "Gestão de atrativos com padronização SeTur, validação inteligente e analytics.", "gradient": "from-orange-500 to-amber-600"},
    {"icon": "Calendar", "title": "Gestão de Eventos", "description": "Planejamento e análise de eventos turísticos com IA preditiva de público.", "gradient": "from-pink-500 to-rose-600"},
    {"icon": "Building2", "title": "Gestão de CATs", "description": "Controle de Centros de Atendimento com GPS, ponto eletrônico e métricas.", "gradient": "from-indigo-500 to-blue-600"}
  ]', 'json', 'Lista de funcionalidades em formato JSON', true),
  
  -- Reports Section
  ('viajar_reports_badge', 'Novidade', 'text', 'Badge da seção de relatórios', true),
  ('viajar_reports_title', 'Relatórios de Dados de Turismo', 'text', 'Título da seção de relatórios', true),
  ('viajar_reports_description', 'Acesse dados agregados e anonimizados de turismo de Mato Grosso do Sul. Relatórios completos com análises demográficas, origem dos visitantes, propósitos de viagem e interações na plataforma.', 'textarea', 'Descrição da seção de relatórios', true),
  ('viajar_reports_items', '["Dados agregados e anonimizados (LGPD)", "Perfil demográfico dos visitantes", "Origem e propósito de viagem", "Interações na plataforma Descubra MS"]', 'json', 'Lista de itens da seção de relatórios', true),
  ('viajar_reports_button_primary', 'Saiba Mais', 'text', 'Texto do botão principal da seção de relatórios', true),
  ('viajar_reports_button_secondary', 'Solicitar Relatório', 'text', 'Texto do botão secundário da seção de relatórios', true),
  
  -- Descubra MS Section
  ('viajar_descubra_ms_badge', 'Case de Sucesso', 'text', 'Badge da seção Descubra MS', true),
  ('viajar_descubra_ms_title', 'Descubra Mato Grosso do Sul', 'text', 'Título da seção Descubra MS', true),
  ('viajar_descubra_ms_description', 'Nossa primeira implementação completa demonstra como a tecnologia ViajARTur revoluciona o turismo regional com Guatá IA, Passaporte Digital e Analytics Avançado.', 'textarea', 'Descrição da seção Descubra MS', true),
  ('viajar_descubra_ms_items', '["Guatá - Assistente IA regional", "Passaporte Digital interativo", "Mapas e rotas inteligentes", "Analytics em tempo real"]', 'json', 'Lista de itens da seção Descubra MS', true),
  ('viajar_descubra_ms_button', 'Conhecer Descubra MS', 'text', 'Texto do botão da seção Descubra MS', true),
  
  -- Video Section
  ('viajar_video_title', 'Veja a Plataforma em Ação', 'text', 'Título da seção de vídeo', true),
  ('viajar_video_description', 'Descubra como a ViajARTur pode transformar a gestão do turismo na sua região', 'textarea', 'Descrição da seção de vídeo', true),
  
  -- CTA Section
  ('viajar_cta_title', 'Pronto para Transformar seu Turismo?', 'text', 'Título da seção CTA final', true),
  ('viajar_cta_description', 'Junte-se a empresas e órgãos públicos que já confiam na ViajARTur.', 'textarea', 'Descrição da seção CTA final', true),
  ('viajar_cta_button_primary', 'Solicitar Demonstração', 'text', 'Texto do botão principal da seção CTA', true),
  ('viajar_cta_button_secondary', 'Ver Planos', 'text', 'Texto do botão secundário da seção CTA', true)
ON CONFLICT (content_key) DO UPDATE
SET content_value = EXCLUDED.content_value,
    updated_at = NOW();
