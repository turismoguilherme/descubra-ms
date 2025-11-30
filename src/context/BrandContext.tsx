import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useMultiTenant } from '../hooks/useMultiTenant';
import logoDescubraMS from '@/assets/images/logo-descubra-ms-v2.png';

export interface BrandConfig {
  brand: 'ms' | 'overflow-one';
  logo: {
    src: string;
    alt: string;
    fallback: string;
  };
  navigation: Array<{
    name: string;
    path: string;
  }>;
  authenticatedNavigation: Array<{
    name: string;
    path: string;
  }>;
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

// Configuração para Overflow One
const overflowOneConfig: BrandConfig = {
  brand: 'overflow-one',
  logo: {
    src: '/images/logo-overflow-one.png',
    alt: 'Overflow One - Plataforma de Turismo',
    fallback: 'Overflow One'
  },
  navigation: [
    { name: 'Destinos', path: '/destinos' },
    { name: 'Eventos', path: '/eventos' },
    { name: 'Parceiros', path: '/parceiros' },
    { name: 'Entrar', path: '/login' }
  ],
  authenticatedNavigation: [
    { name: 'Home', path: '/' },
    { name: 'Guatá IA', path: '/guata' },
    { name: 'Passaporte Digital', path: '/passaporte' },
  ],
  cta: {
    primary: 'Cadastrar',
    secondary: 'Entrar'
  },
  hero: {
    title: 'Overflow One',
    subtitle: 'Sua plataforma completa de turismo e descoberta',
    buttons: {
      primary: { text: 'Começar Agora', path: '/welcome' },
      secondary: { text: 'Passaporte Digital', path: '/passaporte' },
      tertiary: { text: 'Converse com o Guatá', path: '/guata' }
    }
  }
};

// Configuração para Descubra MS
const msConfig: BrandConfig = {
  brand: 'ms',
  logo: {
    src: '/images/logo-descubra-ms.png?v=3', // Logo atualizada do Descubra MS
    alt: 'Descubra Mato Grosso do Sul - Plataforma de Turismo',
    fallback: 'Descubra MS'
  },
  navigation: [
    { name: 'Destinos', path: '/descubramatogrossodosul/destinos' },
    { name: 'Eventos', path: '/descubramatogrossodosul/eventos' },
    { name: 'Parceiros', path: '/descubramatogrossodosul/parceiros' },
    { name: 'Sobre', path: '/descubramatogrossodosul/sobre' },
  ],
  authenticatedNavigation: [
    { name: 'Guatá IA', path: '/descubramatogrossodosul/guata' },
    { name: 'Passaporte Digital', path: '/descubramatogrossodosul/passaporte' },
  ],
  cta: {
    primary: 'Cadastrar',
    secondary: 'Entrar'
  },
  hero: {
    title: 'Descubra Mato Grosso do Sul',
    subtitle: 'Do Pantanal ao Cerrado, explore paisagens únicas e biodiversidade no coração da América do Sul',
    buttons: {
      primary: { text: 'Descubra Agora', path: '/descubramatogrossodosul/welcome' },
      secondary: { text: 'Passaporte Digital', path: '/descubramatogrossodosul/passaporte' },
      tertiary: { text: 'Converse com o Guatá', path: '/descubramatogrossodosul/guata' }
    }
  }
};

interface BrandContextType {
  config: BrandConfig;
  isOverflowOne: boolean;
  isMS: boolean;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

interface BrandProviderProps {
  children: ReactNode;
}

export const BrandProvider: React.FC<BrandProviderProps> = ({ children }) => {
  const { currentTenant, tenantConfig, loading: tenantLoading } = useMultiTenant();
  const location = useLocation();

  // Função para detectar o tenant baseado no path atual
  const detectTenantFromPath = (pathname: string): 'ms' | 'overflow-one' => {
    const path = pathname.toLowerCase();
    if (path.startsWith('/descubramatogrossodosul') || path.startsWith('/ms')) {
      return 'ms';
    }
    return 'overflow-one';
  };

  // Determinar configuração baseada no tenant com useMemo para otimização
  // IMPORTANTE: Inclui location.pathname como dependência para reagir às mudanças de rota
  const config = useMemo((): BrandConfig => {
    console.log('🎨 BRAND: Recalculando config para path:', location.pathname);
    
    // Se estamos no modo multi-tenant e temos um tenant carregado
    if (currentTenant && tenantConfig && !tenantLoading) {
      // Usar a configuração base do MS e aplicar overrides do Supabase
      const baseConfig = msConfig;
      
      const dynamicConfig: BrandConfig = {
        ...baseConfig,
        logo: {
          ...baseConfig.logo,
          src: tenantConfig.logo_url || baseConfig.logo.src,
          alt: `${tenantConfig.name} - Plataforma de Turismo`,
          fallback: tenantConfig.name || baseConfig.logo.fallback
        },
        hero: {
          ...baseConfig.hero,
          title: tenantConfig.name || baseConfig.hero.title,
          subtitle: tenantConfig.description || baseConfig.hero.subtitle
        }
      };

      return dynamicConfig;
    }

    // Detectar tenant do path se não estivermos no modo multi-tenant
    const detectedTenant = detectTenantFromPath(location.pathname);
    console.log('🎨 BRAND: Tenant detectado:', detectedTenant);
    
    if (detectedTenant === 'ms') {
      return msConfig;
    }

    // Fallback para Overflow One
    return overflowOneConfig;
  }, [currentTenant, tenantConfig, tenantLoading, location.pathname]);
  
  const isOverflowOne = config.brand === 'overflow-one';
  const isMS = config.brand === 'ms';
  
  console.log('🎨 BRAND: isMS:', isMS, 'isOverflowOne:', isOverflowOne, 'path:', location.pathname);

  return (
    <BrandContext.Provider value={{ config, isOverflowOne, isMS }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = (): BrandContextType => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};

export default BrandContext;
