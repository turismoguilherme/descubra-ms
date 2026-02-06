import { useState, useEffect } from 'react';
import { useOverflowOneAuth } from './useOverflowOneAuth';

export interface TenantConfig {
  state: string;
  stateCode: string;
  stateName: string;
  cityName: string;
  regionId: string;
  cityId: string;
  timezone: string;
  currency: string;
  language: string;
  features: {
    catGeolocation: boolean;
    passportDigital: boolean;
    iaConsultora: boolean;
    heatmap: boolean;
    community: boolean;
  };
}

// Configurações por estado
const TENANT_CONFIGS: Record<string, TenantConfig> = {
  'ms': {
    state: 'mato-grosso-sul',
    stateCode: 'MS',
    stateName: 'Mato Grosso do Sul',
    cityName: 'Campo Grande',
    regionId: 'centro-oeste',
    cityId: 'campo-grande',
    timezone: 'America/Campo_Grande',
    currency: 'BRL',
    language: 'pt-BR',
    features: {
      catGeolocation: true,
      passportDigital: true,
      iaConsultora: true,
      heatmap: true,
      community: true
    }
  },
  'sp': {
    state: 'sao-paulo',
    stateCode: 'SP',
    stateName: 'São Paulo',
    cityName: 'São Paulo',
    regionId: 'sudeste',
    cityId: 'sao-paulo',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    language: 'pt-BR',
    features: {
      catGeolocation: true,
      passportDigital: true,
      iaConsultora: true,
      heatmap: true,
      community: true
    }
  },
  'rj': {
    state: 'rio-de-janeiro',
    stateCode: 'RJ',
    stateName: 'Rio de Janeiro',
    cityName: 'Rio de Janeiro',
    regionId: 'sudeste',
    cityId: 'rio-de-janeiro',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    language: 'pt-BR',
    features: {
      catGeolocation: true,
      passportDigital: true,
      iaConsultora: true,
      heatmap: true,
      community: true
    }
  },
  'pr': {
    state: 'parana',
    stateCode: 'PR',
    stateName: 'Paraná',
    cityName: 'Curitiba',
    regionId: 'sul',
    cityId: 'curitiba',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    language: 'pt-BR',
    features: {
      catGeolocation: true,
      passportDigital: true,
      iaConsultora: true,
      heatmap: true,
      community: true
    }
  }
};

export const useMultiTenantOverflowOne = () => {
  const { user } = useOverflowOneAuth();
  const [currentTenant, setCurrentTenant] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectTenant = () => {
      try {
        // 1. Tentar detectar pelo usuário logado
        if (user?.company_name) {
          const companyName = user.company_name.toLowerCase();
          
          // Detectar estado pelo nome da empresa
          if (companyName.includes('mato grosso') || companyName.includes('ms')) {
            setCurrentTenant(TENANT_CONFIGS.ms);
            return;
          }
          if (companyName.includes('são paulo') || companyName.includes('sp')) {
            setCurrentTenant(TENANT_CONFIGS.sp);
            return;
          }
          if (companyName.includes('rio de janeiro') || companyName.includes('rj')) {
            setCurrentTenant(TENANT_CONFIGS.rj);
            return;
          }
          if (companyName.includes('paraná') || companyName.includes('pr')) {
            setCurrentTenant(TENANT_CONFIGS.pr);
            return;
          }
        }

        // 2. Tentar detectar pela URL
        const pathname = window.location.pathname;
        const stateFromUrl = pathname.split('/')[2]; // /overflow-one/ms/dashboard
        
        if (stateFromUrl && TENANT_CONFIGS[stateFromUrl]) {
          setCurrentTenant(TENANT_CONFIGS[stateFromUrl]);
          return;
        }

        // 3. Tentar detectar pelo localStorage
        const savedTenant = localStorage.getItem('overflow-one-tenant');
        if (savedTenant && TENANT_CONFIGS[savedTenant]) {
          setCurrentTenant(TENANT_CONFIGS[savedTenant]);
          return;
        }

        // 4. Tentar detectar pela geolocalização (se disponível)
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // Lógica simples de detecção por coordenadas
              const { latitude, longitude } = position.coords;
              
              // Coordenadas aproximadas dos estados
              if (latitude >= -24 && latitude <= -18 && longitude >= -58 && longitude <= -50) {
                setCurrentTenant(TENANT_CONFIGS.ms);
              } else if (latitude >= -25 && latitude <= -20 && longitude >= -54 && longitude <= -44) {
                setCurrentTenant(TENANT_CONFIGS.sp);
              } else if (latitude >= -23 && latitude <= -21 && longitude >= -44 && longitude <= -41) {
                setCurrentTenant(TENANT_CONFIGS.rj);
              } else if (latitude >= -26 && latitude <= -22 && longitude >= -54 && longitude <= -48) {
                setCurrentTenant(TENANT_CONFIGS.pr);
              } else {
                // Default para MS
                setCurrentTenant(TENANT_CONFIGS.ms);
              }
            },
            () => {
              // Em caso de erro na geolocalização, usar MS como padrão
              setCurrentTenant(TENANT_CONFIGS.ms);
            }
          );
        } else {
          // Se geolocalização não estiver disponível, usar MS como padrão
          setCurrentTenant(TENANT_CONFIGS.ms);
        }

      } catch (error) {
        console.error('Erro ao detectar tenant:', error);
        setCurrentTenant(TENANT_CONFIGS.ms);
      } finally {
        setIsLoading(false);
      }
    };

    detectTenant();
  }, [user]);

  const switchTenant = (stateCode: string) => {
    if (TENANT_CONFIGS[stateCode]) {
      setCurrentTenant(TENANT_CONFIGS[stateCode]);
      localStorage.setItem('overflow-one-tenant', stateCode);
      
      // Atualizar URL se necessário
      const currentPath = window.location.pathname;
      const newPath = currentPath.replace(/\/overflow-one\/[^\/]+/, `/overflow-one/${stateCode}`);
      if (newPath !== currentPath) {
        window.history.pushState({}, '', newPath);
      }
    }
  };

  const getAvailableTenants = () => {
    return Object.entries(TENANT_CONFIGS).map(([code, config]) => ({
      code,
      ...config
    }));
  };

  const isFeatureEnabled = (feature: keyof TenantConfig['features']) => {
    return currentTenant?.features[feature] || false;
  };

  return {
    currentTenant,
    isLoading,
    switchTenant,
    getAvailableTenants,
    isFeatureEnabled,
    // Dados específicos do tenant atual
    state: currentTenant?.state || 'mato-grosso-sul',
    stateCode: currentTenant?.stateCode || 'MS',
    stateName: currentTenant?.stateName || 'Mato Grosso do Sul',
    cityName: currentTenant?.cityName || 'Campo Grande',
    regionId: currentTenant?.regionId || 'centro-oeste',
    cityId: currentTenant?.cityId || 'campo-grande',
    timezone: currentTenant?.timezone || 'America/Campo_Grande',
    currency: currentTenant?.currency || 'BRL',
    language: currentTenant?.language || 'pt-BR'
  };
};

