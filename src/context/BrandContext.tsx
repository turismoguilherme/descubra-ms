import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useMultiTenant } from '@/hooks/useMultiTenant';

export type BrandType = 'overflow-one' | 'ms';

interface BrandConfig {
  brand: BrandType;
  logo: {
    src: string;
    alt: string;
    fallback: string;
  };
  navigation: {
    name: string;
    path: string;
  }[];
  authenticatedNavigation: {
    name: string;
    path: string;
  }[];
  cta: {
    primary: string;
    secondary: string;
  };
  hero: {
    title: string;
    subtitle: string;
    buttons: {
      primary: { text: string; path: string };
      secondary: { text: string; path: string };
      tertiary: { text: string; path: string };
    };
  };
}

interface BrandContextType {
  config: BrandConfig;
  isOverflowOne: boolean;
  isMS: boolean;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

const overflowOneConfig: BrandConfig = {
  brand: 'overflow-one',
  logo: {
    src: '/images/overflow-one-logo.png', // Caminho para a nova logo do OverFlow One
    alt: 'OverFlow One',
    fallback: 'OverFlow One'
  },
  navigation: [
    { name: 'Soluções', path: '/solucoes' },
    { name: 'Preços', path: '/precos' },
    { name: 'Sobre', path: '/sobre-overflow-one' }
  ],
  authenticatedNavigation: [
    { name: 'Analytics', path: '/overflow-one/analytics' }
  ],
  cta: {
    primary: 'Agendar Demo',
    secondary: 'Ver Case MS'
  },
  hero: {
    title: 'Transforme seu Estado em Destino Inteligente',
    subtitle: 'Plataforma SaaS completa para gestão turística governamental com IA, analytics e passaporte digital',
    buttons: {
      primary: { text: 'Agendar Demonstração', path: '/contato' },
      secondary: { text: 'Ver Case de Sucesso', path: '/ms' },
      tertiary: { text: 'Conhecer Funcionalidades', path: '/solucoes' }
    }
  }
};

const msConfig: BrandConfig = {
  brand: 'ms',
  logo: {
    src: '/images/logo-descubra-ms-v2.png', // Nova logo do Descubra MS
    alt: 'Descubra Mato Grosso do Sul - Plataforma de Turismo',
    fallback: 'Descubra MS'
  },
  navigation: [
    { name: 'Destinos', path: '/ms/destinos' },
    { name: 'Eventos', path: '/ms/eventos' },
    { name: 'Parceiros', path: '/ms/parceiros' },
    { name: 'Entrar', path: '/ms/login' }
  ],
  authenticatedNavigation: [
    { name: 'Home', path: '/ms' }, // Adicionado link para a Home do tenant logado
    { name: 'Guatá IA', path: '/ms/guata' },
    { name: 'Passaporte Digital', path: '/ms/passaporte' },
    // { name: 'Destinos', path: '/ms/destinos' }, // Removido
    // { name: 'Eventos', path: '/ms/eventos' }, // Removido
    // { name: 'Roteiros', path: '/ms/roteiros' }, // Removido
    // { name: 'Parceiros', path: '/ms/parceiros' }, // Removido
    // { name: 'Sobre', path: '/ms/sobre' } // Removido
  ],
  cta: {
    primary: 'Cadastrar',
    secondary: 'Entrar'
  },
  hero: {
    title: 'Descubra Mato Grosso do Sul',
    subtitle: 'Do Pantanal ao Cerrado, explore paisagens únicas e biodiversidade no coração da América do Sul',
    buttons: {
      primary: { text: 'Descubra Agora', path: '/ms/welcome' },
      secondary: { text: 'Passaporte Digital', path: '/ms/passaporte' },
      tertiary: { text: 'Converse com o Guatá', path: '/ms/guata' }
    }
  }
};

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { isMultiTenantMode, currentTenant, tenantConfig, loading: tenantLoading, error: tenantError } = useMultiTenant(); // Adicionado tenantLoading e tenantError
  
  const config = useMemo(() => {
    console.log("🔍 BrandContext: Calculando config. isMultiTenantMode:", isMultiTenantMode, "currentTenant:", currentTenant, "tenantConfig:", tenantConfig, "tenantLoading:", tenantLoading);

    let currentConfig: BrandConfig;

    // Prioritize MS config if path starts with /ms or currentTenant is 'ms'
    if (location.pathname.toLowerCase().startsWith('/ms')) {
      currentConfig = { ...msConfig }; // Start with msConfig
      console.log("🔍 BrandContext: Path /ms detectado (case-insensitive), usando msConfig como base.");
    } else {
      currentConfig = { ...overflowOneConfig }; // Default to overflowOneConfig
      console.log("🔍 BrandContext: Usando overflowOneConfig como base.");
    }

    // If multi-tenant mode is active and tenant config is loaded, apply dynamic overrides
    if (isMultiTenantMode && tenantConfig && !tenantLoading) {
      console.log("✅ BrandContext: Modo Multi-tenant ATIVO, aplicando overrides do tenantConfig do Supabase.");
      currentConfig = {
        ...currentConfig, // Keep current base config properties
        brand: 'ms', // Garante que o brand seja 'ms' para tenants
        logo: {
          ...currentConfig.logo,
          src: msConfig.logo.src, // Explicitamente usa a logo local do MS
          alt: tenantConfig.name || currentConfig.logo.alt,
          fallback: (tenantConfig.code || currentConfig.brand).toUpperCase()
        },
        navigation: msConfig.navigation.map(nav => ({
          ...nav,
          path: nav.path.replace('/ms', `/${tenantConfig.code}`)
        })),
        authenticatedNavigation: msConfig.authenticatedNavigation.map(nav => ({
          ...nav,
          path: nav.path.replace('/ms', `/${tenantConfig.code}`)
        })),
        cta: {
          primary: tenantConfig.cta_primary || currentConfig.cta.primary,
          secondary: tenantConfig.cta_secondary || currentConfig.cta.secondary,
        },
        hero: {
          ...currentConfig.hero, // Use currentConfig's hero as base
          title: tenantConfig.name || currentConfig.hero.title,
          buttons: {
            ...currentConfig.hero.buttons,
            primary: { ...currentConfig.hero.buttons.primary, path: `/${tenantConfig.code}/welcome` },
            secondary: { ...currentConfig.hero.buttons.secondary, path: `/${tenantConfig.code}/passaporte` },
            tertiary: { ...currentConfig.hero.buttons.tertiary, path: `/${tenantConfig.code}/guata` }
          }
        }
      };
      console.log("Generated dynamicConfig:", currentConfig);
    } else if (tenantLoading) {
      console.log("🔍 BrandContext: Tenant ainda está carregando, usando a baseConfig atual.");
      // If loading, currentConfig (msConfig or flowtripConfig) is already set as base.
      // No change needed here, just log for clarity.
    }

    return currentConfig;
  }, [location.pathname, isMultiTenantMode, currentTenant, tenantConfig, tenantLoading]);

      const isOverflowOne = config.brand === 'overflow-one';
  const isMS = config.brand === 'ms';

  const value = {
    config,
    isOverflowOne,
    isMS
  };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};