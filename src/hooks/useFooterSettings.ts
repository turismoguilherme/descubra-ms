import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
}

const DEFAULT_SETTINGS: FooterSettings = {
  email: '',
  phone: '',
  address: '',
  social_media: {},
  copyright: '',
};

export function useFooterSettings(platform: 'ms' | 'viajar') {
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, [platform]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('platform', platform)
        .eq('setting_key', 'footer')
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar footer settings:', error);
        // Continuar com valores padrão em caso de erro
      }

      if (data?.setting_value) {
        setSettings(data.setting_value as FooterSettings);
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
            copyright: `© ${new Date().getFullYear()} ViajARTur. Todos os direitos reservados.`,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar footer settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading };
}




