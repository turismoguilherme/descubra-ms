// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PartnerLogo {
  id: string;
  name: string;
  logo_url: string;
  alt_text?: string;
  order: number;
}

interface FooterSettings {
  email: string;
  phone: string;
  address: string;
  social_media: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  copyright?: string;
  business_hours?: {
    weekdays?: string;
    saturday?: string;
    sunday?: string;
  };
  partner_logos?: PartnerLogo[];
}

const DEFAULT_SETTINGS: FooterSettings = {
  email: '',
  phone: '',
  address: '',
  social_media: {},
  copyright: '',
};

// Cache global para invalidar quando necessário
let lastUpdateTimestamp: { [key: string]: number } = {};

export function useFooterSettings(platform: 'ms' | 'viajar') {
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<any>(null);
  const cacheKey = `footer_${platform}`;

  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value, updated_at')
        .eq('platform', platform)
        .eq('setting_key', 'footer')
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar footer settings:', error);
        // Continuar com valores padrão em caso de erro
      }

      if (data?.setting_value) {
        const newSettings = data.setting_value as FooterSettings;
        console.log(`✅ [useFooterSettings] Settings carregados para ${platform}:`, newSettings);
        setSettings(newSettings);
        // Atualizar timestamp do cache
        if (data.updated_at) {
          lastUpdateTimestamp[cacheKey] = new Date(data.updated_at).getTime();
          console.log(`📅 [useFooterSettings] Timestamp atualizado: ${data.updated_at}`);
        }
      } else {
        // Usar valores padrão hardcoded como fallback
        if (platform === 'ms') {
          setSettings({
            email: 'contato@descubramsconline.com.br',
            phone: '(67) 3318-7600',
            address: '',
            social_media: {},
            copyright: '© 2025 Descubra Mato Grosso do Sul. Todos os direitos reservados.',
          });
        } else {
          setSettings({
            email: 'contato@viajartur.com.br',
            phone: '(67) 3000-0000',
            address: 'Campo Grande - MS, Brasil',
            social_media: {
              facebook: 'https://facebook.com/viajartur',
              instagram: 'https://instagram.com/viajartur',
              linkedin: 'https://linkedin.com/company/viajartur',
              twitter: 'https://twitter.com/viajartur',
            },
            copyright: `© ${new Date().getFullYear()} Guatá Labs. Todos os direitos reservados.`,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar footer settings:', error);
    } finally {
      setLoading(false);
    }
  }, [platform, cacheKey]);

  useEffect(() => {
    // Carregar settings iniciais
    console.log(`🔵 [useFooterSettings] Inicializando hook para plataforma: ${platform}`);
    loadSettings();

    // Escutar evento customizado de atualização
    const handleSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log(`📢 [useFooterSettings] Evento footerSettingsUpdated recebido:`, customEvent.detail);
      if (customEvent.detail?.platform === platform) {
        console.log(`🔄 [useFooterSettings] Evento de atualização recebido para ${platform}, recarregando...`);
        loadSettings();
      } else {
        console.log(`⏭️ [useFooterSettings] Evento ignorado - plataforma diferente (recebido: ${customEvent.detail?.platform}, esperado: ${platform})`);
      }
    };

    // Escutar evento global de atualização de settings
    const handleGlobalSettingsUpdate = () => {
      console.log(`📢 [useFooterSettings] Evento global siteSettingsUpdated recebido, recarregando para ${platform}...`);
      loadSettings();
    };

    console.log(`👂 [useFooterSettings] Registrando listeners para eventos`);
    window.addEventListener('footerSettingsUpdated', handleSettingsUpdate);
    window.addEventListener('siteSettingsUpdated', handleGlobalSettingsUpdate);

    // Configurar subscription do Supabase Realtime para escutar mudanças
    const channel = supabase
      .channel(`site_settings_${platform}_footer`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: `platform=eq.${platform} AND setting_key=eq.footer`,
        },
        (payload) => {
          console.log('🔄 [useFooterSettings] Mudança detectada no banco via Realtime:', payload);
          // Recarregar settings quando houver mudança
          loadSettings();
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    // Verificar mudanças periodicamente (fallback caso Realtime não funcione)
    const intervalId = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('updated_at')
          .eq('platform', platform)
          .eq('setting_key', 'footer')
          .maybeSingle();

        if (data?.updated_at) {
          const newTimestamp = new Date(data.updated_at).getTime();
          const cachedTimestamp = lastUpdateTimestamp[cacheKey] || 0;
          
          if (newTimestamp > cachedTimestamp) {
            console.log('🔄 [useFooterSettings] Mudança detectada via polling, recarregando...');
            await loadSettings();
          }
        }
      } catch (error) {
        console.error('Erro ao verificar atualizações:', error);
      }
    }, 5000); // Verificar a cada 5 segundos

    return () => {
      // Limpar subscription, interval e event listeners
      console.log(`🧹 [useFooterSettings] Limpando recursos para plataforma: ${platform}`);
      window.removeEventListener('footerSettingsUpdated', handleSettingsUpdate);
      window.removeEventListener('siteSettingsUpdated', handleGlobalSettingsUpdate);
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      clearInterval(intervalId);
    };
  }, [platform, loadSettings, cacheKey]);

  // Função para forçar reload manualmente
  const refetch = useCallback(() => {
    setLoading(true);
    loadSettings();
  }, [loadSettings]);

  return { settings, loading, refetch };
}

