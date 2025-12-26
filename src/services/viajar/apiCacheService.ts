/**
 * API Cache Service
 * Cache inteligente para todas as APIs (Gemini, Google Search, OpenWeather, Places)
 * Reduz custos reutilizando respostas similares
 */

import { supabase } from '@/integrations/supabase/client';
import CryptoJS from 'crypto-js';

export type APIType = 'gemini' | 'google_search' | 'openweather' | 'google_places';

export interface CacheEntry {
  id: string;
  apiType: APIType;
  requestHash: string;
  request: string;
  response: any;
  expiresAt: Date;
  createdAt: Date;
  useCount: number;
}

export interface CacheResult {
  found: boolean;
  response?: any;
  fromCache?: boolean;
}

// Durações de cache por tipo de API
const CACHE_DURATIONS: Record<APIType, number> = {
  gemini: 24 * 60 * 60 * 1000, // 24 horas
  google_search: 6 * 60 * 60 * 1000, // 6 horas
  openweather: 1 * 60 * 60 * 1000, // 1 hora
  google_places: 30 * 24 * 60 * 60 * 1000, // 30 dias
};

class APICacheService {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private readonly MAX_MEMORY_CACHE = 500;

  /**
   * Gera hash da requisição normalizada
   */
  private generateRequestHash(apiType: APIType, request: string): string {
    const normalized = request.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const key = `${apiType}:${normalized}`;
    return CryptoJS.MD5(key).toString();
  }

  /**
   * Normaliza requisição para comparação
   */
  private normalizeRequest(request: string): string {
    return request.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calcula similaridade entre duas strings (0-1)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = this.normalizeRequest(str1);
    const s2 = this.normalizeRequest(str2);
    
    if (s1 === s2) return 1.0;
    
    // Similaridade simples baseada em palavras comuns
    const words1 = new Set(s1.split(' '));
    const words2 = new Set(s2.split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Busca no cache (memória primeiro, depois banco)
   */
  async getFromCache(
    apiType: APIType,
    request: string
  ): Promise<CacheResult> {
    const requestHash = this.generateRequestHash(apiType, request);
    const cacheKey = `${apiType}:${requestHash}`;

    // 1. Verificar cache em memória
    if (this.memoryCache.has(cacheKey)) {
      const entry = this.memoryCache.get(cacheKey)!;
      if (entry.expiresAt > new Date()) {
        entry.useCount++;
        console.log(`✅ CACHE HIT (memória): ${apiType} - Economizou 1 chamada`);
        return {
          found: true,
          response: entry.response,
          fromCache: true,
        };
      } else {
        // Expirou, remover
        this.memoryCache.delete(cacheKey);
      }
    }

    // 2. Verificar cache no banco (apenas para Gemini e Google Search)
    if (apiType === 'gemini' || apiType === 'google_search') {
      try {
        const { data, error } = await supabase
          .from('api_cache')
          .select('*')
          .eq('api_type', apiType)
          .eq('request_hash', requestHash)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          // Atualizar contador de uso
          await supabase
            .from('api_cache')
            .update({ use_count: (data.use_count || 0) + 1 })
            .eq('id', data.id);

          // Adicionar ao cache em memória
          const entry: CacheEntry = {
            id: data.id,
            apiType: data.api_type,
            requestHash: data.request_hash,
            request: data.request,
            response: data.response,
            expiresAt: new Date(data.expires_at),
            createdAt: new Date(data.created_at),
            useCount: (data.use_count || 0) + 1,
          };

          this.addToMemoryCache(cacheKey, entry);

          console.log(`✅ CACHE HIT (banco): ${apiType} - Economizou 1 chamada`);
          return {
            found: true,
            response: data.response,
            fromCache: true,
          };
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao buscar cache do banco (${apiType}):`, error);
      }
    }

    // 3. Buscar por similaridade (apenas para Gemini)
    if (apiType === 'gemini') {
      try {
        const normalizedRequest = this.normalizeRequest(request);
        const { data } = await supabase
          .from('api_cache')
          .select('*')
          .eq('api_type', 'gemini')
          .gt('expires_at', new Date().toISOString())
          .limit(100); // Buscar últimos 100 para comparar

        if (data && data.length > 0) {
          for (const entry of data) {
            const similarity = this.calculateSimilarity(
              normalizedRequest,
              entry.request
            );

            // Se similaridade >= 85%, usar cache
            if (similarity >= 0.85) {
              await supabase
                .from('api_cache')
                .update({ use_count: (entry.use_count || 0) + 1 })
                .eq('id', entry.id);

              console.log(`✅ CACHE HIT (similar ${Math.round(similarity * 100)}%): ${apiType} - Economizou 1 chamada`);
              return {
                found: true,
                response: entry.response,
                fromCache: true,
              };
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Erro ao buscar cache por similaridade:', error);
      }
    }

    console.log(`❌ CACHE MISS: ${apiType} - Fazerá chamada real`);
    return { found: false };
  }

  /**
   * Salva resposta no cache
   */
  async saveToCache(
    apiType: APIType,
    request: string,
    response: any
  ): Promise<void> {
    const requestHash = this.generateRequestHash(apiType, request);
    const cacheKey = `${apiType}:${requestHash}`;
    const expiresAt = new Date(Date.now() + CACHE_DURATIONS[apiType]);

    const entry: CacheEntry = {
      id: crypto.randomUUID(),
      apiType,
      requestHash,
      request: request.substring(0, 500), // Limitar tamanho
      response,
      expiresAt,
      createdAt: new Date(),
      useCount: 1,
    };

    // Adicionar ao cache em memória
    this.addToMemoryCache(cacheKey, entry);

    // Salvar no banco (apenas Gemini e Google Search para economizar espaço)
    if (apiType === 'gemini' || apiType === 'google_search') {
      try {
        await supabase
          .from('api_cache')
          .insert({
            api_type: apiType,
            request_hash: requestHash,
            request: request.substring(0, 500),
            response: typeof response === 'string' ? response : JSON.stringify(response),
            expires_at: expiresAt.toISOString(),
            use_count: 1,
          });
      } catch (error) {
        console.warn(`⚠️ Erro ao salvar cache no banco (${apiType}):`, error);
      }
    }
  }

  /**
   * Adiciona ao cache em memória (com limite de tamanho)
   */
  private addToMemoryCache(key: string, entry: CacheEntry): void {
    // Se cache está cheio, remover mais antigo
    if (this.memoryCache.size >= this.MAX_MEMORY_CACHE) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }

    this.memoryCache.set(key, entry);
  }

  /**
   * Limpa cache expirado
   */
  async cleanupExpiredCache(): Promise<void> {
    const now = new Date();

    // Limpar memória
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryCache.delete(key);
      }
    }

    // Limpar banco (apenas Gemini e Google Search)
    try {
      await supabase
        .from('api_cache')
        .delete()
        .lt('expires_at', now.toISOString());
    } catch (error) {
      console.warn('⚠️ Erro ao limpar cache expirado:', error);
    }
  }

  /**
   * Estatísticas do cache
   */
  getStats(): {
    memoryEntries: number;
    totalHits: number;
  } {
    return {
      memoryEntries: this.memoryCache.size,
      totalHits: Array.from(this.memoryCache.values())
        .reduce((sum, entry) => sum + entry.useCount, 0),
    };
  }
}

export const apiCacheService = new APICacheService();

