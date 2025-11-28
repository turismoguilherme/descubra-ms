/**
 * 🔍 GUATÁ REAL WEB SEARCH SERVICE
 * Sistema de pesquisa web REAL para o Guatá
 * Integra Google Custom Search API + SerpAPI + APIs de turismo
 */

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
  // API KEY ESPECÍFICA DO GUATÁ - Google Search API
  // Prioridade: 1) Variável de ambiente, 2) Chave hardcoded
  private readonly GUATA_GOOGLE_SEARCH_API_KEY = 
    (import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || 'AIzaSyAjh12gRofCgSf6-y1-ckvrDyT7ICuW7XY').trim();
  // ENGINE ID ESPECÍFICO DO GUATÁ - Configurado pelo usuário
  // Prioridade: 1) Variável de ambiente, 2) Engine ID hardcoded
  private readonly GUATA_ENGINE_ID = 
    (import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID || 'a3641e1665f7b4909').trim();
  
  private googleApiKey: string;
  private googleEngineId: string;
  private serpApiKey: string;
  private isConfigured: boolean = false;
  
  // Rate limiting para Google Search (100 requisições/dia no plano gratuito)
  private readonly MAX_SEARCHES_PER_DAY = 100;
  private searchCount: number = 0;
  private searchResetTime: number = Date.now() + (24 * 60 * 60 * 1000); // 24 horas
  private searchCache: Map<string, { results: WebSearchResult[]; timestamp: number }> = new Map();
  private readonly SEARCH_CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

  constructor() {
    // Usar API Key específica do Guatá, com fallback para variável de ambiente
    this.googleApiKey = this.GUATA_GOOGLE_SEARCH_API_KEY || (import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || '').trim();
    this.googleEngineId = this.GUATA_ENGINE_ID; // Usar Engine ID específico do Guatá
    this.serpApiKey = (import.meta.env.VITE_SERPAPI_KEY || '').trim();
    
    this.isConfigured = !!(this.googleApiKey && this.googleEngineId);
    console.log('🔍 Guatá Real Web Search:', this.isConfigured ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
    console.log('🔑 Google API Key (Guatá):', this.googleApiKey ? 'PRESENTE' : 'AUSENTE');
    console.log('🔑 Google Engine ID (Guatá):', this.googleEngineId);
  }

  /**
   * Pesquisa web REAL usando Google Custom Search API
   * Com rate limiting e cache para evitar ultrapassar limites
   */
  private async searchWithGoogle(query: string, maxResults: number = 5): Promise<WebSearchResult[]> {
    if (!this.isConfigured) {
      console.log('⚠️ Google Custom Search não configurado');
      return [];
    }

    // Verificar cache primeiro
    const cacheKey = query.toLowerCase().trim();
    const cached = this.searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.SEARCH_CACHE_DURATION) {
      console.log('🔄 Usando resultados de busca em cache');
      return cached.results;
    }

    // Verificar rate limiting diário
    const now = Date.now();
    if (now > this.searchResetTime) {
      this.searchCount = 0;
      this.searchResetTime = now + (24 * 60 * 60 * 1000);
    }

    if (this.searchCount >= this.MAX_SEARCHES_PER_DAY) {
      console.warn('⚠️ Limite diário de buscas atingido. Usando cache ou resultados alternativos.');
      // Tentar retornar cache mesmo que expirado
      if (cached) {
        return cached.results;
      }
      return [];
    }

    try {
      const apiKey = this.googleApiKey.trim();
      const engineId = this.googleEngineId.trim();
      
      if (!apiKey || !engineId) {
        console.log('⚠️ Google Custom Search não configurado corretamente');
        return [];
      }
      
      // Adicionar contexto de MS para buscas mais relevantes
      const searchQuery = `${query} Mato Grosso do Sul`;
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(engineId)}&q=${encodeURIComponent(searchQuery)}&num=${maxResults}`;
      
      console.log('🔍 Fazendo pesquisa REAL no Google...');
      this.searchCount++;
      console.log(`📊 Buscas hoje: ${this.searchCount}/${this.MAX_SEARCHES_PER_DAY}`);
      
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        
        // Tratamento específico para erro 403 (API não habilitada)
        if (response.status === 403) {
          console.log('ℹ️ Google Search API não habilitada (403) - continuando com fallback');
          // Retornar array vazio sem quebrar o fluxo
          return [];
        }
        
        // Se for rate limit, usar cache se disponível
        if (response.status === 429 && cached) {
          console.log('⏸️ Rate limit atingido, usando cache');
          return cached.results;
        }
        
        // Tratamento específico para erro 400 (API key inválida)
        if (response.status === 400) {
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.reason === 'API_KEY_INVALID' || errorData.error?.message?.includes('API key not valid')) {
              console.error('❌ Google Search API: Chave de API inválida ou sem permissões');
              console.error('💡 PASSO A PASSO PARA CORRIGIR:');
              console.error('   1. Acesse: https://console.cloud.google.com/apis/credentials');
              console.error('   2. Encontre a chave:', this.googleApiKey.substring(0, 20) + '...');
              console.error('   3. Clique em "Editar" (ícone de lápis)');
              console.error('   4. Em "Restrições de API":');
              console.error('      - Se estiver vazio: Adicione "Custom Search API"');
              console.error('      - Se tiver restrições: Certifique-se que "Custom Search API" está na lista');
              console.error('   5. Em "Restrições de aplicativo": Deixe vazio ou configure corretamente');
              console.error('   6. Clique em "Salvar"');
              console.error('   7. Aguarde 1-2 minutos e teste novamente');
              console.error('');
              console.error('🔗 Links úteis:');
              console.error('   - Credenciais: https://console.cloud.google.com/apis/credentials');
              console.error('   - APIs habilitadas: https://console.cloud.google.com/apis/library/customsearch.googleapis.com');
            }
          } catch (e) {
            console.error('❌ Google Search API error: 400 - Chave de API inválida');
            console.error('💡 Acesse: https://console.cloud.google.com/apis/credentials para verificar a chave');
          }
          return [];
        }
        
        // Para outros erros, logar mas não quebrar
        console.warn(`⚠️ Google Search API error: ${response.status}`, errorText);
        return [];
      }

      const data = await response.json();
      const results: WebSearchResult[] = [];

      if (data.items) {
        data.items.forEach((item: any, index: number) => {
          results.push({
            title: item.title || '',
            snippet: item.snippet || '',
            url: item.link || '',
            source: 'google_search',
            confidence: 0.9 - (index * 0.1),
            timestamp: new Date()
          });
        });
      }

      console.log(`✅ Google Search: ${results.length} resultados encontrados`);
      
      // Salvar no cache
      if (results.length > 0) {
        this.searchCache.set(cacheKey, {
          results,
          timestamp: Date.now()
        });
      }
      
      return results;

    } catch (error) {
      console.error('❌ Erro na Google Search API:', error);
      return [];
    }
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

      // 4. Se nenhuma pesquisa web funcionou, usar dados locais
      if (results.length === 0) {
        console.log('⚠️ Nenhuma pesquisa web funcionou, usando dados locais...');
        results = this.generateLocalSearchResults(question);
        searchMethod = 'tourism_apis';
        usedRealSearch = false;
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
        results: this.generateLocalSearchResults(question),
        tourismData: {},
        confidence: 0.5,
        sources: ['local_fallback'],
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
    
    if (lowerQuestion.includes('hotel') || lowerQuestion.includes('hospedagem')) {
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
