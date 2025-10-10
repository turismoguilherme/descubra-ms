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
  private googleApiKey: string;
  private googleEngineId: string;
  private serpApiKey: string;
  private isConfigured: boolean = false;

  constructor() {
    this.googleApiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || '';
    this.googleEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID || '';
    this.serpApiKey = import.meta.env.VITE_SERPAPI_KEY || '';
    
    this.isConfigured = !!(this.googleApiKey && this.googleEngineId);
    console.log('🔍 Guatá Real Web Search:', this.isConfigured ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
    console.log('🔑 Google API Key:', this.googleApiKey ? 'PRESENTE' : 'AUSENTE');
    console.log('🔑 Google Engine ID:', this.googleEngineId ? 'PRESENTE' : 'AUSENTE');
  }

  /**
   * Pesquisa web REAL usando Google Custom Search API
   */
  private async searchWithGoogle(query: string, maxResults: number = 5): Promise<WebSearchResult[]> {
    if (!this.isConfigured) {
      console.log('⚠️ Google Custom Search não configurado');
      return [];
    }

    try {
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${this.googleApiKey}&cx=${this.googleEngineId}&q=${encodeURIComponent(query)}&num=${maxResults}`;
      
      console.log('🔍 Fazendo pesquisa REAL no Google...');
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`Google Search API error: ${response.status}`);
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
  private async searchTourismData(query: RealWebSearchQuery): Promise<TourismData> {
    const tourismData: TourismData = {};

    try {
      // Buscar hotéis se a pergunta for sobre hospedagem
      if (query.category === 'hotels' || query.question.toLowerCase().includes('hotel') || query.question.toLowerCase().includes('hospedagem')) {
        tourismData.hotels = await this.searchHotels(query.location || 'Mato Grosso do Sul');
      }

      // Buscar eventos se a pergunta for sobre eventos
      if (query.category === 'events' || query.question.toLowerCase().includes('evento') || query.question.toLowerCase().includes('festa')) {
        tourismData.events = await this.searchEvents(query.location || 'Mato Grosso do Sul');
      }

      // Buscar restaurantes se a pergunta for sobre comida
      if (query.category === 'restaurants' || query.question.toLowerCase().includes('restaurante') || query.question.toLowerCase().includes('comida')) {
        tourismData.restaurants = await this.searchRestaurants(query.location || 'Mato Grosso do Sul');
      }

      // Buscar clima se a pergunta for sobre tempo
      if (query.question.toLowerCase().includes('clima') || query.question.toLowerCase().includes('tempo')) {
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
    console.log('🔍 Guatá Real Web Search: Iniciando pesquisa...');
    console.log('📝 Query:', query.question);
    console.log('📍 Localização:', query.location || 'Mato Grosso do Sul');
    console.log('🏷️ Categoria:', query.category || 'geral');

    let results: WebSearchResult[] = [];
    let searchMethod: 'google' | 'serpapi' | 'tourism_apis' | 'hybrid' = 'tourism_apis';
    let usedRealSearch = false;

    try {
      // 1. Tentar Google Custom Search primeiro
      if (this.isConfigured) {
        console.log('🔍 Tentando Google Custom Search...');
        const googleResults = await this.searchWithGoogle(query.question, query.maxResults || 5);
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
        const serpResults = await this.searchWithSerpAPI(query.question, query.maxResults || 5);
        if (serpResults.length > 0) {
          results = serpResults;
          searchMethod = 'serpapi';
          usedRealSearch = true;
          console.log('✅ SerpAPI bem-sucedido!');
        }
      }

      // 3. Buscar dados específicos de turismo
      console.log('🏨 Buscando dados específicos de turismo...');
      const tourismData = await this.searchTourismData(query);

      // 4. Se nenhuma pesquisa web funcionou, usar dados locais
      if (results.length === 0) {
        console.log('⚠️ Nenhuma pesquisa web funcionou, usando dados locais...');
        results = this.generateLocalSearchResults(query.question);
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
        results: this.generateLocalSearchResults(query.question),
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
        url: "https://descubrams.com.br/bonito",
        source: "local_knowledge",
        confidence: 0.9,
        timestamp: new Date()
      });
    }
    
    if (lowerQuestion.includes('pantanal')) {
      results.push({
        title: "Pantanal - Maior Área Úmida do Mundo",
        snippet: "O Pantanal sul-mato-grossense é um santuário ecológico único, habitat de jacarés, capivaras, ariranhas e centenas de espécies de aves. Melhor época: maio a outubro.",
        url: "https://descubrams.com.br/pantanal",
        source: "local_knowledge",
        confidence: 0.9,
        timestamp: new Date()
      });
    }
    
    if (lowerQuestion.includes('campo grande')) {
      results.push({
        title: "Campo Grande - Capital de Mato Grosso do Sul",
        snippet: "Campo Grande, a 'Cidade Morena', oferece o Bioparque Pantanal (maior aquário de água doce do mundo), Parque das Nações Indígenas, Feira Central e rica gastronomia regional.",
        url: "https://descubrams.com.br/campo-grande",
        source: "local_knowledge",
        confidence: 0.9,
        timestamp: new Date()
      });
    }
    
    if (lowerQuestion.includes('hotel') || lowerQuestion.includes('hospedagem')) {
      results.push({
        title: "Hospedagem em Mato Grosso do Sul",
        snippet: "MS oferece diversas opções de hospedagem: hotéis urbanos em Campo Grande, pousadas ecológicas em Bonito, fazendas no Pantanal e hospedagem rural em outras cidades.",
        url: "https://descubrams.com.br/hospedagem",
        source: "local_knowledge",
        confidence: 0.8,
        timestamp: new Date()
      });
    }
    
    if (lowerQuestion.includes('comida') || lowerQuestion.includes('gastronomia') || lowerQuestion.includes('restaurante')) {
      results.push({
        title: "Gastronomia de Mato Grosso do Sul",
        snippet: "A culinária sul-mato-grossense é rica e diversificada: sobá, chipa, espetinho, churrasco pantaneiro, sopa paraguaia, tereré e pratos com influências indígenas e paraguaias.",
        url: "https://descubrams.com.br/gastronomia",
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
        url: "https://descubrams.com.br",
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
