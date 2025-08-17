// Serviço de Cache Inteligente para RAG - Guatá
// Cache multi-nível para respostas instantâneas e redução de custos

export interface CachedResponse {
  answer: string;
  sources: any[];
  confidence: number;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  metadata: {
    query_hash: string;
    user_id?: string;
    session_id?: string;
    query_type: string;
    processing_time_ms: number;
  };
}

export interface CacheStats {
  totalEntries: number;
  memoryUsage: number;
  hitRate: number;
  averageResponseTime: number;
  cacheEfficiency: number;
}

export class RAGCacheService {
  private readonly MAX_CACHE_SIZE = 1000; // Máximo de entradas no cache
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hora de TTL
  private readonly ACCESS_BOOST_THRESHOLD = 5; // Boost após 5 acessos
  
  // Cache principal em memória
  private responseCache = new Map<string, CachedResponse>();
  
  // Cache de embeddings para evitar reprocessamento
  private embeddingCache = new Map<string, number[]>();
  
  // Cache de resultados de busca
  private searchCache = new Map<string, any[]>();
  
  // Estatísticas de performance
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    totalResponseTime: 0,
    lastCleanup: Date.now()
  };

  // Gerar chave de cache para uma query
  private generateCacheKey(query: string, user_id?: string, session_id?: string): string {
    const normalizedQuery = query.toLowerCase().trim();
    const queryHash = this.simpleHash(normalizedQuery);
    const userContext = user_id ? `:${user_id}` : '';
    const sessionContext = session_id ? `:${session_id}` : '';
    
    return `${queryHash}${userContext}${sessionContext}`;
  }

  // Hash simples para consistência
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // Buscar resposta em cache
  async getCachedResponse(
    query: string, 
    user_id?: string, 
    session_id?: string
  ): Promise<CachedResponse | null> {
    const cacheKey = this.generateCacheKey(query, user_id, session_id);
    const cached = this.responseCache.get(cacheKey);
    
    if (!cached) {
      this.stats.misses++;
      this.stats.totalRequests++;
      return null;
    }

    // Verificar se expirou
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.responseCache.delete(cacheKey);
      this.stats.misses++;
      this.stats.totalRequests++;
      return null;
    }

    // Atualizar estatísticas de acesso
    cached.accessCount++;
    cached.lastAccessed = Date.now();
    
    // Aplicar boost de confiança para respostas frequentemente acessadas
    if (cached.accessCount >= this.ACCESS_BOOST_THRESHOLD) {
      cached.confidence = Math.min(0.95, cached.confidence + 0.05);
    }
    
    this.stats.hits++;
    this.stats.totalRequests++;
    
    console.log(`🔄 Cache hit para: ${query.substring(0, 50)}...`);
    return cached;
  }

  // Salvar resposta no cache
  async cacheResponse(
    query: string,
    answer: string,
    sources: any[],
    confidence: number,
    user_id?: string,
    session_id?: string,
    processing_time_ms: number = 0
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(query, user_id, session_id);
      
      // Identificar tipo de query para categorização
      const queryType = this.identifyQueryType(query);
      
      const cachedResponse: CachedResponse = {
        answer,
        sources,
        confidence,
        timestamp: Date.now(),
        accessCount: 1,
        lastAccessed: Date.now(),
        metadata: {
          query_hash: cacheKey,
          user_id,
          session_id,
          query_type: queryType,
          processing_time_ms
        }
      };

      // Verificar se cache está cheio
      if (this.responseCache.size >= this.MAX_CACHE_SIZE) {
        await this.evictLeastValuableEntries();
      }

      this.responseCache.set(cacheKey, cachedResponse);
      console.log(`💾 Resposta cacheada: ${query.substring(0, 50)}...`);
      
    } catch (error) {
      console.error('❌ Erro ao cachear resposta:', error);
    }
  }

  // Cache de embeddings para evitar reprocessamento
  async getCachedEmbedding(text: string): Promise<number[] | null> {
    const cacheKey = this.generateCacheKey(text);
    return this.embeddingCache.get(cacheKey) || null;
  }

  async cacheEmbedding(text: string, embedding: number[]): Promise<void> {
    const cacheKey = this.generateCacheKey(text);
    this.embeddingCache.set(cacheKey, embedding);
  }

  // Cache de resultados de busca
  async getCachedSearchResults(query: string, state_code: string): Promise<any[] | null> {
    const cacheKey = `${this.generateCacheKey(query)}:${state_code}`;
    const cached = this.searchCache.get(cacheKey);
    
    if (!cached) return null;
    
    // Verificar se expirou (busca expira mais rápido)
    if (Date.now() - cached.timestamp > this.CACHE_TTL / 2) {
      this.searchCache.delete(cacheKey);
      return null;
    }
    
    return cached.results;
  }

  async cacheSearchResults(query: string, state_code: string, results: any[]): Promise<void> {
    const cacheKey = `${this.generateCacheKey(query)}:${state_code}`;
    this.searchCache.set(cacheKey, {
      results,
      timestamp: Date.now()
    });
  }

  // Evadir entradas menos valiosas do cache
  private async evictLeastValuableEntries(): Promise<void> {
    console.log('🧹 Evadindo entradas menos valiosas do cache...');
    
    const entries = Array.from(this.responseCache.entries());
    
    // Calcular score de valor para cada entrada
    const scoredEntries = entries.map(([key, value]) => ({
      key,
      value,
      score: this.calculateEntryValue(value)
    }));
    
    // Ordenar por score (menor primeiro)
    scoredEntries.sort((a, b) => a.score - b.score);
    
    // Remover 20% das entradas menos valiosas
    const entriesToRemove = Math.ceil(entries.length * 0.2);
    
    for (let i = 0; i < entriesToRemove; i++) {
      this.responseCache.delete(scoredEntries[i].key);
    }
    
    console.log(`🧹 ${entriesToRemove} entradas removidas do cache`);
  }

  // Calcular valor de uma entrada no cache
  private calculateEntryValue(entry: CachedResponse): number {
    const now = Date.now();
    const age = now - entry.timestamp;
    const recency = Math.exp(-age / (this.CACHE_TTL * 0.1)); // Decaimento exponencial
    const frequency = Math.log(entry.accessCount + 1) / Math.log(this.ACCESS_BOOST_THRESHOLD + 1);
    const quality = entry.confidence;
    
    // Score = recency * 0.3 + frequency * 0.4 + quality * 0.3
    return recency * 0.3 + frequency * 0.4 + quality * 0.3;
  }

  // Identificar tipo de query para categorização
  private identifyQueryType(query: string): string {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('hotel') || queryLower.includes('hospedagem')) return 'hotel';
    if (queryLower.includes('restaurante') || queryLower.includes('comida')) return 'restaurant';
    if (queryLower.includes('fazer') || queryLower.includes('atrativo')) return 'attraction';
    if (queryLower.includes('evento') || queryLower.includes('festival')) return 'event';
    if (queryLower.includes('ônibus') || queryLower.includes('transporte')) return 'transport';
    if (queryLower.includes('tempo') || queryLower.includes('clima')) return 'weather';
    if (queryLower.includes('turismo') || queryLower.includes('viagem')) return 'tourism';
    
    return 'other';
  }

  // Limpeza automática de cache antigo
  async cleanupExpiredEntries(): Promise<void> {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, value] of this.responseCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.responseCache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cache limpo: ${keysToDelete.length} entradas expiradas removidas`);
    }
    
    this.stats.lastCleanup = now;
  }

  // Busca inteligente em cache
  async searchSimilarCachedQueries(
    query: string, 
    threshold: number = 0.7
  ): Promise<CachedResponse[]> {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
    
    const similarResponses: { response: CachedResponse; similarity: number }[] = [];
    
    for (const [key, response] of this.responseCache.entries()) {
      const responseWords = response.answer.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      
      // Calcular similaridade simples baseada em palavras em comum
      const commonWords = queryWords.filter(word => responseWords.includes(word));
      const similarity = commonWords.length / Math.max(queryWords.length, responseWords.length);
      
      if (similarity >= threshold) {
        similarResponses.push({ response, similarity });
      }
    }
    
    // Ordenar por similaridade
    return similarResponses
      .sort((a, b) => b.similarity - a.similarity)
      .map(item => item.response);
  }

  // Obter estatísticas do cache
  getCacheStats(): CacheStats {
    const hitRate = this.stats.totalRequests > 0 
      ? this.stats.hits / this.stats.totalRequests 
      : 0;
    
    const averageResponseTime = this.stats.totalRequests > 0
      ? this.stats.totalResponseTime / this.stats.totalRequests
      : 0;
    
    // Calcular eficiência do cache (baseada em hit rate e uso de memória)
    const memoryEfficiency = 1 - (this.responseCache.size / this.MAX_CACHE_SIZE);
    const cacheEfficiency = (hitRate * 0.7) + (memoryEfficiency * 0.3);
    
    return {
      totalEntries: this.responseCache.size,
      memoryUsage: Math.round((this.responseCache.size / this.MAX_CACHE_SIZE) * 100),
      hitRate: Math.round(hitRate * 100),
      averageResponseTime: Math.round(averageResponseTime),
      cacheEfficiency: Math.round(cacheEfficiency * 100)
    };
  }

  // Pré-carregar cache com queries frequentes
  async preloadFrequentQueries(queries: string[]): Promise<void> {
    console.log(`🚀 Pré-carregando ${queries.length} queries frequentes...`);
    
    for (const query of queries) {
      try {
        // Simular resposta para queries frequentes
        const mockResponse: CachedResponse = {
          answer: `Resposta pré-carregada para: ${query}`,
          sources: [],
          confidence: 0.8,
          timestamp: Date.now(),
          accessCount: 1,
          lastAccessed: Date.now(),
          metadata: {
            query_hash: this.generateCacheKey(query),
            query_type: this.identifyQueryType(query),
            processing_time_ms: 0
          }
        };
        
        const cacheKey = this.generateCacheKey(query);
        this.responseCache.set(cacheKey, mockResponse);
        
      } catch (error) {
        console.error(`❌ Erro ao pré-carregar query: ${query}`, error);
      }
    }
    
    console.log('✅ Pré-carregamento concluído');
  }

  // Limpar todo o cache
  clearAllCaches(): void {
    this.responseCache.clear();
    this.embeddingCache.clear();
    this.searchCache.clear();
    
    // Resetar estatísticas
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      totalResponseTime: 0,
      lastCleanup: Date.now()
    };
    
    console.log('🧹 Todos os caches limpos');
  }

  // Exportar cache para backup
  exportCache(): any {
    return {
      responseCache: Array.from(this.responseCache.entries()),
      embeddingCache: Array.from(this.embeddingCache.entries()),
      searchCache: Array.from(this.searchCache.entries()),
      stats: this.stats,
      exportTimestamp: Date.now()
    };
  }

  // Importar cache de backup
  importCache(backup: any): void {
    try {
      this.responseCache = new Map(backup.responseCache || []);
      this.embeddingCache = new Map(backup.embeddingCache || []);
      this.searchCache = new Map(backup.searchCache || []);
      this.stats = backup.stats || this.stats;
      
      console.log('📥 Cache importado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao importar cache:', error);
    }
  }
}

export const ragCacheService = new RAGCacheService();






