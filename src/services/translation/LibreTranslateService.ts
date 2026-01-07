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

  /**
   * Traduz um texto usando LibreTranslate API
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

    try {
      console.log(`🌐 [LibreTranslate] Traduzindo: "${text.substring(0, 50)}..." (${options.sourceLanguage || 'auto'} → ${options.targetLanguage})`);

      // Preparar URL da API
      const apiUrl = `${API_CONFIG.LIBRE_TRANSLATE.BASE_URL}/translate`;

      // Preparar payload
      const payload = {
        q: text,
        source: this.mapLanguageCode(options.sourceLanguage || 'pt-BR'),
        target: this.mapLanguageCode(options.targetLanguage),
        format: 'text',
        api_key: '' // LibreTranslate não requer chave
      };

      // Fazer requisição
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
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

      console.log(`✅ [LibreTranslate] Tradução concluída: "${translatedText.substring(0, 50)}..."`);

      return {
        translatedText,
        sourceLanguage: data.detectedLanguage || options.sourceLanguage || 'pt-BR',
        targetLanguage: options.targetLanguage,
        success: true,
        confidence: 0.8, // LibreTranslate geralmente tem boa qualidade
      };

    } catch (error) {
      console.error('❌ [LibreTranslate] Erro na tradução:', error);

      return {
        translatedText: text,
        sourceLanguage: options.sourceLanguage || 'pt-BR',
        targetLanguage: options.targetLanguage,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
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
