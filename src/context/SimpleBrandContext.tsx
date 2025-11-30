import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

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
    src: '/images/overflow-one-logo.png',
    alt: 'OverFlow One',
    fallback: 'OverFlow One'
  },
  navigation: [
    { name: 'Início', path: '/' },
    { name: 'Soluções', path: '/solucoes' },
    { name: 'Preços', path: '/precos' },
    { name: 'Sobre', path: '/sobre-overflow-one' },
    { name: 'Contato', path: '/contato' }
  ],
  authenticatedNavigation: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Perfil', path: '/profile' },
    { name: 'Configurações', path: '/settings' }
  ],
  cta: {
    primary: 'Começar Agora',
    secondary: 'Saiba Mais'
  },
  hero: {
    title: 'Transforme seu Turismo com IA',
    subtitle: 'A plataforma completa para gestão inteligente do turismo',
    buttons: {
      primary: { text: 'Começar Agora', path: '/ms' },
      secondary: { text: 'Ver Demo', path: '/demo' },
      tertiary: { text: 'Falar com Vendas', path: '/contato' }
    }
  }
};

const msConfig: BrandConfig = {
  brand: 'ms',
  logo: {
    src: '/images/logo-descubra-ms.png?v=3',
    alt: 'Descubra Mato Grosso do Sul',
    fallback: 'Descubra MS'
  },
  navigation: [
    { name: 'Início', path: '/descubramatogrossodosul' },
    { name: 'Destinos', path: '/descubramatogrossodosul/destinos' },
    { name: 'Eventos', path: '/descubramatogrossodosul/eventos' },
    { name: 'Roteiros', path: '/descubramatogrossodosul/roteiros' },
    { name: 'Sobre', path: '/descubramatogrossodosul/sobre' }
  ],
  authenticatedNavigation: [
    { name: 'Dashboard', path: '/descubramatogrossodosul/dashboard' },
    { name: 'Perfil', path: '/descubramatogrossodosul/profile' },
    { name: 'Admin', path: '/descubramatogrossodosul/admin' }
  ],
  cta: {
    primary: 'Explorar MS',
    secondary: 'Criar Conta'
  },
  hero: {
    title: 'Descubra Mato Grosso do Sul',
    subtitle: 'A beleza natural do Pantanal e muito mais',
    buttons: {
      primary: { text: 'Explorar Destinos', path: '/descubramatogrossodosul/destinos' },
      secondary: { text: 'Ver Roteiros', path: '/descubramatogrossodosul/roteiros' },
      tertiary: { text: 'Criar Conta', path: '/descubramatogrossodosul/register' }
    }
  }
};

export const SimpleBrandProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  const config = useMemo(() => {
    const isMS = location.pathname.startsWith('/descubramatogrossodosul') || location.pathname.startsWith('/ms');
    return isMS ? msConfig : overflowOneConfig;
  }, [location.pathname]);

  const value = useMemo(() => ({
    config,
    isOverflowOne: config.brand === 'overflow-one',
    isMS: config.brand === 'ms'
  }), [config]);

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a SimpleBrandProvider');
  }
  return context;
};
