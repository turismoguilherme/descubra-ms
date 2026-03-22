import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMultiTenant } from '../hooks/useMultiTenant';
import { platformContentService } from '@/services/admin/platformContentService';
import logoDescubraMS from '@/assets/images/logo-descubra-ms-v2.png';

const enableDebugLogs = import.meta.env.VITE_DEBUG_LOGS === 'true';
const safeLog = (payload: any) => {
  if (!enableDebugLogs) return;
  // eslint-disable-next-line no-console
  console.debug('[BrandContext]', payload);
};

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
    src: '/images/logo-descubra-ms.png', // Logo atualizada do Descubra MS (sincronizada com banco de dados)
    alt: 'Descubra Mato Grosso do Sul - Plataforma de Turismo',
    fallback: 'Descubra MS'
  },
  navigation: [
    { name: 'Mapa Turístico', path: '/descubrams/mapa-turistico' },
    { name: 'Destinos', path: '/descubrams/destinos' },
    { name: 'Eventos', path: '/descubrams/eventos' },
    { name: 'Parceiros', path: '/descubrams/parceiros' },
    { name: 'Sobre', path: '/descubrams/sobre' },
    { name: 'Guatá IA', path: '/descubrams/guata' },
    { name: 'Passaporte Digital', path: '/descubrams/passaporte' },
  ],
  authenticatedNavigation: [
    { name: 'Roteiros', path: '/descubrams/roteiros-personalizados' },
  ],
  cta: {
    primary: 'Cadastrar',
    secondary: 'Entrar'
  },
  hero: {
    title: 'Descubra Mato Grosso do Sul',
    subtitle: 'Do Pantanal ao Cerrado, explore paisagens únicas e biodiversidade no coração da América do Sul',
    buttons: {
      primary: { text: 'Descubra Agora', path: '/descubrams/welcome' },
      secondary: { text: 'Passaporte Digital', path: '/descubrams/passaporte' },
      tertiary: { text: 'Converse com o Guatá', path: '/descubrams/guata' }
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
  const [logosFromDB, setLogosFromDB] = useState<Record<string, string>>({});

  // Carregar logos do banco de dados
  useEffect(() => {
    const loadLogos = async () => {
      try {
        const logoKeys = ['ms_logo_url', 'viajar_logo_url', 'guata_avatar_url'];
        const data = await platformContentService.getContent(logoKeys);
        const logoMap: Record<string, string> = {};
        data.forEach(item => {
          if (item.content_value) {
            logoMap[item.content_key] = item.content_value;
          }
        });
        const previousLogoUrl = logosFromDB['ms_logo_url'];
        setLogosFromDB(logoMap);
        console.log('🔄 [BrandContext] ========== LOGOS CARREGADOS DO BANCO ==========');
        console.log('🔄 [BrandContext] Logo map completo:', logoMap);
        console.log('🔄 [BrandContext] ms_logo_url:', logoMap['ms_logo_url'] || 'NÃO ENCONTRADO');
        console.log('🔄 [BrandContext] viajar_logo_url:', logoMap['viajar_logo_url'] || 'NÃO ENCONTRADO');
        console.log('🔄 [BrandContext] guata_avatar_url:', logoMap['guata_avatar_url'] || 'NÃO ENCONTRADO');
        
      } catch (error) {
        console.error('Erro ao carregar logos do banco:', error);
      }
    };
    loadLogos();
    
    // Recarregar logos a cada 30 segundos para pegar atualizações
    const interval = setInterval(loadLogos, 30000);
    
    // Escutar eventos de atualização de logo com logs detalhados
    const handleLogoUpdate = (event: CustomEvent) => {
      console.log('📢 [BrandContext] ========== EVENTO logo-updated CAPTURADO ==========');
      console.log('📢 [BrandContext] Detalhes do evento:', {
        key: event.detail?.key,
        url: event.detail?.url,
        originalUrl: event.detail?.originalUrl,
        timestamp: event.detail?.timestamp,
        label: event.detail?.label,
        eventType: event.type,
        fullEvent: event
      });
      console.log('📢 [BrandContext] Recarregando logos do banco...');
      loadLogos();
      console.log('📢 [BrandContext] Logo recarregado. O componente deve re-renderizar com a nova logo.');
    };
    window.addEventListener('logo-updated', handleLogoUpdate as EventListener);
    console.log('📢 [BrandContext] Listener de logo-updated registrado');
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('logo-updated', handleLogoUpdate as EventListener);
    };
  }, []);

  // Função para detectar o tenant baseado no path atual
  const detectTenantFromPath = (pathname: string): 'ms' | 'overflow-one' => {
    const path = pathname.toLowerCase();

    if (path.startsWith('/descubrams') || path.startsWith('/descubramatogrossodosul') || path.startsWith('/ms') || path.startsWith('/partner')) {
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
          src: tenantConfig.logo_url || logosFromDB['ms_logo_url'] || baseConfig.logo.src,
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
      // Usar logo do banco se disponível, senão usar padrão
      let logoUrl = logosFromDB['ms_logo_url'] || msConfig.logo.src;
      
      // Adicionar cache busting se for URL do Supabase para garantir atualização
      if (logoUrl.includes('supabase.co') && !logoUrl.includes('?t=')) {
        // Usar timestamp baseado na última atualização conhecida (ou timestamp atual)
        // Isso força o navegador a buscar a versão mais recente
        const cacheBustParam = logoUrl.includes('?') ? '&' : '?';
        logoUrl = `${logoUrl}${cacheBustParam}t=${Date.now()}`;
      }

      return {
        ...msConfig,
        logo: {
          ...msConfig.logo,
          src: logoUrl,
        }
      };
    }

    // Fallback para Overflow One - também pode usar logo do banco
    return {
      ...overflowOneConfig,
      logo: {
        ...overflowOneConfig.logo,
        src: logosFromDB['viajar_logo_url'] || overflowOneConfig.logo.src,
      }
    };
  }, [currentTenant, tenantConfig, tenantLoading, location.pathname, logosFromDB]);
  
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
    
    // Durante HMR, o contexto pode estar temporariamente indisponível
    // Retornar um valor padrão em vez de lançar erro para evitar quebrar a aplicação
    if (import.meta.env.DEV) {
      // Em desenvolvimento, retornar um fallback silencioso
      console.warn('useBrand: BrandProvider não disponível temporariamente (provavelmente durante HMR). Usando fallback.');
      return {
        config: msConfig, // Fallback para MS como padrão
        isOverflowOne: false,
        isMS: true
      };
    }
    // Em produção, ainda lançar erro para detectar problemas reais
    throw new Error('useBrand must be used within a BrandProvider');
  }
  
  return context;
};

export default BrandContext;
