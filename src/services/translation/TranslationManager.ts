/**
 * Translation Manager
 * Gerencia múltiplas APIs de tradução com sistema de fallback
 */

import { googleTranslateService } from './GoogleTranslateService';
import { geminiTranslationService } from './GeminiTranslationService';
import { libreTranslateService } from './LibreTranslateService';
import { API_CONFIG } from '@/config/apiKeys';
import type { LanguageCode } from '@/utils/translationHelpers';
import type { TranslationResult, TranslationOptions } from './GoogleTranslateService';

export interface TranslationProvider {
  name: string;
  priority: number;
  service: {
    translateText(text: string, options: TranslationOptions): Promise<TranslationResult>;
  };
  isConfigured: () => boolean;
}

class TranslationManager {
  private providers: TranslationProvider[] = [
    {
      name: 'LibreTranslate',
      priority: 1, // Prioridade mais alta = gratuito e sem configuração
      service: libreTranslateService,
      isConfigured: () => true // Sempre disponível (API gratuita)
    },
    {
      name: 'Google Translate',
      priority: 2,
      service: googleTranslateService,
      isConfigured: () => {
        return API_CONFIG.GOOGLE_TRANSLATE.isConfigured();
      }
    },
    {
      name: 'Gemini AI',
      priority: 3,
      service: geminiTranslationService,
      isConfigured: () => {
        return API_CONFIG.GEMINI.isConfigured();
      }
    }
  ];

  /**
   * Traduz um texto usando o melhor provedor disponível
   */
  async translateText(
    text: string,
    options: TranslationOptions
  ): Promise<TranslationResult> {
    // Ordenar provedores por prioridade (menor número = maior prioridade)
    const availableProviders = this.providers
      .filter(provider => provider.isConfigured())
      .sort((a, b) => a.priority - b.priority);

    if (availableProviders.length === 0) {
      console.warn('⚠️ [TranslationManager] Nenhum provedor de tradução configurado');
      return {
        translatedText: text,
        sourceLanguage: options.sourceLanguage || 'pt-BR',
        targetLanguage: options.targetLanguage,
        success: false,
        error: 'Nenhum provedor de tradução configurado',
      };
    }

    let lastError: string = '';

    // Tentar cada provedor em ordem de prioridade
    for (const provider of availableProviders) {
      try {
        console.log(`🔄 [TranslationManager] Tentando tradução com ${provider.name}...`);

        const result = await provider.service.translateText(text, options);

        if (result.success && result.translatedText && result.translatedText !== text) {
          console.log(`✅ [TranslationManager] Tradução bem-sucedida com ${provider.name}`);
          return result;
        } else {
          console.log(`⚠️ [TranslationManager] ${provider.name} falhou ou retornou texto idêntico`);
          lastError = result.error || 'Tradução falhou';
        }
      } catch (error) {
        console.error(`❌ [TranslationManager] Erro com ${provider.name}:`, error);
        lastError = error instanceof Error ? error.message : 'Erro desconhecido';
      }
    }

    // Se nenhum provedor funcionou, retornar o texto original
    console.warn(`❌ [TranslationManager] Todos os provedores falharam. Retornando texto original.`);
    return {
      translatedText: text,
      sourceLanguage: options.sourceLanguage || 'pt-BR',
      targetLanguage: options.targetLanguage,
      success: false,
      error: `Todos os provedores falharam: ${lastError}`,
    };
  }

  /**
   * Traduz múltiplos textos em lote
   */
  async translateBatch(
    texts: string[],
    options: TranslationOptions
  ): Promise<TranslationResult[]> {
    const results: TranslationResult[] = [];

    // Traduzir um por vez para melhor controle de fallback
    for (const text of texts) {
      const result = await this.translateText(text, options);
      results.push(result);

      // Pequena pausa para não sobrecarregar APIs
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return results;
  }

  /**
   * Retorna status de todos os provedores
   */
  getProvidersStatus(): Array<{
    name: string;
    configured: boolean;
    priority: number;
  }> {
    return this.providers.map(provider => ({
      name: provider.name,
      configured: provider.isConfigured(),
      priority: provider.priority,
    }));
  }

  /**
   * Retorna estatísticas de uso
   */
  getStats(): {
    totalProviders: number;
    configuredProviders: number;
    providers: Array<{
      name: string;
      configured: boolean;
      priority: number;
    }>;
  } {
    const status = this.getProvidersStatus();

    return {
      totalProviders: this.providers.length,
      configuredProviders: status.filter(p => p.configured).length,
      providers: status,
    };
  }
}

export const translationManager = new TranslationManager();
