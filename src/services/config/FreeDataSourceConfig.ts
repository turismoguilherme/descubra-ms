/**
 * Free Data Source Configuration
 * Configuração de fontes de dados gratuitas por região
 */

export interface DataSource {
  name: string;
  type: 'free' | 'premium' | 'ai';
  priority: number;
  available: boolean;
  description: string;
  features: string[];
  limits?: {
    daily?: number;
    monthly?: number;
    perMinute?: number;
  };
  cost: 'free' | 'paid';
  quality: number; // 0-1
}

export interface RegionConfig {
  country: string;
  state?: string;
  city?: string;
  dataSources: DataSource[];
  hasAlumia: boolean;
  timezone: string;
  currency: string;
  language: string;
}

export class FreeDataSourceConfig {
  private static instance: FreeDataSourceConfig;
  
  private constructor() {}
  
  static getInstance(): FreeDataSourceConfig {
    if (!FreeDataSourceConfig.instance) {
      FreeDataSourceConfig.instance = new FreeDataSourceConfig();
    }
    return FreeDataSourceConfig.instance;
  }

  /**
   * Obter fontes de dados para região
   */
  getDataSourcesForRegion(region: string): DataSource[] {
    console.log(`🔧 Configurando fontes de dados para região: ${region}`);
    
    switch (region) {
      case 'MS':
        return this.getMSDataSources();
      case 'RJ':
      case 'SP':
      case 'PR':
      case 'SC':
      case 'RS':
        return this.getBrazilDataSources(region);
      case 'US':
        return this.getUSDataSources();
      case 'EU':
        return this.getEUDataSources();
      case 'GLOBAL':
        return this.getGlobalDataSources();
      default:
        return this.getDefaultDataSources();
    }
  }

  /**
   * Fontes de dados para MS (com ALUMIA)
   */
  private getMSDataSources(): DataSource[] {
    return [
      {
        name: 'ALUMIA',
        type: 'premium',
        priority: 1,
        available: true,
        description: 'Dados oficiais do Mato Grosso do Sul',
        features: ['Aéreo', 'Alojamento', 'Redes Sociais', 'Eventos', 'Big Data'],
        limits: {
          daily: 1000,
          monthly: 30000
        },
        cost: 'free',
        quality: 0.9
      },
      {
        name: 'OpenStreetMap',
        type: 'free',
        priority: 2,
        available: true,
        description: 'Dados geográficos gratuitos',
        features: ['Localização', 'Endereços', 'Categorias', 'Avaliações'],
        limits: {
          daily: 10000,
          monthly: 300000
        },
        cost: 'free',
        quality: 0.8
      },
      {
        name: 'Google Custom Search',
        type: 'free',
        priority: 3,
        available: true,
        description: '100 queries/dia grátis',
        features: ['Busca web', 'Informações', 'Links', 'Imagens'],
        limits: {
          daily: 100,
          monthly: 3000
        },
        cost: 'free',
        quality: 0.7
      },
      {
        name: 'IA Generativa',
        type: 'ai',
        priority: 4,
        available: true,
        description: 'Análise inteligente com Gemini',
        features: ['Recomendações', 'Insights', 'Tendências', 'Análise'],
        limits: {
          daily: 1000,
          monthly: 30000
        },
        cost: 'free',
        quality: 0.6
      }
    ];
  }

  /**
   * Fontes de dados para outros estados do Brasil
   */
  private getBrazilDataSources(state: string): DataSource[] {
    return [
      {
        name: `SETUR-${state}`,
        type: 'free',
        priority: 1,
        available: true,
        description: `Dados oficiais do ${state}`,
        features: ['Indicadores', 'Eventos', 'Atrativos', 'Estatísticas'],
        limits: {
          daily: 500,
          monthly: 15000
        },
        cost: 'free',
        quality: 0.8
      },
      {
        name: 'EMBRATUR',
        type: 'free',
        priority: 2,
        available: true,
        description: 'Dados nacionais de turismo',
        features: ['Estatísticas', 'Indicadores', 'Tendências', 'Relatórios'],
        limits: {
          daily: 200,
          monthly: 6000
        },
        cost: 'free',
        quality: 0.7
      },
      {
        name: 'OpenStreetMap',
        type: 'free',
        priority: 3,
        available: true,
        description: 'Dados geográficos gratuitos',
        features: ['Localização', 'Endereços', 'Categorias', 'Avaliações'],
        limits: {
          daily: 10000,
          monthly: 300000
        },
        cost: 'free',
        quality: 0.8
      },
      {
        name: 'Google Custom Search',
        type: 'free',
        priority: 4,
        available: true,
        description: '100 queries/dia grátis',
        features: ['Busca web', 'Informações', 'Links', 'Imagens'],
        limits: {
          daily: 100,
          monthly: 3000
        },
        cost: 'free',
        quality: 0.7
      },
      {
        name: 'IA Generativa',
        type: 'ai',
        priority: 5,
        available: true,
        description: 'Análise inteligente com Gemini',
        features: ['Recomendações', 'Insights', 'Tendências', 'Análise'],
        limits: {
          daily: 1000,
          monthly: 30000
        },
        cost: 'free',
        quality: 0.6
      }
    ];
  }

  /**
   * Fontes de dados para Estados Unidos
   */
  private getUSDataSources(): DataSource[] {
    return [
      {
        name: 'Google Places API',
        type: 'free',
        priority: 1,
        available: true,
        description: 'Dados de lugares do Google',
        features: ['Atrações', 'Avaliações', 'Fotos', 'Horários'],
        limits: {
          daily: 1000,
          monthly: 30000
        },
        cost: 'free',
        quality: 0.9
      },
      {
        name: 'TripAdvisor API',
        type: 'free',
        priority: 2,
        available: true,
        description: 'Dados do TripAdvisor',
        features: ['Avaliações', 'Fotos', 'Preços', 'Disponibilidade'],
        limits: {
          daily: 500,
          monthly: 15000
        },
        cost: 'free',
        quality: 0.8
      },
      {
        name: 'OpenStreetMap',
        type: 'free',
        priority: 3,
        available: true,
        description: 'Dados geográficos gratuitos',
        features: ['Localização', 'Endereços', 'Categorias', 'Avaliações'],
        limits: {
          daily: 10000,
          monthly: 300000
        },
        cost: 'free',
        quality: 0.8
      },
      {
        name: 'Google Custom Search',
        type: 'free',
        priority: 4,
        available: true,
        description: '100 queries/dia grátis',
        features: ['Busca web', 'Informações', 'Links', 'Imagens'],
        limits: {
          daily: 100,
          monthly: 3000
        },
        cost: 'free',
        quality: 0.7
      },
      {
        name: 'IA Generativa',
        type: 'ai',
        priority: 5,
        available: true,
        description: 'Análise inteligente com Gemini',
        features: ['Recomendações', 'Insights', 'Tendências', 'Análise'],
        limits: {
          daily: 1000,
          monthly: 30000
        },
        cost: 'free',
        quality: 0.6
      }
    ];
  }

  /**
   * Fontes de dados para Europa
   */
  private getEUDataSources(): DataSource[] {
    return [
      {
        name: 'Booking.com API',
        type: 'free',
        priority: 1,
        available: true,
        description: 'Dados do Booking.com',
        features: ['Hotéis', 'Avaliações', 'Preços', 'Disponibilidade'],
        limits: {
          daily: 500,
          monthly: 15000
        },
        cost: 'free',
        quality: 0.8
      },
      {
        name: 'Google Places API',
        type: 'free',
        priority: 2,
        available: true,
        description: 'Dados de lugares do Google',
        features: ['Atrações', 'Avaliações', 'Fotos', 'Horários'],
        limits: {
          daily: 1000,
          monthly: 30000
        },
        cost: 'free',
        quality: 0.9
      },
      {
        name: 'APIs Europeias',
        type: 'free',
        priority: 3,
        available: true,
        description: 'APIs nacionais europeias',
        features: ['Dados oficiais', 'Eventos', 'Estatísticas', 'Relatórios'],
        limits: {
          daily: 200,
          monthly: 6000
        },
        cost: 'free',
        quality: 0.7
      },
      {
        name: 'OpenStreetMap',
        type: 'free',
        priority: 4,
        available: true,
        description: 'Dados geográficos gratuitos',
        features: ['Localização', 'Endereços', 'Categorias', 'Avaliações'],
        limits: {
          daily: 10000,
          monthly: 300000
        },
        cost: 'free',
        quality: 0.8
      },
      {
        name: 'IA Generativa',
        type: 'ai',
        priority: 5,
        available: true,
        description: 'Análise inteligente com Gemini',
        features: ['Recomendações', 'Insights', 'Tendências', 'Análise'],
        limits: {
          daily: 1000,
          monthly: 30000
        },
        cost: 'free',
        quality: 0.6
      }
    ];
  }

  /**
   * Fontes de dados globais
   */
  private getGlobalDataSources(): DataSource[] {
    return [
      {
        name: 'Google Places API',
        type: 'free',
        priority: 1,
        available: true,
        description: 'Dados de lugares do Google',
        features: ['Atrações', 'Avaliações', 'Fotos', 'Horários'],
        limits: {
          daily: 1000,
          monthly: 30000
        },
        cost: 'free',
        quality: 0.9
      },
      {
        name: 'OpenStreetMap',
        type: 'free',
        priority: 2,
        available: true,
        description: 'Dados geográficos gratuitos',
        features: ['Localização', 'Endereços', 'Categorias', 'Avaliações'],
        limits: {
          daily: 10000,
          monthly: 300000
        },
        cost: 'free',
        quality: 0.8
      },
      {
        name: 'Google Custom Search',
        type: 'free',
        priority: 3,
        available: true,
        description: '100 queries/dia grátis',
        features: ['Busca web', 'Informações', 'Links', 'Imagens'],
        limits: {
          daily: 100,
          monthly: 3000
        },
        cost: 'free',
        quality: 0.7
      },
      {
        name: 'IA Generativa',
        type: 'ai',
        priority: 4,
        available: true,
        description: 'Análise inteligente com Gemini',
        features: ['Recomendações', 'Insights', 'Tendências', 'Análise'],
        limits: {
          daily: 1000,
          monthly: 30000
        },
        cost: 'free',
        quality: 0.6
      }
    ];
  }

  /**
   * Fontes de dados padrão
   */
  private getDefaultDataSources(): DataSource[] {
    return [
      {
        name: 'OpenStreetMap',
        type: 'free',
        priority: 1,
        available: true,
        description: 'Dados geográficos gratuitos',
        features: ['Localização', 'Endereços', 'Categorias', 'Avaliações'],
        limits: {
          daily: 10000,
          monthly: 300000
        },
        cost: 'free',
        quality: 0.8
      },
      {
        name: 'Google Custom Search',
        type: 'free',
        priority: 2,
        available: true,
        description: '100 queries/dia grátis',
        features: ['Busca web', 'Informações', 'Links', 'Imagens'],
        limits: {
          daily: 100,
          monthly: 3000
        },
        cost: 'free',
        quality: 0.7
      },
      {
        name: 'IA Generativa',
        type: 'ai',
        priority: 3,
        available: true,
        description: 'Análise inteligente com Gemini',
        features: ['Recomendações', 'Insights', 'Tendências', 'Análise'],
        limits: {
          daily: 1000,
          monthly: 30000
        },
        cost: 'free',
        quality: 0.6
      }
    ];
  }

  /**
   * Verificar se fonte está disponível
   */
  isSourceAvailable(sourceName: string, region: string): boolean {
    const sources = this.getDataSourcesForRegion(region);
    const source = sources.find(s => s.name === sourceName);
    return source ? source.available : false;
  }

  /**
   * Obter qualidade da fonte
   */
  getSourceQuality(sourceName: string, region: string): number {
    const sources = this.getDataSourcesForRegion(region);
    const source = sources.find(s => s.name === sourceName);
    return source ? source.quality : 0.5;
  }

  /**
   * Obter limites da fonte
   */
  getSourceLimits(sourceName: string, region: string): any {
    const sources = this.getDataSourcesForRegion(region);
    const source = sources.find(s => s.name === sourceName);
    return source ? source.limits : null;
  }

  /**
   * Listar todas as regiões disponíveis
   */
  getAvailableRegions(): string[] {
    return [
      'MS', 'RJ', 'SP', 'PR', 'SC', 'RS', // Brasil
      'US', 'CA', 'MX', // América do Norte
      'EU', 'FR', 'DE', 'IT', 'ES', 'GB', // Europa
      'GLOBAL' // Global
    ];
  }

  /**
   * Obter configuração completa da região
   */
  getRegionConfig(region: string): RegionConfig {
    const dataSources = this.getDataSourcesForRegion(region);
    
    return {
      country: this.getCountryFromRegion(region),
      state: region,
      city: this.getMainCityFromRegion(region),
      dataSources,
      hasAlumia: region === 'MS',
      timezone: this.getTimezoneFromRegion(region),
      currency: this.getCurrencyFromRegion(region),
      language: this.getLanguageFromRegion(region)
    };
  }

  /**
   * Obter país da região
   */
  private getCountryFromRegion(region: string): string {
    if (['MS', 'RJ', 'SP', 'PR', 'SC', 'RS'].includes(region)) return 'BR';
    if (['US', 'CA', 'MX'].includes(region)) return 'US';
    if (['EU', 'FR', 'DE', 'IT', 'ES', 'GB'].includes(region)) return 'EU';
    return 'GLOBAL';
  }

  /**
   * Obter cidade principal da região
   */
  private getMainCityFromRegion(region: string): string {
    const cities: { [key: string]: string } = {
      'MS': 'Campo Grande',
      'RJ': 'Rio de Janeiro',
      'SP': 'São Paulo',
      'PR': 'Curitiba',
      'SC': 'Florianópolis',
      'RS': 'Porto Alegre',
      'US': 'New York',
      'CA': 'Toronto',
      'MX': 'Mexico City',
      'EU': 'London',
      'FR': 'Paris',
      'DE': 'Berlin',
      'IT': 'Rome',
      'ES': 'Madrid',
      'GB': 'London'
    };
    
    return cities[region] || 'Unknown';
  }

  /**
   * Obter timezone da região
   */
  private getTimezoneFromRegion(region: string): string {
    const timezones: { [key: string]: string } = {
      'MS': 'America/Campo_Grande',
      'RJ': 'America/Sao_Paulo',
      'SP': 'America/Sao_Paulo',
      'PR': 'America/Sao_Paulo',
      'SC': 'America/Sao_Paulo',
      'RS': 'America/Sao_Paulo',
      'US': 'America/New_York',
      'CA': 'America/Toronto',
      'MX': 'America/Mexico_City',
      'EU': 'Europe/London',
      'FR': 'Europe/Paris',
      'DE': 'Europe/Berlin',
      'IT': 'Europe/Rome',
      'ES': 'Europe/Madrid',
      'GB': 'Europe/London'
    };
    
    return timezones[region] || 'UTC';
  }

  /**
   * Obter moeda da região
   */
  private getCurrencyFromRegion(region: string): string {
    if (['MS', 'RJ', 'SP', 'PR', 'SC', 'RS'].includes(region)) return 'BRL';
    if (['US', 'CA', 'MX'].includes(region)) return 'USD';
    if (['EU', 'FR', 'DE', 'IT', 'ES', 'GB'].includes(region)) return 'EUR';
    return 'USD';
  }

  /**
   * Obter idioma da região
   */
  private getLanguageFromRegion(region: string): string {
    if (['MS', 'RJ', 'SP', 'PR', 'SC', 'RS'].includes(region)) return 'pt-BR';
    if (['US', 'CA', 'MX'].includes(region)) return 'en-US';
    if (['EU', 'FR', 'DE', 'IT', 'ES', 'GB'].includes(region)) return 'en-GB';
    return 'en-US';
  }
}

export default FreeDataSourceConfig;
