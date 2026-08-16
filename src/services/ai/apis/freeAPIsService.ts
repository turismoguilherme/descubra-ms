/**
 * Serviço de APIs Gratuitas para Guatá Inteligente
 * Integra múltiplas APIs gratuitas para buscar informações atualizadas
 */

export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  source: string;
  timestamp: Date;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  city: string;
  updatedAt: Date;
}

export interface WikipediaData {
  title: string;
  extract: string;
  url: string;
  lastUpdated: Date;
}

export interface IBGEData {
  population?: number;
  area?: number;
  region?: string;
  lastCensus?: number;
}

export interface DuckDuckGoData {
  abstract: string;
  url: string;
  title: string;
}

export class FreeAPIsService {
  private readonly WIKIPEDIA_BASE_URL = 'https://pt.wikipedia.org/api/rest_v1/page/summary';
  private readonly IBGE_BASE_URL = 'https://servicodados.ibge.gov.br/api/v1';
  private readonly WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
  private readonly DUCKDUCKGO_BASE_URL = 'https://api.duckduckgo.com/';

  constructor() {}

  /**
   * Busca informações do Wikipedia sobre MS
   */
  async getWikipediaInfo(query: string): Promise<APIResponse> {
    try {
      const searchQuery = encodeURIComponent(`${query} Mato Grosso do Sul`);
      const response = await fetch(`${this.WIKIPEDIA_BASE_URL}/${searchQuery}`);
      
      if (!response.ok) {
        return {
          success: false,
          error: `Wikipedia API error: ${response.status}`,
          source: 'wikipedia',
          timestamp: new Date()
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          title: data.title,
          extract: data.extract,
          url: data.content_urls?.desktop?.page,
          lastUpdated: new Date()
        } as WikipediaData,
        source: 'wikipedia',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: `Wikipedia error: ${error}`,
        source: 'wikipedia',
        timestamp: new Date()
      };
    }
  }

  /**
   * Busca dados oficiais do IBGE sobre MS
   */
  async getIBGEData(city?: string): Promise<APIResponse> {
    try {
      const msCode = '50'; // Código do MS no IBGE
      let url = `${this.IBGE_BASE_URL}/localidades/estados/${msCode}`;
      
      if (city) {
        // Busca dados específicos da cidade
        const cityResponse = await fetch(`${this.IBGE_BASE_URL}/localidades/municipios?nome=${encodeURIComponent(city)}&estado=${msCode}`);
        if (cityResponse.ok) {
          const cityData = await cityResponse.json();
          if (cityData.length > 0) {
            const cityCode = cityData[0].id;
            url = `${this.IBGE_BASE_URL}/localidades/municipios/${cityCode}`;
          }
        }
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        return {
          success: false,
          error: `IBGE API error: ${response.status}`,
          source: 'ibge',
          timestamp: new Date()
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          population: data.populacao_estimada,
          area: data.area_km2,
          region: data.microrregiao?.mesorregiao?.nome,
          lastCensus: data.ultimo_censo
        } as IBGEData,
        source: 'ibge',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: `IBGE error: ${error}`,
        source: 'ibge',
        timestamp: new Date()
      };
    }
  }

  /**
   * Busca informações climáticas atuais
   */
  async getWeatherData(city: string = 'Campo Grande'): Promise<APIResponse> {
    try {
      // Usando OpenWeatherMap API (gratuita)
      const apiKey = process.env.OPENWEATHER_API_KEY || 'demo'; // Fallback para demo
      const cityCode = city === 'Campo Grande' ? '3467747' : '3467747'; // Código do Campo Grande
      
      const response = await fetch(
        `${this.WEATHER_BASE_URL}?id=${cityCode}&appid=${apiKey}&units=metric&lang=pt_br`
      );
      
      if (!response.ok) {
        return {
          success: false,
          error: `Weather API error: ${response.status}`,
          source: 'weather',
          timestamp: new Date()
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].description,
          humidity: data.main.humidity,
          city: data.name,
          updatedAt: new Date()
        } as WeatherData,
        source: 'weather',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: `Weather error: ${error}`,
        source: 'weather',
        timestamp: new Date()
      };
    }
  }

  /**
   * Busca informações gerais via DuckDuckGo
   */
  async getDuckDuckGoInfo(query: string): Promise<APIResponse> {
    try {
      const searchQuery = encodeURIComponent(`${query} Mato Grosso do Sul`);
      const response = await fetch(`${this.DUCKDUCKGO_BASE_URL}?q=${searchQuery}&format=json&no_html=1&skip_disambig=1`);
      
      if (!response.ok) {
        return {
          success: false,
          error: `DuckDuckGo API error: ${response.status}`,
          source: 'duckduckgo',
          timestamp: new Date()
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          abstract: data.Abstract || data.AbstractText || 'Informação não disponível',
          url: data.AbstractURL || '',
          title: data.Heading || query
        } as DuckDuckGoData,
        source: 'duckduckgo',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: `DuckDuckGo error: ${error}`,
        source: 'duckduckgo',
        timestamp: new Date()
      };
    }
  }

  /**
   * Busca informações de múltiplas APIs simultaneamente
   */
  async getMultiSourceInfo(query: string): Promise<{
    wikipedia?: WikipediaData;
    ibge?: IBGEData;
    weather?: WeatherData;
    duckduckgo?: DuckDuckGoData;
    errors: string[];
  }> {
    const results = await Promise.allSettled([
      this.getWikipediaInfo(query),
      this.getIBGEData(),
      this.getWeatherData(),
      this.getDuckDuckGoInfo(query)
    ]);

    const errors: string[] = [];
    const data: any = {};

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        const sources = ['wikipedia', 'ibge', 'weather', 'duckduckgo'];
        data[sources[index]] = result.value.data;
      } else if (result.status === 'rejected') {
        errors.push(`API ${index} failed: ${result.reason}`);
      } else if (result.status === 'fulfilled' && !result.value.success) {
        errors.push(result.value.error || 'Unknown error');
      }
    });

    return { ...data, errors };
  }

  /**
   * Verifica se as APIs estão funcionando
   */
  async healthCheck(): Promise<{
    wikipedia: boolean;
    ibge: boolean;
    weather: boolean;
    duckduckgo: boolean;
  }> {
    const results = await Promise.allSettled([
      this.getWikipediaInfo('Mato Grosso do Sul'),
      this.getIBGEData(),
      this.getWeatherData(),
      this.getDuckDuckGoInfo('Mato Grosso do Sul')
    ]);

    return {
      wikipedia: results[0].status === 'fulfilled' && results[0].value.success,
      ibge: results[1].status === 'fulfilled' && results[1].value.success,
      weather: results[2].status === 'fulfilled' && results[2].value.success,
      duckduckgo: results[3].status === 'fulfilled' && results[3].value.success
    };
  }
}

// Instância singleton
export const freeAPIsService = new FreeAPIsService(); 