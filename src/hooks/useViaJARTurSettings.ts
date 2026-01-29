/**
 * Hook para carregar configurações do ViaJARTur do banco de dados
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ViaJARTurPlanSettings {
  professional: {
    name: string;
    price: number;
    description: string;
    paymentLink: string;
  };
  government: {
    name: string;
    price: number;
    description: string;
    paymentLink: string;
  };
}

const DEFAULT_SETTINGS: ViaJARTurPlanSettings = {
  professional: {
    name: 'Plano Empresários',
    price: 200,
    description: 'Para hotéis, pousadas, agências e operadores de turismo',
    paymentLink: 'https://buy.stripe.com/test_7sY28t9gG5y5dsH2vxbfO00',
  },
  government: {
    name: 'Plano Secretárias',
    price: 2000,
    description: 'Para secretarias de turismo e órgãos públicos',
    paymentLink: 'https://buy.stripe.com/test_fZu5kF50q7GdgET1rtbfO03',
  },
};

export function useViaJARTurSettings() {
  const [settings, setSettings] = useState<ViaJARTurPlanSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const keys = [
        'viajar_professional_price',
        'viajar_professional_name',
        'viajar_professional_description',
        'viajar_professional_payment_link',
        'viajar_government_price',
        'viajar_government_name',
        'viajar_government_description',
        'viajar_government_payment_link',
      ];

      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .eq('platform', 'viajar')
        .in('setting_key', keys);

      if (fetchError) {
        console.error('Erro ao carregar settings ViaJARTur:', fetchError);
        // Usar valores padrão em caso de erro
        return;
      }

      if (data && data.length > 0) {
        const newSettings: ViaJARTurPlanSettings = { ...DEFAULT_SETTINGS };

        data.forEach((item) => {
          const value = item.setting_value || '';
          
          if (item.setting_key === 'viajar_professional_price') {
            const price = parseFloat(value);
            if (!isNaN(price) && price > 0) {
              newSettings.professional.price = price;
            }
          } else if (item.setting_key === 'viajar_professional_name') {
            if (value) newSettings.professional.name = value;
          } else if (item.setting_key === 'viajar_professional_description') {
            if (value) newSettings.professional.description = value;
          } else if (item.setting_key === 'viajar_professional_payment_link') {
            if (value) newSettings.professional.paymentLink = value;
          } else if (item.setting_key === 'viajar_government_price') {
            const price = parseFloat(value);
            if (!isNaN(price) && price > 0) {
              newSettings.government.price = price;
            }
          } else if (item.setting_key === 'viajar_government_name') {
            if (value) newSettings.government.name = value;
          } else if (item.setting_key === 'viajar_government_description') {
            if (value) newSettings.government.description = value;
          } else if (item.setting_key === 'viajar_government_payment_link') {
            if (value) newSettings.government.paymentLink = value;
          }
        });

        setSettings(newSettings);
      }
    } catch (err: unknown) {
      console.error('Erro ao carregar configurações ViaJARTur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    error,
    refresh: loadSettings,
  };
}

