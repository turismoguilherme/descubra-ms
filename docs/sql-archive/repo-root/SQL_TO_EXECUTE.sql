-- Criar parceiro de teste para login
INSERT INTO public.institutional_partners (
  name,
  description,
  contact_email,
  contact_phone,
  is_active,
  partner_type,
  created_at,
  updated_at
)
VALUES (
  'Parceiro de Teste',
  'Parceiro criado para testes do sistema de login',
  'parceiro.teste@descubrams.com.br',
  '(67) 99999-9999',
  true,
  'general',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

INSERT INTO public.institutional_content (content_key, content_value, content_type, description, is_active)
VALUES
  ('viajar_hero_badge', 'Plataforma #1 de Turismo Inteligente', 'text', 'Badge exibido acima do título no hero', true),
  ('viajar_hero_title', 'ViajARTur', 'text', 'Título principal do hero', true),
  ('viajar_hero_subtitle', 'Ecossistema inteligente de turismo', 'text', 'Subtítulo do hero', true),
  ('viajar_hero_description', 'Transforme dados em decisões estratégicas. Analytics avançado e IA para o setor público e privado.', 'textarea', 'Descrição do hero', true),
  ('viajar_hero_cta_primary', 'Acessar Plataforma', 'text', 'Texto do botão principal', true),
  ('viajar_hero_cta_secondary', 'Agendar Demo', 'text', 'Texto do botão secundário', true),
  ('viajar_hero_video_url', '', 'text', 'URL do vídeo do hero', true),
  ('viajar_features_title', 'Soluções Inteligentes', 'text', 'Título da seção de funcionalidades', true),
  ('viajar_features_subtitle', 'Tecnologia de ponta para transformar a gestão do turismo', 'textarea', 'Subtítulo da seção de funcionalidades', true),
  ('viajar_feature_1_title', 'Guilherme IA', 'text', 'Título da funcionalidade 1', true),
  ('viajar_feature_1_description', 'Assistente inteligente especializado em turismo com insights estratégicos personalizados.', 'textarea', 'Descrição da funcionalidade 1', true),
  ('viajar_feature_2_title', 'Revenue Optimizer', 'text', 'Título da funcionalidade 2', true),
  ('viajar_feature_2_description', 'Precificação dinâmica com IA que maximiza receita baseado em demanda e sazonalidade.', 'textarea', 'Descrição da funcionalidade 2', true),
  ('viajar_feature_3_title', 'Market Intelligence', 'text', 'Título da funcionalidade 3', true),
  ('viajar_feature_3_description', 'Análise de mercado: origem dos turistas, perfil de clientes e benchmarking competitivo.', 'textarea', 'Descrição da funcionalidade 3', true),
  ('viajar_feature_4_title', 'Inventário Turístico', 'text', 'Título da funcionalidade 4', true),
  ('viajar_feature_4_description', 'Gestão de atrativos com padronização SeTur, validação inteligente e analytics.', 'textarea', 'Descrição da funcionalidade 4', true),
  ('viajar_feature_5_title', 'Gestão de Eventos', 'text', 'Título da funcionalidade 5', true),
  ('viajar_feature_5_description', 'Planejamento e análise de eventos turísticos com IA preditiva de público.', 'textarea', 'Descrição da funcionalidade 5', true),
  ('viajar_feature_6_title', 'Gestão de CATs', 'text', 'Título da funcionalidade 6', true),
  ('viajar_feature_6_description', 'Controle de Centros de Atendimento com GPS, ponto eletrônico e métricas.', 'textarea', 'Descrição da funcionalidade 6', true),
  ('viajar_reports_badge', 'Novidade', 'text', 'Badge da seção de relatórios', true),
  ('viajar_reports_title', 'Relatórios de Dados de Turismo', 'text', 'Título da seção de relatórios', true),
  ('viajar_reports_description', 'Acesse dados agregados e anonimizados de turismo de Mato Grosso do Sul. Relatórios completos com análises demográficas, origem dos visitantes, propósitos de viagem e interações na plataforma.', 'textarea', 'Descrição da seção de relatórios', true),
  ('viajar_reports_item_1', 'Dados agregados e anonimizados (LGPD)', 'text', 'Item 1 da lista de relatórios', true),
  ('viajar_reports_item_2', 'Perfil demográfico dos visitantes', 'text', 'Item 2 da lista de relatórios', true),
  ('viajar_reports_item_3', 'Origem e propósito de viagem', 'text', 'Item 3 da lista de relatórios', true),
  ('viajar_reports_item_4', 'Interações na plataforma Descubra MS', 'text', 'Item 4 da lista de relatórios', true),
  ('viajar_reports_button_primary', 'Saiba Mais', 'text', 'Texto do botão principal da seção de relatórios', true),
  ('viajar_reports_button_secondary', 'Solicitar Relatório', 'text', 'Texto do botão secundário da seção de relatórios', true),
  ('viajar_descubra_ms_badge', 'Case de Sucesso', 'text', 'Badge da seção Descubra MS', true),
  ('viajar_descubra_ms_title', 'Descubra Mato Grosso do Sul', 'text', 'Título da seção Descubra MS', true),
  ('viajar_descubra_ms_description', 'Nossa primeira implementação completa demonstra como a tecnologia ViajARTur revoluciona o turismo regional com Guatá IA, Passaporte Digital e Analytics Avançado.', 'textarea', 'Descrição da seção Descubra MS', true),
  ('viajar_descubra_ms_item_1', 'Guatá - Assistente IA regional', 'text', 'Item 1 da lista Descubra MS', true),
  ('viajar_descubra_ms_item_2', 'Passaporte Digital interativo', 'text', 'Item 2 da lista Descubra MS', true),
  ('viajar_descubra_ms_item_3', 'Mapas e rotas inteligentes', 'text', 'Item 3 da lista Descubra MS', true),
  ('viajar_descubra_ms_item_4', 'Analytics em tempo real', 'text', 'Item 4 da lista Descubra MS', true),
  ('viajar_descubra_ms_button', 'Conhecer Descubra MS', 'text', 'Texto do botão da seção Descubra MS', true),
  ('viajar_video_title', 'Veja a Plataforma em Ação', 'text', 'Título da seção de vídeo', true),
  ('viajar_video_description', 'Descubra como a ViajARTur pode transformar a gestão do turismo na sua região', 'textarea', 'Descrição da seção de vídeo', true),
  ('viajar_cta_title', 'Pronto para Transformar seu Turismo?', 'text', 'Título da seção CTA final', true),
  ('viajar_cta_description', 'Junte-se a empresas e órgãos públicos que já confiam na ViajARTur.', 'textarea', 'Descrição da seção CTA final', true),
  ('viajar_cta_button_primary', 'Solicitar Demonstração', 'text', 'Texto do botão principal da seção CTA', true),
  ('viajar_cta_button_secondary', 'Ver Planos', 'text', 'Texto do botão secundário da seção CTA', true)
ON CONFLICT (content_key) DO UPDATE
SET content_value = EXCLUDED.content_value,
    updated_at = NOW();

INSERT INTO public.institutional_content (content_key, content_value, content_type, description, is_active)
VALUES
  ('ms_hero_title', 'Descubra Mato Grosso do Sul', 'text', 'Título principal do hero', true),
  ('ms_hero_subtitle', 'Explore destinos incríveis, crie roteiros únicos e viva experiências inesquecíveis', 'textarea', 'Subtítulo do hero', true),
  ('ms_hero_button_1', 'Explorar Destinos', 'text', 'Texto do botão 1 do hero', true),
  ('ms_hero_button_2', 'Ver Galerias', 'text', 'Texto do botão 2 do hero', true),
  ('ms_hero_button_3', 'Eventos', 'text', 'Texto do botão 3 do hero', true),
  ('ms_hero_universal_subtitle', 'Do Pantanal ao Cerrado, explore paisagens únicas e biodiversidade no coração da América do Sul', 'textarea', 'Subtítulo do hero universal', true),
  ('ms_hero_universal_button_1', 'Descubra Agora', 'text', 'Texto do botão 1 do hero universal', true),
  ('ms_hero_universal_button_2', 'Passaporte Digital', 'text', 'Texto do botão 2 do hero universal', true),
  ('ms_hero_universal_button_3', 'Converse com o Guatá', 'text', 'Texto do botão 3 do hero universal', true),
  ('ms_tourism_title', 'Descubra Mato Grosso do Sul – Viva essa experiência!', 'text', 'Título da seção de descrição turística', true),
  ('ms_tourism_paragraph_1', 'Prepare-se para descobrir o melhor de MS de um jeito inovador e inteligente. Com a ajuda do Guatá, seu guia virtual inspirado na cultura local, você explora atrativos como Bonito, Pantanal, Serra da Bodoquena e muito mais!', 'textarea', 'Parágrafo 1 da descrição turística', true),
  ('ms_tourism_paragraph_2', 'Crie seu passaporte digital, desbloqueie selos temáticos com animais do Cerrado e do Pantanal, participe de roteiros interativos, receba recompensas e viva momentos inesquecíveis! Cadastre-se para explorar mais e ajudar a melhorar o turismo local!', 'textarea', 'Parágrafo 2 da descrição turística', true),
  ('ms_tourism_button', 'Cadastre-se', 'text', 'Texto do botão da descrição turística', true),
  ('ms_destinations_title', 'Destinos em Destaque', 'text', 'Título da seção de destinos', true),
  ('ms_destinations_description', 'Descubra os principais destinos turísticos de Mato Grosso do Sul', 'textarea', 'Descrição da seção de destinos', true),
  ('ms_destinations_button', 'Ver Todos os Destinos', 'text', 'Texto do botão da seção de destinos', true),
  ('ms_about_title', 'Sobre o Descubra MS', 'text', 'Título da página Sobre', true),
  ('ms_about_subtitle', 'Sua plataforma completa para explorar as maravilhas do estado mais biodiverso do Brasil. Do Pantanal ao Cerrado, conectamos você às experiências mais autênticas.', 'textarea', 'Subtítulo da página Sobre', true),
  ('ms_about_essence_title', 'Nossa Essência', 'text', 'Título "Nossa Essência"', true),
  ('ms_about_mission_title', 'Nossa Missão', 'text', 'Título Missão', true),
  ('ms_about_mission_text', 'Conectar turistas a experiências autênticas no Mato Grosso do Sul, promovendo o turismo sustentável e valorizando a cultura local, a biodiversidade única do Pantanal e as belezas naturais do Cerrado.', 'textarea', 'Texto da Missão', true),
  ('ms_about_vision_title', 'Nossa Visão', 'text', 'Título Visão', true),
  ('ms_about_vision_text', 'Ser a principal plataforma de turismo do Centro-Oeste brasileiro, reconhecida pela inovação tecnológica e pelo compromisso com o desenvolvimento sustentável das comunidades locais.', 'textarea', 'Texto da Visão', true),
  ('ms_footer_copyright', '© 2025 Descubra Mato Grosso do Sul. Todos os direitos reservados.', 'text', 'Copyright do rodapé', true),
  ('ms_footer_privacy_link', 'Política de Privacidade', 'text', 'Link Política de Privacidade', true),
  ('ms_footer_terms_link', 'Termos de Uso', 'text', 'Link Termos de Uso', true)
ON CONFLICT (content_key) DO UPDATE
SET content_value = EXCLUDED.content_value,
    updated_at = NOW();
