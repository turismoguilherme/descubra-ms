import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useMultiTenant } from '@/hooks/useMultiTenant';

export type BrandType = 'flowtrip' | 'ms';

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
  isFlowTrip: boolean;
  isMS: boolean;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

const flowTripConfig: BrandConfig = {
  brand: 'flowtrip',
  logo: {
    src: '/lovable-uploads/flowtrip-logo.png',
    alt: 'FlowTrip',
    fallback: 'FlowTrip'
  },
  navigation: [
    { name: 'Soluções', path: '/solucoes' },
    { name: 'Cases', path: '/cases' },
    { name: 'Resultados', path: '/resultados' },
    { name: 'Preços', path: '/precos' },
    { name: 'Sobre', path: '/sobre-flowtrip' }
  ],
  authenticatedNavigation: [
    { name: 'Dashboard', path: '/flowtrip/dashboard' },
    { name: 'Analytics', path: '/flowtrip/analytics' }
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
    src: '/lovable-uploads/63490622-9b5f-483c-857e-2427e85a58a3.png',
    alt: 'Descubra Mato Grosso do Sul',
    fallback: 'Descubra MS'
  },
  navigation: [
    { name: 'Destinos', path: '/ms/destinos' },
    { name: 'Eventos', path: '/ms/eventos' },
    { name: 'Parceiros', path: '/ms/parceiros' },
    { name: 'Entrar', path: '/ms/login' }
  ],
  authenticatedNavigation: [
    { name: 'Guatá IA', path: '/ms/guata' },
    { name: 'Passaporte Digital', path: '/ms/passaporte' }
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
  const { isFlowTripMain, currentTenant } = useMultiTenant();
  
  const config = useMemo(() => {
    // Multi-tenant: detectar contexto baseado na URL e tenant
    if (!isFlowTripMain && currentTenant) {
      // Configuração dinâmica baseada no tenant (estado)
      return {
        ...msConfig,
        logo: {
          ...msConfig.logo,
          src: currentTenant.logo,
          alt: `Descubra ${currentTenant.name}`,
          fallback: `Descubra ${currentTenant.slug.toUpperCase()}`
        },
        navigation: msConfig.navigation.map(nav => ({
          ...nav,
          path: nav.path.replace('/ms', `/${currentTenant.slug}`)
        })),
        authenticatedNavigation: msConfig.authenticatedNavigation.map(nav => ({
          ...nav,
          path: nav.path.replace('/ms', `/${currentTenant.slug}`)
        })),
        hero: {
          ...msConfig.hero,
          title: `Descubra ${currentTenant.name}`,
          buttons: {
            ...msConfig.hero.buttons,
            primary: { ...msConfig.hero.buttons.primary, path: `/${currentTenant.slug}/welcome` },
            secondary: { ...msConfig.hero.buttons.secondary, path: `/${currentTenant.slug}/passaporte` },
            tertiary: { ...msConfig.hero.buttons.tertiary, path: `/${currentTenant.slug}/guata` }
          }
        }
      };
    } else if (location.pathname.startsWith('/ms')) {
      return msConfig;
    }
    return flowTripConfig;
  }, [location.pathname, isFlowTripMain, currentTenant]);

  const isFlowTrip = config.brand === 'flowtrip';
  const isMS = config.brand === 'ms';

  const value = {
    config,
    isFlowTrip,
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