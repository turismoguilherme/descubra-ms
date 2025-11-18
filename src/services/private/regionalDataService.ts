/**
 * Regional Data Service
 * Serviço para buscar dados regionais de turismo
 * - MS: ALUMIA (quando API disponível)
 * - Outros estados: Google Search API
 */

import { supabase } from '@/integrations/supabase/client';
import { AlumiaService } from '@/services/alumia/index';
import { GoogleSearchAPI } from '@/services/ai/search/googleSearchAPI';

export interface RegionalTourismData {
  source: 'ALUMIA' | 'GOOGLE_SEARCH' | 'NONE';
  state: string;
  data: {
    touristArrivals?: number;
    averageStay?: number;
    averageSpending?: number;
    topDestinations?: string[];
    seasonalTrends?: {
      month: string;
      arrivals: number;
    }[];
    marketInsights?: string[];
    competitorData?: {
      name: string;
      occupancy?: number;
      avgPrice?: number;
    }[];
    originOfTourists?: {
      state: string;
      percentage: number;
    }[];
  };
  lastUpdate: Date;
  quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'BASIC';
  isConfigured: boolean;
  statusMessage?: string;
}

export class RegionalDataService {
  private googleSearchAPI: GoogleSearchAPI;

  constructor() {
    this.googleSearchAPI = new GoogleSearchAPI();
  }

  /**
   * Obter dados regionais baseado no estado do negócio
   */
  async getRegionalData(
    state: string,
    businessType?: string
  ): Promise<RegionalTourismData | null> {
    try {
      // Se for MS, tentar ALUMIA primeiro
      if (state === 'MS' || state === 'Mato Grosso do Sul') {
        const alumiaData = await this.fetchFromAlumia(businessType);
        if (alumiaData) {
          return alumiaData;
        }
        // Se ALUMIA não estiver disponível, usar Google Search como fallback
        return await this.fetchFromGoogleSearch('MS', businessType);
      }

      // Para outros estados, usar Google Search API
      return await this.fetchFromGoogleSearch(state, businessType);
    } catch (error) {
      console.error('Erro ao buscar dados regionais:', error);
      return null;
    }
  }

  /**
   * Verificar se ALUMIA está configurada e disponível
   */
  async checkAlumiaAvailability(): Promise<{
    isConfigured: boolean;
    isAvailable: boolean;
    message: string;
  }> {
    const apiKey = import.meta.env.VITE_ALUMIA_API_KEY;
    const baseUrl = import.meta.env.VITE_ALUMIA_BASE_URL;

    if (!apiKey || !baseUrl) {
      return {
        isConfigured: false,
        isAvailable: false,
        message: 'ALUMIA não configurada. Configure VITE_ALUMIA_API_KEY e VITE_ALUMIA_BASE_URL'
      };
    }

    // Testar conexão
    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10 segundos timeout
      });

      if (response.ok) {
        return {
          isConfigured: true,
          isAvailable: true,
          message: 'ALUMIA configurada e disponível'
        };
      } else {
        return {
          isConfigured: true,
          isAvailable: false,
          message: 'ALUMIA configurada mas API não está respondendo'
        };
      }
    } catch (error) {
      return {
        isConfigured: true,
        isAvailable: false,
        message: 'ALUMIA configurada mas não foi possível conectar'
      };
    }
  }

  /**
   * Buscar dados da ALUMIA (MS)
   */
  private async fetchFromAlumia(businessType?: string): Promise<RegionalTourismData | null> {
    const availability = await this.checkAlumiaAvailability();

    if (!availability.isConfigured || !availability.isAvailable) {
      console.log('⚠️ ALUMIA não disponível:', availability.message);
      return null;
    }

    try {
      console.log('🔗 Buscando dados da ALUMIA...');
      
      // Usar o serviço ALUMIA existente
      const alumiaService = AlumiaService.getInstance();
      const insights = await alumiaService.getTourismInsights('MS');
      
      if (!insights || insights.status === 'simulated_data') {
        console.log('⚠️ ALUMIA retornou dados simulados, usando fallback');
        return null;
      }

      // Extrair dados estruturados dos insights
      const data: RegionalTourismData['data'] = {
        touristArrivals: insights.insights?.visitacao?.total_visitantes,
        marketInsights: insights.insights?.tendencias || [],
        topDestinations: insights.insights?.destinos_populares?.map((d: any) => d.nome) || [],
        seasonalTrends: this.extractSeasonalTrends(insights),
        originOfTourists: this.extractOriginData(insights)
      };

      return {
        source: 'ALUMIA',
        state: 'MS',
        data,
        lastUpdate: new Date(),
        quality: 'EXCELLENT',
        isConfigured: true,
        statusMessage: 'Dados oficiais da ALUMIA - Governo de MS'
      };
    } catch (error) {
      console.error('❌ Erro ao buscar dados da ALUMIA:', error);
      return null;
    }
  }

  /**
   * Buscar dados via Google Search API (outros estados ou fallback)
   */
  private async fetchFromGoogleSearch(
    state: string,
    businessType?: string
  ): Promise<RegionalTourismData> {
    console.log(`🔍 Buscando dados via Google Search para ${state}...`);

    try {
      // Construir queries de busca
      const queries = [
        `turismo ${state} estatísticas dados`,
        `turismo ${state} origem turistas`,
        `turismo ${state} sazonalidade`,
        `turismo ${state} eventos`,
        `turismo ${state} atrações principais`
      ];

      const allResults: any[] = [];
      
      // Buscar para cada query usando Google Custom Search diretamente
      const apiKey = (import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || '').trim();
      const searchEngineId = (import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID || '').trim();
      
      if (!apiKey || !searchEngineId) {
        throw new Error('Google Search API não configurada');
      }

      for (const query of queries) {
        try {
          const searchQuery = `${query} ${state} Brasil`;
          const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}&num=5`;
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.items && data.items.length > 0) {
            allResults.push(...data.items);
          }
        } catch (error) {
          console.warn(`Erro ao buscar query "${query}":`, error);
        }
      }

      // Extrair dados dos resultados
      const extractedData = this.extractDataFromSearchResults(allResults, state);

      return {
        source: 'GOOGLE_SEARCH',
        state,
        data: extractedData,
        lastUpdate: new Date(),
        quality: allResults.length > 0 ? 'GOOD' : 'FAIR',
        isConfigured: true,
        statusMessage: 'Dados baseados em Google Search API. Não são dados oficiais.'
      };
    } catch (error) {
      console.error('❌ Erro ao buscar dados via Google Search:', error);
      
      // Retornar dados básicos como fallback
      return {
        source: 'GOOGLE_SEARCH',
        state,
        data: {
          marketInsights: [
            `Dados de turismo para ${state} não disponíveis no momento.`,
            'Configure Google Search API ou ALUMIA (se for MS) para ver dados regionais.'
          ]
        },
        lastUpdate: new Date(),
        quality: 'BASIC',
        isConfigured: false,
        statusMessage: 'Não foi possível buscar dados. Configure as APIs necessárias.'
      };
    }
  }

  /**
   * Extrair dados relevantes dos resultados de busca
   */
  private extractDataFromSearchResults(
    results: any[],
    state: string
  ): RegionalTourismData['data'] {
    const insights: string[] = [];
    const destinations: string[] = [];
    let touristArrivals: number | undefined;
    let averageStay: number | undefined;
    let averageSpending: number | undefined;

    // Processar resultados
    results.forEach((item: any) => {
      const text = `${item.title || ''} ${item.snippet || ''}`.toLowerCase();
      
      // Extrair números de visitantes
      const visitorMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:milhões?|mil|milhões?)?\s*(?:de\s*)?(?:visitantes|turistas)/i);
      if (visitorMatch) {
        let num = parseFloat(visitorMatch[1]);
        if (text.includes('milhão') || text.includes('milhões')) {
          num *= 1000000;
        } else if (text.includes('mil')) {
          num *= 1000;
        }
        if (!touristArrivals || num > touristArrivals) {
          touristArrivals = Math.round(num);
        }
      }

      // Extrair permanência média
      const stayMatch = text.match(/(\d+(?:\.\d+)?)\s*dias?/i);
      if (stayMatch) {
        const num = parseFloat(stayMatch[1]);
        if (!averageStay || num > averageStay) {
          averageStay = num;
        }
      }

      // Extrair gasto médio
      const spendingMatch = text.match(/r\$\s*(\d+(?:\.\d+)?)/i);
      if (spendingMatch) {
        const num = parseFloat(spendingMatch[1]);
        if (!averageSpending || num > averageSpending) {
          averageSpending = num;
        }
      }

      // Adicionar insights
      if (item.title) {
        insights.push(`Baseado em: ${item.title}`);
      }
    });

    return {
      touristArrivals,
      averageStay,
      averageSpending,
      marketInsights: insights.length > 0 
        ? insights.slice(0, 5)
        : [
            `Dados de turismo para ${state} baseados em Google Search`,
            'Fontes: Sites públicos e informações disponíveis online',
            'Para dados oficiais, consulte as fontes governamentais do seu estado'
          ],
      seasonalTrends: [],
      topDestinations: destinations
    };
  }

  /**
   * Extrair tendências sazonais dos dados ALUMIA
   */
  private extractSeasonalTrends(insights: any): RegionalTourismData['data']['seasonalTrends'] {
    // Implementar extração de tendências sazonais se disponível nos insights
    return undefined;
  }

  /**
   * Extrair dados de origem dos turistas
   */
  private extractOriginData(insights: any): RegionalTourismData['data']['originOfTourists'] {
    // Implementar extração de origem se disponível nos insights
    return undefined;
  }
}

export const regionalDataService = new RegionalDataService();

