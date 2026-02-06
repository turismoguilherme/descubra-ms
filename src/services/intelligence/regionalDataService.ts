/**
 * Regional Data Service
 * Gerencia fontes de dados por região (multi-regional)
 * 
 * NÍVEIS DE DADOS:
 * ⭐⭐⭐ ALUMIA (MS) - Dados oficiais governo
 * ⭐⭐ APIs Estaduais + Scraping - Boa qualidade
 * ⭐ IA + Estimativas - Qualidade básica
 */

export type DataSource = 'ALUMIA' | 'STATE_API' | 'SCRAPING' | 'AI_ESTIMATION' | 'COMMUNITY';
export type DataQualityLevel = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'BASIC';

export interface RegionConfig {
  code: string;
  name: string;
  dataSource: DataSource;
  quality: DataQualityLevel;
  qualityScore: number; // 0-100
  features: string[];
  lastUpdate: Date;
  updateFrequency: string;
  apiEndpoint?: string;
  hasOfficialData: boolean;
}

export interface DataQualityIndicator {
  region: string;
  source: string;
  quality: DataQualityLevel;
  score: number;
  badge: '⭐⭐⭐' | '⭐⭐' | '⭐';
  message: string;
  limitations?: string[];
  benefits?: string[];
}

/**
 * Configurações por região
 */
const REGION_CONFIGS: Record<string, RegionConfig> = {
  // MATO GROSSO DO SUL - Premium (ALUMIA)
  'MS': {
    code: 'MS',
    name: 'Mato Grosso do Sul',
    dataSource: 'ALUMIA',
    quality: 'EXCELLENT',
    qualityScore: 95,
    features: ['all'],
    lastUpdate: new Date(),
    updateFrequency: 'tempo real',
    apiEndpoint: import.meta.env.VITE_ALUMIA_API_URL,
    hasOfficialData: true,
  },
  
  // SÃO PAULO - Boa qualidade (API Estadual ou Scraping)
  'SP': {
    code: 'SP',
    name: 'São Paulo',
    dataSource: 'SCRAPING', // Mudar para 'STATE_API' quando conseguir parceria
    quality: 'GOOD',
    qualityScore: 75,
    features: ['limited'],
    lastUpdate: new Date(),
    updateFrequency: 'diário',
    hasOfficialData: false,
  },
  
  // RIO DE JANEIRO - Boa qualidade
  'RJ': {
    code: 'RJ',
    name: 'Rio de Janeiro',
    dataSource: 'SCRAPING',
    quality: 'GOOD',
    qualityScore: 70,
    features: ['limited'],
    lastUpdate: new Date(),
    updateFrequency: 'diário',
    hasOfficialData: false,
  },
  
  // PARANÁ - Boa qualidade
  'PR': {
    code: 'PR',
    name: 'Paraná',
    dataSource: 'SCRAPING',
    quality: 'GOOD',
    qualityScore: 70,
    features: ['limited'],
    lastUpdate: new Date(),
    updateFrequency: 'diário',
    hasOfficialData: false,
  },
  
  // INTERNACIONAL - Qualidade básica
  'INTERNATIONAL': {
    code: 'INT',
    name: 'Internacional',
    dataSource: 'AI_ESTIMATION',
    quality: 'BASIC',
    qualityScore: 60,
    features: ['basic'],
    lastUpdate: new Date(),
    updateFrequency: 'semanal',
    hasOfficialData: false,
  },
};

/**
 * Obtém configuração da região
 */
export function getRegionConfig(regionCode: string): RegionConfig {
  // MS tem dados premium
  if (regionCode === 'MS') {
    return REGION_CONFIGS.MS;
  }
  
  // Estados com configuração específica
  if (REGION_CONFIGS[regionCode]) {
    return REGION_CONFIGS[regionCode];
  }
  
  // Internacional
  if (!isBrazilianState(regionCode)) {
    return REGION_CONFIGS.INTERNATIONAL;
  }
  
  // Outros estados brasileiros (fallback genérico)
  return {
    code: regionCode,
    name: getStateName(regionCode),
    dataSource: 'SCRAPING',
    quality: 'FAIR',
    qualityScore: 65,
    features: ['limited'],
    lastUpdate: new Date(),
    updateFrequency: 'diário',
    hasOfficialData: false,
  };
}

/**
 * Obtém indicador de qualidade para exibir no dashboard
 */
export function getDataQualityIndicator(regionCode: string): DataQualityIndicator {
  const config = getRegionConfig(regionCode);
  
  const indicators: Record<DataSource, DataQualityIndicator> = {
    'ALUMIA': {
      region: config.name,
      source: 'ALUMIA (Governo MS)',
      quality: 'EXCELLENT',
      score: 95,
      badge: '⭐⭐⭐',
      message: 'Dados oficiais do governo em tempo real',
      benefits: [
        'Dados 100% oficiais e verificados',
        'Atualização em tempo real',
        'Todas as funcionalidades disponíveis',
        'Integração com CATs governamentais',
        'Suporte técnico oficial',
      ],
    },
    
    'STATE_API': {
      region: config.name,
      source: 'API Estadual Oficial',
      quality: 'GOOD',
      score: 80,
      badge: '⭐⭐',
      message: 'Dados oficiais do governo estadual',
      benefits: [
        'Dados oficiais verificados',
        'Atualização diária',
        'Maioria das funcionalidades disponíveis',
      ],
      limitations: [
        'Algumas métricas podem ter delay de 24h',
        'Nem todas as funcionalidades premium disponíveis',
      ],
    },
    
    'SCRAPING': {
      region: config.name,
      source: 'Múltiplas Fontes (Web + IA)',
      quality: 'GOOD',
      score: 70,
      badge: '⭐⭐',
      message: 'Dados tratados de fontes públicas + IA',
      benefits: [
        'Dados consolidados de múltiplas fontes',
        'Validação por IA',
        'Funcionalidades principais disponíveis',
      ],
      limitations: [
        'Dados estimados com IA (70-80% precisos)',
        'Atualização a cada 24h',
        'Aguardando parceria oficial com governo',
        'Algumas funcionalidades premium limitadas',
      ],
    },
    
    'AI_ESTIMATION': {
      region: config.name,
      source: 'Inteligência Artificial',
      quality: 'BASIC',
      score: 60,
      badge: '⭐',
      message: 'Dados estimados com algoritmos de IA',
      benefits: [
        'Análises de tendências gerais',
        'Funcionalidades básicas disponíveis',
      ],
      limitations: [
        'Dados estimados (60-70% precisos)',
        'Recomendado apenas para trends gerais',
        'Funcionalidades premium não disponíveis',
        'Atualização semanal',
      ],
    },
    
    'COMMUNITY': {
      region: config.name,
      source: 'Comunidade + Auto-cadastro',
      quality: 'FAIR',
      score: 65,
      badge: '⭐⭐',
      message: 'Dados fornecidos pela comunidade',
      limitations: [
        'Qualidade depende dos usuários',
        'Validação manual necessária',
        'Funcionalidades limitadas',
      ],
    },
  };
  
  return indicators[config.dataSource];
}

/**
 * Verifica se código é de estado brasileiro
 */
function isBrazilianState(code: string): boolean {
  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  return brazilianStates.includes(code);
}

/**
 * Obtém nome completo do estado
 */
function getStateName(code: string): string {
  const stateNames: Record<string, string> = {
    'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
    'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo',
    'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
    'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
    'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
    'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
    'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins',
  };
  return stateNames[code] || code;
}

/**
 * Obtém dados da região (função principal)
 */
export class RegionalDataService {
  
  async getData(region: string, dataType: string): Promise<any> {
    const config = getRegionConfig(region);
    
    console.log(`Buscando ${dataType} para ${config.name} via ${config.dataSource}`);
    
    switch(config.dataSource) {
      case 'ALUMIA':
        return this.fetchFromAlumia(dataType);
        
      case 'STATE_API':
        return this.fetchFromStateAPI(region, dataType);
        
      case 'SCRAPING':
        return this.fetchFromScraping(region, dataType);
        
      case 'AI_ESTIMATION':
        return this.fetchFromAI(region, dataType);
        
      default:
        return this.fetchFromCommunity(region, dataType);
    }
  }
  
  /**
   * Busca dados da ALUMIA (MS premium)
   */
  private async fetchFromAlumia(dataType: string): Promise<any> {
    // TODO: Integrar com API real da ALUMIA quando disponível
    console.log('Buscando dados ALUMIA (oficial MS)');
    
    // Mock de dados premium
    return {
      source: 'ALUMIA',
      quality: 'EXCELLENT',
      realTimeData: true,
      // ... dados reais virão aqui
    };
  }
  
  /**
   * Busca dados de APIs estaduais
   */
  private async fetchFromStateAPI(region: string, dataType: string): Promise<any> {
    console.log(`Buscando dados de API estadual: ${region}`);
    
    // TODO: Implementar integrações com APIs estaduais
    return {
      source: 'STATE_API',
      quality: 'GOOD',
      // ... dados tratados
    };
  }
  
  /**
   * Busca dados via web scraping + IA
   */
  private async fetchFromScraping(region: string, dataType: string): Promise<any> {
    console.log(`Buscando dados via scraping: ${region}`);
    
    // TODO: Implementar scraping inteligente
    return {
      source: 'SCRAPING',
      quality: 'GOOD',
      estimated: true,
      // ... dados consolidados
    };
  }
  
  /**
   * Busca dados via IA (internacional/fallback)
   */
  private async fetchFromAI(region: string, dataType: string): Promise<any> {
    console.log(`Estimando dados com IA: ${region}`);
    
    return {
      source: 'AI_ESTIMATION',
      quality: 'BASIC',
      estimated: true,
      confidence: 0.6,
      // ... estimativas
    };
  }
  
  /**
   * Busca dados da comunidade
   */
  private async fetchFromCommunity(region: string, dataType: string): Promise<any> {
    console.log(`Buscando dados da comunidade: ${region}`);
    
    return {
      source: 'COMMUNITY',
      quality: 'FAIR',
      userGenerated: true,
      // ... dados auto-cadastrados
    };
  }
  
  /**
   * Verifica se funcionalidade está disponível na região
   */
  isFeatureAvailable(region: string, feature: string): boolean {
    const config = getRegionConfig(region);
    
    if (config.features.includes('all')) {
      return true;
    }
    
    // Features básicas disponíveis em todas as regiões
    const basicFeatures = ['profile', 'listing', 'photos'];
    if (basicFeatures.includes(feature)) {
      return true;
    }
    
    // Features avançadas só em regiões premium
    const advancedFeatures = ['revenue_optimizer', 'market_intelligence', 'real_time_analytics'];
    if (advancedFeatures.includes(feature)) {
      return config.quality === 'EXCELLENT' || config.quality === 'GOOD';
    }
    
    return false;
  }
  
  /**
   * Obtém mensagem explicativa sobre limitações
   */
  getFeatureLimitationMessage(region: string, feature: string): string | null {
    if (this.isFeatureAvailable(region, feature)) {
      return null;
    }
    
    const config = getRegionConfig(region);
    
    if (config.code === 'MS') {
      return null; // MS tem tudo
    }
    
    return `Esta funcionalidade está disponível apenas em regiões com dados oficiais do governo. ` +
           `Estamos trabalhando para trazer a ALUMIA para ${config.name}!`;
  }
}

/**
 * Instância singleton do serviço
 */
export const regionalDataService = new RegionalDataService();

/**
 * Lista de regiões disponíveis
 */
export function getAvailableRegions(): RegionConfig[] {
  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  return brazilianStates.map(code => getRegionConfig(code));
}

/**
 * Obtém regiões por qualidade
 */
export function getRegionsByQuality(quality: DataQualityLevel): RegionConfig[] {
  return getAvailableRegions().filter(r => r.quality === quality);
}

