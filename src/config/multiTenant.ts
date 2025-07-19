// Configuração do Sistema Multi-Tenant
// Suporte para múltiplos estados brasileiros

export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  fullName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  regions: string[];
  questions: string[];
  features: {
    passport: boolean;
    ai: boolean;
    analytics: boolean;
    accessibility: boolean;
  };
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  social: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
}

export interface MultiTenantConfig {
  states: {
    ms: TenantConfig;
    // Preparado para futuros estados
    mt?: TenantConfig;
    go?: TenantConfig;
    sp?: TenantConfig;
  };
  defaultState: 'ms';
}

// Configuração específica do Mato Grosso do Sul
const MS_CONFIG: TenantConfig = {
  id: 'ms',
  name: 'MS',
  slug: 'ms',
  fullName: 'Mato Grosso do Sul',
  logo: '/flowtrip-logo.png',
  primaryColor: '#1e40af', // MS Blue
  secondaryColor: '#0d9488', // MS Teal
  accentColor: '#ea580c', // MS Orange
  regions: [
    'bonito-serra-bodoquena',
    'pantanal',
    'caminho-ipes',
    'rota-norte',
    'costa-leste',
    'grande-dourados',
    'sete-caminhos-natureza',
    'vale-aguas',
    'vale-apore',
    'caminho-fronteira'
  ],
  questions: [
    'Você já visitou o Pantanal?',
    'Tem interesse em ecoturismo?',
    'Conhece Bonito?',
    'Prefere turismo urbano ou rural?',
    'Tem interesse em turismo de fronteira?',
    'Já experimentou a gastronomia local?',
    'Tem interesse em pesca esportiva?',
    'Prefere destinos com cachoeiras ou rios?'
  ],
  features: {
    passport: true,
    ai: true,
    analytics: true,
    accessibility: true
  },
  contact: {
    email: 'turismo@ms.gov.br',
    phone: '(67) 3318-6000',
    website: 'https://www.turismo.ms.gov.br'
  },
  social: {
    instagram: '@turismo_ms',
    facebook: 'TurismoMS',
    youtube: 'TurismoMS'
  }
};

// Configuração completa multi-tenant
export const MULTI_TENANT_CONFIG: MultiTenantConfig = {
  states: {
    ms: MS_CONFIG
  },
  defaultState: 'ms'
};

// Hook para gerenciar multi-tenancy
export const useMultiTenant = () => {
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const currentState = pathSegments[0];
  const isStatePath = currentState && currentState.length === 2;
  
  const getCurrentTenant = (): TenantConfig => {
    if (isStatePath && MULTI_TENANT_CONFIG.states[currentState as keyof typeof MULTI_TENANT_CONFIG.states]) {
      return MULTI_TENANT_CONFIG.states[currentState as keyof typeof MULTI_TENANT_CONFIG.states];
    }
    return MULTI_TENANT_CONFIG.states[MULTI_TENANT_CONFIG.defaultState];
  };

  const getTenantBySlug = (slug: string): TenantConfig | undefined => {
    return MULTI_TENANT_CONFIG.states[slug as keyof typeof MULTI_TENANT_CONFIG.states];
  };

  const getAllTenants = (): TenantConfig[] => {
    return Object.values(MULTI_TENANT_CONFIG.states);
  };

  const isTenantPath = (): boolean => {
    return isStatePath;
  };

  const getPathWithTenant = (path: string): string => {
    const tenant = getCurrentTenant();
    return isTenantPath() ? `/${tenant.slug}${path}` : path;
  };

  const getTenantBranding = () => {
    const tenant = getCurrentTenant();
    return {
      logo: tenant.logo,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      accentColor: tenant.accentColor,
      name: tenant.name,
      fullName: tenant.fullName
    };
  };

  return {
    currentTenant: getCurrentTenant(),
    isTenantPath: isTenantPath(),
    getTenantBySlug,
    getAllTenants,
    getPathWithTenant,
    getTenantBranding,
    currentState: isStatePath ? currentState : null
  };
};

// Utilitários para multi-tenancy
export const getTenantFromPath = (path: string): string | null => {
  const segments = path.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment && firstSegment.length === 2) {
    return firstSegment;
  }
  
  return null;
};

export const isTenantValid = (tenant: string): boolean => {
  return tenant in MULTI_TENANT_CONFIG.states;
};

export const getTenantQuestions = (tenantSlug: string): string[] => {
  const tenant = MULTI_TENANT_CONFIG.states[tenantSlug as keyof typeof MULTI_TENANT_CONFIG.states];
  return tenant?.questions || [];
};

export const getTenantRegions = (tenantSlug: string): string[] => {
  const tenant = MULTI_TENANT_CONFIG.states[tenantSlug as keyof typeof MULTI_TENANT_CONFIG.states];
  return tenant?.regions || [];
}; 