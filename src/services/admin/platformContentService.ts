import { supabase } from '@/integrations/supabase/client';

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
        { key: 'viajar_hero_title', label: 'Título Principal', type: 'text', placeholder: 'Título do Hero' },
        { key: 'viajar_hero_subtitle', label: 'Subtítulo', type: 'textarea', placeholder: 'Descrição do Hero' },
        { key: 'viajar_hero_cta_primary', label: 'Botão Principal', type: 'text', placeholder: 'Texto do botão' },
        { key: 'viajar_hero_cta_secondary', label: 'Botão Secundário', type: 'text', placeholder: 'Texto do botão' },
        { key: 'viajar_hero_video_url', label: 'Vídeo Promocional', type: 'url', placeholder: 'URL do YouTube' },
      ]
    },
    {
      id: 'features',
      name: 'Funcionalidades',
      fields: [
        { key: 'viajar_features_title', label: 'Título da Seção', type: 'text' },
        { key: 'viajar_features_subtitle', label: 'Subtítulo', type: 'textarea' },
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
    let query = supabase
      .from('institutional_content')
      .select('*')
      .order('content_key');

    if (keys && keys.length > 0) {
      query = query.in('content_key', keys);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as PlatformContent[];
  },

  async getContentByPrefix(prefix: string): Promise<PlatformContent[]> {
    const { data, error } = await supabase
      .from('institutional_content')
      .select('*')
      .ilike('content_key', `${prefix}%`)
      .order('content_key');

    if (error) throw error;
    return (data || []) as PlatformContent[];
  },

  async updateContent(id: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('institutional_content')
      .update({ 
        content_value: value,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async createContent(content: Omit<PlatformContent, 'id' | 'created_at' | 'updated_at'>): Promise<PlatformContent> {
    const { data, error } = await supabase
      .from('institutional_content')
      .insert([content])
      .select()
      .single();

    if (error) throw error;
    return data as PlatformContent;
  },

  async upsertContent(key: string, value: string, type: string = 'text', description?: string): Promise<void> {
    // Primeiro, verificar se o conteúdo já existe
    const { data: existing } = await supabase
      .from('institutional_content')
      .select('id')
      .eq('content_key', key)
      .single();

    if (existing) {
      // Atualizar
      const { error } = await supabase
        .from('institutional_content')
        .update({ 
          content_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Criar
      const { error } = await supabase
        .from('institutional_content')
        .insert([{
          content_key: key,
          content_value: value,
          content_type: type,
          description: description || null,
          is_active: true,
        }]);

      if (error) throw error;
    }
  },

  async bulkUpsert(contents: { key: string; value: string; type?: string }[]): Promise<void> {
    for (const content of contents) {
      await this.upsertContent(content.key, content.value, content.type || 'text');
    }
  },
};
