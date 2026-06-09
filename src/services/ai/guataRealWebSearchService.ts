// @ts-nocheck
/**
 * 🔍 GUATÁ REAL WEB SEARCH SERVICE
 * Sistema de pesquisa web REAL para o Guatá
 * Integra Google Custom Search API + SerpAPI + APIs de turismo
 */

import { getErrorMessage } from '@/utils/errorUtils';

export interface WebSearchResult {
  title: string;
  snippet: string;
  url: string;
  source: string;
  confidence: number;
  timestamp: Date;
}

export interface TourismData {
  hotels?: Hotel[];
  events?: Event[];
  restaurants?: Restaurant[];
  weather?: Weather;
  attractions?: Attraction[];
}

export interface Hotel {
  name: string;
  address: string;
  price: string;
  rating: number;
  distance: string;
  contact: string;
  amenities: string[];
  source: string;
}

export interface Event {
  name: string;
  date: string;
  location: string;
  description: string;
  price: string;
  source: string;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  rating: number;
  address: string;
  priceRange: string;
  specialties: string[];
  source: string;
}

export interface Weather {
  temperature: number;
  condition: string;
  humidity: number;
  forecast: string[];
  source: string;
}

export interface Attraction {
  name: string;
  type: string;
  rating: number;
  description: string;
  location: string;
  price: string;
  source: string;
}

export interface RealWebSearchQuery {
  question: string;
  location?: string;
  category?: 'hotels' | 'events' | 'restaurants' | 'attractions' | 'general';
  maxResults?: number;
}

export interface RealWebSearchResponse {
  results: WebSearchResult[];
  tourismData: TourismData;
  confidence: number;
  sources: string[];
  processingTime: number;
  usedRealSearch: boolean;
  searchMethod: 'google' | 'serpapi' | 'tourism_apis' | 'hybrid';
}

class GuataRealWebSearchService {
  // Cache de resultados para evitar chamadas repetidas
  private searchCache: Map<string, { results: WebSearchResult[]; timestamp: number }> = new Map();
  private readonly SEARCH_CACHE_DURATION = 30 * 60 * 1000; // 30 minutos
  
  // Google Search sempre disponível via Edge Function (chaves no servidor)
  private readonly isConfigured: boolean = true;
  
  // SerpAPI (opcional, fallback)
  private readonly serpApiKey: string | undefined = import.meta.env.VITE_SERPAPI_KEY;

  constructor() {
    // Todas as buscas passam pela Edge Function (chaves protegidas no servidor)
    if (import.meta.env.DEV) {
      console.log('[Guatá Web Search] Usando Edge Function para buscas (chaves protegidas)');
    }
  }

  /** Snippet via Gemini (sem google_search) quando CSE/Vertex falham. */
  private async searchWithGeminiSnippetFallback(
    query: string,
    cacheKey: string,
  ): Promise<WebSearchResult[]> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const prompt =
        `Pesquisador de turismo em Mato Grosso do Sul. ` +
        `Responda em português, factual e específico sobre: ${query}. ` +
        `Cite programas oficiais, destinos e fontes .gov.br quando souber.`;

      const { data, error } = await supabase.functions.invoke('guata-gemini-proxy', {
        body: {
          prompt,
          model: 'gemini-2.5-flash-lite',
          temperature: 0.2,
          maxOutputTokens: 600,
          enableGoogleSearch: false,
          userLocation: 'Mato Grosso do Sul',
          cacheQuestion: query,
        },
      });

      if (error || !data?.text || data?.success === false) return [];

      const text = String(data.text).trim();
      if (text.length < 80) return [];

      const urlMatches = text.match(/https?:\/\/[^\s)\]"']+/g) ?? [];
      const results: WebSearchResult[] = [];

      if (urlMatches.length > 0) {
        for (const url of urlMatches.slice(0, 3)) {
          results.push({
            title: url,
            snippet: text.slice(0, 280),
            url,
            source: 'gemini_text_snippet',
            confidence: 0.75,
            timestamp: new Date(),
          });
        }
      } else {
        results.push({
          title: `Pesquisa: ${query.slice(0, 80)}`,
          snippet: text.slice(0, 500),
          url: 'https://turismo.ms.gov.br',
          source: 'gemini_text_snippet',
          confidence: 0.75,
          timestamp: new Date(),
        });
      }

      this.searchCache.set(cacheKey, { results, timestamp: Date.now() });
      if (import.meta.env.DEV) {
        console.log('[Web Search] ✅ Snippet Gemini (sem google_search):', results.length, 'itens');
      }
      return results;
    } catch {
      return [];
    }
  }

  /**
   * Pesquisa web REAL usando Google Custom Search API
   * Com rate limiting e cache para evitar ultrapassar limites
   */
  private async searchWithGoogle(query: string, maxResults: number = 5): Promise<WebSearchResult[]> {
    const cacheKey = query.toLowerCase().trim();
    const cached = this.searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.SEARCH_CACHE_DURATION) {
      if (import.meta.env.DEV) console.log('[Web Search] Cache hit');
      return cached.results;
    }

    const isDev = import.meta.env.DEV;
    let edgeResponded = false;
    let edgeErrorCode: string | undefined;

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('guata-google-search-proxy', {
        body: { query, maxResults, location: 'Mato Grosso do Sul' },
      });

      edgeResponded = Boolean(data || error);

      if (!error && data?.results?.length > 0) {
        this.searchCache.set(cacheKey, { results: data.results, timestamp: Date.now() });
        if (isDev) console.log('[Web Search] ✅ Edge:', data.results.length, 'resultados');
        return data.results;
      }

      if (data?.error) {
        edgeErrorCode = data.error;
        if (isDev) {
          console.warn(`[Web Search] Edge sem resultados (${data.error}):`, data.help || data.message);
        }
      } else if (error && isDev) {
        console.warn('[Web Search] Invoke error:', getErrorMessage(error));
      }
    } catch (edgeErr) {
      if (isDev) console.warn('[Web Search] Edge exception:', getErrorMessage(edgeErr));
    }

    const geminiResults = await this.searchWithGeminiSnippetFallback(query, cacheKey);
    if (geminiResults.length > 0) return geminiResults;

    // Dev: fallback client-side com VITE_GOOGLE_SEARCH_* (modo antigo local)
    if (import.meta.env.DEV) {
      const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY?.trim();
      const engineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID?.trim();
      if (apiKey && engineId) {
        try {
          const searchQuery = `${query} Mato Grosso do Sul turismo`;
          const url =
            `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}` +
            `&cx=${encodeURIComponent(engineId)}&q=${encodeURIComponent(searchQuery)}&num=${maxResults}`;
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data?.items?.length) {
              const results = data.items.map((item: { title?: string; snippet?: string; link?: string }) => ({
                title: item.title || '',
                snippet: item.snippet || '',
                url: item.link || '',
                source: 'google_cse_dev',
                confidence: 0.85,
                timestamp: new Date(),
              })).filter((r: WebSearchResult) => r.url);
              if (results.length > 0) {
                this.searchCache.set(cacheKey, { results, timestamp: Date.now() });
                console.log('[Web Search] ✅ Fallback dev CSE:', results.length, 'resultados');
                return results;
              }
            }
          }
        } catch {
          // CSE local opcional
        }
      }
    }

    if (isDev) {
      const hint = edgeResponded
        ? `provedores sem acesso/quota (${edgeErrorCode || 'NO_RESULTS'})`
        : 'Edge Function não respondeu';
      console.warn(`[Web Search] Sem resultados — ${hint}; fluxo segue com Gemini/KB local`);
    }
    return [];
  }

  /**
   * Pesquisa usando SerpAPI (alternativa premium)
   */
  private async searchWithSerpAPI(query: string, maxResults: number = 5): Promise<WebSearchResult[]> {
    if (!this.serpApiKey) {
      console.log('⚠️ SerpAPI não configurado');
      return [];
    }

    try {
      const serpUrl = `https://serpapi.com/search?api_key=${this.serpApiKey}&q=${encodeURIComponent(query)}&num=${maxResults}`;
      
      console.log('🔍 Fazendo pesquisa REAL no SerpAPI...');
      const response = await fetch(serpUrl);
      
      if (!response.ok) {
        throw new Error(`SerpAPI error: ${response.status}`);
      }

      const data = await response.json();
      const results: WebSearchResult[] = [];

      if (data.organic_results) {
        data.organic_results.forEach((item: any, index: number) => {
          results.push({
            title: item.title || '',
            snippet: item.snippet || '',
            url: item.link || '',
            source: 'serpapi',
            confidence: 0.95 - (index * 0.05),
            timestamp: new Date()
          });
        });
      }

      console.log(`✅ SerpAPI: ${results.length} resultados encontrados`);
      return results;

    } catch (error) {
      console.error('❌ Erro na SerpAPI:', error);
      return [];
    }
  }

  /**
   * Busca dados específicos de turismo
   */
  private async searchTourismData(query: RealWebSearchQuery, question: string): Promise<TourismData> {
    const tourismData: TourismData = {};

    try {
      // Buscar hotéis se a pergunta for sobre hospedagem
      const lowerQuestion = question.toLowerCase();
      if (query.category === 'hotels' || lowerQuestion.includes('hotel') || lowerQuestion.includes('hospedagem')) {
        tourismData.hotels = await this.searchHotels(query.location || 'Mato Grosso do Sul');
      }

      // Buscar eventos se a pergunta for sobre eventos
      if (query.category === 'events' || lowerQuestion.includes('evento') || lowerQuestion.includes('festa')) {
        tourismData.events = await this.searchEvents(query.location || 'Mato Grosso do Sul');
      }

      // Buscar restaurantes se a pergunta for sobre comida
      if (query.category === 'restaurants' || lowerQuestion.includes('restaurante') || lowerQuestion.includes('comida')) {
        tourismData.restaurants = await this.searchRestaurants(query.location || 'Mato Grosso do Sul');
      }

      // Buscar clima se a pergunta for sobre tempo
      if (lowerQuestion.includes('clima') || lowerQuestion.includes('tempo')) {
        tourismData.weather = await this.searchWeather(query.location || 'Mato Grosso do Sul');
      }

    } catch (error) {
      console.error('❌ Erro ao buscar dados de turismo:', error);
    }

    return tourismData;
  }

  /**
   * Busca hotéis usando APIs de turismo
   */
  private async searchHotels(location: string): Promise<Hotel[]> {
    // NÃO retornar dados simulados - apenas dados reais
    console.log('🏨 Buscando hotéis reais para:', location);
    return []; // Retornar vazio até ter APIs reais
  }

  /**
   * Busca eventos usando APIs de eventos
   */
  private async searchEvents(location: string): Promise<Event[]> {
    // NÃO retornar dados simulados - apenas dados reais
    console.log('🎉 Buscando eventos reais para:', location);
    return []; // Retornar vazio até ter APIs reais
  }

  /**
   * Busca restaurantes usando APIs de gastronomia
   */
  private async searchRestaurants(location: string): Promise<Restaurant[]> {
    // NÃO retornar dados simulados - apenas dados reais
    console.log('🍽️ Buscando restaurantes reais para:', location);
    return []; // Retornar vazio até ter APIs reais
  }

  /**
   * Busca dados de clima
   */
  private async searchWeather(location: string): Promise<Weather> {
    // NÃO retornar dados simulados - apenas dados reais
    console.log('🌤️ Buscando dados de clima reais para:', location);
    return {
      temperature: 0,
      condition: "Dados não disponíveis",
      humidity: 0,
      forecast: [],
      source: "no_data"
    };
  }

  /**
   * Método principal de pesquisa web real
   */
  async searchRealTime(query: RealWebSearchQuery): Promise<RealWebSearchResponse> {
    const startTime = Date.now();
    // Garantir que question seja sempre uma string
    const question = String(query.question || '').trim();
    console.log('🔍 Guatá Real Web Search: Iniciando pesquisa...');
    console.log('📝 Query:', question);
    console.log('📍 Localização:', query.location || 'Mato Grosso do Sul');
    console.log('🏷️ Categoria:', query.category || 'geral');

    let results: WebSearchResult[] = [];
    let searchMethod: 'google' | 'serpapi' | 'tourism_apis' | 'hybrid' = 'tourism_apis';
    let usedRealSearch = false;

    try {
      // 1. Tentar Google Custom Search primeiro
      if (this.isConfigured) {
        console.log('🔍 Tentando Google Custom Search...');
        const googleResults = await this.searchWithGoogle(question, query.maxResults || 5);
        if (googleResults.length > 0) {
          results = googleResults;
          searchMethod = 'google';
          usedRealSearch = true;
          console.log('✅ Google Search bem-sucedido!');
        }
      }

      // 2. Se Google falhar, tentar SerpAPI
      if (results.length === 0 && this.serpApiKey) {
        console.log('🔍 Tentando SerpAPI...');
        const serpResults = await this.searchWithSerpAPI(question, query.maxResults || 5);
        if (serpResults.length > 0) {
          results = serpResults;
          searchMethod = 'serpapi';
          usedRealSearch = true;
          console.log('✅ SerpAPI bem-sucedido!');
        }
      }

      // 3. Buscar dados específicos de turismo
      console.log('🏨 Buscando dados específicos de turismo...');
      const tourismData = await this.searchTourismData(query, question);

      if (results.length === 0) {
        if (import.meta.env.DEV) {
          console.log('[Web Search] Sem snippets — resposta via KB local ou Gemini sem google_search');
        }
        searchMethod = 'tourism_apis';
        usedRealSearch = false;
      } else if (results.some((r) => r.source === 'gemini_text_snippet')) {
        searchMethod = 'hybrid';
        usedRealSearch = true;
      }

      const processingTime = Date.now() - startTime;
      console.log(`✅ Guatá Real Web Search: Concluído em ${processingTime}ms`);
      console.log(`📊 Resultados: ${results.length}`);
      console.log(`🌐 Método: ${searchMethod}`);
      console.log(`🔍 Pesquisa real: ${usedRealSearch}`);

      return {
        results,
        tourismData,
        confidence: usedRealSearch ? 0.9 : 0.7,
        sources: results.map(r => r.source),
        processingTime,
        usedRealSearch,
        searchMethod
      };

    } catch (error) {
      console.error('❌ Erro no Guatá Real Web Search:', error);
      
      return {
        results: [],
        tourismData: {},
        confidence: 0.3,
        sources: [],
        processingTime: Date.now() - startTime,
        usedRealSearch: false,
        searchMethod: 'tourism_apis'
      };
    }
  }

  /**
   * Gera resultados de busca locais como fallback
   */
  private generateLocalSearchResults(question: string): WebSearchResult[] {
    const lowerQuestion = question.toLowerCase();
    
    // Gerar resultados inteligentes baseados na pergunta
    const results: WebSearchResult[] = [];
    
    // Detectar tipo de pergunta e gerar resposta específica
    if (lowerQuestion.includes('bonito')) {
      results.push({
        title: "Bonito MS - Capital do Ecoturismo",
        snippet: "Bonito é conhecido mundialmente por suas águas cristalinas, grutas, cachoeiras e flutuação. Principais atrativos: Rio da Prata, Gruta do Lago Azul, Buraco das Araras, Aquário Natural.",
        url: "",
        source: "local_knowledge",
        confidence: 0.9,
        timestamp: new Date()
      });
    }
    
    if (lowerQuestion.includes('pantanal')) {
      results.push({
        title: "Pantanal - Maior Área Úmida do Mundo",
        snippet: "O Pantanal sul-mato-grossense é um santuário ecológico único, habitat de jacarés, capivaras, ariranhas e centenas de espécies de aves. Melhor época: maio a outubro.",
        url: "",
        source: "local_knowledge",
        confidence: 0.9,
        timestamp: new Date()
      });
    }
    
    if (lowerQuestion.includes('campo grande')) {
      results.push({
        title: "Campo Grande - Capital de Mato Grosso do Sul",
        snippet: "Campo Grande, a 'Cidade Morena', oferece o Bioparque Pantanal (maior aquário de água doce do mundo), Parque das Nações Indígenas, Feira Central e rica gastronomia regional.",
        url: "",
        source: "local_knowledge",
        confidence: 0.9,
        timestamp: new Date()
      });
    }
    
    // Hotéis próximos ao aeroporto de Campo Grande
    if ((lowerQuestion.includes('hotel') || lowerQuestion.includes('hospedagem')) && 
        (lowerQuestion.includes('aeroporto') || lowerQuestion.includes('campo grande'))) {
      results.push({
        title: "Hotéis Próximos ao Aeroporto de Campo Grande",
        snippet: "Hotéis próximos ao Aeroporto Internacional de Campo Grande (CGR): Hotel MS Executive (5km, transfer gratuito), Hotel Nacional (7km, centro), Grand Park Hotel (8km, luxo), Hotel Bristol Brasil (6km, executivo). Região do Aero Rancho e Vila Sobrinho concentram opções econômicas a 3-5km do aeroporto. Táxi/Uber: R$ 25-40. Maioria oferece transfer gratuito.",
        url: "",
        source: "local_knowledge",
        confidence: 0.9,
        timestamp: new Date()
      });
    } else if (lowerQuestion.includes('hotel') || lowerQuestion.includes('hospedagem')) {
      results.push({
        title: "Hospedagem em Mato Grosso do Sul",
        snippet: "MS oferece diversas opções de hospedagem: hotéis urbanos em Campo Grande, pousadas ecológicas em Bonito, fazendas no Pantanal e hospedagem rural em outras cidades.",
        url: "",
        source: "local_knowledge",
        confidence: 0.8,
        timestamp: new Date()
      });
    }
    
    if (lowerQuestion.includes('comida') || lowerQuestion.includes('gastronomia') || lowerQuestion.includes('restaurante')) {
      results.push({
        title: "Gastronomia de Mato Grosso do Sul",
        snippet: "A culinária sul-mato-grossense é rica e diversificada: sobá, chipa, espetinho, churrasco pantaneiro, sopa paraguaia, tereré e pratos com influências indígenas e paraguaias.",
        url: "",
        source: "local_knowledge",
        confidence: 0.8,
        timestamp: new Date()
      });
    }
    
    // Se não encontrou resultados específicos, retornar informação geral
    if (results.length === 0) {
      results.push({
        title: "Mato Grosso do Sul - Portal Oficial de Turismo",
        snippet: "Descubra as maravilhas de MS: Pantanal, Bonito, Campo Grande e muito mais. Turismo, cultura e aventura.",
        url: "",
        source: "local_knowledge",
        confidence: 0.7,
        timestamp: new Date()
      });
    }
    
    return results;
  }
}

// Exportar instância única
export const guataRealWebSearchService = new GuataRealWebSearchService();
