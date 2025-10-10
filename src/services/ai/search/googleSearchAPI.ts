// Google Custom Search API para busca real de informações sobre MS
// Busca específica em sites oficiais e confiáveis

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

export class GoogleSearchAPI {
  private readonly API_KEY = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
  private readonly SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
  
  // Sites oficiais de MS para busca específica
  private readonly OFFICIAL_SITES = [
    'fundtur.ms.gov.br',
    'campogrande.ms.gov.br', 
    'bonito.ms.gov.br',
    'corumba.ms.gov.br',
    'bioparque.com',
    'turismo.ms.gov.br'
  ];

  /**
   * Buscar informações específicas sobre MS
   */
  async searchMSInfo(query: string, category?: string): Promise<GoogleSearchResponse> {
    console.log('🔍 Google Search: Buscando informações sobre MS:', query);

    if (!this.API_KEY || !this.SEARCH_ENGINE_ID) {
      console.log('⚠️ Google Search: API keys não configuradas');
      return {
        success: false,
        results: [],
        totalResults: 0,
        searchTime: 0
      };
    }

    try {
      // Construir query específica para MS
      const msQuery = this.buildMSQuery(query, category);
      
      // Fazer busca no Google
      const response = await this.performGoogleSearch(msQuery);
      
      // Filtrar e classificar resultados
      const filteredResults = this.filterAndClassifyResults(response);
      
      console.log(`✅ Google Search: Encontrados ${filteredResults.length} resultados`);
      
      return {
        success: true,
        results: filteredResults,
        totalResults: filteredResults.length,
        searchTime: Date.now()
      };

    } catch (error) {
      console.log('❌ Google Search: Erro na busca:', error);
      return {
        success: false,
        results: [],
        totalResults: 0,
        searchTime: 0
      };
    }
  }

  /**
   * Construir query específica para MS
   */
  private buildMSQuery(query: string, category?: string): string {
    let msQuery = `${query} "Mato Grosso do Sul"`;
    
    // Adicionar sites oficiais específicos
    const siteRestrictions = this.OFFICIAL_SITES.map(site => `site:${site}`).join(' OR ');
    msQuery += ` (${siteRestrictions})`;
    
    // Adicionar categoria se especificada
    if (category) {
      msQuery += ` ${category}`;
    }
    
    return msQuery;
  }

  /**
   * Executar busca no Google
   */
  private async performGoogleSearch(query: string): Promise<any> {
    const url = 'https://www.googleapis.com/customsearch/v1';
    const params = new URLSearchParams({
      key: this.API_KEY!,
      cx: this.SEARCH_ENGINE_ID!,
      q: query,
      num: '10', // Máximo de resultados
      dateRestrict: 'm6', // Últimos 6 meses
      sort: 'date' // Mais recentes primeiro
    });

    const response = await fetch(`${url}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Google Search API error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Filtrar e classificar resultados
   */
  private filterAndClassifyResults(googleResponse: any): GoogleSearchResult[] {
    if (!googleResponse.items) {
      return [];
    }

    return googleResponse.items.map((item: any) => {
      const source = this.extractSource(item.link);
      const reliability = this.classifyReliability(source, item.link);
      
      return {
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        source,
        reliability
      };
    }).filter(result => result.reliability !== 'low'); // Remover fontes não confiáveis
  }

  /**
   * Extrair fonte do link
   */
  private extractSource(link: string): string {
    try {
      const url = new URL(link);
      return url.hostname;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Classificar confiabilidade da fonte
   */
  private classifyReliability(source: string, link: string): 'high' | 'medium' | 'low' {
    // Fontes oficiais = alta confiabilidade
    if (this.OFFICIAL_SITES.some(site => source.includes(site))) {
      return 'high';
    }
    
    // Sites governamentais = alta confiabilidade
    if (source.includes('.gov.br') || source.includes('.ms.gov.br')) {
      return 'high';
    }
    
    // Sites de turismo conhecidos = média confiabilidade
    if (source.includes('tripadvisor') || source.includes('booking.com')) {
      return 'medium';
    }
    
    // Outros = baixa confiabilidade
    return 'low';
  }

  /**
   * Buscar hotéis específicos
   */
  async searchHotels(location: string): Promise<GoogleSearchResult[]> {
    const query = `hotéis ${location} Mato Grosso do Sul`;
    const response = await this.searchMSInfo(query, 'hospedagem');
    return response.results;
  }

  /**
   * Buscar restaurantes específicos
   */
  async searchRestaurants(location: string): Promise<GoogleSearchResult[]> {
    const query = `restaurantes ${location} Mato Grosso do Sul`;
    const response = await this.searchMSInfo(query, 'gastronomia');
    return response.results;
  }

  /**
   * Buscar atrações turísticas
   */
  async searchAttractions(location: string): Promise<GoogleSearchResult[]> {
    const query = `atrações turísticas ${location} Mato Grosso do Sul`;
    const response = await this.searchMSInfo(query, 'turismo');
    return response.results;
  }

  /**
   * Verificar se uma informação específica existe
   */
  async verifyInformation(info: string, location?: string): Promise<{
    exists: boolean;
    sources: string[];
    confidence: number;
  }> {
    const query = location ? `${info} ${location} MS` : `${info} Mato Grosso do Sul`;
    const response = await this.searchMSInfo(query);
    
    const exists = response.results.length > 0;
    const sources = response.results.map(r => r.source);
    const confidence = response.results.filter(r => r.reliability === 'high').length / response.results.length;
    
    return { exists, sources, confidence };
  }
}

export const googleSearchAPI = new GoogleSearchAPI(); 