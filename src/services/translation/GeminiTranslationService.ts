/**
 * Gemini Translation Service
 * Serviço de tradução automática usando Gemini API
 */

import { generateContent } from '@/config/gemini';
import type { LanguageCode } from '@/utils/translationHelpers';

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  success: boolean;
  error?: string;
}

export interface TranslationOptions {
  sourceLanguage?: LanguageCode;
  targetLanguage: LanguageCode;
  context?: string;
}

class GeminiTranslationService {
  private cache: Map<string, string> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

  /**
   * Traduz um texto usando Gemini API
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
    const cacheKey = this.getCacheKey(text, options.targetLanguage);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return {
        translatedText: cached,
        sourceLanguage: options.sourceLanguage || 'pt-BR',
        targetLanguage: options.targetLanguage,
        success: true,
      };
    }

    try {
      const languageName = this.getLanguageName(options.targetLanguage);
      const contextHint = options.context 
        ? `\n\nContexto: ${options.context}`
        : '';

      const prompt = `Traduza o seguinte texto para ${languageName}. 
Mantenha o tom e o estilo originais. Se o texto for sobre turismo ou viagem, use terminologia apropriada para esse contexto.${contextHint}

Texto a traduzir:
"${text}"

Retorne APENAS o texto traduzido, sem aspas, sem explicações adicionais.`;

      const result = await generateContent(prompt);
      
      if (!result.ok) {
        throw new Error(result.error || 'Erro ao traduzir texto');
      }

      const translatedText = result.text.trim().replace(/^["']|["']$/g, '');

      // Salvar no cache
      this.cache.set(cacheKey, translatedText);

      return {
        translatedText,
        sourceLanguage: options.sourceLanguage || 'pt-BR',
        targetLanguage: options.targetLanguage,
        success: true,
      };
    } catch (error) {
      console.error('Erro ao traduzir texto com Gemini:', error);
      return {
        translatedText: text, // Fallback para texto original
        sourceLanguage: options.sourceLanguage || 'pt-BR',
        targetLanguage: options.targetLanguage,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Traduz um objeto complexo (ex: destino, evento)
   */
  async translateObject<T extends Record<string, any>>(
    obj: T,
    options: TranslationOptions,
    fieldsToTranslate: (keyof T)[]
  ): Promise<Partial<T>> {
    const translated: Partial<T> = { ...obj };
    const translations: Promise<void>[] = [];

    for (const field of fieldsToTranslate) {
      const value = obj[field];
      
      if (!value) continue;

      if (typeof value === 'string' && value.trim()) {
        translations.push(
          this.translateText(value, {
            ...options,
            context: `Campo: ${String(field)}`,
          }).then((result) => {
            if (result.success) {
              (translated[field] as any) = result.translatedText;
            }
          })
        );
      } else if (Array.isArray(value)) {
        // Traduzir array de strings
        translations.push(
          Promise.all(
            value.map((item) =>
              typeof item === 'string'
                ? this.translateText(item, {
                    ...options,
                    context: `Item do campo: ${String(field)}`,
                  }).then((result) => (result.success ? result.translatedText : item))
                : Promise.resolve(item)
            )
          ).then((translatedArray) => {
            (translated[field] as any) = translatedArray;
          })
        );
      }
    }

    await Promise.all(translations);
    return translated;
  }

  /**
   * Limpa o cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Gera chave de cache
   */
  private getCacheKey(text: string, targetLanguage: LanguageCode): string {
    return `${targetLanguage}:${text.substring(0, 100)}`;
  }

  /**
   * Obtém nome do idioma para o prompt
   */
  private getLanguageName(code: LanguageCode): string {
    const names: Record<LanguageCode, string> = {
      'pt-BR': 'português brasileiro',
      'en-US': 'inglês americano',
      'es-ES': 'espanhol',
      'fr-FR': 'francês',
      'de-DE': 'alemão',
      'it-IT': 'italiano',
      'ja-JP': 'japonês',
      'ko-KR': 'coreano',
      'zh-CN': 'chinês simplificado',
    };
    return names[code] || code;
  }
}

export const geminiTranslationService = new GeminiTranslationService();

