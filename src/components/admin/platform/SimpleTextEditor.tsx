// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { platformContentService, PlatformContent } from '@/services/admin/platformContentService';
import { Save, Loader2, Check, RotateCcw, Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { LabelWithHelp } from '@/components/admin/ui/LabelWithHelp';

interface TextField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'json' | 'toggle' | 'select';
  placeholder?: string;
  section: string;
  options?: { value: string; label: string }[];
}

interface SimpleTextEditorProps {
  platform: 'viajar' | 'descubra_ms';
}

// Definição dos campos editáveis - SIMPLES, sem JSON
const TEXT_FIELDS: Record<string, TextField[]> = {
  viajar: [
    // Hero
    { key: 'viajar_hero_badge', label: 'Badge (texto pequeno)', type: 'text', placeholder: 'Plataforma #1 de Turismo Inteligente', section: 'Hero Principal' },
    { key: 'viajar_hero_title', label: 'Título Principal', type: 'text', placeholder: 'ViajARTur', section: 'Hero Principal' },
    { key: 'viajar_hero_subtitle', label: 'Subtítulo', type: 'text', placeholder: 'Ecossistema inteligente de turismo', section: 'Hero Principal' },
    { key: 'viajar_hero_description', label: 'Descrição', type: 'textarea', placeholder: 'Transforme dados em decisões estratégicas...', section: 'Hero Principal' },
    { key: 'viajar_hero_cta_primary', label: 'Botão Principal', type: 'text', placeholder: 'Acessar Plataforma', section: 'Hero Principal' },
    { key: 'viajar_hero_cta_secondary', label: 'Botão Secundário', type: 'text', placeholder: 'Agendar Demo', section: 'Hero Principal' },
    { key: 'viajar_hero_video_url', label: 'Vídeo (URL YouTube)', type: 'text', placeholder: 'https://youtube.com/...', section: 'Hero Principal' },
    
    // Funcionalidades
    { key: 'viajar_features_title', label: 'Título da Seção', type: 'text', placeholder: 'Soluções Inteligentes', section: 'Funcionalidades' },
    { key: 'viajar_features_subtitle', label: 'Subtítulo', type: 'textarea', placeholder: 'Tecnologia de ponta para transformar...', section: 'Funcionalidades' },
    
    // Funcionalidade 1
    { key: 'viajar_feature_1_title', label: 'Funcionalidade 1 - Título', type: 'text', placeholder: 'Guilherme IA', section: 'Funcionalidades' },
    { key: 'viajar_feature_1_description', label: 'Funcionalidade 1 - Descrição', type: 'textarea', placeholder: 'Assistente inteligente...', section: 'Funcionalidades' },
    
    // Funcionalidade 2
    { key: 'viajar_feature_2_title', label: 'Funcionalidade 2 - Título', type: 'text', placeholder: 'Revenue Optimizer', section: 'Funcionalidades' },
    { key: 'viajar_feature_2_description', label: 'Funcionalidade 2 - Descrição', type: 'textarea', placeholder: 'Precificação dinâmica...', section: 'Funcionalidades' },
    
    // Funcionalidade 3
    { key: 'viajar_feature_3_title', label: 'Funcionalidade 3 - Título', type: 'text', placeholder: 'Market Intelligence', section: 'Funcionalidades' },
    { key: 'viajar_feature_3_description', label: 'Funcionalidade 3 - Descrição', type: 'textarea', placeholder: 'Análise de mercado...', section: 'Funcionalidades' },
    
    // Funcionalidade 4
    { key: 'viajar_feature_4_title', label: 'Funcionalidade 4 - Título', type: 'text', placeholder: 'Inventário Turístico', section: 'Funcionalidades' },
    { key: 'viajar_feature_4_description', label: 'Funcionalidade 4 - Descrição', type: 'textarea', placeholder: 'Gestão de atrativos...', section: 'Funcionalidades' },
    
    // Funcionalidade 5
    { key: 'viajar_feature_5_title', label: 'Funcionalidade 5 - Título', type: 'text', placeholder: 'Gestão de Eventos', section: 'Funcionalidades' },
    { key: 'viajar_feature_5_description', label: 'Funcionalidade 5 - Descrição', type: 'textarea', placeholder: 'Planejamento e análise...', section: 'Funcionalidades' },
    
    // Funcionalidade 6
    { key: 'viajar_feature_6_title', label: 'Funcionalidade 6 - Título', type: 'text', placeholder: 'Gestão de CATs', section: 'Funcionalidades' },
    { key: 'viajar_feature_6_description', label: 'Funcionalidade 6 - Descrição', type: 'textarea', placeholder: 'Controle de Centros...', section: 'Funcionalidades' },
    
    // Relatórios
    { key: 'viajar_reports_badge', label: 'Badge', type: 'text', placeholder: 'Novidade', section: 'Relatórios de Dados' },
    { key: 'viajar_reports_title', label: 'Título', type: 'text', placeholder: 'Relatórios de Dados de Turismo', section: 'Relatórios de Dados' },
    { key: 'viajar_reports_description', label: 'Descrição', type: 'textarea', placeholder: 'Acesse dados agregados...', section: 'Relatórios de Dados' },
    { key: 'viajar_reports_item_1', label: 'Item 1 da Lista', type: 'text', placeholder: 'Dados agregados e anonimizados (LGPD)', section: 'Relatórios de Dados' },
    { key: 'viajar_reports_item_2', label: 'Item 2 da Lista', type: 'text', placeholder: 'Perfil demográfico dos visitantes', section: 'Relatórios de Dados' },
    { key: 'viajar_reports_item_3', label: 'Item 3 da Lista', type: 'text', placeholder: 'Origem e propósito de viagem', section: 'Relatórios de Dados' },
    { key: 'viajar_reports_item_4', label: 'Item 4 da Lista', type: 'text', placeholder: 'Interações na plataforma Descubra MS', section: 'Relatórios de Dados' },
    { key: 'viajar_reports_button_primary', label: 'Botão Principal', type: 'text', placeholder: 'Saiba Mais', section: 'Relatórios de Dados' },
    { key: 'viajar_reports_button_secondary', label: 'Botão Secundário', type: 'text', placeholder: 'Solicitar Relatório', section: 'Relatórios de Dados' },
    
    // Descubra MS
    { key: 'viajar_descubra_ms_badge', label: 'Badge', type: 'text', placeholder: 'Case de Sucesso', section: 'Descubra MS' },
    { key: 'viajar_descubra_ms_title', label: 'Título', type: 'text', placeholder: 'Descubra Mato Grosso do Sul', section: 'Descubra MS' },
    { key: 'viajar_descubra_ms_description', label: 'Descrição', type: 'textarea', placeholder: 'Nossa primeira implementação...', section: 'Descubra MS' },
    { key: 'viajar_descubra_ms_item_1', label: 'Item 1 da Lista', type: 'text', placeholder: 'Guatá - Assistente IA regional', section: 'Descubra MS' },
    { key: 'viajar_descubra_ms_item_2', label: 'Item 2 da Lista', type: 'text', placeholder: 'Passaporte Digital interativo', section: 'Descubra MS' },
    { key: 'viajar_descubra_ms_item_3', label: 'Item 3 da Lista', type: 'text', placeholder: 'Mapas e rotas inteligentes', section: 'Descubra MS' },
    { key: 'viajar_descubra_ms_item_4', label: 'Item 4 da Lista', type: 'text', placeholder: 'Analytics em tempo real', section: 'Descubra MS' },
    { key: 'viajar_descubra_ms_button', label: 'Texto do Botão', type: 'text', placeholder: 'Conhecer Descubra MS', section: 'Descubra MS' },
    
    // Vídeo
    { key: 'viajar_video_title', label: 'Título', type: 'text', placeholder: 'Veja a Plataforma em Ação', section: 'Vídeo' },
    { key: 'viajar_video_description', label: 'Descrição', type: 'textarea', placeholder: 'Descubra como a ViajARTur...', section: 'Vídeo' },
    
    // CTA Final
    { key: 'viajar_cta_title', label: 'Título', type: 'text', placeholder: 'Pronto para Transformar seu Turismo?', section: 'Call to Action' },
    { key: 'viajar_cta_description', label: 'Descrição', type: 'textarea', placeholder: 'Junte-se a empresas...', section: 'Call to Action' },
    { key: 'viajar_cta_button_primary', label: 'Botão Principal', type: 'text', placeholder: 'Solicitar Demonstração', section: 'Call to Action' },
    { key: 'viajar_cta_button_secondary', label: 'Botão Secundário', type: 'text', placeholder: 'Ver Planos', section: 'Call to Action' },
    
    // Cases de Sucesso
    { key: 'viajar_cases_descubra_ms_title', label: 'Descubra MS - Título', type: 'text', placeholder: 'Descubra MS', section: 'Cases de Sucesso' },
    { key: 'viajar_cases_descubra_ms_subtitle', label: 'Descubra MS - Subtítulo', type: 'text', placeholder: 'Plataforma desenvolvida', section: 'Cases de Sucesso' },
    { key: 'viajar_cases_descubra_ms_technologies', label: 'Descubra MS - Tecnologias (JSON)', type: 'json', placeholder: '["Guatá IA", "Passaporte Digital", "Analytics", "Gestão de Eventos"]', section: 'Cases de Sucesso' },
    { key: 'viajar_cases_descubra_ms_image', label: 'Descubra MS - Imagem', type: 'image', placeholder: 'URL da imagem ou faça upload', section: 'Cases de Sucesso' },
    { key: 'viajar_cases_koda_title', label: 'Koda - Título', type: 'text', placeholder: 'Koda', section: 'Cases de Sucesso' },
    { key: 'viajar_cases_koda_subtitle', label: 'Koda - Subtítulo', type: 'text', placeholder: 'Chatbot desenvolvido', section: 'Cases de Sucesso' },
    { key: 'viajar_cases_koda_technologies', label: 'Koda - Tecnologias (JSON)', type: 'json', placeholder: '["IA Conversacional", "Multi-idioma", "Web Search"]', section: 'Cases de Sucesso' },
    { key: 'viajar_cases_koda_image', label: 'Koda - Imagem', type: 'image', placeholder: 'URL da imagem ou faça upload', section: 'Cases de Sucesso' },
    
    // Página Sobre
    { key: 'viajar_sobre_destaque', label: 'Texto de Destaque', type: 'text', placeholder: 'Transformar dados turísticos em decisões estratégicas que geram impacto real.', section: 'Página Sobre' },
    { key: 'viajar_sobre_narrativa', label: 'Narrativa Unificada (Missão + Visão)', type: 'textarea', placeholder: 'A ViajarTur existe para transformar dados turísticos em decisões estratégicas...', section: 'Página Sobre' },
    { key: 'viajar_sobre_missao', label: 'Nossa Missão', type: 'textarea', placeholder: 'Democratizar tecnologia de ponta para o setor turístico.', section: 'Página Sobre' },
    { key: 'viajar_sobre_visao', label: 'Nossa Visão', type: 'textarea', placeholder: 'Ser a plataforma líder em gestão inteligente de turismo no Brasil.', section: 'Página Sobre' },
    
    // Página Preços
    { key: 'viajar_pricing_hero_title', label: 'Título do Hero', type: 'text', placeholder: 'Escolha o Plano Perfeito para o Seu Negócio', section: 'Página Preços' },
    { key: 'viajar_pricing_hero_subtitle', label: 'Subtítulo do Hero', type: 'text', placeholder: 'Planos Flexíveis para Todos os Tamanhos', section: 'Página Preços' },
    { key: 'viajar_pricing_hero_description', label: 'Descrição do Hero', type: 'textarea', placeholder: 'Do pequeno estabelecimento ao grande hotel, temos o plano ideal para impulsionar seu turismo.', section: 'Página Preços' },
    { key: 'viajar_pricing_plans_title', label: 'Título da Seção de Planos', type: 'text', placeholder: 'Todos os Planos Incluem', section: 'Página Preços' },
    { key: 'viajar_pricing_plans_subtitle', label: 'Subtítulo da Seção de Planos', type: 'textarea', placeholder: 'Recursos fundamentais disponíveis em todos os planos', section: 'Página Preços' },
    { key: 'viajar_pricing_cta_title', label: 'Título do CTA', type: 'text', placeholder: 'Pronto para começar?', section: 'Página Preços' },
    { key: 'viajar_pricing_cta_description', label: 'Descrição do CTA', type: 'textarea', placeholder: 'Escolha seu plano e comece a transformar seu negócio hoje mesmo.', section: 'Página Preços' },
    
    // Página Contato
    { key: 'viajar_contact_hero_title', label: 'Título do Hero', type: 'text', placeholder: 'Entre em Contato', section: 'Página Contato' },
    { key: 'viajar_contact_hero_subtitle', label: 'Subtítulo do Hero', type: 'textarea', placeholder: 'Estamos aqui para ajudar você a transformar seu negócio turístico.', section: 'Página Contato' },
    { key: 'viajar_contact_form_title', label: 'Título do Formulário', type: 'text', placeholder: 'Envie sua Mensagem', section: 'Página Contato' },
    { key: 'viajar_contact_form_description', label: 'Descrição do Formulário', type: 'textarea', placeholder: 'Preencha o formulário abaixo e nossa equipe entrará em contato em breve.', section: 'Página Contato' },
    
    // Página Soluções
    { key: 'viajar_solutions_hero_title', label: 'Título do Hero', type: 'text', placeholder: 'Soluções Inteligentes para o Turismo', section: 'Página Soluções' },
    { key: 'viajar_solutions_hero_subtitle', label: 'Subtítulo do Hero', type: 'textarea', placeholder: 'Tecnologia de ponta para transformar a gestão do turismo', section: 'Página Soluções' },
    { key: 'viajar_solutions_items', label: 'Itens de Soluções (JSON)', type: 'json', placeholder: '[{"title": "Revenue Optimizer", "description": "..."}]', section: 'Página Soluções' },
  ],
  descubra_ms: [
    // Hero Principal
    { key: 'ms_hero_title', label: 'Título Principal', type: 'text', placeholder: 'Descubra Mato Grosso do Sul', section: 'Hero Principal' },
    { key: 'ms_hero_subtitle', label: 'Subtítulo', type: 'textarea', placeholder: 'Explore destinos incríveis...', section: 'Hero Principal' },
    { key: 'ms_hero_button_1', label: 'Botão 1', type: 'text', placeholder: 'Explorar Destinos', section: 'Hero Principal' },
    { key: 'ms_hero_button_2', label: 'Botão 2', type: 'text', placeholder: 'Ver Galerias', section: 'Hero Principal' },
    { key: 'ms_hero_button_3', label: 'Botão 3', type: 'text', placeholder: 'Eventos', section: 'Hero Principal' },
    
    // Hero Universal
    { key: 'ms_hero_universal_subtitle', label: 'Subtítulo do Hero Universal', type: 'textarea', placeholder: 'Do Pantanal ao Cerrado...', section: 'Hero Universal' },
    { key: 'ms_hero_universal_button_1', label: 'Botão 1', type: 'text', placeholder: 'Descubra Agora', section: 'Hero Universal' },
    { key: 'ms_hero_universal_button_2', label: 'Botão 2', type: 'text', placeholder: 'Passaporte Digital', section: 'Hero Universal' },
    { key: 'ms_hero_universal_button_3', label: 'Botão 3', type: 'text', placeholder: 'Converse com o Guatá', section: 'Hero Universal' },
    { key: 'ms_hero_video_url', label: 'Vídeo de Fundo (URL)', type: 'text', placeholder: 'URL do YouTube, Vimeo ou vídeo MP4', section: 'Hero Universal' },
    { key: 'ms_hero_video_placeholder_image_url', label: 'Imagem de Placeholder do Vídeo (URL)', type: 'text', placeholder: 'URL da imagem exibida enquanto o vídeo carrega', section: 'Hero Universal' },
    { key: 'ms_guata_roteiro_image_url', label: 'Imagem do Guatá - Banner Roteiro (URL)', type: 'text', placeholder: 'URL da imagem do Guatá para o banner "Montamos seu roteiro"', section: 'Hero Universal' },
    
    // Banner Roteiro Personalizado
    { key: 'ms_roteiro_banner_enabled', label: 'Ativar Banner de Roteiros Personalizados', type: 'toggle', section: 'Banner Roteiro Personalizado' },
    { key: 'ms_roteiro_banner_image', label: 'Imagem do Banner (lateral)', type: 'image', placeholder: 'URL ou upload da imagem ao lado do texto', section: 'Banner Roteiro Personalizado' },
    { key: 'ms_roteiro_contact_type', label: 'Tipo de Contato', type: 'select', section: 'Banner Roteiro Personalizado', options: [
      { value: 'whatsapp', label: 'Apenas WhatsApp' },
      { value: 'link', label: 'Apenas Link Externo' },
      { value: 'both', label: 'WhatsApp e Link Externo' }
    ]},
    { key: 'ms_roteiro_external_link', label: 'Link Externo (URL)', type: 'text', placeholder: 'https://exemplo.com', section: 'Banner Roteiro Personalizado' },
    { key: 'ms_roteiro_external_link_text', label: 'Texto do Botão Link Externo', type: 'text', placeholder: 'Acessar Site', section: 'Banner Roteiro Personalizado' },
    
    // Descrição Turística
    { key: 'ms_tourism_title', label: 'Título', type: 'text', placeholder: 'Descubra Mato Grosso do Sul – Viva essa experiência!', section: 'Descrição Turística' },
    { key: 'ms_tourism_paragraph_1', label: 'Parágrafo 1', type: 'textarea', placeholder: 'Prepare-se para descobrir...', section: 'Descrição Turística' },
    { key: 'ms_tourism_paragraph_2', label: 'Parágrafo 2', type: 'textarea', placeholder: 'Crie seu passaporte digital...', section: 'Descrição Turística' },
    { key: 'ms_tourism_button', label: 'Texto do Botão', type: 'text', placeholder: 'Cadastre-se', section: 'Descrição Turística' },
    
    // Destinos em Destaque
    { key: 'ms_destinations_title', label: 'Título', type: 'text', placeholder: 'Destinos em Destaque', section: 'Destinos em Destaque' },
    { key: 'ms_destinations_description', label: 'Descrição', type: 'textarea', placeholder: 'Descubra os principais destinos...', section: 'Destinos em Destaque' },
    { key: 'ms_destinations_button', label: 'Texto do Botão', type: 'text', placeholder: 'Ver Todos os Destinos', section: 'Destinos em Destaque' },
    
    // Página Sobre
    { key: 'ms_about_title', label: 'Título da Página', type: 'text', placeholder: 'Sobre o Descubra MS', section: 'Página Sobre' },
    { key: 'ms_about_subtitle', label: 'Subtítulo', type: 'textarea', placeholder: 'Sua plataforma completa para explorar as maravilhas do estado mais biodiverso do Brasil.', section: 'Página Sobre' },
    { key: 'ms_about_essence_title', label: 'Título "Nossa Essência"', type: 'text', placeholder: 'Nossa Essência', section: 'Página Sobre' },
    { key: 'ms_about_mission_title', label: 'Título Missão', type: 'text', placeholder: 'Nossa Missão', section: 'Página Sobre' },
    { key: 'ms_about_mission_text', label: 'Texto da Missão', type: 'textarea', placeholder: 'Conectar turistas a experiências autênticas...', section: 'Página Sobre' },
    { key: 'ms_about_vision_title', label: 'Título Visão', type: 'text', placeholder: 'Nossa Visão', section: 'Página Sobre' },
    { key: 'ms_about_vision_text', label: 'Texto da Visão', type: 'textarea', placeholder: 'Ser a principal plataforma de turismo...', section: 'Página Sobre' },
    
    // Seção Experiências
    { key: 'ms_experience_title', label: 'Título', type: 'text', placeholder: 'Experiências Completas', section: 'Seção Experiências' },
    { key: 'ms_experience_subtitle', label: 'Subtítulo', type: 'textarea', placeholder: 'Descubra tudo que Mato Grosso do Sul tem para oferecer com experiências únicas e inesquecíveis', section: 'Seção Experiências' },
    { key: 'ms_experience_description', label: 'Descrição', type: 'textarea', placeholder: 'Explore diferentes tipos de experiências turísticas disponíveis na plataforma', section: 'Seção Experiências' },
    
    // Seção CATs
    { key: 'ms_cats_title', label: 'Título', type: 'text', placeholder: 'Centros de Atendimento ao Turista', section: 'Seção CATs' },
    { key: 'ms_cats_description', label: 'Descrição', type: 'textarea', placeholder: 'Os CATs são pontos de apoio onde você encontra informações e orientações para aproveitar ao máximo sua experiência em Mato Grosso do Sul.', section: 'Seção CATs' },
    
    // Footer
    { key: 'ms_footer_about', label: 'Texto Sobre', type: 'textarea', placeholder: 'Sobre o Descubra MS...', section: 'Rodapé' },
    { key: 'ms_footer_links', label: 'Links do Footer (JSON)', type: 'json', placeholder: '[{"label": "Destinos", "path": "/destinos"}]', section: 'Rodapé' },
    { key: 'ms_footer_newsletter_title', label: 'Título da Newsletter', type: 'text', placeholder: 'Receba nossas novidades', section: 'Rodapé' },
    { key: 'ms_footer_newsletter_description', label: 'Descrição da Newsletter', type: 'textarea', placeholder: 'Cadastre-se para receber informações sobre eventos e destinos', section: 'Rodapé' },
    { key: 'ms_footer_copyright', label: 'Copyright', type: 'text', placeholder: '© 2025 Descubra Mato Grosso do Sul. Todos os direitos reservados.', section: 'Rodapé' },
    { key: 'ms_footer_privacy_link', label: 'Link Política de Privacidade', type: 'text', placeholder: 'Política de Privacidade', section: 'Rodapé' },
    { key: 'ms_footer_terms_link', label: 'Link Termos de Uso', type: 'text', placeholder: 'Termos de Uso', section: 'Rodapé' },
  ],
};

const BUCKET_NAME = 'tourism-images';

// Campos que devem ser salvos em site_settings ao invés de platform_content
const SITE_SETTINGS_KEYS = [
  'ms_roteiro_banner_enabled',
  'ms_roteiro_contact_type',
  'ms_roteiro_external_link',
  'ms_roteiro_external_link_text'
];

// Função helper para gerar tooltips baseado na chave do campo
const getHelpText = (key: string, type: string): string => {
  // Tooltips específicos por campo
  const specificTooltips: Record<string, string> = {
    // ViajARTur - Hero
    'viajar_hero_badge': 'Texto pequeno que aparece acima do título principal',
    'viajar_hero_title': 'Nome da plataforma. Será exibido em destaque na página inicial',
    'viajar_hero_subtitle': 'Frase de efeito que resume a proposta da plataforma',
    'viajar_hero_description': 'Texto explicativo mais detalhado sobre a plataforma',
    'viajar_hero_cta_primary': 'Texto do botão principal. Use verbos de ação',
    'viajar_hero_cta_secondary': 'Texto do botão secundário',
    'viajar_hero_video_url': 'Link do YouTube. O vídeo será incorporado como background',
    
    // ViajARTur - Cases
    'viajar_cases_descubra_ms_title': 'Título do case Descubra MS',
    'viajar_cases_descubra_ms_technologies': 'Array JSON com tecnologias: ["Guatá IA", "Passaporte Digital"]',
    'viajar_cases_koda_title': 'Título do case Koda',
    'viajar_cases_koda_technologies': 'Array JSON com tecnologias: ["IA Conversacional", "Multi-idioma"]',
    
    // ViajARTur - Sobre
    'viajar_sobre_destaque': 'Texto de destaque que aparece no topo da página Sobre',
    'viajar_sobre_narrativa': 'Narrativa unificada combinando missão e visão em um texto corrido',
    
    // Descubra MS - Hero
    'ms_hero_title': 'Título principal da página inicial do Descubra MS',
    'ms_hero_subtitle': 'Descrição que convida o visitante a explorar o estado',
    'ms_hero_video_url': 'Link do YouTube para o vídeo de fundo do hero',
    'ms_hero_video_placeholder_image_url': 'Imagem exibida enquanto o vídeo carrega',
    'ms_guata_roteiro_image_url': 'Imagem do Guatá para o banner "Montamos seu roteiro"',
    'ms_roteiro_banner_image': 'Imagem lateral do banner de roteiros; se vazia, usa a imagem do Guatá (campo acima no Hero) ou o padrão do site.',
    
    // Descubra MS - Destinos
    'ms_destinations_title': 'Título da seção de destinos em destaque',
    'ms_destinations_description': 'Descrição que convida a explorar os destinos',
    'ms_destinations_button': 'Texto do botão para ver todos os destinos',
    
    // Descubra MS - Experiências
    'ms_experience_title': 'Título da seção de experiências',
    'ms_experience_subtitle': 'Subtítulo explicando as experiências disponíveis',
    
    // Descubra MS - CATs
    'ms_cats_title': 'Título da seção de Centros de Atendimento ao Turista',
    'ms_cats_description': 'Descrição explicando o que são os CATs',
  };
  
  // Se houver tooltip específico, retornar
  if (specificTooltips[key]) {
    return specificTooltips[key];
  }
  
  // Tooltips genéricos por tipo
  if (type === 'text') {
    return 'Texto simples. Recomendado: até 60 caracteres para títulos.';
  }
  if (type === 'textarea') {
    return 'Texto longo. Use para descrições e parágrafos.';
  }
  if (type === 'image') {
    return 'URL da imagem ou faça upload. Formatos: JPG, PNG, WebP. Tamanho máx: 5MB.';
  }
  if (type === 'json') {
    return 'Formato JSON válido. Ex: ["item1", "item2"] ou {"key": "value"}.';
  }
  
  return 'Este campo será exibido publicamente no site.';
};

export default function SimpleTextEditor({ platform }: SimpleTextEditorProps) {
  const { toast } = useToast();
  const [contents, setContents] = useState<Record<string, string>>({});
  const [originalContents, setOriginalContents] = useState<Record<string, string>>({});
  const [contentIds, setContentIds] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fields = TEXT_FIELDS[platform] || [];
  const platformName = platform === 'viajar' ? 'ViajARTur' : 'Descubra MS';
  const prefix = platform === 'viajar' ? 'viajar_' : 'ms_';

  // Agrupar campos por seção
  const fieldsBySection = fields.reduce((acc, field) => {
    if (!acc[field.section]) {
      acc[field.section] = [];
    }
    acc[field.section].push(field);
    return acc;
  }, {} as Record<string, TextField[]>);

  useEffect(() => {
    loadContent();
  }, [platform]);

  const loadContent = async () => {
    setLoading(true);
    try {
      // Log removido para produção - usar apenas em desenvolvimento
      if (import.meta.env.DEV) console.log('📥 [SimpleTextEditor] Carregando conteúdo com prefixo:', prefix);
      const data = await platformContentService.getContentByPrefix(prefix);
      if (import.meta.env.DEV) console.log('📦 [SimpleTextEditor] Dados recebidos do banco:', data.length, 'itens');
      
      const contentMap: Record<string, string> = {};
      const idMap: Record<string, string> = {};

      // Filtrar apenas campos que pertencem à plataforma atual
      const platformFieldKeys = new Set(fields.map(f => f.key));
      if (import.meta.env.DEV) console.log('🔑 [SimpleTextEditor] Campos esperados:', Array.from(platformFieldKeys));

      // Carregar valores do banco - APENAS para campos desta plataforma
      data.forEach(item => {
        // Garantir que apenas campos desta plataforma sejam carregados
        if (platformFieldKeys.has(item.content_key)) {
          contentMap[item.content_key] = item.content_value || '';
          idMap[item.content_key] = item.id;
          if (import.meta.env.DEV) console.log('✅ [SimpleTextEditor] Campo carregado:', {
            key: item.content_key,
            value: (item.content_value || '').substring(0, 50),
            id: item.id
          });
        }
      });

      // Carregar campos de roteiro de site_settings
      const { data: siteSettings, error: siteSettingsError } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .eq('platform', 'ms')
        .in('setting_key', SITE_SETTINGS_KEYS);

      if (!siteSettingsError && siteSettings) {
        siteSettings.forEach(setting => {
          const value = typeof setting.setting_value === 'string' 
            ? setting.setting_value.replace(/^"|"$/g, '') // Remove aspas JSON se houver
            : String(setting.setting_value || '');
          contentMap[setting.setting_key] = value;
          if (import.meta.env.DEV) console.log('✅ [SimpleTextEditor] Campo de roteiro carregado de site_settings:', {
            key: setting.setting_key,
            value: value.substring(0, 50)
          });
        });
      } else if (siteSettingsError) {
        console.error('❌ [SimpleTextEditor] Erro ao carregar site_settings:', siteSettingsError);
      }

      // Para campos que não existem no banco, usar string vazia (não placeholder)
      // O placeholder é apenas uma dica visual, não o valor real
      fields.forEach(field => {
        if (!contentMap[field.key]) {
          contentMap[field.key] = '';
          if (import.meta.env.DEV) console.log('⚠️ [SimpleTextEditor] Campo não encontrado no banco, usando vazio:', field.key);
        }
      });

      if (import.meta.env.DEV) console.log('📊 [SimpleTextEditor] Estado final:', {
        contentsKeys: Object.keys(contentMap),
        idsKeys: Object.keys(idMap),
        totalFields: fields.length
      });

      setContents(contentMap);
      setOriginalContents({ ...contentMap }); // Salvar cópia dos valores originais
      setContentIds(idMap);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [SimpleTextEditor] Erro ao carregar conteúdo:', err);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar o conteúdo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: string, value: string) => {
    if (import.meta.env.DEV) console.log('✏️ [SimpleTextEditor] updateField chamado:', { key, value: value.substring(0, 100), valueLength: value.length });
    setContents(prev => {
      const newContents = { ...prev, [key]: value };
      if (import.meta.env.DEV) console.log('📝 [SimpleTextEditor] Estado contents atualizado:', { 
        key, 
        newValue: newContents[key]?.substring(0, 100), 
        newValueLength: newContents[key]?.length || 0 
      });
      return newContents;
    });
    setSaved(prev => ({ ...prev, [key]: false }));
  };

  const hasChanges = (key: string): boolean => {
    const currentValue = contents[key] !== undefined ? contents[key] : '';
    const originalValue = originalContents[key] !== undefined ? originalContents[key] : '';
    // Comparar valores diretamente (sem trim para preservar valores exatos)
    return currentValue !== originalValue;
  };

  const revertField = (key: string) => {
    const originalValue = originalContents[key] || '';
    setContents(prev => ({ ...prev, [key]: originalValue }));
    setSaved(prev => ({ ...prev, [key]: false }));
    setImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[key];
      return newPreviews;
    });
    toast({
      title: 'Campo revertido',
      description: 'O campo foi restaurado ao valor original.',
    });
  };

  const handleImageSelect = (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (import.meta.env.DEV) console.log('📎 [SimpleTextEditor] handleImageSelect chamado para:', key);
    const file = event.target.files?.[0];
    if (!file) {
      console.warn('⚠️ [SimpleTextEditor] Nenhum arquivo selecionado');
      return;
    }

    if (import.meta.env.DEV) console.log('📄 [SimpleTextEditor] Arquivo selecionado:', { name: file.name, size: file.size, type: file.type });

    if (!file.type.startsWith('image/')) {
      console.error('❌ [SimpleTextEditor] Arquivo não é uma imagem:', file.type);
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ [SimpleTextEditor] Arquivo muito grande:', file.size);
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    if (import.meta.env.DEV) console.log('🖼️ [SimpleTextEditor] Criando preview da imagem...');
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      if (import.meta.env.DEV) console.log('✅ [SimpleTextEditor] Preview criado, tamanho:', preview?.length);
      setImagePreviews(prev => ({ ...prev, [key]: preview }));
    };
    reader.onerror = (error) => {
      console.error('❌ [SimpleTextEditor] Erro ao ler arquivo:', error);
      toast({
        title: 'Erro ao ler arquivo',
        description: 'Não foi possível ler o arquivo selecionado.',
        variant: 'destructive',
      });
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (key: string, file: File): Promise<string | null> => {
    if (import.meta.env.DEV) console.log('📤 [SimpleTextEditor] Iniciando upload:', { key, fileName: file.name, fileSize: file.size, fileType: file.type });
    
    try {
      // Verificar e renovar token se necessário antes do upload
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ [SimpleTextEditor] Nenhuma sessão encontrada');
        toast({
          title: 'Erro de autenticação',
          description: 'Você precisa estar logado para fazer upload de imagens.',
          variant: 'destructive',
        });
        return null;
      }
      
      if (session?.expires_at) {
        const expiresAt = session.expires_at * 1000;
        const timeUntilExpiry = expiresAt - Date.now();
        if (timeUntilExpiry < 5 * 60 * 1000 && session.refresh_token) {
          if (import.meta.env.DEV) console.log('🔄 [SimpleTextEditor] Token próximo de expirar, renovando antes do upload...');
          await supabase.auth.refreshSession();
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `platform-content/${key}/${uuidv4()}.${fileExt}`;
      if (import.meta.env.DEV) console.log('📁 [SimpleTextEditor] Nome do arquivo gerado:', fileName);

      let uploadError;
      let retries = 1;
      
      // Tentar upload com retry em caso de erro 401
      while (retries >= 0) {
        if (import.meta.env.DEV) console.log(`🔄 [SimpleTextEditor] Tentativa de upload (${retries + 1}/2)...`);
        const result = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        uploadError = result.error;
        
        if (uploadError) {
          console.error('❌ [SimpleTextEditor] Erro no upload:', {
            message: uploadError.message,
            statusCode: uploadError.statusCode,
            name: uploadError.name
          });
        } else {
          if (import.meta.env.DEV) console.log('✅ [SimpleTextEditor] Upload bem-sucedido!');
        }
        
        // Se não há erro ou não é erro de JWT, sair do loop
        if (!uploadError || !uploadError.message?.includes('exp') || retries === 0) {
          break;
        }
        
        // Se é erro de JWT, tentar renovar e retry
        if (uploadError.message?.includes('exp') && retries > 0) {
          if (import.meta.env.DEV) console.log('🔄 [SimpleTextEditor] Token expirado no upload, renovando...');
          await supabase.auth.refreshSession();
          await new Promise(resolve => setTimeout(resolve, 300));
          retries--;
        }
      }

      if (uploadError) {
        if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
          console.error('❌ [SimpleTextEditor] Bucket não encontrado:', BUCKET_NAME);
          toast({
            title: 'Aviso',
            description: `Bucket "${BUCKET_NAME}" não encontrado. Você pode usar uma URL manualmente.`,
            variant: 'default',
          });
          return null;
        }
        console.error('❌ [SimpleTextEditor] Erro no upload após retries:', uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData?.publicUrl || null;
      if (import.meta.env.DEV) console.log('🔗 [SimpleTextEditor] URL pública gerada:', publicUrl);
      
      return publicUrl;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [SimpleTextEditor] Erro capturado no upload:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      toast({
        title: 'Erro no upload',
        description: error.message || 'Não foi possível fazer upload da imagem. Verifique o console para mais detalhes.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleImageUpload = async (key: string) => {
    const input = fileInputRefs.current[key];
    const file = input?.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [key]: true }));

    try {
      if (import.meta.env.DEV) console.log('🚀 [SimpleTextEditor] Iniciando upload para:', key);
      const uploadedUrl = await uploadImage(key, file);
      if (import.meta.env.DEV) console.log('📥 [SimpleTextEditor] URL recebida:', uploadedUrl);
      if (uploadedUrl) {
        updateField(key, uploadedUrl);
        setImagePreviews(prev => ({ ...prev, [key]: uploadedUrl }));
        
        // Salvar automaticamente após upload
        try {
          const field = fields.find(f => f.key === key);
          const id = contentIds[key];
          
          if (id) {
            await platformContentService.updateContent(id, uploadedUrl);
          } else {
            const newContent = await platformContentService.createContent({
              content_key: key,
              content_value: uploadedUrl,
              content_type: field?.type || 'text',
              description: field?.label || null,
              is_active: true,
            });
            // Atualizar IDs
            setContentIds(prev => ({ ...prev, [key]: newContent.id }));
          }
          
          setSaved(prev => ({ ...prev, [key]: true }));
          setOriginalContents(prev => ({ ...prev, [key]: uploadedUrl }));
          
          toast({
            title: 'Sucesso!',
            description: 'Imagem enviada e salva automaticamente.',
          });
          
          // Remover indicador de salvo após 2 segundos
          setTimeout(() => {
            setSaved(prev => ({ ...prev, [key]: false }));
          }, 2000);
        } catch (saveError: unknown) {
          console.error('❌ [SimpleTextEditor] Erro ao salvar no banco:', {
            message: saveError.message,
            stack: saveError.stack,
            key,
            uploadedUrl
          });
          toast({
            title: 'Upload concluído, mas erro ao salvar',
            description: `Imagem enviada, mas erro ao salvar: ${saveError.message}. Clique em "Salvar" manualmente.`,
            variant: 'destructive',
          });
        }
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [SimpleTextEditor] Erro capturado:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        key
      });
      toast({
        title: 'Erro no upload',
        description: error.message || 'Não foi possível fazer upload da imagem. Verifique o console.',
        variant: 'destructive',
      });
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
      if (input) input.value = '';
    }
  };

  const saveField = async (key: string) => {
    // Permitir valores vazios - não fazer trim se o usuário quer salvar string vazia
    const value = contents[key] !== undefined ? contents[key] : '';
    const id = contentIds[key];

    if (import.meta.env.DEV) console.log('💾 [SimpleTextEditor] saveField iniciado:', {
      key,
      value: value.substring(0, 100),
      valueLength: value.length,
      hasId: !!id,
      id,
      fieldType: fields.find(f => f.key === key)?.type
    });

    setSaving(prev => ({ ...prev, [key]: true }));

    try {
      // Se for campo de roteiro, salvar em site_settings
      if (SITE_SETTINGS_KEYS.includes(key)) {
        if (import.meta.env.DEV) console.log('💾 [SimpleTextEditor] Salvando em site_settings:', { key, value: value.substring(0, 100) });
        const field = fields.find(f => f.key === key);
        
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            platform: 'ms',
            setting_key: key,
            setting_value: value,
            description: field?.label || null,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'platform,setting_key',
          });

        if (error) {
          console.error('❌ [SimpleTextEditor] Erro ao salvar em site_settings:', error);
          throw error;
        }

        if (import.meta.env.DEV) console.log('✅ [SimpleTextEditor] Salvo em site_settings com sucesso:', { key });
      } else {
        // Comportamento padrão: salvar em platform_content
        if (id) {
          if (import.meta.env.DEV) console.log('📝 [SimpleTextEditor] Atualizando conteúdo existente:', { key, id, value: value.substring(0, 100) });
          // Atualizar existente
          await platformContentService.updateContent(id, value);
          if (import.meta.env.DEV) console.log('✅ [SimpleTextEditor] updateContent concluído com sucesso:', { key, id });
        } else {
          if (import.meta.env.DEV) console.log('➕ [SimpleTextEditor] Criando novo conteúdo:', { 
            key, 
            value: value.substring(0, 100), 
            fieldType: fields.find(f => f.key === key)?.type 
          });
          // Criar novo
          const field = fields.find(f => f.key === key);
          const newContent = await platformContentService.createContent({
            content_key: key,
            content_value: value,
            content_type: field?.type || 'text',
            description: field?.label || null,
            is_active: true,
          });
          if (import.meta.env.DEV) console.log('✅ [SimpleTextEditor] createContent concluído:', { 
            key, 
            newId: newContent.id, 
            newContentValue: newContent.content_value?.substring(0, 100) 
          });
          // Atualizar IDs
          setContentIds(prev => ({ ...prev, [key]: newContent.id }));
          // Recarregar para obter o ID
          await loadContent();
        }
      }

      setSaved(prev => ({ ...prev, [key]: true }));
      
      // Atualizar valor original após salvar
      setOriginalContents(prev => ({ ...prev, [key]: value }));
      
      if (import.meta.env.DEV) console.log('✅ [SimpleTextEditor] saveField concluído com sucesso:', { key, value: value.substring(0, 100) });
      
      toast({
        title: 'Salvo!',
        description: `${fields.find(f => f.key === key)?.label} foi salvo com sucesso.`,
      });

      // Remover indicador de salvo após 2 segundos
      setTimeout(() => {
        setSaved(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [SimpleTextEditor] Erro ao salvar:', {
        key,
        error: err.message,
        errorDetails: error,
        stack: err.stack
      });
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar.',
        variant: 'destructive',
      });
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Editar Textos - {platformName}
        </h2>
        <p className="text-muted-foreground">
          Edite os textos que aparecem na página inicial. Clique em "Salvar" em cada campo para salvar as alterações.
        </p>
      </div>

      {Object.entries(fieldsBySection).map(([section, sectionFields]) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle>{section}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {sectionFields.map(field => {
              // Usar valor do banco, ou string vazia se não existir
              // O placeholder é apenas uma dica visual no input
              const value = contents[field.key] !== undefined 
                ? contents[field.key] 
                : '';
              const isSaving = saving[field.key];
              const isSaved = saved[field.key];

              const hasChanged = hasChanges(field.key);
              const isEmpty = !value || value.trim() === '';

              // Determinar se o campo ocupa largura total (textarea, json, image)
              const isFullWidth = field.type === 'textarea' || field.type === 'json' || field.type === 'image';
              
              return (
                <div 
                  key={field.key} 
                  className={cn(
                    "space-y-2",
                    isFullWidth && "md:col-span-2"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <LabelWithHelp 
                      htmlFor={field.key}
                      label={field.label}
                      helpText={getHelpText(field.key, field.type)}
                    />
                    <div className="flex items-center gap-2">
                      {hasChanged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => revertField(field.key)}
                          className="h-8"
                          title="Voltar ao valor original"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Voltar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => saveField(field.key)}
                        disabled={isSaving || !hasChanged}
                        className={cn(
                          "h-8",
                          isSaved && "bg-green-500 hover:bg-green-600",
                          !hasChanged && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isSaving ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : isSaved ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Save className="h-3 w-3 mr-1" />
                        )}
                        {isSaved ? 'Salvo!' : 'Salvar'}
                      </Button>
                    </div>
                  </div>
                  {/* Campo especial para imagens com upload */}
                  {field.type === 'image' ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          id={field.key}
                          value={value}
                          onChange={(e) => {
                            
                            updateField(field.key, e.target.value);
                          }}
                          placeholder={field.placeholder}
                          className={cn(
                            "flex-1",
                            hasChanged && "border-amber-300 bg-amber-50/50",
                            isSaved && "border-green-300 bg-green-50/50"
                          )}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          ref={(el) => fileInputRefs.current[field.key] = el}
                          onChange={(e) => handleImageSelect(field.key, e)}
                          className="hidden"
                          id={`file-${field.key}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById(`file-${field.key}`)?.click()}
                          disabled={uploading[field.key]}
                          className="flex items-center gap-2"
                        >
                          {uploading[field.key] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          Upload
                        </Button>
                        {imagePreviews[field.key] && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleImageUpload.bind(null, field.key)}
                            disabled={uploading[field.key]}
                            className="flex items-center gap-2"
                          >
                            {uploading[field.key] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ImageIcon className="h-4 w-4" />
                            )}
                            Enviar
                          </Button>
                        )}
                      </div>
                      {(imagePreviews[field.key] || value) && (
                        <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={imagePreviews[field.key] || value}
                            alt="Preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          {imagePreviews[field.key] && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setImagePreviews(prev => {
                                  const newPreviews = { ...prev };
                                  delete newPreviews[field.key];
                                  return newPreviews;
                                });
                                if (fileInputRefs.current[field.key]) {
                                  fileInputRefs.current[field.key]!.value = '';
                                }
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : field.type === 'json' ? (
                    <Textarea
                      id={field.key}
                      value={value}
                      onChange={(e) => {
                        try {
                          // Validar JSON ao digitar
                          const parsed = JSON.parse(e.target.value);
                          updateField(field.key, JSON.stringify(parsed, null, 2));
                        } catch {
                          // Se não for JSON válido ainda, apenas atualizar o texto
                          updateField(field.key, e.target.value);
                        }
                      }}
                      placeholder={field.placeholder || '[] ou {}'}
                      rows={6}
                      className={cn(
                        "font-mono text-sm",
                        hasChanged && "border-amber-300 bg-amber-50/50",
                        isSaved && "border-green-300 bg-green-50/50"
                      )}
                    />
                  ) : field.type === 'textarea' ? (
                    <Textarea
                      id={field.key}
                      value={value}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className={cn(
                        hasChanged && "border-amber-300 bg-amber-50/50",
                        isSaved && "border-green-300 bg-green-50/50"
                      )}
                    />
                  ) : field.type === 'toggle' ? (
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={field.key}
                        checked={value === 'true' || value === true}
                        onChange={(e) => updateField(field.key, e.target.checked ? 'true' : 'false')}
                        className={cn(
                          "w-4 h-4 text-blue-600 rounded focus:ring-blue-500",
                          hasChanged && "ring-2 ring-amber-300",
                          isSaved && "ring-2 ring-green-300"
                        )}
                      />
                      <Label htmlFor={field.key} className="cursor-pointer">
                        {field.label}
                      </Label>
                    </div>
                  ) : field.type === 'select' ? (
                    <select
                      id={field.key}
                      value={value || ''}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 border rounded-md bg-white",
                        hasChanged && "border-amber-300 bg-amber-50/50",
                        isSaved && "border-green-300 bg-green-50/50"
                      )}
                    >
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={field.key}
                      value={value}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={cn(
                        hasChanged && "border-amber-300 bg-amber-50/50",
                        isSaved && "border-green-300 bg-green-50/50"
                      )}
                    />
                  )}
                  {isEmpty && field.placeholder && (
                    <p className="text-xs text-muted-foreground italic">
                      Este campo está vazio. O valor padrão "{field.placeholder}" será usado na página.
                    </p>
                  )}
                </div>
              );
            })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
