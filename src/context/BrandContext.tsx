import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

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
    { name: 'Início', path: '/ms' },
    { name: 'Destinos', path: '/ms/destinos' },
    { name: 'Eventos', path: '/ms/eventos' },
    { name: 'Roteiros', path: '/ms/roteiros' },
    { name: 'Parceiros', path: '/ms/parceiros' },
    { name: 'Sobre', path: '/ms/sobre' }
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
  
  const config = useMemo(() => {
    // Detectar contexto baseado na URL
    if (location.pathname.startsWith('/ms')) {
      return msConfig;
    }
    return flowTripConfig;
  }, [location.pathname]);

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