import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export interface TenantConfig {
  id: string;
  slug: string; // ms, mt, go, sp, etc.
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  isActive: boolean;
}

export const useMultiTenant = () => {
  const location = useLocation();
  const [currentTenant, setCurrentTenant] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectTenant = async () => {
      setLoading(true);
      
      // Detectar tenant baseado na URL
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const tenantSlug = pathSegments[0]; // primeiro segmento após a barra

      try {
        if (tenantSlug && tenantSlug !== '' && !['admin', 'api'].includes(tenantSlug)) {
          // Buscar configuração do tenant no banco
          const { data: state } = await supabase
            .from('flowtrip_states')
            .select('*')
            .eq('code', tenantSlug.toUpperCase())
            .eq('is_active', true)
            .single();

          if (state) {
            setCurrentTenant({
              id: state.id,
              slug: state.code.toLowerCase(),
              name: state.name,
              logo: state.logo_url || '/placeholder.svg',
              primaryColor: state.primary_color,
              secondaryColor: state.secondary_color,
              accentColor: state.accent_color,
              isActive: state.is_active
            });
          } else {
            setCurrentTenant(null);
          }
        } else {
          // Contexto FlowTrip principal
          setCurrentTenant(null);
        }
      } catch (error) {
        console.error('Erro ao detectar tenant:', error);
        setCurrentTenant(null);
      } finally {
        setLoading(false);
      }
    };

    detectTenant();
  }, [location.pathname]);

  const isFlowTripMain = !currentTenant;
  const isTenantContext = !!currentTenant;

  return {
    currentTenant,
    isFlowTripMain,
    isTenantContext,
    loading,
    tenantSlug: currentTenant?.slug || null
  };
};