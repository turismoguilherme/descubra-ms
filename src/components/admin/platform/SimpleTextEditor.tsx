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

interface TextField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'json';
  placeholder?: string;
  section: string;
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
    { key: 'viajar_sobre_missao', label: 'Nossa Missão', type: 'textarea', placeholder: 'Democratizar tecnologia de ponta para o setor turístico.', section: 'Página Sobre' },
    { key: 'viajar_sobre_visao', label: 'Nossa Visão', type: 'textarea', placeholder: 'Ser a plataforma líder em gestão inteligente de turismo no Brasil.', section: 'Página Sobre' },
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
    
    // Footer
    { key: 'ms_footer_copyright', label: 'Copyright', type: 'text', placeholder: '© 2025 Descubra Mato Grosso do Sul. Todos os direitos reservados.', section: 'Rodapé' },
    { key: 'ms_footer_privacy_link', label: 'Link Política de Privacidade', type: 'text', placeholder: 'Política de Privacidade', section: 'Rodapé' },
    { key: 'ms_footer_terms_link', label: 'Link Termos de Uso', type: 'text', placeholder: 'Termos de Uso', section: 'Rodapé' },
  ],
};

const BUCKET_NAME = 'tourism-images';

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
      console.log('📥 [SimpleTextEditor] Carregando conteúdo com prefixo:', prefix);
      const data = await platformContentService.getContentByPrefix(prefix);
      console.log('📦 [SimpleTextEditor] Dados recebidos do banco:', data.length, 'itens');
      
      const contentMap: Record<string, string> = {};
      const idMap: Record<string, string> = {};

      // Filtrar apenas campos que pertencem à plataforma atual
      const platformFieldKeys = new Set(fields.map(f => f.key));
      console.log('🔑 [SimpleTextEditor] Campos esperados:', Array.from(platformFieldKeys));

      // Carregar valores do banco - APENAS para campos desta plataforma
      data.forEach(item => {
        // Garantir que apenas campos desta plataforma sejam carregados
        if (platformFieldKeys.has(item.content_key)) {
          contentMap[item.content_key] = item.content_value || '';
          idMap[item.content_key] = item.id;
          console.log('✅ [SimpleTextEditor] Campo carregado:', {
            key: item.content_key,
            value: (item.content_value || '').substring(0, 50),
            id: item.id
          });
        }
      });

      // Para campos que não existem no banco, usar string vazia (não placeholder)
      // O placeholder é apenas uma dica visual, não o valor real
      fields.forEach(field => {
        if (!contentMap[field.key]) {
          contentMap[field.key] = '';
          console.log('⚠️ [SimpleTextEditor] Campo não encontrado no banco, usando vazio:', field.key);
        }
      });

      console.log('📊 [SimpleTextEditor] Estado final:', {
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
    console.log('✏️ [SimpleTextEditor] updateField chamado:', { key, value: value.substring(0, 100), valueLength: value.length });
    setContents(prev => {
      const newContents = { ...prev, [key]: value };
      console.log('📝 [SimpleTextEditor] Estado contents atualizado:', { 
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
    console.log('📎 [SimpleTextEditor] handleImageSelect chamado para:', key);
    const file = event.target.files?.[0];
    if (!file) {
      console.warn('⚠️ [SimpleTextEditor] Nenhum arquivo selecionado');
      return;
    }

    console.log('📄 [SimpleTextEditor] Arquivo selecionado:', { name: file.name, size: file.size, type: file.type });

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

    console.log('🖼️ [SimpleTextEditor] Criando preview da imagem...');
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      console.log('✅ [SimpleTextEditor] Preview criado, tamanho:', preview?.length);
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
    console.log('📤 [SimpleTextEditor] Iniciando upload:', { key, fileName: file.name, fileSize: file.size, fileType: file.type });
    
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
          console.log('🔄 [SimpleTextEditor] Token próximo de expirar, renovando antes do upload...');
          await supabase.auth.refreshSession();
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `platform-content/${key}/${uuidv4()}.${fileExt}`;
      console.log('📁 [SimpleTextEditor] Nome do arquivo gerado:', fileName);

      let uploadError;
      let retries = 1;
      
      // Tentar upload com retry em caso de erro 401
      while (retries >= 0) {
        console.log(`🔄 [SimpleTextEditor] Tentativa de upload (${retries + 1}/2)...`);
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
          console.log('✅ [SimpleTextEditor] Upload bem-sucedido!');
        }
        
        // Se não há erro ou não é erro de JWT, sair do loop
        if (!uploadError || !uploadError.message?.includes('exp') || retries === 0) {
          break;
        }
        
        // Se é erro de JWT, tentar renovar e retry
        if (uploadError.message?.includes('exp') && retries > 0) {
          console.log('🔄 [SimpleTextEditor] Token expirado no upload, renovando...');
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
      console.log('🔗 [SimpleTextEditor] URL pública gerada:', publicUrl);
      
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
      console.log('🚀 [SimpleTextEditor] Iniciando upload para:', key);
      const uploadedUrl = await uploadImage(key, file);
      console.log('📥 [SimpleTextEditor] URL recebida:', uploadedUrl);
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

    console.log('💾 [SimpleTextEditor] saveField iniciado:', {
      key,
      value: value.substring(0, 100),
      valueLength: value.length,
      hasId: !!id,
      id,
      fieldType: fields.find(f => f.key === key)?.type
    });

    setSaving(prev => ({ ...prev, [key]: true }));

    try {
      if (id) {
        console.log('📝 [SimpleTextEditor] Atualizando conteúdo existente:', { key, id, value: value.substring(0, 100) });
        // Atualizar existente
        await platformContentService.updateContent(id, value);
        console.log('✅ [SimpleTextEditor] updateContent concluído com sucesso:', { key, id });
      } else {
        console.log('➕ [SimpleTextEditor] Criando novo conteúdo:', { 
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
        console.log('✅ [SimpleTextEditor] createContent concluído:', { 
          key, 
          newId: newContent.id, 
          newContentValue: newContent.content_value?.substring(0, 100) 
        });
        // Atualizar IDs
        setContentIds(prev => ({ ...prev, [key]: newContent.id }));
        // Recarregar para obter o ID
        await loadContent();
      }

      setSaved(prev => ({ ...prev, [key]: true }));
      
      // Atualizar valor original após salvar
      setOriginalContents(prev => ({ ...prev, [key]: value }));
      
      console.log('✅ [SimpleTextEditor] saveField concluído com sucesso:', { key, value: value.substring(0, 100) });
      
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
          <CardContent className="space-y-4">
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
              
              // #region agent log
              if (field.key === 'ms_hero_video_placeholder_image_url') {
                fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SimpleTextEditor.tsx:475',message:'Render campo placeholder',data:{key:field.key,value:value.substring(0,100),valueLength:value.length,hasChanged,isEmpty,contentsState:contents[field.key]?.substring(0,100),originalValue:originalContents[field.key]?.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
              }
              // #endregion

              return (
                <div key={field.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.key}>{field.label}</Label>
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
                            // #region agent log
                            fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SimpleTextEditor.tsx:527',message:'Input onChange disparado',data:{key:field.key,newValue:e.target.value.substring(0,100),newValueLength:e.target.value.length,currentValue:value.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
                            // #endregion
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
