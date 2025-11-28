/**
 * 💾 ML CACHE SERVICE
 * Cache local inteligente para dados de aprendizado
 */

import { UserPreferences } from './preferenceLearningService';
import { QualityImprovement } from './qualityLearningService';
import { DetectedPattern } from './patternDetectionService';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class MLCacheService {
  // Cache de preferências do usuário (5 minutos)
  private userPreferencesCache: Map<string, CacheEntry<UserPreferences>> = new Map();
  private readonly PREFERENCES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  // Cache de melhorias de qualidade (10 minutos)
  private qualityImprovementsCache: Map<string, CacheEntry<QualityImprovement[]>> = new Map();
  private readonly QUALITY_CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

  // Cache de padrões frequentes (30 minutos)
  private frequentPatternsCache: CacheEntry<DetectedPattern[]> | null = null;
  private readonly PATTERNS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

  /**
   * Obtém preferências do usuário do cache
   */
  getUserPreferences(key: string): UserPreferences | null {
    const cached = this.userPreferencesCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.PREFERENCES_CACHE_DURATION) {
      this.userPreferencesCache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Salva preferências do usuário no cache
   */
  setUserPreferences(key: string, preferences: UserPreferences): void {
    this.userPreferencesCache.set(key, {
      data: preferences,
      timestamp: Date.now()
    });
  }

  /**
   * Obtém melhorias de qualidade do cache
   */
  getQualityImprovements(question: string): QualityImprovement[] | null {
    const cacheKey = this.generateQuestionKey(question);
    const cached = this.qualityImprovementsCache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.QUALITY_CACHE_DURATION) {
      this.qualityImprovementsCache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  /**
   * Salva melhorias de qualidade no cache
   */
  setQualityImprovements(question: string, improvements: QualityImprovement[]): void {
    const cacheKey = this.generateQuestionKey(question);
    this.qualityImprovementsCache.set(cacheKey, {
      data: improvements,
      timestamp: Date.now()
    });
  }

  /**
   * Obtém padrões frequentes do cache
   */
  getFrequentPatterns(): DetectedPattern[] | null {
    if (!this.frequentPatternsCache) return null;

    const now = Date.now();
    if (now - this.frequentPatternsCache.timestamp > this.PATTERNS_CACHE_DURATION) {
      this.frequentPatternsCache = null;
      return null;
    }

    return this.frequentPatternsCache.data;
  }

  /**
   * Salva padrões frequentes no cache
   */
  setFrequentPatterns(patterns: DetectedPattern[]): void {
    this.frequentPatternsCache = {
      data: patterns,
      timestamp: Date.now()
    };
  }

  /**
   * Invalida cache do usuário
   */
  invalidateUserCache(key: string): void {
    this.userPreferencesCache.delete(key);
    // Limpar cache de melhorias relacionadas (opcional)
    // Por simplicidade, não limpamos tudo, apenas o cache de preferências
  }

  /**
   * Limpa cache expirado
   */
  cleanExpiredCache(): void {
    const now = Date.now();

    // Limpar preferências expiradas
    for (const [key, entry] of this.userPreferencesCache.entries()) {
      if (now - entry.timestamp > this.PREFERENCES_CACHE_DURATION) {
        this.userPreferencesCache.delete(key);
      }
    }

    // Limpar melhorias expiradas
    for (const [key, entry] of this.qualityImprovementsCache.entries()) {
      if (now - entry.timestamp > this.QUALITY_CACHE_DURATION) {
        this.qualityImprovementsCache.delete(key);
      }
    }

    // Limpar padrões expirados
    if (this.frequentPatternsCache && 
        now - this.frequentPatternsCache.timestamp > this.PATTERNS_CACHE_DURATION) {
      this.frequentPatternsCache = null;
    }
  }

  /**
   * Gera chave de cache para pergunta
   */
  private generateQuestionKey(question: string): string {
    // Normalizar pergunta para criar chave consistente
    return question.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100);
  }

  /**
   * Limpa todo o cache
   */
  clearAll(): void {
    this.userPreferencesCache.clear();
    this.qualityImprovementsCache.clear();
    this.frequentPatternsCache = null;
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): {
    userPreferences: number;
    qualityImprovements: number;
    frequentPatterns: boolean;
  } {
    return {
      userPreferences: this.userPreferencesCache.size,
      qualityImprovements: this.qualityImprovementsCache.size,
      frequentPatterns: this.frequentPatternsCache !== null
    };
  }
}


