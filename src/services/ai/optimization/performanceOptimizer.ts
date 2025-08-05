/**
 * Performance Optimizer Service
 * Otimiza performance do Guatá Inteligente com cache inteligente e busca paralela
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number; // Time to live em horas
  source: string;
  confidence: number;
}

export interface PerformanceMetrics {
  responseTime: number;
  cacheHitRate: number;
  successRate: number;
  activeConnections: number;
  memoryUsage: number;
}

export interface OptimizedQuery {
  query: string;
  sources: string[];
  priority: 'high' | 'medium' | 'low';
  cacheStrategy: 'aggressive' | 'balanced' | 'fresh';
}

export class PerformanceOptimizer {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private metrics: PerformanceMetrics = {
    responseTime: 0,
    cacheHitRate: 0,
    successRate: 0,
    activeConnections: 0,
    memoryUsage: 0
  };
  private activeQueries: Set<string> = new Set();

  /**
   * Otimiza uma consulta para melhor performance
   */
  optimizeQuery(query: string): OptimizedQuery {
    const normalizedQuery = this.normalizeQuery(query);
    
    // Determina estratégia baseada no tipo de consulta
    const strategy = this.determineStrategy(normalizedQuery);
    
    // Define fontes baseadas na consulta
    const sources = this.selectSources(normalizedQuery);
    
    // Define prioridade baseada na urgência
    const priority = this.determinePriority(normalizedQuery);

    return {
      query: normalizedQuery,
      sources,
      priority,
      cacheStrategy: strategy
    };
  }

  /**
   * Executa busca paralela otimizada
   */
  async executeParallelSearch(optimizedQuery: OptimizedQuery): Promise<any[]> {
    const startTime = Date.now();
    this.activeQueries.add(optimizedQuery.query);
    this.metrics.activeConnections++;

    try {
      // Verifica cache primeiro
      const cachedResult = this.getFromCache(optimizedQuery.query);
      if (cachedResult && this.isCacheValid(cachedResult)) {
        this.metrics.cacheHitRate = this.updateCacheHitRate(true);
        return [cachedResult.data];
      }

      // Executa busca paralela
      const promises = optimizedQuery.sources.map(source => 
        this.fetchFromSource(source, optimizedQuery.query)
      );

      const results = await Promise.allSettled(promises);
      const successfulResults = results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value);

      // Atualiza cache
      if (successfulResults.length > 0) {
        this.setCache(optimizedQuery.query, successfulResults[0], optimizedQuery.cacheStrategy);
      }

      this.metrics.responseTime = Date.now() - startTime;
      this.metrics.successRate = successfulResults.length / optimizedQuery.sources.length;
      
      return successfulResults;

    } finally {
      this.activeQueries.delete(optimizedQuery.query);
      this.metrics.activeConnections--;
    }
  }

  /**
   * Sistema de cache inteligente
   */
  private getFromCache(key: string): CacheEntry<any> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (!this.isCacheValid(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  private setCache(key: string, data: any, strategy: string): void {
    const ttl = this.getTTL(strategy);
    const confidence = this.calculateConfidence(data);
    
    this.cache.set(key, {
      data,
      timestamp: new Date(),
      ttl,
      source: 'multiple',
      confidence
    });

    // Limpa cache antigo se necessário
    this.cleanupCache();
  }

  private isCacheValid(entry: CacheEntry<any>): boolean {
    const now = new Date();
    const age = (now.getTime() - entry.timestamp.getTime()) / (1000 * 60 * 60); // horas
    return age < entry.ttl;
  }

  private getTTL(strategy: string): number {
    switch (strategy) {
      case 'aggressive': return 24; // 24 horas
      case 'balanced': return 6;    // 6 horas
      case 'fresh': return 1;       // 1 hora
      default: return 6;
    }
  }

  /**
   * Seleção inteligente de fontes
   */
  private selectSources(query: string): string[] {
    const sources = [];
    
    // Sempre inclui base verificada
    sources.push('verified_knowledge');
    
    // Adiciona APIs baseado no tipo de consulta
    if (this.isWeatherQuery(query)) {
      sources.push('weather_api');
    }
    
    if (this.isLocationQuery(query)) {
      sources.push('wikipedia_api', 'ibge_api');
    }
    
    if (this.isTourismQuery(query)) {
      sources.push('scraping_official', 'scraping_tourism');
    }
    
    // Adiciona busca geral
    sources.push('duckduckgo_api');
    
    return sources;
  }

  private isWeatherQuery(query: string): boolean {
    const weatherKeywords = ['clima', 'tempo', 'temperatura', 'chuva', 'sol'];
    return weatherKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  private isLocationQuery(query: string): boolean {
    const locationKeywords = ['onde', 'localização', 'endereço', 'como chegar'];
    return locationKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  private isTourismQuery(query: string): boolean {
    const tourismKeywords = ['hotel', 'restaurante', 'atração', 'passeio', 'turismo'];
    return tourismKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  /**
   * Determina estratégia de cache
   */
  private determineStrategy(query: string): string {
    if (this.isWeatherQuery(query)) return 'fresh';
    if (this.isLocationQuery(query)) return 'balanced';
    return 'aggressive';
  }

  /**
   * Determina prioridade da consulta
   */
  private determinePriority(query: string): 'high' | 'medium' | 'low' {
    const urgentKeywords = ['agora', 'hoje', 'urgente', 'emergência'];
    const hasUrgent = urgentKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
    
    if (hasUrgent) return 'high';
    if (this.isWeatherQuery(query)) return 'high';
    return 'medium';
  }

  /**
   * Normaliza consulta para melhor cache
   */
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  /**
   * Calcula confiança dos dados
   */
  private calculateConfidence(data: any): number {
    // Implementação simplificada
    if (data && typeof data === 'object') {
      return 0.8; // Confiança alta para dados estruturados
    }
    return 0.5; // Confiança média para dados simples
  }

  /**
   * Simula busca de fonte (será integrado com serviços reais)
   */
  private async fetchFromSource(source: string, query: string): Promise<any> {
    // Simulação de busca
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    
    return {
      source,
      query,
      data: `Dados simulados de ${source} para "${query}"`,
      timestamp: new Date()
    };
  }

  /**
   * Limpeza automática de cache
   */
  private cleanupCache(): void {
    const now = new Date();
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isCacheValid(entry)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Atualiza taxa de cache hit
   */
  private updateCacheHitRate(hit: boolean): number {
    // Implementação simplificada
    return hit ? 0.8 : 0.2;
  }

  /**
   * Retorna métricas de performance
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Health check do otimizador
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    cacheSize: number;
    activeQueries: number;
    metrics: PerformanceMetrics;
  }> {
    const cacheSize = this.cache.size;
    const activeQueries = this.activeQueries.size;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (this.metrics.successRate < 0.5) status = 'degraded';
    if (this.metrics.responseTime > 5000) status = 'degraded';
    if (activeQueries > 10) status = 'degraded';

    return {
      status,
      cacheSize,
      activeQueries,
      metrics: this.getMetrics()
    };
  }

  /**
   * Limpa cache manualmente
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Retorna estatísticas do cache
   */
  getCacheStats(): {
    totalEntries: number;
    validEntries: number;
    expiredEntries: number;
    memoryUsage: number;
  } {
    const now = new Date();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      if (this.isCacheValid(entry)) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      memoryUsage: this.cache.size * 1024 // Estimativa simples
    };
  }
}

export const performanceOptimizer = new PerformanceOptimizer(); 