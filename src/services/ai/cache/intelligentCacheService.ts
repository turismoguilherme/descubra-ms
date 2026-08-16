// 💾 SISTEMA DE CACHE INTELIGENTE PARA ECONOMIZAR APIS
// Evita gastos desnecessários reutilizando respostas similares

interface CacheEntry {
  id: string;
  originalQuestion: string;
  normalizedQuestion: string;
  response: string;
  timestamp: Date;
  useCount: number;
  sources: string[];
  confidence: number;
  contextHash: string;
}

interface CacheStats {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  apiCallsSaved: number;
  lastCleanup: Date;
}

export class IntelligentCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats = {
    totalQueries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    apiCallsSaved: 0,
    lastCleanup: new Date()
  };

  // Tempo de vida do cache em horas
  private readonly CACHE_TTL_HOURS = 24;
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly SIMILARITY_THRESHOLD = 0.85;

  /**
   * 🔍 Busca resposta similar no cache
   */
  async findSimilarResponse(question: string, context: string = ''): Promise<CacheEntry | null> {
    console.log('🔍 CACHE: Buscando resposta similar para:', question.substring(0, 50) + '...');
    
    this.stats.totalQueries++;
    
    const normalizedQuestion = this.normalizeQuestion(question);
    const contextHash = this.createContextHash(context);
    
    // 1. Busca exata primeiro
    const exactKey = this.createCacheKey(normalizedQuestion, contextHash);
    if (this.cache.has(exactKey)) {
      const entry = this.cache.get(exactKey)!;
      if (this.isValidEntry(entry)) {
        entry.useCount++;
        this.stats.cacheHits++;
        this.stats.apiCallsSaved++;
        console.log('✅ CACHE HIT EXATO: Resposta encontrada! APIs economizadas:', this.stats.apiCallsSaved);
        return entry;
      }
    }

    // 2. Busca por similaridade
    for (const [key, entry] of this.cache.entries()) {
      if (this.isValidEntry(entry)) {
        const similarity = this.calculateSimilarity(normalizedQuestion, entry.normalizedQuestion);
        if (similarity >= this.SIMILARITY_THRESHOLD) {
          entry.useCount++;
          this.stats.cacheHits++;
          this.stats.apiCallsSaved++;
          console.log(`✅ CACHE HIT SIMILAR (${Math.round(similarity * 100)}%): APIs economizadas:`, this.stats.apiCallsSaved);
          return entry;
        }
      }
    }

    this.stats.cacheMisses++;
    console.log('❌ CACHE MISS: Nova consulta será feita às APIs');
    return null;
  }

  /**
   * 💾 Salva resposta no cache
   */
  async saveResponse(
    question: string, 
    response: string, 
    sources: string[], 
    confidence: number,
    context: string = ''
  ): Promise<void> {
    const normalizedQuestion = this.normalizeQuestion(question);
    const contextHash = this.createContextHash(context);
    const cacheKey = this.createCacheKey(normalizedQuestion, contextHash);

    const entry: CacheEntry = {
      id: this.generateId(),
      originalQuestion: question,
      normalizedQuestion,
      response,
      timestamp: new Date(),
      useCount: 1,
      sources,
      confidence,
      contextHash
    };

    this.cache.set(cacheKey, entry);
    console.log('💾 CACHE SAVE: Resposta salva para futuras consultas similares');

    // Limpar cache se necessário
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      this.cleanupCache();
    }
  }

  /**
   * 🧹 Limpeza automática do cache
   */
  private cleanupCache(): void {
    console.log('🧹 CACHE CLEANUP: Removendo entradas antigas...');
    
    const now = new Date();
    const entries = Array.from(this.cache.entries());
    
    // Remover entradas expiradas
    const expiredKeys = entries
      .filter(([key, entry]) => !this.isValidEntry(entry))
      .map(([key]) => key);

    expiredKeys.forEach(key => this.cache.delete(key));

    // Se ainda muito grande, remover as menos usadas
    if (this.cache.size > this.MAX_CACHE_SIZE * 0.8) {
      const sortedByUsage = entries
        .sort(([, a], [, b]) => a.useCount - b.useCount)
        .slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2));

      sortedByUsage.forEach(([key]) => this.cache.delete(key));
    }

    this.stats.lastCleanup = now;
    console.log(`✅ CACHE CLEANUP: ${expiredKeys.length} entradas removidas`);
  }

  /**
   * 📊 Estatísticas do cache
   */
  getStats(): CacheStats & { cacheHitRate: number; currentCacheSize: number } {
    const cacheHitRate = this.stats.totalQueries > 0 
      ? (this.stats.cacheHits / this.stats.totalQueries) * 100 
      : 0;

    return {
      ...this.stats,
      cacheHitRate,
      currentCacheSize: this.cache.size
    };
  }

  /**
   * 🎯 Normalizar pergunta para comparação
   */
  private normalizeQuestion(question: string): string {
    return question
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ') // Remove pontuação
      .replace(/\s+/g, ' ') // Normaliza espaços
      .replace(/\b(o|a|os|as|um|uma|do|da|dos|das|em|no|na|nos|nas|para|por|com|sem|de|que|qual|quais|onde|quando|como|porque)\b/g, '') // Remove stop words
      .trim();
  }

  /**
   * 🔄 Calcular similaridade entre perguntas
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(str2.split(' ').filter(w => w.length > 2));
    
    if (words1.size === 0 && words2.size === 0) return 1;
    if (words1.size === 0 || words2.size === 0) return 0;

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * 🔑 Criar chave única para cache
   */
  private createCacheKey(normalizedQuestion: string, contextHash: string): string {
    return `${normalizedQuestion}_${contextHash}`.substring(0, 100);
  }

  /**
   * #️⃣ Criar hash do contexto
   */
  private createContextHash(context: string): string {
    // Hash simples para contexto
    let hash = 0;
    for (let i = 0; i < context.length; i++) {
      const char = context.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * ✅ Verificar se entrada é válida (não expirou)
   */
  private isValidEntry(entry: CacheEntry): boolean {
    const now = new Date();
    const ageInHours = (now.getTime() - entry.timestamp.getTime()) / (1000 * 60 * 60);
    return ageInHours < this.CACHE_TTL_HOURS;
  }

  /**
   * 🆔 Gerar ID único
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 🎮 Modo demo - limpar cache
   */
  clearCache(): void {
    this.cache.clear();
    this.stats = {
      totalQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      apiCallsSaved: 0,
      lastCleanup: new Date()
    };
    console.log('🧹 CACHE: Cache limpo manualmente');
  }

  /**
   * 📈 Relatório de economia
   */
  getEconomyReport(): string {
    const stats = this.getStats();
    const economy = stats.apiCallsSaved;
    const estimatedCost = economy * 0.02; // ~R$ 0,02 por consulta
    
    return `
💰 ECONOMIA DE APIS:
• ${economy} chamadas economizadas
• ${Math.round(stats.cacheHitRate)}% de taxa de acerto
• ~R$ ${estimatedCost.toFixed(2)} economizados
• ${stats.currentCacheSize} respostas em cache
    `.trim();
  }
}

// Singleton global
export const intelligentCacheService = new IntelligentCacheService();

