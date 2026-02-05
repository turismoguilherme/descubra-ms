/**
 * LibreTranslate Service
 * Serviço de tradução gratuita usando LibreTranslate API
 */

import type { LanguageCode } from '@/utils/translationHelpers';
import { API_CONFIG } from '@/config/apiKeys';

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  success: boolean;
  error?: string;
  confidence?: number;
}

export interface TranslationOptions {
  sourceLanguage?: LanguageCode;
  targetLanguage: LanguageCode;
  context?: string;
}

class LibreTranslateService {
  private cache: Map<string, string> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  private readonly TIMEOUT = 10000; // 10 segundos
  private readonly FAILURE_CACHE: Map<string, number> = new Map(); // Cache de falhas (circuit breaker)
  private readonly FAILURE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  // Lista de instâncias públicas de LibreTranslate (fallback)
  private readonly INSTANCES = [
    'https://libretranslate.de',
    'https://lt.vern.cc',
    'https://translate.argosopentech.com',
  ];

  /**
   * Verifica se uma instância está disponível (circuit breaker)
   */
  private isInstanceAvailable(baseUrl: string): boolean {
    const failureKey = `failure:${baseUrl}`;
    const failureTime = this.FAILURE_CACHE.get(failureKey);
    
    if (failureTime) {
      const timeSinceFailure = Date.now() - failureTime;
      if (timeSinceFailure < this.FAILURE_CACHE_DURATION) {
        return false; // Instância ainda em "cooldown"
      }
      // Remover do cache de falhas se passou o tempo
      this.FAILURE_CACHE.delete(failureKey);
    }
    
    return true;
  }

  /**
   * Marca uma instância como falha
   */
  private markInstanceFailure(baseUrl: string): void {
    this.FAILURE_CACHE.set(`failure:${baseUrl}`, Date.now());
    
    // Limpar cache de falhas antigo
    for (const [key, time] of this.FAILURE_CACHE.entries()) {
      if (Date.now() - time > this.FAILURE_CACHE_DURATION) {
        this.FAILURE_CACHE.delete(key);
      }
    }
  }

  /**
   * Traduz um texto usando LibreTranslate API com fallback para múltiplas instâncias
   */
  async translateText(
    text: string,
    options: TranslationOptions
  ): Promise<TranslationResult> {
    if (!text || !text.trim()) {
      return {
        translatedText: text,
        sourceLanguage: options.sourceLanguage || 'pt-BR',
        targetLanguage: options.targetLanguage,
        success: true,
      };
    }

    // Se o idioma alvo for português, retornar texto original
    if (options.targetLanguage === 'pt-BR') {
      return {
        translatedText: text,
        sourceLanguage: options.sourceLanguage || 'pt-BR',
        targetLanguage: options.targetLanguage,
        success: true,
      };
    }

    // Verificar cache
    const cacheKey = `${text}:${options.targetLanguage}`;
    if (this.cache.has(cacheKey)) {
      console.log(`📋 [LibreTranslate] Usando cache para: "${text.substring(0, 50)}..."`);
      return {
        translatedText: this.cache.get(cacheKey)!,
        sourceLanguage: options.sourceLanguage || 'pt-BR',
        targetLanguage: options.targetLanguage,
        success: true,
      };
    }

    // Tentar todas as instâncias disponíveis
    const instancesToTry = [
      API_CONFIG.LIBRE_TRANSLATE.BASE_URL,
      ...this.INSTANCES.filter(url => url !== API_CONFIG.LIBRE_TRANSLATE.BASE_URL)
    ].filter(url => this.isInstanceAvailable(url));

    if (instancesToTry.length === 0) {
      console.warn('⚠️ [LibreTranslate] Todas as instâncias estão em cooldown');
      return {
        translatedText: text,
        sourceLanguage: options.sourceLanguage || 'pt-BR',
        targetLanguage: options.targetLanguage,
        success: false,
        error: 'Todas as instâncias estão temporariamente indisponíveis',
      };
    }

    let lastError: string = '';

    for (const baseUrl of instancesToTry) {
      try {
        console.log(`🌐 [LibreTranslate] Tentando traduzir com ${baseUrl}: "${text.substring(0, 50)}..." (${options.sourceLanguage || 'auto'} → ${options.targetLanguage})`);

        // Preparar URL da API
        const apiUrl = `${baseUrl}/translate`;

        // Preparar payload
        const payload = {
          q: text,
          source: this.mapLanguageCode(options.sourceLanguage || 'pt-BR'),
          target: this.mapLanguageCode(options.targetLanguage),
          format: 'text',
          api_key: '' // LibreTranslate não requer chave
        };

        // Fazer requisição com timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

        let response: Response;
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new Error(`Timeout após ${this.TIMEOUT}ms`);
          }
          throw fetchError;
        }

        if (!response.ok) {
          // Se for erro 429 (rate limit) ou 503 (service unavailable), marcar como falha
          if (response.status === 429 || response.status === 503) {
            this.markInstanceFailure(baseUrl);
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || !data.translatedText) {
          throw new Error('Resposta inválida da API');
        }

        const translatedText = data.translatedText;

        // Armazenar no cache
        this.cache.set(cacheKey, translatedText);

        // Limpar cache antigo (manter apenas últimas 1000 traduções)
        if (this.cache.size > 1000) {
          const firstKey = this.cache.keys().next().value;
          this.cache.delete(firstKey);
        }

        console.log(`✅ [LibreTranslate] Tradução concluída com ${baseUrl}: "${translatedText.substring(0, 50)}..."`);

        return {
          translatedText,
          sourceLanguage: data.detectedLanguage || options.sourceLanguage || 'pt-BR',
          targetLanguage: options.targetLanguage,
          success: true,
          confidence: 0.8, // LibreTranslate geralmente tem boa qualidade
        };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error(`❌ [LibreTranslate] Erro com ${baseUrl}:`, errorMessage);
        
        // Marcar instância como falha se for erro de rede ou timeout
        if (errorMessage.includes('Timeout') || errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          this.markInstanceFailure(baseUrl);
        }
        
        lastError = errorMessage;
        // Continuar para próxima instância
        continue;
      }
    }

    // Se todas as instâncias falharam
    console.error('❌ [LibreTranslate] Todas as instâncias falharam. Último erro:', lastError);

    return {
      translatedText: text,
      sourceLanguage: options.sourceLanguage || 'pt-BR',
      targetLanguage: options.targetLanguage,
      success: false,
      error: `Todas as instâncias falharam: ${lastError}`,
    };
  }

  /**
   * Mapeia códigos de idioma do projeto para códigos do LibreTranslate
   */
  private mapLanguageCode(code: LanguageCode): string {
    const mapping: Record<LanguageCode, string> = {
      'pt-BR': 'pt',
      'en-US': 'en',
      'es-ES': 'es',
      'fr-FR': 'fr',
      'de-DE': 'de',
    };

    return mapping[code] || code.split('-')[0];
  }

  /**
   * Traduz múltiplos textos em lote
   */
  async translateBatch(
    texts: string[],
    options: TranslationOptions
  ): Promise<TranslationResult[]> {
    const results: TranslationResult[] = [];

    // LibreTranslate pode ser mais lento, então processar um por vez
    for (const text of texts) {
      const result = await this.translateText(text, options);
      results.push(result);

      // Pausa maior para respeitar rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
  }

  /**
   * Limpa o cache de traduções
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 [LibreTranslate] Cache limpo');
  }

  /**
   * Retorna estatísticas do cache
   */
  getCacheStats(): { size: number; hitRate?: number } {
    return {
      size: this.cache.size,
    };
  }
}

export const libreTranslateService = new LibreTranslateService();
