/**
 * Hook para tradução automática de conteúdo
 * Gera traduções automaticamente quando conteúdo é salvo
 */

import { useCallback } from 'react';
import { translationManager } from '@/services/translation/TranslationManager';
import { autoTranslationGenerator } from '@/services/translation/AutoTranslationGenerator';
import type { LanguageCode } from '@/utils/translationHelpers';

export interface AutoTranslationOptions {
  enabled?: boolean;
  languages?: LanguageCode[];
  delay?: number; // ms to wait before starting translation
}

export const useAutoTranslation = (options: AutoTranslationOptions = {}) => {
  const {
    enabled = true,
    languages = ['en-US', 'es-ES', 'fr-FR', 'de-DE'],
    delay = 1000
  } = options;

  /**
   * Gera traduções automaticamente para um conteúdo recém-salvo
   */
  const generateTranslationsForContent = useCallback(async (
    contentKey: string,
    contentValue: string,
    platform: string = 'descubra-ms'
  ) => {
    if (!enabled || !contentValue || contentValue.trim() === '') {
      return;
    }

    console.log(`🚀 [AutoTranslation] Iniciando tradução automática para: ${contentKey}`);

    // Aguardar um pouco antes de começar (para não interferir na UI)
    setTimeout(async () => {
      try {
        const result = await autoTranslationGenerator.generateTranslationsForContent(
          contentKey,
          languages
        );

        const successfulTranslations = result.results.filter(r => r.success).length;
        const failedTranslations = result.results.filter(r => !r.success).length;

        if (successfulTranslations > 0) {
          console.log(`✅ [AutoTranslation] ${successfulTranslations} traduções geradas para ${contentKey}`);
        }

        if (failedTranslations > 0) {
          console.warn(`⚠️ [AutoTranslation] ${failedTranslations} traduções falharam para ${contentKey}`);
        }

      } catch (error) {
        console.error(`❌ [AutoTranslation] Erro ao gerar traduções para ${contentKey}:`, error);
      }
    }, delay);

  }, [enabled, languages, delay]);

  /**
   * Verifica se um conteúdo precisa de tradução
   */
  const checkContentNeedsTranslation = useCallback(async (
    contentKey: string,
    targetLanguages: LanguageCode[] = languages
  ): Promise<LanguageCode[]> => {
    // Esta função pode ser usada para verificar quais idiomas ainda precisam de tradução
    // Implementação pode ser feita depois se necessário
    return targetLanguages;
  }, [languages]);

  /**
   * Força geração de traduções para um conteúdo específico
   */
  const forceGenerateTranslations = useCallback(async (
    contentKey: string,
    contentValue: string
  ) => {
    if (!contentValue || contentValue.trim() === '') {
      console.warn('⚠️ [AutoTranslation] Conteúdo vazio, pulando tradução');
      return;
    }

    console.log(`🔄 [AutoTranslation] Forçando geração de traduções para: ${contentKey}`);

    try {
      await generateTranslationsForContent(contentKey, contentValue);
    } catch (error) {
      console.error(`❌ [AutoTranslation] Erro ao forçar tradução para ${contentKey}:`, error);
    }
  }, [generateTranslationsForContent]);

  return {
    generateTranslationsForContent,
    checkContentNeedsTranslation,
    forceGenerateTranslations,
    isEnabled: enabled,
    targetLanguages: languages
  };
};

export default useAutoTranslation;
