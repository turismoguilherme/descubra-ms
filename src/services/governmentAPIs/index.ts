// Sistema de APIs Governamentais - Fase 3
// Integração com APIs oficiais do governo para dados turísticos

import { GovernmentAPIResponse, TourismData, WeatherData, EventData, TransportData } from './types';

// Configurações das APIs
const API_CONFIG = {
  // API do Ministério do Turismo
  MINISTRY_TOURISM: {
    baseURL: 'https://api.turismo.gov.br/v1',
    endpoints: {
      destinations: '/destinations',
      events: '/events',
      statistics: '/statistics',
      alerts: '/alerts'
    }
  },
  
  // API do IBGE
  IBGE: {
    baseURL: 'https://servicodados.ibge.gov.br/api/v1',
    endpoints: {
      municipalities: '/localidades/municipios',
      regions: '/localidades/regioes',
      population: '/populacao'
    }
  },
  
  // API do INMET (Clima)
  INMET: {
    baseURL: 'https://apitempo.inmet.gov.br',
    endpoints: {
      weather: '/estacao',
      forecast: '/previsao'
    }
  },
  
  // API da ANTT (Transporte)
  ANTT: {
    baseURL: 'https://api.antt.gov.br/v1',
    endpoints: {
      routes: '/routes',
      schedules: '/schedules',
      prices: '/prices'
    }
  },
  
  // API da Fundtur-MS (Dados locais)
  FUNDTUR_MS: {
    baseURL: 'https://api.fundtur.ms.gov.br/v1',
    endpoints: {
      destinations: '/destinations',
      events: '/events',
      statistics: '/statistics',
      realTime: '/real-time'
    }
  }
};

// Classe principal para gerenciar APIs governamentais
export class GovernmentAPIService {
  private static instance: GovernmentAPIService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  private constructor() {}

  static getInstance(): GovernmentAPIService {
    if (!GovernmentAPIService.instance) {
      GovernmentAPIService.instance = new GovernmentAPIService();
    }
    return GovernmentAPIService.instance;
  }

  // Método genérico para fazer requisições com cache
  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📦 Retornando dados do cache:', url);
      return cached.data;
    }

    try {
      console.log('🌐 Fazendo requisição para API governamental:', url);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Descubra-MS/1.0',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache dos dados
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('❌ Erro na API governamental:', error);
      throw error;
    }
  }

  // API do Ministério do Turismo
  async getMinistryTourismData(state: string = 'MS'): Promise<TourismData[]> {
    const url = `${API_CONFIG.MINISTRY_TOURISM.baseURL}${API_CONFIG.MINISTRY_TOURISM.endpoints.destinations}?state=${state}`;
    
    try {
      const data = await this.makeRequest<TourismData[]>(url);
      return data;
    } catch (error) {
      console.warn('⚠️ Fallback para dados mockados do Ministério do Turismo');
      return this.getMockTourismData();
    }
  }

  // API do IBGE
  async getIBGEData(municipalityCode?: string): Promise<any> {
    const url = municipalityCode 
      ? `${API_CONFIG.IBGE.baseURL}${API_CONFIG.IBGE.endpoints.municipalities}/${municipalityCode}`
      : `${API_CONFIG.IBGE.baseURL}${API_CONFIG.IBGE.endpoints.municipalities}?uf=MS`;
    
    try {
      const data = await this.makeRequest(url);
      return data;
    } catch (error) {
      console.warn('⚠️ Fallback para dados mockados do IBGE');
      return this.getMockIBGEData();
    }
  }

  // API do INMET (Clima)
  async getWeatherData(cityCode: string): Promise<WeatherData> {
    const url = `${API_CONFIG.INMET.baseURL}${API_CONFIG.INMET.endpoints.weather}/${cityCode}`;
    
    try {
      const data = await this.makeRequest<WeatherData>(url);
      return data;
    } catch (error) {
      console.warn('⚠️ Fallback para dados mockados do INMET');
      return this.getMockWeatherData();
    }
  }

  // API da ANTT (Transporte)
  async getTransportData(origin: string, destination: string): Promise<TransportData[]> {
    const url = `${API_CONFIG.ANTT.baseURL}${API_CONFIG.ANTT.endpoints.routes}?origin=${origin}&destination=${destination}`;
    
    try {
      const data = await this.makeRequest<TransportData[]>(url);
      return data;
    } catch (error) {
      console.warn('⚠️ Fallback para dados mockados da ANTT');
      return this.getMockTransportData();
    }
  }

  // API da Fundtur-MS
  async getFundturMSData(endpoint: string): Promise<any> {
    const url = `${API_CONFIG.FUNDTUR_MS.baseURL}${API_CONFIG.FUNDTUR_MS.endpoints[endpoint as keyof typeof API_CONFIG.FUNDTUR_MS.endpoints]}`;
    
    try {
      const data = await this.makeRequest(url);
      return data;
    } catch (error) {
      console.warn('⚠️ Fallback para dados mockados da Fundtur-MS');
      return this.getMockFundturMSData(endpoint);
    }
  }

  // Dados em tempo real da Fundtur-MS
  async getRealTimeData(): Promise<any> {
    return this.getFundturMSData('realTime');
  }

  // Limpar cache
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache das APIs governamentais limpo');
  }

  // Obter estatísticas de uso
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  // Dados mockados para fallback
  private getMockTourismData(): TourismData[] {
    return [
      {
        id: '1',
        name: 'Bonito',
        type: 'destination',
        state: 'MS',
        category: 'ecoturismo',
        rating: 4.8,
        visitors: 150000,
        lastUpdate: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Pantanal',
        type: 'destination',
        state: 'MS',
        category: 'natureza',
        rating: 4.9,
        visitors: 80000,
        lastUpdate: new Date().toISOString()
      }
    ];
  }

  private getMockIBGEData(): any {
    return {
      municipalities: [
        { id: 5002704, nome: 'Campo Grande', microrregiao: { nome: 'Campo Grande' } },
        { id: 5003207, nome: 'Dourados', microrregiao: { nome: 'Dourados' } },
        { id: 5004106, nome: 'Três Lagoas', microrregiao: { nome: 'Três Lagoas' } }
      ]
    };
  }

  private getMockWeatherData(): WeatherData {
    return {
      temperature: 25,
      humidity: 65,
      condition: 'Ensolarado',
      forecast: [
        { day: 'Hoje', max: 28, min: 18, condition: 'Ensolarado' },
        { day: 'Amanhã', max: 26, min: 17, condition: 'Parcialmente nublado' }
      ],
      lastUpdate: new Date().toISOString()
    };
  }

  private getMockTransportData(): TransportData[] {
    return [
      {
        id: '1',
        type: 'bus',
        company: 'Viação Cruzeiro do Sul',
        origin: 'Campo Grande',
        destination: 'Bonito',
        duration: '4h 30min',
        price: 45.50,
        schedule: '08:00, 14:00, 18:00'
      }
    ];
  }

  private getMockFundturMSData(endpoint: string): any {
    const mockData = {
      destinations: [
        { id: 1, name: 'Bonito', status: 'active', visitors: 1500 },
        { id: 2, name: 'Pantanal', status: 'active', visitors: 800 }
      ],
      events: [
        { id: 1, name: 'Festival de Inverno', date: '2024-07-15', status: 'upcoming' },
        { id: 2, name: 'Feira Gastronômica', date: '2024-08-20', status: 'upcoming' }
      ],
      statistics: {
        totalVisitors: 25000,
        totalRevenue: 1500000,
        averageRating: 4.7
      },
      realTime: {
        activeTourists: 1250,
        availableAccommodations: 85,
        weatherCondition: 'Ensolarado',
        lastUpdate: new Date().toISOString()
      }
    };

    return mockData[endpoint as keyof typeof mockData] || mockData;
  }
}

// Instância singleton
export const governmentAPI = GovernmentAPIService.getInstance();

// Hooks para React
export const useGovernmentAPI = () => {
  return governmentAPI;
};

// Utilitários
export const formatAPIResponse = (data: any): GovernmentAPIResponse => {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    source: 'government-api'
  };
};

export const handleAPIError = (error: any): GovernmentAPIResponse => {
  return {
    success: false,
    error: error.message,
    timestamp: new Date().toISOString(),
    source: 'government-api'
  };
}; 