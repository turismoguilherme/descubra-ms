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
  // Prioridade: Variável de ambiente (.env)
  private readonly GUATA_GOOGLE_SEARCH_API_KEY = 
    (import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || '').trim();
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
    
    // Log apenas em desenvolvimento e sem expor informações sensíveis
    const isDev = import.meta.env.DEV;
    if (isDev) {
      console.log('[Guatá Web Search] Configurado:', this.isConfigured);
      if (this.isConfigured) {
        console.log('[Guatá Web Search] Engine ID:', this.googleEngineId);
      }
    }
    
    // Verificação silenciosa (sem logs que expõem informações)
    if (!this.isConfigured && isDev) {
      console.warn('[Guatá Web Search] Não configurado - Verifique VITE_GOOGLE_SEARCH_API_KEY e VITE_GOOGLE_SEARCH_ENGINE_ID');
    }
  }

  /**
   * Pesquisa web REAL usando Google Custom Search API
   * Com rate limiting e cache para evitar ultrapassar limites
   */
  private async searchWithGoogle(query: string, maxResults: number = 5): Promise<WebSearchResult[]> {
    // Verificar cache primeiro
    const cacheKey = query.toLowerCase().trim();
    const cached = this.searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.SEARCH_CACHE_DURATION) {
      console.log('🔄 Usando resultados de busca em cache');
      return cached.results;
    }

    const isDev = import.meta.env.DEV;

    // NOVO: Tentar usar Edge Function primeiro (chaves protegidas no servidor)
    try {
      if (isDev) {
        console.log('[Web Search] Tentando usar Edge Function (chaves protegidas)...');
      }

      const { supabase } = await import('@/integrations/supabase/client');
      
      try {
        const { data, error } = await supabase.functions.invoke('guata-google-search-proxy', {
          body: {
            query,
            maxResults,
            location: 'Mato Grosso do Sul'
          }
        });

        // Log completo da resposta para debug
        if (isDev) {
          console.log('[Web Search] Resposta completa da Edge Function:', {
            hasError: !!error,
            hasData: !!data,
            error: error,
            data: data
          });
        }

        // Verificar se há erro na resposta (mesmo com status 200)
        if (data?.error || !data?.success) {
          console.error('[Web Search] ❌ Edge Function retornou erro:', {
            error: data?.error,
            message: data?.message,
            help: data?.help,
            fullData: data
          });
          // Continuar para fallback
        } else if (!error && data?.results && Array.isArray(data.results) && data.results.length > 0) {
          // Salvar no cache
          this.searchCache.set(cacheKey, {
            results: data.results,
            timestamp: Date.now()
          });

          if (isDev) {
            console.log('[Web Search] ✅ Edge Function funcionou! (chaves protegidas)');
          }
          return data.results;
        }

        // Se Edge Function falhou, logar detalhes mas continuar para fallback
        if (error) {
          console.error('[Web Search] ❌ Edge Function falhou:', {
            message: error.message,
            status: error.status,
            context: error.context,
            data: data,
            error: error
          });
          
          // Tentar extrair detalhes do erro se disponível
          if (data && typeof data === 'object') {
            console.error('[Web Search] Detalhes do erro da Edge Function:', JSON.stringify(data, null, 2));
          }
        } else if (data) {
          // Edge Function retornou dados mas sem resultados válidos
          console.warn('[Web Search] Edge Function retornou dados inválidos:', {
            hasResults: !!data.results,
            resultsType: Array.isArray(data.results) ? 'array' : typeof data.results,
            resultsLength: Array.isArray(data.results) ? data.results.length : 'N/A',
            success: data.success,
            error: data.error,
            message: data.message,
            fullData: data
          });
          
          if (data.error) {
            console.error('[Web Search] Erro na resposta:', data.error, data.message);
          }
        } else {
          console.warn('[Web Search] Edge Function retornou resposta vazia (sem data e sem error)');
        }
      } catch (invokeError: unknown) {
        if (isDev) {
          const errorObj = invokeError && typeof invokeError === 'object'
            ? (invokeError as { message?: string; stack?: string })
            : null;
          console.error('[Web Search] ❌ Erro ao invocar Edge Function:', {
            message: errorObj?.message || String(invokeError),
            stack: errorObj?.stack,
            error: invokeError
          });
        }
      }
    } catch (edgeFunctionError: unknown) {
      // Edge Function não disponível ou falhou - usar método antigo
      if (isDev) {
        const errorMessage = edgeFunctionError && typeof edgeFunctionError === 'object' && 'message' in edgeFunctionError
          ? (edgeFunctionError as { message: string }).message
          : String(edgeFunctionError);
        console.warn('[Web Search] Edge Function não disponível, usando método direto:', errorMessage);
      }
    }

    // FALLBACK: Método antigo (direto do frontend) - manter para compatibilidade
    if (!this.isConfigured) {
      console.log('⚠️ Google Custom Search não configurado');
      return [];
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
      
      // Nunca logar informações sobre a chave, mesmo parcialmente
      const isDev = import.meta.env.DEV;
      if (isDev) {
        console.log('[Web Search] Buscando:', searchQuery.substring(0, 50) + '...');
      }
      console.log('🔍 [DEBUG] Engine ID presente:', !!engineId, 'Valor:', engineId);
      
      const response = await fetch(searchUrl);
      
      console.log('🔍 [DEBUG] Status da resposta:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DEBUG] Erro completo da API:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500) // Limitar tamanho do log
        });
        
        // Tentar parsear erro JSON para mais detalhes
        let errorJson: any = null;
        try {
          errorJson = JSON.parse(errorText);
          console.error('❌ [DEBUG] Erro JSON detalhado:', {
            error: errorJson.error,
            message: errorJson.error?.message,
            reason: errorJson.error?.reason,
            domain: errorJson.error?.domain
          });
        } catch (e) {
          console.error('❌ [DEBUG] Erro não é JSON válido');
        }
        
        // Tratamento específico para erro 400 (chave expirada)
        if (response.status === 400) {
          const errorMessage = errorJson?.error?.message || errorText;
          if (errorMessage?.includes('expired') || errorMessage?.includes('expirada')) {
            console.error('❌ [ERRO CRÍTICO] Google Search API Key EXPIRADA!');
            console.error('💡 [SOLUÇÃO]:');
            console.error('   1. Acesse: https://console.cloud.google.com/apis/credentials');
            console.error('   2. Revogue a chave atual e crie uma nova');
            console.error('   3. Crie uma NOVA chave de API');
            console.error('   4. Atualize VITE_GOOGLE_SEARCH_API_KEY no Vercel e localmente');
            console.error('   5. Revogue a chave antiga expirada');
            console.log('ℹ️ Google Search API key expirada (400) - continuando com fallback');
            return [];
          }
        }
        
        // Tratamento específico para erro 403 (API não habilitada)
        if (response.status === 403) {
          console.error('❌ [ERRO CRÍTICO] Google Search API retornou 403 Forbidden!');
          console.error('💡 [DIAGNÓSTICO] Possíveis causas:');
          console.error('   1. API Key inválida ou expirada');
          console.error('   2. Custom Search API não está habilitada no projeto da chave');
          console.error('   3. API Key pertence a projeto DIFERENTE de onde a API está ativada');
          console.error('   4. API Key não tem permissões para Custom Search API');
          console.error('   5. Restrições de API bloqueando a requisição');
          console.error('💡 [SOLUÇÃO PASSO A PASSO]:');
          console.error('   PASSO 1: Verifique qual projeto a chave pertence');
          console.error('      - Acesse: https://console.cloud.google.com/apis/credentials');
          console.error('      - Revogue a chave atual e crie uma nova');
          console.error('      - Verifique o projeto ao qual ela pertence');
          console.error('   PASSO 2: Verifique se a API está ativada no projeto da chave');
          console.error('      - O projeto deve ser: gen-lang-client-0847008941 (GuataIA)');
          console.error('      - Acesse: https://console.cloud.google.com/apis/library/customsearch.googleapis.com?project=gen-lang-client-0847008941');
          console.error('      - Deve mostrar "API ativada" (como na sua imagem)');
          console.error('   PASSO 3: Se a chave está em outro projeto:');
          console.error('      - Opção A: Copie a chave do projeto gen-lang-client-0847008941 e atualize o .env');
          console.error('      - Opção B: Ative Custom Search API no projeto da chave atual');
          console.error('   PASSO 4: Aguarde 2-5 minutos após mudanças');
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
              console.error('   2. Revogue a chave atual e crie uma nova');
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
        console.warn('⚠️ [FALLBACK] Nenhuma pesquisa web funcionou!');
        console.warn('⚠️ [FALLBACK] Motivos possíveis:');
        console.warn('   - Google Search API retornou 403 (API não habilitada)');
        console.warn('   - Google Search API retornou erro');
        console.warn('   - Nenhum resultado encontrado');
        console.warn('⚠️ [FALLBACK] Usando dados locais genéricos (menos específicos)...');
        results = this.generateLocalSearchResults(question);
        searchMethod = 'tourism_apis';
        usedRealSearch = false;
        console.warn(`⚠️ [FALLBACK] Gerados ${results.length} resultados locais genéricos`);
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
