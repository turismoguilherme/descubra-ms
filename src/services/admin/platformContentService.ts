import { supabase } from '@/integrations/supabase/client';
import { contentTranslationService } from '@/services/translation/ContentTranslationService';
import type { LanguageCode } from '@/utils/translationHelpers';
import { withAutoRefresh } from '@/utils/supabaseInterceptor';

export interface PlatformContent {
  id: string;
  content_key: string;
  content_value: string | null;
  content_type: string | null;
  description: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ContentSection {
  id: string;
  name: string;
  fields: ContentField[];
}

export interface ContentField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'image' | 'video' | 'html' | 'json';
  placeholder?: string;
  description?: string;
}

// Definição das seções editáveis por plataforma
export const PLATFORM_SECTIONS: Record<string, ContentSection[]> = {
  viajar: [
    {
      id: 'hero',
      name: 'Hero Principal',
      fields: [
        { key: 'viajar_hero_badge', label: 'Badge (texto pequeno acima do título)', type: 'text', placeholder: 'Plataforma #1 de Turismo Inteligente' },
        { key: 'viajar_hero_title', label: 'Título Principal', type: 'text', placeholder: 'ViajARTur' },
        { key: 'viajar_hero_subtitle', label: 'Subtítulo', type: 'text', placeholder: 'Ecossistema inteligente de turismo' },
        { key: 'viajar_hero_description', label: 'Descrição', type: 'textarea', placeholder: 'Transforme dados em decisões estratégicas. Analytics avançado e IA para o setor público e privado.' },
        { key: 'viajar_hero_cta_primary', label: 'Botão Principal', type: 'text', placeholder: 'Acessar Plataforma' },
        { key: 'viajar_hero_cta_secondary', label: 'Botão Secundário', type: 'text', placeholder: 'Agendar Demo' },
        { key: 'viajar_hero_video_url', label: 'Vídeo Promocional', type: 'url', placeholder: 'URL do YouTube' },
      ]
    },
    {
      id: 'features',
      name: 'Funcionalidades',
      fields: [
        { key: 'viajar_features_title', label: 'Título da Seção', type: 'text', placeholder: 'Soluções Inteligentes' },
        { key: 'viajar_features_subtitle', label: 'Subtítulo', type: 'textarea', placeholder: 'Tecnologia de ponta para transformar a gestão do turismo' },
        { key: 'viajar_features_items', label: 'Lista de Funcionalidades (JSON)', type: 'json', description: 'Array de objetos com: title, description, icon (opcional)' },
      ]
    },
    {
      id: 'reports',
      name: 'Seção Relatórios de Dados',
      fields: [
        { key: 'viajar_reports_badge', label: 'Badge', type: 'text', placeholder: 'Novidade' },
        { key: 'viajar_reports_title', label: 'Título', type: 'text', placeholder: 'Relatórios de Dados de Turismo' },
        { key: 'viajar_reports_description', label: 'Descrição', type: 'textarea', placeholder: 'Acesse dados agregados e anonimizados...' },
        { key: 'viajar_reports_items', label: 'Lista de Itens (JSON)', type: 'json', description: 'Array de strings com os itens da lista' },
        { key: 'viajar_reports_button_primary', label: 'Botão Principal', type: 'text', placeholder: 'Saiba Mais' },
        { key: 'viajar_reports_button_secondary', label: 'Botão Secundário', type: 'text', placeholder: 'Solicitar Relatório' },
      ]
    },
    {
      id: 'descubra_ms',
      name: 'Seção Descubra MS',
      fields: [
        { key: 'viajar_descubra_ms_badge', label: 'Badge', type: 'text', placeholder: 'Case de Sucesso' },
        { key: 'viajar_descubra_ms_title', label: 'Título', type: 'text', placeholder: 'Descubra Mato Grosso do Sul' },
        { key: 'viajar_descubra_ms_description', label: 'Descrição', type: 'textarea', placeholder: 'Nossa primeira implementação completa...' },
        { key: 'viajar_descubra_ms_items', label: 'Lista de Itens (JSON)', type: 'json', description: 'Array de strings com os itens da lista' },
        { key: 'viajar_descubra_ms_button', label: 'Texto do Botão', type: 'text', placeholder: 'Conhecer Descubra MS' },
      ]
    },
    {
      id: 'video',
      name: 'Seção Vídeo',
      fields: [
        { key: 'viajar_video_title', label: 'Título', type: 'text', placeholder: 'Veja a Plataforma em Ação' },
        { key: 'viajar_video_description', label: 'Descrição', type: 'textarea', placeholder: 'Descubra como a ViajARTur pode transformar...' },
      ]
    },
    {
      id: 'cta',
      name: 'Call to Action Final',
      fields: [
        { key: 'viajar_cta_title', label: 'Título', type: 'text', placeholder: 'Pronto para Transformar seu Turismo?' },
        { key: 'viajar_cta_description', label: 'Descrição', type: 'textarea', placeholder: 'Junte-se a empresas e órgãos públicos...' },
        { key: 'viajar_cta_button_primary', label: 'Botão Principal', type: 'text', placeholder: 'Solicitar Demonstração' },
        { key: 'viajar_cta_button_secondary', label: 'Botão Secundário', type: 'text', placeholder: 'Ver Planos' },
      ]
    },
    {
      id: 'contact',
      name: 'Informações de Contato',
      fields: [
        { key: 'viajar_contact_email', label: 'Email', type: 'text', placeholder: 'contato@viajartur.com' },
        { key: 'viajar_contact_phone', label: 'Telefone', type: 'text', placeholder: '(67) 99999-9999' },
        { key: 'viajar_contact_address', label: 'Endereço', type: 'textarea' },
        { key: 'viajar_contact_whatsapp', label: 'WhatsApp', type: 'text', placeholder: '5567999999999' },
      ]
    },
    {
      id: 'social',
      name: 'Redes Sociais',
      fields: [
        { key: 'viajar_social_facebook', label: 'Facebook', type: 'url' },
        { key: 'viajar_social_instagram', label: 'Instagram', type: 'url' },
        { key: 'viajar_social_linkedin', label: 'LinkedIn', type: 'url' },
        { key: 'viajar_social_youtube', label: 'YouTube', type: 'url' },
      ]
    },
    {
      id: 'footer',
      name: 'Rodapé',
      fields: [
        { key: 'viajar_footer_about', label: 'Sobre a Empresa', type: 'textarea' },
        { key: 'viajar_footer_copyright', label: 'Copyright', type: 'text' },
      ]
    },
    {
      id: 'cases',
      name: 'Cases de Sucesso',
      fields: [
        { key: 'viajar_cases_descubra_ms_title', label: 'Descubra MS - Título', type: 'text', placeholder: 'Descubra MS' },
        { key: 'viajar_cases_descubra_ms_subtitle', label: 'Descubra MS - Subtítulo', type: 'text', placeholder: 'Plataforma desenvolvida' },
        { key: 'viajar_cases_descubra_ms_technologies', label: 'Descubra MS - Tecnologias (JSON)', type: 'json', description: 'Array de strings: ["Guatá IA", "Passaporte Digital", "Analytics", "Gestão de Eventos"]' },
        { key: 'viajar_cases_descubra_ms_image', label: 'Descubra MS - Imagem (URL)', type: 'image', placeholder: 'URL da imagem' },
        { key: 'viajar_cases_koda_title', label: 'Koda - Título', type: 'text', placeholder: 'Koda' },
        { key: 'viajar_cases_koda_subtitle', label: 'Koda - Subtítulo', type: 'text', placeholder: 'Chatbot desenvolvido' },
        { key: 'viajar_cases_koda_technologies', label: 'Koda - Tecnologias (JSON)', type: 'json', description: 'Array de strings: ["IA Conversacional", "Multi-idioma", "Web Search"]' },
        { key: 'viajar_cases_koda_image', label: 'Koda - Imagem (URL)', type: 'image', placeholder: 'URL da imagem' },
      ]
    },
    {
      id: 'sobre',
      name: 'Página Sobre',
      fields: [
        { key: 'viajar_sobre_missao', label: 'Nossa Missão', type: 'textarea', placeholder: 'Democratizar tecnologia de ponta para o setor turístico.' },
        { key: 'viajar_sobre_visao', label: 'Nossa Visão', type: 'textarea', placeholder: 'Ser a plataforma líder em gestão inteligente de turismo no Brasil.' },
      ]
    },
  ],
  descubra_ms: [
    {
      id: 'hero',
      name: 'Hero Principal',
      fields: [
        { key: 'ms_hero_title', label: 'Título Principal', type: 'text', placeholder: 'Descubra Mato Grosso do Sul' },
        { key: 'ms_hero_subtitle', label: 'Subtítulo', type: 'textarea', placeholder: 'Descrição do Hero' },
        { key: 'ms_hero_cta_primary', label: 'Botão Principal', type: 'text' },
        { key: 'ms_hero_video_url', label: 'Vídeo de Fundo', type: 'url', placeholder: 'URL do vídeo' },
        { key: 'ms_guata_roteiro_image_url', label: 'Imagem do Guatá (Banner Roteiro)', type: 'url', placeholder: 'URL da imagem do Guatá para o banner "Montamos seu roteiro"' },
      ]
    },
    {
      id: 'destinations',
      name: 'Seção Destinos',
      fields: [
        { key: 'ms_destinations_title', label: 'Título', type: 'text' },
        { key: 'ms_destinations_subtitle', label: 'Subtítulo', type: 'textarea' },
      ]
    },
    {
      id: 'events',
      name: 'Seção Eventos',
      fields: [
        { key: 'ms_events_title', label: 'Título', type: 'text' },
        { key: 'ms_events_subtitle', label: 'Subtítulo', type: 'textarea' },
        { key: 'ms_events_cta', label: 'Texto do Botão', type: 'text' },
      ]
    },
    {
      id: 'contact',
      name: 'Informações de Contato',
      fields: [
        { key: 'ms_contact_email', label: 'Email', type: 'text' },
        { key: 'ms_contact_phone', label: 'Telefone', type: 'text' },
        { key: 'ms_contact_address', label: 'Endereço', type: 'textarea' },
      ]
    },
    {
      id: 'social',
      name: 'Redes Sociais',
      fields: [
        { key: 'ms_social_facebook', label: 'Facebook', type: 'url' },
        { key: 'ms_social_instagram', label: 'Instagram', type: 'url' },
        { key: 'ms_social_twitter', label: 'Twitter/X', type: 'url' },
        { key: 'ms_social_youtube', label: 'YouTube', type: 'url' },
      ]
    },
    {
      id: 'footer',
      name: 'Rodapé',
      fields: [
        { key: 'ms_footer_about', label: 'Sobre o Projeto', type: 'textarea' },
        { key: 'ms_footer_copyright', label: 'Copyright', type: 'text' },
      ]
    },
  ],
};

export const platformContentService = {
  async getContent(keys?: string[]): Promise<PlatformContent[]> {
    const { data, error } = await withAutoRefresh(async () => {
      let query = supabase
        .from('institutional_content')
        .select('*')
        .order('content_key');

      if (keys && keys.length > 0) {
        query = query.in('content_key', keys);
      }

      return await query;
    });
    
    if (error) throw error;
    return (data || []) as PlatformContent[];
  },

  async getContentByPrefix(prefix: string, languageCode?: LanguageCode): Promise<PlatformContent[]> {
    console.log(`🔍 [platformContentService] Buscando conteúdo com prefixo: ${prefix}`, languageCode ? `(idioma: ${languageCode})` : '');
    
    const { data, error } = await withAutoRefresh(async () => {
      return await supabase
        .from('institutional_content')
        .select('*')
        .ilike('content_key', `${prefix}%`)
        .eq('is_active', true)
        .order('content_key');
    });

    if (error) {
      console.error(`❌ [platformContentService] Erro ao buscar conteúdo com prefixo ${prefix}:`, error);
      throw error;
    }
    
    const contents = (data || []) as PlatformContent[];
    
    // Se não for português e tiver idioma especificado, buscar traduções
    if (languageCode && languageCode !== 'pt-BR' && contents.length > 0) {
      const contentKeys = contents.map(c => c.content_key);
      const translations = await contentTranslationService.getTranslations(
        contentKeys,
        languageCode
      );
      
      // Aplicar traduções aos conteúdos
      const translatedContents = contents.map(content => {
        const translation = translations.get(content.content_key);
        if (translation && translation.content?.content_value) {
          return {
            ...content,
            content_value: translation.content.content_value,
          };
        }
        return content;
      });
      
      console.log(`✅ [platformContentService] Encontrados ${translatedContents.length} itens (${translations.size} traduzidos)`);
      return translatedContents;
    }
    
    console.log(`✅ [platformContentService] Encontrados ${contents.length} itens com prefixo ${prefix}`);
    return contents;
  },

  async updateContent(id: string, value: string): Promise<void> {
    // Garantir que value seja sempre string (permitir valores vazios)
    const contentValue = value !== null && value !== undefined ? value : '';
    console.log('📝 [platformContentService] updateContent chamado:', {
      id,
      value: contentValue.substring(0, 100),
      valueLength: contentValue.length,
      isNull: value === null,
      isUndefined: value === undefined
    });
    
    const { data, error } = await withAutoRefresh(async () => {
      return await supabase
        .from('institutional_content')
        .update({ 
          content_value: contentValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
    });

    console.log('📝 [platformContentService] updateContent resultado:', {
      id,
      error: error?.message || null,
      updatedRows: data?.length || 0,
      updatedValue: data?.[0]?.content_value?.substring(0, 100) || null,
      fullData: data?.[0]
    });

    if (error) {
      console.error('❌ [platformContentService] Erro no updateContent:', error);
      throw error;
    }

    // Gerar traduções automaticamente em background (apenas se houver conteúdo)
    if (contentValue && contentValue.trim() && data?.[0]?.content_key) {
      // Usar setTimeout para não bloquear a resposta da API
      setTimeout(async () => {
        try {
          const { autoTranslationGenerator } = await import('@/services/translation/AutoTranslationGenerator');
          await autoTranslationGenerator.generateTranslationsForContent(data[0].content_key);
          console.log(`🌐 [platformContentService] Traduções geradas automaticamente para: ${data[0].content_key}`);
        } catch (translationError) {
          console.warn(`⚠️ [platformContentService] Falha ao gerar traduções para: ${data[0].content_key}`, translationError);
        }
      }, 1000);
    }
  },

  async createContent(content: Omit<PlatformContent, 'id' | 'created_at' | 'updated_at'>): Promise<PlatformContent> {
    // Garantir que content_value seja sempre string (permitir valores vazios)
    const contentToInsert = {
      ...content,
      content_value: content.content_value !== null && content.content_value !== undefined ? content.content_value : ''
    };
    console.log('➕ [platformContentService] createContent chamado:', {
      contentKey: contentToInsert.content_key,
      contentValue: contentToInsert.content_value?.substring(0, 100) || '',
      contentValueLength: contentToInsert.content_value?.length || 0,
      contentType: contentToInsert.content_type,
      fullContent: contentToInsert
    });
    
    const { data, error } = await withAutoRefresh(async () => {
      return await supabase
        .from('institutional_content')
        .insert([contentToInsert])
        .select()
        .single();
    });

    console.log('➕ [platformContentService] createContent resultado:', {
      error: error?.message || null,
      createdId: data?.id || null,
      createdValue: data?.content_value?.substring(0, 100) || null,
      createdValueLength: data?.content_value?.length || 0,
      fullData: data
    });

    if (error) {
      console.error('❌ [platformContentService] Erro no createContent:', error);
      throw error;
    }
    return data as PlatformContent;
  },

  async upsertContent(key: string, value: string, type: string = 'text', description?: string): Promise<void> {
    console.log('🔄 [platformContentService] upsertContent chamado:', { key, value: value.substring(0, 50) + '...', type, description });
    
    // Verificar se o usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Você precisa estar autenticado para salvar conteúdo.');
    }
    
    // Verificar role do usuário
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'tech', 'master_admin']);
    
    if (!userRoles || userRoles.length === 0) {
      throw new Error('Você não tem permissão para salvar conteúdo. É necessário ter role de admin ou tech.');
    }
    
    console.log('✅ [platformContentService] Usuário autorizado:', { userId: user.id, roles: userRoles.map(r => r.role) });
    
    // Primeiro, verificar se o conteúdo já existe
    const { data: existing, error: selectError } = await withAutoRefresh(async () => {
      return await supabase
        .from('institutional_content')
        .select('id, content_key, content_value')
        .eq('content_key', key)
        .maybeSingle();
    });

    console.log('🔍 [platformContentService] Verificação existente:', { existing, selectError });

    // Se houver erro diferente de "não encontrado", lançar
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ [platformContentService] Erro ao buscar existente:', selectError);
      throw new Error(`Erro ao verificar conteúdo existente: ${selectError.message || selectError.details || 'Erro desconhecido'}`);
    }

    if (existing && existing.id) {
      // Atualizar existente
      console.log('📝 [platformContentService] Atualizando conteúdo existente:', existing.id);
      const { data: updated, error: updateError } = await withAutoRefresh(async () => {
        return await supabase
          .from('institutional_content')
          .update({ 
            content_value: value,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select();
      });

      if (updateError) {
        console.error('❌ [platformContentService] Erro ao atualizar:', updateError);
        
        // Mensagem mais clara para erros de permissão
        if (updateError.code === '42501' || updateError.message?.includes('permission') || updateError.message?.includes('policy')) {
          throw new Error('Você não tem permissão para atualizar conteúdo. Verifique se você tem role de admin ou tech no sistema.');
        }
        
        throw new Error(`Erro ao atualizar conteúdo: ${updateError.message || updateError.details || 'Erro desconhecido'}`);
      }
      console.log('✅ [platformContentService] Conteúdo atualizado:', updated);
    } else {
      // Criar novo
      console.log('➕ [platformContentService] Criando novo conteúdo');
      const { data: inserted, error: insertError } = await withAutoRefresh(async () => {
        return await supabase
          .from('institutional_content')
          .insert([{
            content_key: key,
            content_value: value,
            content_type: type,
            description: description || null,
            is_active: true,
          }])
          .select();
      });

      if (insertError) {
        console.error('❌ [platformContentService] Erro ao inserir:', insertError);
        console.error('❌ [platformContentService] Detalhes:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        });
        throw new Error(`Erro ao inserir conteúdo: ${insertError.message || insertError.details || insertError.hint || 'Erro desconhecido'}`);
      }
      console.log('✅ [platformContentService] Conteúdo criado:', inserted);
    }
  },

  async bulkUpsert(contents: { key: string; value: string; type?: string }[]): Promise<void> {
    for (const content of contents) {
      await this.upsertContent(content.key, content.value, content.type || 'text');
    }
  },
};
