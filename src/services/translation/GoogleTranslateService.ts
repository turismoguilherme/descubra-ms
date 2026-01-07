/**
 * Google Translate Service
 * Serviço de tradução automática usando Google Translate API
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

class GoogleTranslateService {
  private cache: Map<string, string> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

  /**
   * Traduz um texto usando Google Translate API
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
      console.log(`📋 [GoogleTranslate] Usando cache para: "${text.substring(0, 50)}..."`);
      return {
        translatedText: this.cache.get(cacheKey)!,
        sourceLanguage: options.sourceLanguage || 'pt-BR',
        targetLanguage: options.targetLanguage,
        success: true,
      };
    }

    // Verificar se API está configurada
    if (!API_CONFIG.GOOGLE_TRANSLATE.isConfigured()) {
      console.warn('⚠️ [GoogleTranslate] API não configurada, pulando tradução');
      return {
        translatedText: text,
        sourceLanguage: options.sourceLanguage || 'pt-BR',
        targetLanguage: options.targetLanguage,
        success: false,
        error: 'API não configurada',
      };
    }

    try {
      console.log(`🌐 [GoogleTranslate] Traduzindo: "${text.substring(0, 50)}..." (${options.sourceLanguage || 'auto'} → ${options.targetLanguage})`);

      // Preparar URL da API
      const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${API_CONFIG.GOOGLE_TRANSLATE.API_KEY}`;

      // Preparar payload
      const payload = {
        q: text,
        target: this.mapLanguageCode(options.targetLanguage),
        source: options.sourceLanguage ? this.mapLanguageCode(options.sourceLanguage) : undefined,
        format: 'text',
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

      if (!data.data || !data.data.translations || data.data.translations.length === 0) {
        throw new Error('Resposta inválida da API');
      }

      const translatedText = data.data.translations[0].translatedText;
      const detectedSourceLang = data.data.translations[0].detectedSourceLanguage;

      // Armazenar no cache
      this.cache.set(cacheKey, translatedText);

      // Limpar cache antigo (manter apenas últimas 1000 traduções)
      if (this.cache.size > 1000) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      console.log(`✅ [GoogleTranslate] Tradução concluída: "${translatedText.substring(0, 50)}..."`);

      return {
        translatedText,
        sourceLanguage: detectedSourceLang || options.sourceLanguage || 'pt-BR',
        targetLanguage: options.targetLanguage,
        success: true,
        confidence: 0.9, // Google Translate geralmente tem alta confiança
      };

    } catch (error) {
      console.error('❌ [GoogleTranslate] Erro na tradução:', error);

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
   * Mapeia códigos de idioma do projeto para códigos do Google Translate
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
   * Traduz múltiplos textos em lote (mais eficiente)
   */
  async translateBatch(
    texts: string[],
    options: TranslationOptions
  ): Promise<TranslationResult[]> {
    const results: TranslationResult[] = [];

    // Processar em lotes de 10 para não sobrecarregar a API
    for (let i = 0; i < texts.length; i += 10) {
      const batch = texts.slice(i, i + 10);
      const batchPromises = batch.map(text => this.translateText(text, options));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Pequena pausa entre lotes para respeitar rate limits
      if (i + 10 < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Limpa o cache de traduções
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 [GoogleTranslate] Cache limpo');
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

export const googleTranslateService = new GoogleTranslateService();
