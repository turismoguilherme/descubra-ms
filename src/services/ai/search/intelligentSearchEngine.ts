// Sistema de Busca Inteligente Reutilizável
// Pode ser usado em qualquer produto da Flowtrip

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  reliability: 'high' | 'medium' | 'low';
  category: 'hotel' | 'restaurant' | 'attraction' | 'agency' | 'general';
  lastUpdated: string;
  verified: boolean;
  confidence: number; // 0-100
  crossReferences: number; // Quantas fontes confirmaram
}

export interface SearchQuery {
  query: string;
  category?: string;
  location?: string;
  limit?: number;
  region?: string; // Para reutilização em outros produtos
}

export interface SourceConfig {
  name: string;
  url: string;
  reliability: 'high' | 'medium' | 'low';
  region: string; // MS, SP, RJ, etc.
  categories: string[];
  isOfficial: boolean;
}

class IntelligentSearchEngine {
  // Configuração de fontes por região (reutilizável)
  private readonly sourceConfigs: SourceConfig[] = [
    // MS - Descubra MS
    {
      name: 'Fundtur MS',
      url: 'fundtur.ms.gov.br',
      reliability: 'high',
      region: 'MS',
      categories: ['hotel', 'restaurant', 'attraction'],
      isOfficial: true
    },
    {
      name: 'Prefeitura Campo Grande',
      url: 'campogrande.ms.gov.br',
      reliability: 'high',
      region: 'MS',
      categories: ['hotel', 'restaurant', 'attraction'],
      isOfficial: true
    },
    {
      name: 'Prefeitura Bonito',
      url: 'bonito.ms.gov.br',
      reliability: 'high',
      region: 'MS',
      categories: ['hotel', 'restaurant', 'attraction'],
      isOfficial: true
    },
    {
      name: 'Bioparque Pantanal',
      url: 'bioparque.com.br',
      reliability: 'high',
      region: 'MS',
      categories: ['attraction'],
      isOfficial: true
    },
    // Futuro: SP - Descubra SP
    // {
    //   name: 'Sectur SP',
    //   url: 'turismo.sp.gov.br',
    //   reliability: 'high',
    //   region: 'SP',
    //   categories: ['hotel', 'restaurant', 'attraction'],
    //   isOfficial: true
    // }
  ];

  // Cache inteligente por região
  private readonly cache: Map<string, SearchResult[]> = new Map();
  private readonly confidenceHistory: Map<string, number> = new Map();

  /**
   * Busca inteligente multi-fonte
   */
  async search(query: SearchQuery): Promise<SearchResult[]> {
    console.log('🔍 Intelligent Search: Iniciando busca:', query);

    const results: SearchResult[] = [];
    const region = query.region || 'MS';

    try {
      // 1. Buscar no cache primeiro
      const cachedResults = this.getFromCache(query, region);
      if (cachedResults.length > 0) {
        console.log('✅ Intelligent Search: Resultados do cache encontrados');
        results.push(...cachedResults);
      }

      // 2. Buscar em múltiplas fontes simultaneamente
      const sourceResults = await this.searchMultipleSources(query, region);
      results.push(...sourceResults);

      // 3. Verificação cruzada e análise de confiabilidade
      const verifiedResults = await this.crossVerifyResults(results, query);
      
      // 4. Aplicar aprendizado de máquina (simples)
      const rankedResults = this.applyMachineLearning(verifiedResults, query);

      // 5. Atualizar cache
      this.updateCache(query, rankedResults, region);

      console.log(`✅ Intelligent Search: ${rankedResults.length} resultados verificados`);
      return rankedResults.slice(0, query.limit || 10);

    } catch (error) {
      console.error('❌ Intelligent Search: Erro na busca:', error);
      return this.getFallbackResults(query, region);
    }
  }

  /**
   * Busca em múltiplas fontes simultaneamente
   */
  private async searchMultipleSources(query: SearchQuery, region: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const sources = this.sourceConfigs.filter(s => s.region === region);

    // Buscar em paralelo
    const searchPromises = sources.map(source => 
      this.searchSingleSource(source, query)
    );

    const sourceResults = await Promise.allSettled(searchPromises);
    
    sourceResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(...result.value);
      }
    });

    return results;
  }

  /**
   * Busca em uma fonte específica
   */
  private async searchSingleSource(source: SourceConfig, query: SearchQuery): Promise<SearchResult[]> {
    try {
      // Simular busca (em produção seria real)
      const results = await this.simulateSourceSearch(source, query);
      return results.map(result => ({
        ...result,
        source: source.name,
        reliability: source.reliability,
        verified: source.isOfficial
      }));
    } catch (error) {
      console.log(`⚠️ Intelligent Search: Erro ao buscar em ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Simular busca em fonte (substituir por busca real)
   */
  private async simulateSourceSearch(source: SourceConfig, query: SearchQuery): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    // Simular resultados baseados na fonte e query
    if (source.name.includes('Fundtur') && query.query.toLowerCase().includes('hotel')) {
      results.push({
        title: 'Hospedagem em MS - Fundtur',
        url: `https://${source.url}/hospedagem`,
        snippet: 'Informações oficiais sobre hospedagem em Mato Grosso do Sul',
        source: source.name,
        reliability: source.reliability,
        category: 'hotel',
        lastUpdated: new Date().toISOString(),
        verified: source.isOfficial,
        confidence: 90,
        crossReferences: 1
      });
    }

    if (source.name.includes('Bonito') && query.query.toLowerCase().includes('atração')) {
      results.push({
        title: 'Atrações de Bonito',
        url: `https://${source.url}/turismo`,
        snippet: 'Principais atrações turísticas de Bonito, MS',
        source: source.name,
        reliability: source.reliability,
        category: 'attraction',
        lastUpdated: new Date().toISOString(),
        verified: source.isOfficial,
        confidence: 95,
        crossReferences: 1
      });
    }

    return results;
  }

  /**
   * Verificação cruzada de resultados
   */
  private async crossVerifyResults(results: SearchResult[], query: SearchQuery): Promise<SearchResult[]> {
    const verifiedResults: SearchResult[] = [];

    for (const result of results) {
      // Verificar se a informação aparece em múltiplas fontes
      const crossReferences = results.filter(r => 
        r.title.toLowerCase().includes(result.title.toLowerCase().split(' ')[0]) ||
        r.snippet.toLowerCase().includes(result.title.toLowerCase().split(' ')[0])
      ).length;

      // Calcular confiança baseada em múltiplos fatores
      const confidence = this.calculateConfidence(result, crossReferences);

      verifiedResults.push({
        ...result,
        crossReferences,
        confidence
      });
    }

    return verifiedResults;
  }

  /**
   * Calcular score de confiança
   */
  private calculateConfidence(result: SearchResult, crossReferences: number): number {
    let confidence = 50; // Base

    // Fonte oficial
    if (result.verified) confidence += 20;
    
    // Confiabilidade da fonte
    if (result.reliability === 'high') confidence += 15;
    else if (result.reliability === 'medium') confidence += 10;
    
    // Cross-references
    confidence += Math.min(crossReferences * 10, 30);
    
    // Histórico de confiança da fonte
    const sourceHistory = this.confidenceHistory.get(result.source) || 50;
    confidence = (confidence + sourceHistory) / 2;

    return Math.min(confidence, 100);
  }

  /**
   * Aplicar aprendizado de máquina simples
   */
  private applyMachineLearning(results: SearchResult[], query: SearchQuery): SearchResult[] {
    // Ordenar por confiança
    const rankedResults = results.sort((a, b) => b.confidence - a.confidence);

    // Aprender com os resultados
    rankedResults.forEach(result => {
      const currentHistory = this.confidenceHistory.get(result.source) || 50;
      const newHistory = (currentHistory + result.confidence) / 2;
      this.confidenceHistory.set(result.source, newHistory);
    });

    return rankedResults;
  }

  /**
   * Gerenciamento de cache
   */
  private getFromCache(query: SearchQuery, region: string): SearchResult[] {
    const cacheKey = `${region}:${query.query}:${query.category || 'all'}`;
    return this.cache.get(cacheKey) || [];
  }

  private updateCache(query: SearchQuery, results: SearchResult[], region: string): void {
    const cacheKey = `${region}:${query.query}:${query.category || 'all'}`;
    this.cache.set(cacheKey, results);
  }

  /**
   * Resultados de fallback
   */
  private getFallbackResults(query: SearchQuery, region: string): SearchResult[] {
    return [{
      title: 'Informações sobre MS',
      url: 'https://fundtur.ms.gov.br',
      snippet: 'Para informações atualizadas, consulte a Fundtur MS',
      source: 'Fundtur MS',
      reliability: 'high',
      category: 'general',
      lastUpdated: new Date().toISOString(),
      verified: true,
      confidence: 80,
      crossReferences: 1
    }];
  }

  /**
   * Estatísticas do sistema
   */
  getStats(): {
    totalSources: number;
    regions: string[];
    cacheSize: number;
    averageConfidence: number;
  } {
    const regions = [...new Set(this.sourceConfigs.map(s => s.region))];
    const averageConfidence = Array.from(this.confidenceHistory.values()).reduce((a, b) => a + b, 0) / this.confidenceHistory.size || 0;

    return {
      totalSources: this.sourceConfigs.length,
      regions,
      cacheSize: this.cache.size,
      averageConfidence: Math.round(averageConfidence)
    };
  }

  /**
   * Adicionar nova fonte (para outros produtos)
   */
  addSource(config: SourceConfig): void {
    this.sourceConfigs.push(config);
    console.log(`✅ Intelligent Search: Nova fonte adicionada: ${config.name} (${config.region})`);
  }

  /**
   * Limpar cache do sistema
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache do sistema inteligente limpo');
  }
}

// Instância global reutilizável
export const intelligentSearchEngine = new IntelligentSearchEngine(); 