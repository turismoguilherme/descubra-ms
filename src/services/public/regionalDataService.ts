/**
 * Regional Data Service para Setor Público
 * Integra dados de APIs governamentais (IBGE, INMET, ANTT, Fundtur-MS)
 */

import { supabase } from '@/integrations/supabase/client';

export interface IBGEData {
  population?: number;
  area?: number;
  region?: string;
  lastCensus?: number;
  city?: string;
  state?: string;
}

export interface INMETData {
  temperature?: number;
  humidity?: number;
  precipitation?: number;
  forecast?: string;
  lastUpdate?: string;
}

export interface ANTTData {
  roadConditions?: string[];
  trafficAlerts?: string[];
  lastUpdate?: string;
}

export interface FundturMSData {
  tourismIndicators?: {
    visitors?: number;
    revenue?: number;
    occupancy?: number;
  };
  lastUpdate?: string;
}

export interface RegionalDataSummary {
  ibge: IBGEData | null;
  inmet: INMETData | null;
  antt: ANTTData | null;
  fundtur: FundturMSData | null;
  lastUpdate: string;
  region: string;
  city?: string;
}

export class PublicRegionalDataService {
  private cache: Map<string, { data: RegionalDataSummary; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hora

  /**
   * Obter dados do IBGE
   */
  async getIBGEData(city?: string, state: string = 'MS'): Promise<IBGEData | null> {
    try {
      const stateCode = this.getStateCode(state);
      let url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateCode}`;

      if (city) {
        // Buscar código da cidade
        const citySearchUrl = `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?nome=${encodeURIComponent(city)}&estado=${stateCode}`;
        const cityResponse = await fetch(citySearchUrl);
        
        if (cityResponse.ok) {
          const cityData = await cityResponse.json();
          if (cityData.length > 0) {
            const cityCode = cityData[0].id;
            url = `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${cityCode}`;
          }
        }
      }

      const response = await fetch(url);
      if (!response.ok) {
        console.warn('⚠️ Erro ao buscar dados do IBGE:', response.status);
        return null;
      }

      const data = await response.json();
      
      return {
        city: data.nome || city,
        state: data.microrregiao?.mesorregiao?.UF?.sigla || state,
        region: data.microrregiao?.mesorregiao?.nome,
        // Nota: IBGE não retorna população diretamente, precisa de outra API
        population: undefined,
        area: undefined,
        lastCensus: undefined
      };
    } catch (error) {
      console.error('❌ Erro ao buscar dados do IBGE:', error);
      return null;
    }
  }

  /**
   * Obter dados climáticos do INMET (simulado - API real requer autenticação)
   */
  async getINMETData(city: string = 'Campo Grande', state: string = 'MS'): Promise<INMETData | null> {
    try {
      // Nota: API do INMET requer autenticação e é complexa
      // Por enquanto, retornamos dados simulados baseados em padrões
      // Em produção, integrar com API oficial do INMET
      
      const weatherData = this.getSimulatedWeatherData(city);
      
      return {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        precipitation: weatherData.precipitation,
        forecast: weatherData.forecast,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro ao buscar dados do INMET:', error);
      return null;
    }
  }

  /**
   * Obter dados de transporte da ANTT (simulado)
   */
  async getANTTData(region: string = 'MS'): Promise<ANTTData | null> {
    try {
      // Nota: API da ANTT não é pública
      // Retornamos dados simulados
      return {
        roadConditions: [
          'BR-262: Trânsito normal',
          'BR-163: Obras em andamento',
          'BR-060: Trânsito livre'
        ],
        trafficAlerts: [],
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro ao buscar dados da ANTT:', error);
      return null;
    }
  }

  /**
   * Obter dados da Fundtur-MS (simulado - integrar com API quando disponível)
   */
  async getFundturMSData(): Promise<FundturMSData | null> {
    try {
      // Buscar dados do Supabase como fallback
      const { data: tourists } = await supabase
        .from('cat_tourists')
        .select('visit_date')
        .eq('is_active', true)
        .gte('visit_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      const visitors = tourists?.length || 0;
      const estimatedRevenue = visitors * 200; // R$ 200 por turista (estimativa)

      return {
        tourismIndicators: {
          visitors,
          revenue: estimatedRevenue,
          occupancy: Math.min(100, (visitors / 1000) * 100) // Estimativa de ocupação
        },
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro ao buscar dados da Fundtur-MS:', error);
      return null;
    }
  }

  /**
   * Obter resumo completo de dados regionais
   */
  async getRegionalDataSummary(city?: string, state: string = 'MS'): Promise<RegionalDataSummary> {
    const cacheKey = `${state}-${city || 'default'}`;
    const cached = this.cache.get(cacheKey);

    // Verificar cache
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const [ibge, inmet, antt, fundtur] = await Promise.all([
        this.getIBGEData(city, state),
        this.getINMETData(city, state),
        this.getANTTData(state),
        state === 'MS' ? this.getFundturMSData() : Promise.resolve(null)
      ]);

      const summary: RegionalDataSummary = {
        ibge,
        inmet,
        antt,
        fundtur,
        lastUpdate: new Date().toISOString(),
        region: state,
        city
      };

      // Atualizar cache
      this.cache.set(cacheKey, {
        data: summary,
        timestamp: Date.now()
      });

      return summary;
    } catch (error) {
      console.error('❌ Erro ao obter dados regionais:', error);
      return {
        ibge: null,
        inmet: null,
        antt: null,
        fundtur: null,
        lastUpdate: new Date().toISOString(),
        region: state,
        city
      };
    }
  }

  /**
   * Limpar cache
   */
  clearCache() {
    this.cache.clear();
  }

  // Métodos auxiliares privados

  private getStateCode(state: string): string {
    const stateCodes: Record<string, string> = {
      'AC': '12', 'AL': '27', 'AP': '16', 'AM': '13', 'BA': '29',
      'CE': '23', 'DF': '53', 'ES': '32', 'GO': '52', 'MA': '21',
      'MT': '51', 'MS': '50', 'MG': '31', 'PA': '15', 'PB': '25',
      'PR': '41', 'PE': '26', 'PI': '22', 'RJ': '33', 'RN': '24',
      'RS': '43', 'RO': '11', 'RR': '14', 'SC': '42', 'SP': '35',
      'SE': '28', 'TO': '17'
    };
    return stateCodes[state.toUpperCase()] || '50';
  }

  private getSimulatedWeatherData(city: string): { temperature: number; humidity: number; precipitation: number; forecast: string } {
    // Simulação baseada em padrões climáticos do MS
    const month = new Date().getMonth();
    const isDrySeason = month >= 4 && month <= 9; // Maio a Outubro

    return {
      temperature: isDrySeason ? 25 + Math.random() * 5 : 20 + Math.random() * 8,
      humidity: isDrySeason ? 40 + Math.random() * 20 : 60 + Math.random() * 30,
      precipitation: isDrySeason ? Math.random() * 10 : Math.random() * 50,
      forecast: isDrySeason ? 'Ensolarado' : 'Parcialmente nublado'
    };
  }
}

export const publicRegionalDataService = new PublicRegionalDataService();

