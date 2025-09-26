import { geminiClient } from '@/config/gemini';
import { realWebSearchService, WebSearchResult } from './realWebSearch';
import { internalSearchService, InternalSearchResult } from './internalSearchService';
import { webScrapingService, ScrapedResult } from './webScrapingService';
import { intelligentSearchEngine, SearchQuery } from './intelligentSearchEngine';
import { dynamicWebSearchService, SearchAnalysis } from './dynamicWebSearchService';

/**
 * Serviço de busca web inteligente
 * Combina busca interna gratuita com APIs externas quando necessário
 */
class WebSearchService {
  private useInternalSearch = true; // Priorizar busca interna gratuita
  private useRealAPIs = false; // Usar APIs externas apenas se necessário

  /**
   * Buscar informações na web
   */
  async search(query: string, category?: string): Promise<WebSearchResult[]> {
    console.log('🔍 Web Search: Iniciando busca:', query);

    try {
      // 1. Usar busca dinâmica inteligente (como o Gemini)
      const dynamicAnalysis = await dynamicWebSearchService.search(query);
      
      if (dynamicAnalysis.confidence > 70) {
        console.log(`✅ Web Search: Análise dinâmica encontrada (${dynamicAnalysis.confidence}% confiança)`);
        return this.convertDynamicResults(dynamicAnalysis);
      }

      // 2. Usar sistema de busca inteligente (reutilizável)
      const intelligentResults = await intelligentSearchEngine.search({
        query,
        category: category as any,
        limit: 10,
        region: 'MS' // Para Descubra MS
      });
      
      if (intelligentResults.length > 0) {
        console.log(`✅ Web Search: Encontrados ${intelligentResults.length} resultados inteligentes`);
        return this.convertIntelligentResults(intelligentResults);
      }

      // 3. Fallback para busca interna
      if (this.useInternalSearch) {
        const internalResults = await internalSearchService.search({
          query,
          category: category as any,
          limit: 10
        });
        
        if (internalResults.length > 0) {
          console.log(`✅ Web Search: Encontrados ${internalResults.length} resultados internos`);
          return this.convertInternalResults(internalResults);
        }
      }

      // 4. Fallback para busca externa (se configurada)
      if (this.useRealAPIs) {
        const externalResults = await this.performExternalSearch(query, category);
        if (externalResults.length > 0) {
          console.log(`✅ Web Search: Encontrados ${externalResults.length} resultados externos`);
          return externalResults;
        }
      }

      // 5. Fallback para busca simulada
      console.log('⚠️ Web Search: Usando busca simulada como fallback');
      return this.generateMockResults(query, category);

    } catch (error) {
      console.log('❌ Web Search: Erro na busca, usando fallback:', error);
      return this.generateMockResults(query, category);
    }
  }

  /**
   * Converter resultados dinâmicos para formato padrão
   */
  private convertDynamicResults(dynamicAnalysis: SearchAnalysis): WebSearchResult[] {
    // Criar um resultado principal com a melhor resposta
    const mainResult: WebSearchResult = {
      title: `Resposta para: ${dynamicAnalysis.query}`,
      url: dynamicAnalysis.sources[0] || 'https://fundtur.ms.gov.br',
      content: dynamicAnalysis.bestAnswer, // Added required content field
      source: dynamicAnalysis.sources.join(', '),
      lastUpdated: new Date().toISOString(),
      confidence: dynamicAnalysis.confidence / 100, // Added required confidence field
      category: this.detectCategory(dynamicAnalysis.query, dynamicAnalysis.bestAnswer)
    };

    // Adicionar resultados individuais das fontes
    const sourceResults = dynamicAnalysis.results.map(result => ({
      title: result.title,
      url: result.url,
      content: result.content,
      source: result.source,
      category: this.mapCategory(result.categories[0] || 'general'),
      lastUpdated: result.lastVerified,
      confidence: 0.8
    }));

    return [mainResult, ...sourceResults];
  }

  /**
   * Converter resultados inteligentes para formato padrão
   */
  private convertIntelligentResults(intelligentResults: any[]): WebSearchResult[] {
    return intelligentResults.map(result => ({
      title: result.title,
      url: result.url,
      content: result.snippet || result.content,
      source: result.source,
      category: this.mapCategory(result.category),
      lastUpdated: result.lastUpdated,
      confidence: result.confidence || 0.8
    }));
  }

  /**
   * Converter resultados internos para formato padrão
   */
  private convertInternalResults(internalResults: InternalSearchResult[]): WebSearchResult[] {
    return internalResults.map(result => ({
      title: result.title,
      url: result.url,
      content: result.snippet || 'Sem conteúdo disponível',
      source: result.source,
      category: this.mapCategory(result.category),
      lastUpdated: result.lastUpdated,
      confidence: 0.8
    }));
  }

  /**
   * Mapear categorias internas para padrão
   */
  private mapCategory(internalCategory: string): string {
    const categoryMap: Record<string, string> = {
      'hotel': 'hotel',
      'restaurant': 'restaurant',
      'attraction': 'attraction',
      'agency': 'agency',
      'general': 'general'
    };
    
    return categoryMap[internalCategory] || 'general';
  }

  /**
   * Converter resultados de scraping para formato padrão
   */
  private convertScrapedResults(scrapedResults: ScrapedResult[]): WebSearchResult[] {
    return scrapedResults.map(result => ({
      title: result.title,
      url: result.url,
      content: result.content,
      source: result.source,
      category: this.detectCategory(result.title, result.content),
      lastUpdated: result.lastScraped.toISOString(),
      confidence: 0.8
    }));
  }

  /**
   * Realizar busca externa (quando necessário)
   */
  private async performExternalSearch(query: string, category?: string): Promise<WebSearchResult[]> {
    const results: WebSearchResult[] = [];

    try {
      // 2. Buscar em sites oficiais via web scraping (gratuito)
      const scrapedResults = await webScrapingService.scrapeOfficialSites(query);
      if (scrapedResults.length > 0) {
        console.log(`✅ Web Search: Encontrados ${scrapedResults.length} resultados via scraping`);
        results.push(...this.convertScrapedResults(scrapedResults));
      }

      return results;
    } catch (error) {
      console.log('⚠️ Web Search: Erro na busca externa:', error);
      return results;
    }
  }

  /**
   * Detectar categoria baseada no conteúdo
   */
  private detectCategory(title: string, snippet: string): string {
    const content = `${title} ${snippet}`.toLowerCase();
    
    if (content.includes('hotel') || content.includes('hospedagem') || content.includes('pousada')) {
      return 'hotel';
    }
    
    if (content.includes('restaurante') || content.includes('comida') || content.includes('gastronomia')) {
      return 'restaurant';
    }
    
    if (content.includes('turismo') || content.includes('passeio') || content.includes('atração')) {
      return 'attraction';
    }
    
    return 'general';
  }

  /**
   * Gerar resultados simulados (fallback)
   */
  private generateMockResults(query: string, category?: string): WebSearchResult[] {
    const lowerQuery = query.toLowerCase();
    
    // Informações gerais sobre MS (sempre confiáveis)
    if (lowerQuery.includes('mato grosso do sul') || lowerQuery.includes('ms')) {
      return [
        {
          title: 'Mato Grosso do Sul - Portal Oficial',
          url: 'https://www.ms.gov.br',
          snippet: 'Informações oficiais sobre o estado de Mato Grosso do Sul, incluindo turismo, economia e serviços.',
          source: 'ms.gov.br',
          reliability: 'high',
          category: 'general',
          lastUpdated: new Date().toISOString()
        }
      ];
    }

    // Bioparque Pantanal (informação real)
    if (lowerQuery.includes('bioparque') || lowerQuery.includes('pantanal')) {
      return [
        {
          title: 'Bioparque Pantanal - Maior Aquário de Água Doce do Mundo',
          url: 'https://bioparque.com',
          snippet: 'O Bioparque Pantanal é o maior aquário de água doce do mundo, localizado em Campo Grande, MS.',
          source: 'bioparque.com',
          reliability: 'high',
          category: 'attraction',
          lastUpdated: new Date().toISOString()
        }
      ];
    }

    // Bonito (informação real)
    if (lowerQuery.includes('bonito')) {
      return [
        {
          title: 'Bonito - Capital do Ecoturismo',
          url: 'https://bonito.ms.gov.br',
          snippet: 'Bonito é conhecida como a capital do ecoturismo, com grutas, cachoeiras e rios de águas cristalinas.',
          source: 'bonito.ms.gov.br',
          reliability: 'high',
          category: 'attraction',
          lastUpdated: new Date().toISOString()
        }
      ];
    }

    // Para outras consultas, direcionar para fontes oficiais
    return [
      {
        title: 'Fundtur-MS - Fundação de Turismo de MS',
        url: 'https://fundtur.ms.gov.br',
        snippet: 'Para informações específicas sobre turismo em Mato Grosso do Sul, consulte o site oficial da Fundtur-MS.',
        source: 'fundtur.ms.gov.br',
        reliability: 'high',
        category: 'general',
        lastUpdated: new Date().toISOString()
      }
    ];
  }

  /**
   * Verificar se uma informação específica existe
   */
  async verifySpecificInfo(info: string, location?: string): Promise<{
    exists: boolean;
    sources: string[];
    confidence: number;
    details?: string;
  }> {
    try {
      // Usar busca interna gratuita
      const verification = await internalSearchService.verifyInformation(info, location);
      
      if (verification.exists) {
        return {
          exists: true,
          sources: verification.sources,
          confidence: verification.confidence,
          details: verification.details
        };
      }

      // Se não encontrou, retornar resultado negativo
      return {
        exists: false,
        sources: [],
        confidence: 0,
        details: 'Informação não encontrada em fontes confiáveis'
      };

    } catch (error) {
      console.log('⚠️ Web Search: Erro na verificação:', error);
      return {
        exists: false,
        sources: [],
        confidence: 0,
        details: 'Erro na verificação'
      };
    }
  }

  /**
   * Buscar hotéis específicos
   */
  async searchHotels(location: string): Promise<WebSearchResult[]> {
    return this.search(`hotéis ${location}`, 'hotel');
  }

  /**
   * Buscar restaurantes específicos
   */
  async searchRestaurants(location: string): Promise<WebSearchResult[]> {
    return this.search(`restaurantes ${location}`, 'restaurant');
  }

  /**
   * Buscar atrações turísticas
   */
  async searchAttractions(location: string): Promise<WebSearchResult[]> {
    return this.search(`atrações turísticas ${location}`, 'attraction');
  }

  /**
   * Adicionar nova informação à base interna
   */
  addToKnowledgeBase(item: InternalSearchResult): void {
    internalSearchService.addToKnowledgeBase(item);
  }

  /**
   * Obter estatísticas da base interna
   */
  getKnowledgeBaseStats() {
    return internalSearchService.getKnowledgeBaseStats();
  }

  /**
   * Limpar cache do sistema
   */
  async clearCache(): Promise<void> {
    try {
      // Limpar cache do sistema dinâmico
      dynamicWebSearchService.clearCache();
      
      // Limpar cache do sistema inteligente
      intelligentSearchEngine.clearCache();
      
      // Limpar cache interno
      internalSearchService.clearCache();
      
      console.log('🧹 Cache limpo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  }
}

export const webSearchService = new WebSearchService();
