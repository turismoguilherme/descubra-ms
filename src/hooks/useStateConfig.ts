import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StateConfig {
  id: string;
  code: string;
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  isActive: boolean;
}

export const useStateConfig = (stateCode?: string) => {
  const [stateConfig, setStateConfig] = useState<StateConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStateConfig = async () => {
      if (!stateCode) {
        setStateConfig(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('flowtrip_states')
          .select('*')
          .eq('code', stateCode.toUpperCase())
          .eq('is_active', true)
          .single();

        if (supabaseError) {
          console.error('Erro ao buscar configuração do estado:', supabaseError);
          setError(supabaseError.message);
          setStateConfig(null);
        } else if (data) {
          setStateConfig({
            id: data.id,
            code: data.code,
            name: data.name,
            logoUrl: data.logo_url,
            primaryColor: data.primary_color,
            secondaryColor: data.secondary_color,
            accentColor: data.accent_color,
            isActive: data.is_active
          });
        } else {
          setStateConfig(null);
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        setError('Erro inesperado ao carregar configuração');
        setStateConfig(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStateConfig();
  }, [stateCode]);

  return {
    stateConfig,
    loading,
    error,
    isValidState: !!stateConfig
  };
};