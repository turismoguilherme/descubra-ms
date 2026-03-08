// Google Custom Search API - Todas as buscas passam pela Edge Function
// Chaves protegidas no servidor via guata-google-search-proxy

import { callGoogleSearchProxy } from './googleSearchProxy';

export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
  reliability: 'high' | 'medium' | 'low';
}

export interface GoogleSearchResponse {
  success: boolean;
  results: GoogleSearchResult[];
  totalResults: number;
  searchTime: number;
}

// Sites oficiais de MS para classificação de confiabilidade
const OFFICIAL_SITES = [
  'fundtur.ms.gov.br',
  'campogrande.ms.gov.br',
  'bonito.ms.gov.br',
  'corumba.ms.gov.br',
  'bioparque.com',
  'turismo.ms.gov.br'
];

function classifyReliability(source: string): 'high' | 'medium' | 'low' {
  if (OFFICIAL_SITES.some(site => source.includes(site))) return 'high';
  if (source.includes('.gov.br')) return 'high';
  if (source.includes('tripadvisor') || source.includes('booking.com')) return 'medium';
  return 'low';
}

function extractSource(link: string): string {
  try {
    return new URL(link).hostname;
  } catch {
    return 'unknown';
  }
}

export class GoogleSearchAPI {
  async searchMSInfo(query: string, category?: string): Promise<GoogleSearchResponse> {
    try {
      const msQuery = category ? `${query} "Mato Grosso do Sul" ${category}` : `${query} "Mato Grosso do Sul"`;
      const response = await callGoogleSearchProxy(msQuery, { maxResults: 10 });

      if (!response.success) {
        return { success: false, results: [], totalResults: 0, searchTime: 0 };
      }

      const results: GoogleSearchResult[] = response.results.map(item => {
        const source = extractSource(item.link);
        return {
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          source,
          reliability: classifyReliability(source)
        };
      }).filter(r => r.reliability !== 'low');

      return { success: true, results, totalResults: results.length, searchTime: Date.now() };
    } catch (error) {
      console.warn('❌ Google Search: Erro na busca:', error);
      return { success: false, results: [], totalResults: 0, searchTime: 0 };
    }
  }

  async searchHotels(location: string): Promise<GoogleSearchResult[]> {
    const response = await this.searchMSInfo(`hotéis ${location}`, 'hospedagem');
    return response.results;
  }

  async searchRestaurants(location: string): Promise<GoogleSearchResult[]> {
    const response = await this.searchMSInfo(`restaurantes ${location}`, 'gastronomia');
    return response.results;
  }

  async searchAttractions(location: string): Promise<GoogleSearchResult[]> {
    const response = await this.searchMSInfo(`atrações turísticas ${location}`, 'turismo');
    return response.results;
  }

  async verifyInformation(info: string, location?: string): Promise<{
    exists: boolean;
    sources: string[];
    confidence: number;
  }> {
    const query = location ? `${info} ${location} MS` : `${info} Mato Grosso do Sul`;
    const response = await this.searchMSInfo(query);
    const exists = response.results.length > 0;
    const sources = response.results.map(r => r.source);
    const confidence = response.results.length > 0
      ? response.results.filter(r => r.reliability === 'high').length / response.results.length
      : 0;
    return { exists, sources, confidence };
  }
}

export const googleSearchAPI = new GoogleSearchAPI();
