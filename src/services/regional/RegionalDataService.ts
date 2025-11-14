/**
 * Serviço de Dados Regionais para ViaJAR
 * Gerencia APIs e dados específicos por região
 */

export interface RegionalConfig {
  region: string;
  primaryAPI: string;
  secondaryAPIs: string[];
  dataQuality: 'HIGH' | 'MEDIUM' | 'LOW';
  specialties: string[];
  seasonality: string;
  targetAudience: string[];
}

export interface RegionalData {
  region: string;
  visitors: number;
  revenue: number;
  occupancy: number;
  attractions: number;
  events: number;
  lastUpdated: string;
  source: string;
}

export class RegionalDataService {
  private static instance: RegionalDataService;
  private regionalConfigs: Map<string, RegionalConfig> = new Map();

  constructor() {
    this.initializeRegionalConfigs();
  }

  static getInstance(): RegionalDataService {
    if (!RegionalDataService.instance) {
      RegionalDataService.instance = new RegionalDataService();
    }
    return RegionalDataService.instance;
  }

  /**
   * Inicializa configurações regionais
   */
  private initializeRegionalConfigs(): void {
    // Mato Grosso do Sul - ALUMIA
    this.regionalConfigs.set('MS', {
      region: 'MS',
      primaryAPI: 'ALUMIA_API',
      secondaryAPIs: ['IBGE_API', 'INMET_API', 'GOOGLE_PLACES'],
      dataQuality: 'HIGH',
      specialties: ['Pantanal', 'Bonito', 'Ecoturismo', 'Pesca Esportiva'],
      seasonality: 'Alta temporada: Maio a Setembro',
      targetAudience: ['Ecoturistas', 'Aventureiros', 'Pesca Esportiva', 'Fotógrafos']
    });

    // São Paulo - SETUR-SP
    this.regionalConfigs.set('SP', {
      region: 'SP',
      primaryAPI: 'SETUR_SP_API',
      secondaryAPIs: ['IBGE_API', 'INMET_API', 'GOOGLE_PLACES'],
      dataQuality: 'HIGH',
      specialties: ['Capital', 'Interior', 'Litoral', 'Negócios'],
      seasonality: 'Alta temporada: Dezembro a Março',
      targetAudience: ['Negócios', 'Lazer', 'Eventos', 'Cultura']
    });

    // Rio de Janeiro - TurisRio
    this.regionalConfigs.set('RJ', {
      region: 'RJ',
      primaryAPI: 'TURISRIO_API',
      secondaryAPIs: ['IBGE_API', 'INMET_API', 'GOOGLE_PLACES'],
      dataQuality: 'HIGH',
      specialties: ['Capital', 'Costa Verde', 'Serra', 'Carnaval'],
      seasonality: 'Alta temporada: Dezembro a Março',
      targetAudience: ['Carnaval', 'Praias', 'Cultura', 'Eventos']
    });

    // Paraná - Paraná Turismo
    this.regionalConfigs.set('PR', {
      region: 'PR',
      primaryAPI: 'PARANA_TURISMO_API',
      secondaryAPIs: ['IBGE_API', 'INMET_API', 'GOOGLE_PLACES'],
      dataQuality: 'HIGH',
      specialties: ['Cataratas', 'Litoral', 'Serra', 'Cultura'],
      seasonality: 'Alta temporada: Dezembro a Março',
      targetAudience: ['Natureza', 'Cultura', 'Eventos', 'Família']
    });

    // Configuração padrão para outras regiões
    this.regionalConfigs.set('DEFAULT', {
      region: 'DEFAULT',
      primaryAPI: 'GOOGLE_PLACES',
      secondaryAPIs: ['IBGE_API', 'INMET_API', 'WEB_SCRAPING'],
      dataQuality: 'MEDIUM',
      specialties: ['Turismo', 'Eventos', 'Atrações'],
      seasonality: 'Varia por região',
      targetAudience: ['Diversificado']
    });
  }

  /**
   * Obtém dados regionais
   */
  async getRegionalData(region: string): Promise<RegionalData> {
    try {
      const config = this.getRegionalConfig(region);
      
      // Tentar API primária primeiro
      if (config.primaryAPI !== 'GOOGLE_PLACES') {
        try {
          return await this.callPrimaryAPI(config);
        } catch (error) {
          console.warn(`API primária ${config.primaryAPI} falhou, usando fallback:`, error);
        }
      }

      // Fallback para APIs secundárias
      return await this.callSecondaryAPIs(config);
      
    } catch (error) {
      console.error('Erro ao obter dados regionais:', error);
      return this.getMockData(region);
    }
  }

  /**
   * Obtém configuração regional
   */
  getRegionalConfig(region: string): RegionalConfig {
    return this.regionalConfigs.get(region.toUpperCase()) || 
           this.regionalConfigs.get('DEFAULT')!;
  }

  /**
   * Lista todas as regiões disponíveis
   */
  getAvailableRegions(): string[] {
    return Array.from(this.regionalConfigs.keys()).filter(r => r !== 'DEFAULT');
  }

  /**
   * Chama API primária
   */
  private async callPrimaryAPI(config: RegionalConfig): Promise<RegionalData> {
    switch (config.primaryAPI) {
      case 'ALUMIA_API':
        return await this.callAlumiaAPI(config.region);
      case 'SETUR_SP_API':
        return await this.callSeturSPAPI(config.region);
      case 'TURISRIO_API':
        return await this.callTurisRioAPI(config.region);
      case 'PARANA_TURISMO_API':
        return await this.callParanaTurismoAPI(config.region);
      default:
        throw new Error(`API primária ${config.primaryAPI} não implementada`);
    }
  }

  /**
   * Chama APIs secundárias
   */
  private async callSecondaryAPIs(config: RegionalConfig): Promise<RegionalData> {
    // Simular chamada para APIs secundárias
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      region: config.region,
      visitors: Math.floor(Math.random() * 100000) + 10000,
      revenue: Math.floor(Math.random() * 10000000) + 1000000,
      occupancy: Math.floor(Math.random() * 40) + 60,
      attractions: Math.floor(Math.random() * 50) + 20,
      events: Math.floor(Math.random() * 20) + 5,
      lastUpdated: new Date().toISOString(),
      source: 'Secondary APIs'
    };
  }

  /**
   * Chama API ALUMIA (MS)
   */
  private async callAlumiaAPI(region: string): Promise<RegionalData> {
    // Simular chamada para ALUMIA
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      region,
      visitors: 150000,
      revenue: 25000000,
      occupancy: 75,
      attractions: 45,
      events: 12,
      lastUpdated: new Date().toISOString(),
      source: 'ALUMIA API'
    };
  }

  /**
   * Chama API SETUR-SP
   */
  private async callSeturSPAPI(region: string): Promise<RegionalData> {
    // Simular chamada para SETUR-SP
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      region,
      visitors: 500000,
      revenue: 100000000,
      occupancy: 80,
      attractions: 120,
      events: 25,
      lastUpdated: new Date().toISOString(),
      source: 'SETUR-SP API'
    };
  }

  /**
   * Chama API TurisRio
   */
  private async callTurisRioAPI(region: string): Promise<RegionalData> {
    // Simular chamada para TurisRio
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      region,
      visitors: 300000,
      revenue: 75000000,
      occupancy: 85,
      attractions: 80,
      events: 18,
      lastUpdated: new Date().toISOString(),
      source: 'TurisRio API'
    };
  }

  /**
   * Chama API Paraná Turismo
   */
  private async callParanaTurismoAPI(region: string): Promise<RegionalData> {
    // Simular chamada para Paraná Turismo
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      region,
      visitors: 200000,
      revenue: 50000000,
      occupancy: 70,
      attractions: 60,
      events: 15,
      lastUpdated: new Date().toISOString(),
      source: 'Paraná Turismo API'
    };
  }

  /**
   * Dados mock para fallback
   */
  private getMockData(region: string): RegionalData {
    return {
      region,
      visitors: Math.floor(Math.random() * 50000) + 5000,
      revenue: Math.floor(Math.random() * 5000000) + 500000,
      occupancy: Math.floor(Math.random() * 30) + 50,
      attractions: Math.floor(Math.random() * 30) + 10,
      events: Math.floor(Math.random() * 10) + 2,
      lastUpdated: new Date().toISOString(),
      source: 'Mock Data'
    };
  }

  /**
   * Verifica se região tem API oficial
   */
  hasOfficialAPI(region: string): boolean {
    const config = this.getRegionalConfig(region);
    return config.primaryAPI !== 'GOOGLE_PLACES';
  }

  /**
   * Obtém qualidade dos dados da região
   */
  getDataQuality(region: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    const config = this.getRegionalConfig(region);
    return config.dataQuality;
  }
}

// Exportar instância singleton
export const regionalDataService = RegionalDataService.getInstance();




