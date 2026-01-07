/**
 * Auto Translation Generator
 * Gera traduções automaticamente para todo conteúdo sem tradução
 */

import { supabase } from '@/integrations/supabase/client';
import { translationManager } from './TranslationManager';
import type { LanguageCode } from '@/utils/translationHelpers';

const TARGET_LANGUAGES: LanguageCode[] = ['en-US', 'es-ES', 'fr-FR', 'de-DE'];

export class AutoTranslationGenerator {
  /**
   * Gera traduções para todo conteúdo que não tem tradução
   */
  async generateAllMissingTranslations(): Promise<{
    processed: number;
    translated: number;
    errors: number;
    details: Array<{
      contentKey: string;
      language: LanguageCode;
      success: boolean;
      error?: string;
    }>;
  }> {
    console.log('🚀 [AutoTranslation] Iniciando geração automática de traduções...');

    const results = {
      processed: 0,
      translated: 0,
      errors: 0,
      details: [] as Array<{
        contentKey: string;
        language: LanguageCode;
        success: boolean;
        error?: string;
      }>
    };

    try {
      // Buscar todo conteúdo editável
      const { data: contents, error } = await supabase
        .from('institutional_content')
        .select('id, content_key, content_value')
        .not('content_value', 'is', null)
        .neq('content_value', '');

      if (error) {
        throw error;
      }

      if (!contents || contents.length === 0) {
        console.log('ℹ️ [AutoTranslation] Nenhum conteúdo encontrado');
        return results;
      }

      console.log(`📋 [AutoTranslation] Encontrados ${contents.length} itens de conteúdo`);

      // Para cada conteúdo, verificar traduções faltantes
      for (const content of contents) {
        if (!content.content_value || content.content_value.trim() === '') {
          continue;
        }

        console.log(`🔍 [AutoTranslation] Verificando traduções para: ${content.content_key}`);

        // Verificar quais idiomas não têm tradução
        for (const targetLang of TARGET_LANGUAGES) {
          results.processed++;

          try {
            // Verificar se já existe tradução
            const { data: existingTranslation } = await supabase
              .from('content_translations')
              .select('id')
              .eq('content_key', content.content_key)
              .eq('language_code', targetLang)
              .single();

            if (existingTranslation) {
              console.log(`⏭️ [AutoTranslation] Tradução já existe: ${content.content_key} → ${targetLang}`);
              continue;
            }

            // Gerar tradução
            console.log(`🔄 [AutoTranslation] Gerando tradução: ${content.content_key} → ${targetLang}`);

            const translationResult = await translationManager.translateText(
              content.content_value,
              {
                targetLanguage: targetLang,
                sourceLanguage: 'pt-BR',
                context: `Conteúdo institucional: ${content.content_key}`
              }
            );

            if (translationResult.success && translationResult.translatedText !== content.content_value) {
              // Salvar tradução
              const { error: saveError } = await supabase
                .from('content_translations')
                .insert({
                  content_key: content.content_key,
                  platform: 'descubra-ms', // ou detectar automaticamente
                  section: 'auto-generated',
                  language_code: targetLang,
                  content: {
                    content_value: translationResult.translatedText
                  }
                });

              if (saveError) {
                throw saveError;
              }

              results.translated++;
              results.details.push({
                contentKey: content.content_key,
                language: targetLang,
                success: true
              });

              console.log(`✅ [AutoTranslation] Tradução salva: ${content.content_key} → ${targetLang}`);

            } else {
              results.errors++;
              results.details.push({
                contentKey: content.content_key,
                language: targetLang,
                success: false,
                error: translationResult.error || 'Falha na tradução'
              });

              console.warn(`⚠️ [AutoTranslation] Falha na tradução: ${content.content_key} → ${targetLang}`);
            }

            // Pequena pausa para não sobrecarregar APIs
            await new Promise(resolve => setTimeout(resolve, 200));

          } catch (error) {
            results.errors++;
            results.details.push({
              contentKey: content.content_key,
              language: targetLang,
              success: false,
              error: error instanceof Error ? error.message : 'Erro desconhecido'
            });

            console.error(`❌ [AutoTranslation] Erro ao processar ${content.content_key} → ${targetLang}:`, error);
          }
        }
      }

    } catch (error) {
      console.error('❌ [AutoTranslation] Erro geral:', error);
    }

    console.log(`📊 [AutoTranslation] Finalizado:
      - Processados: ${results.processed}
      - Traduzidos: ${results.translated}
      - Erros: ${results.errors}
    `);

    return results;
  }

  /**
   * Gera traduções para um conteúdo específico
   */
  async generateTranslationsForContent(
    contentKey: string,
    languages: LanguageCode[] = TARGET_LANGUAGES
  ): Promise<{
    contentKey: string;
    results: Array<{
      language: LanguageCode;
      success: boolean;
      error?: string;
    }>;
  }> {
    console.log(`🔄 [AutoTranslation] Gerando traduções para: ${contentKey}`);

    const results = [];

    try {
      // Buscar conteúdo original
      const { data: content, error } = await supabase
        .from('institutional_content')
        .select('content_value')
        .eq('content_key', contentKey)
        .single();

      if (error || !content?.content_value) {
        throw new Error('Conteúdo não encontrado');
      }

      // Gerar traduções para cada idioma
      for (const targetLang of languages) {
        try {
          const translationResult = await translationManager.translateText(
            content.content_value,
            {
              targetLanguage: targetLang,
              sourceLanguage: 'pt-BR',
              context: `Conteúdo específico: ${contentKey}`
            }
          );

          if (translationResult.success) {
            // Salvar tradução
            const { error: saveError } = await supabase
              .from('content_translations')
              .upsert({
                content_key: contentKey,
                platform: 'descubra-ms',
                section: 'manual-translation',
                language_code: targetLang,
                content: {
                  content_value: translationResult.translatedText
                }
              });

            if (saveError) {
              throw saveError;
            }

            results.push({
              language: targetLang,
              success: true
            });

            console.log(`✅ [AutoTranslation] Tradução salva: ${contentKey} → ${targetLang}`);

          } else {
            results.push({
              language: targetLang,
              success: false,
              error: translationResult.error
            });
          }

        } catch (error) {
          results.push({
            language: targetLang,
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }

        // Pausa entre traduções
        await new Promise(resolve => setTimeout(resolve, 200));
      }

    } catch (error) {
      console.error(`❌ [AutoTranslation] Erro ao processar ${contentKey}:`, error);
    }

    return {
      contentKey,
      results
    };
  }
}

export const autoTranslationGenerator = new AutoTranslationGenerator();
