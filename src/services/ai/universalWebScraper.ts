// 🌐 UNIVERSAL WEB SCRAPER - Sistema de Busca REAL na internet
// Busca informações reais em QUALQUER site da internet, sempre atualizadas

import { webSearchService, WebSearchResult } from './search/webSearchService';

export interface ScrapingResult {
  title: string;
  content: string;
  url: string;
  site: string;
  timestamp: string;
  reliability: 'high' | 'medium' | 'low';
  dataType: 'official' | 'commercial' | 'review' | 'news' | 'general';
}

export interface SearchConfig {
  query: string;
  maxResults?: number;
  includeOfficialSites?: boolean;
  includeCommercialSites?: boolean;
  includeReviewSites?: boolean;
  includeNewsSites?: boolean;
}

class UniversalWebScraperService {
  
  /**
   * BUSCA UNIVERSAL - Procura informações REAIS em tempo real na internet
   */
  async searchUniversal(config: SearchConfig): Promise<ScrapingResult[]> {
    console.log(`🌐 Universal Scraper: Buscando "${config.query}" na internet REAL...`);
    
    const searchStartTime = Date.now();

    try {
      // 🎯 BUSCA REAL usando WebSearchService
      console.log('🔍 Fazendo busca REAL na web...');
      const webResults = await webSearchService.search(config.query, 'tourism');
      
      if (webResults.length === 0) {
        console.log('⚠️ Nenhum resultado real encontrado, tentando busca alternativa...');
        // Tentar busca mais ampla
        const alternativeResults = await webSearchService.search(config.query + ' Mato Grosso do Sul', 'general');
        if (alternativeResults.length > 0) {
          console.log(`✅ Encontrados ${alternativeResults.length} resultados alternativos`);
          return this.convertWebResults(alternativeResults, config.maxResults || 8);
        }
      }
      
      const finalResults = this.convertWebResults(webResults, config.maxResults || 8);
      const searchTime = Date.now() - searchStartTime;
      
      console.log(`✅ Universal Scraper: ${finalResults.length} resultados REAIS encontrados em ${searchTime}ms`);
      return finalResults;

    } catch (error) {
      console.error('❌ Erro na busca universal:', error);
      return [];
    }
  }

  /**
   * CONVERTER resultados do WebSearchService para ScrapingResult
   */
  private convertWebResults(webResults: WebSearchResult[], maxResults: number): ScrapingResult[] {
    return webResults.slice(0, maxResults).map(result => ({
      title: result.title || 'Informação encontrada',
      content: result.snippet || result.title || 'Conteúdo disponível',
      url: result.url || 'https://google.com',
      site: this.extractDomain(result.url || result.source || 'google.com'),
      timestamp: result.lastUpdated || new Date().toISOString(),
      reliability: this.mapReliability(result.reliability),
      dataType: this.detectDataType(result.category, result.source)
    }));
  }

  /**
   * EXTRAIR domínio de uma URL
   */
  private extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'google.com';
    }
  }

  /**
   * MAPEAR confiabilidade
   */
  private mapReliability(reliability: string): 'high' | 'medium' | 'low' {
    switch (reliability) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  }

  /**
   * DETECTAR tipo de dados baseado na categoria e fonte
   */
  private detectDataType(category: string, source: string): 'official' | 'commercial' | 'review' | 'news' | 'general' {
    const lowerSource = source?.toLowerCase() || '';
    const lowerCategory = category?.toLowerCase() || '';
    
    // Sites oficiais
    if (lowerSource.includes('.gov.br') || lowerSource.includes('ms.gov.br')) {
      return 'official';
    }
    
    // Sites de notícias
    if (lowerSource.includes('g1.globo.com') || lowerSource.includes('folha.uol.com.br') || 
        lowerSource.includes('estadao.com.br') || lowerSource.includes('correiodoestado.com.br')) {
      return 'news';
    }
    
    // Sites comerciais
    if (lowerSource.includes('booking.com') || lowerSource.includes('hotels.com') || 
        lowerSource.includes('expedia.com.br') || lowerSource.includes('decolar.com')) {
      return 'commercial';
    }
    
    // Sites de reviews
    if (lowerSource.includes('tripadvisor.com.br') || lowerSource.includes('google.com/maps')) {
      return 'review';
    }
    
    // Categorias específicas
    if (lowerCategory.includes('hotel') || lowerCategory.includes('restaurante') || 
        lowerCategory.includes('preço') || lowerCategory.includes('reserva')) {
      return 'commercial';
    }
    
    if (lowerCategory.includes('evento') || lowerCategory.includes('notícia') || 
        lowerCategory.includes('atualidade')) {
      return 'news';
    }
    
    return 'general';
  }

  /**
   * BUSCA EM SITES OFICIAIS (usando busca real)
   */
  private async searchOfficialSites(query: string): Promise<ScrapingResult[]> {
    const officialQuery = `${query} site:gov.br OR site:ms.gov.br`;
    const results = await webSearchService.search(officialQuery, 'official');
    return this.convertWebResults(results, 3);
  }

  /**
   * BUSCA GOOGLE (usando busca real)
   */
  private async searchGoogle(query: string): Promise<ScrapingResult[]> {
    const results = await webSearchService.search(query, 'general');
    return this.convertWebResults(results, 5);
  }

  /**
   * BUSCA EM SITES COMERCIAIS (usando busca real)
   */
  private async searchCommercialSites(query: string): Promise<ScrapingResult[]> {
    const commercialQuery = `${query} site:booking.com OR site:hotels.com OR site:expedia.com.br`;
    const results = await webSearchService.search(commercialQuery, 'commercial');
    return this.convertWebResults(results, 3);
  }

  /**
   * BUSCA EM SITES DE REVIEW (usando busca real)
   */
  private async searchReviewSites(query: string): Promise<ScrapingResult[]> {
    const reviewQuery = `${query} site:tripadvisor.com.br OR site:google.com/maps`;
    const results = await webSearchService.search(reviewQuery, 'review');
    return this.convertWebResults(results, 3);
  }

  /**
   * BUSCA EM SITES DE NOTÍCIAS (usando busca real)
   */
  private async searchNewsSites(query: string): Promise<ScrapingResult[]> {
    const newsQuery = `${query} site:g1.globo.com OR site:correiodoestado.com.br OR site:campograndenews.com.br`;
    const results = await webSearchService.search(newsQuery, 'news');
    return this.convertWebResults(results, 3);
  }

  /**
   * VERIFICAR se é query comercial
   */
  private isCommercialQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    return lowerQuery.includes('preço') || lowerQuery.includes('hotel') || 
           lowerQuery.includes('restaurante') || lowerQuery.includes('reserva') ||
           lowerQuery.includes('custo') || lowerQuery.includes('valor');
  }

  /**
   * VERIFICAR se é query de review
   */
  private isReviewQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    return lowerQuery.includes('avaliação') || lowerQuery.includes('review') || 
           lowerQuery.includes('opinião') || lowerQuery.includes('experiência') ||
           lowerQuery.includes('recomendação');
  }
}

export const universalWebScraperService = new UniversalWebScraperService();

