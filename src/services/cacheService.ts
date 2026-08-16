/**
 * Serviço de Cache para Otimização de Performance
 * Implementa cache em memória com TTL e estratégias de invalidação
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time To Live em milissegundos
  hits: number;
  lastAccessed: number;
}

interface CacheStats {
  totalItems: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memoryUsage: number;
}

export class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private stats = {
    totalHits: 0,
    totalMisses: 0
  };

  // Configurações padrão
  private defaultTTL = 5 * 60 * 1000; // 5 minutos
  private maxSize = 1000; // Máximo de itens no cache
  private cleanupInterval = 60 * 1000; // Limpeza a cada minuto

  constructor() {
    // Iniciar limpeza automática
    this.startCleanup();
  }

  // Armazenar item no cache
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, item);

    // Verificar se precisa limpar cache
    if (this.cache.size > this.maxSize) {
      this.cleanup();
    }
  }

  // Recuperar item do cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      this.stats.totalMisses++;
      return null;
    }

    // Verificar se expirou
    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.stats.totalMisses++;
      return null;
    }

    // Atualizar estatísticas
    item.hits++;
    item.lastAccessed = Date.now();
    this.stats.totalHits++;

    return item.data;
  }

  // Verificar se item existe e não expirou
  has(key: string): boolean {
    const item = this.cache.get(key);
    return item ? !this.isExpired(item) : false;
  }

  // Remover item específico
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear();
    this.stats.totalHits = 0;
    this.stats.totalMisses = 0;
  }

  // Verificar se item expirou
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  // Limpeza automática de itens expirados
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));

    // Se ainda estiver muito grande, remover itens menos acessados
    if (this.cache.size > this.maxSize) {
      this.evictLeastUsed();
    }
  }

  // Remover itens menos utilizados
  private evictLeastUsed(): void {
    const items = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.hits - b.hits || a.lastAccessed - b.lastAccessed);

    const toRemove = items.slice(0, Math.floor(this.maxSize * 0.1)); // Remover 10%
    toRemove.forEach(([key]) => this.cache.delete(key));
  }

  // Iniciar limpeza automática
  private startCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  // Obter estatísticas do cache
  getStats(): CacheStats {
    const totalRequests = this.stats.totalHits + this.stats.totalMisses;
    const hitRate = totalRequests > 0 ? (this.stats.totalHits / totalRequests) * 100 : 0;

    return {
      totalItems: this.cache.size,
      totalHits: this.stats.totalHits,
      totalMisses: this.stats.totalMisses,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  // Estimar uso de memória
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const [, item] of this.cache.entries()) {
      totalSize += JSON.stringify(item).length * 2; // Aproximação
    }
    return totalSize;
  }

  // Cache com função assíncrona
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFunction();
    this.set(key, data, ttl);
    return data;
  }

  // Invalidação por padrão
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let removed = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  // Cache com dependências
  setWithDependencies<T>(
    key: string,
    data: T,
    dependencies: string[],
    ttl?: number
  ): void {
    this.set(key, data, ttl);
    
    // Armazenar dependências
    const depsKey = `${key}:deps`;
    this.set(depsKey, dependencies, ttl);
  }

  // Invalidar por dependência
  invalidateByDependency(dependency: string): number {
    let removed = 0;

    for (const [key, item] of this.cache.entries()) {
      if (key.endsWith(':deps')) {
        const deps = item.data as string[];
        if (deps.includes(dependency)) {
          const mainKey = key.replace(':deps', '');
          this.cache.delete(mainKey);
          this.cache.delete(key);
          removed++;
        }
      }
    }

    return removed;
  }
}

// Instância singleton
export const cacheService = new CacheService();

