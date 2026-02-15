/**
 * Region Translation Service
 * Serviço para buscar/criar traduções de regiões turísticas
 */

import { supabase } from '@/integrations/supabase/client';
import { geminiTranslationService } from './GeminiTranslationService';
import type { LanguageCode } from '@/utils/translationHelpers';

export interface RegionTranslation {
  id: string;
  region_id: string;
  language_code: string;
  name: string | null;
  description: string | null;
  highlights: string[] | null;
}

export interface RegionData {
  id: string;
  name: string;
  description: string | null;
  highlights?: string[] | null;
}

class RegionTranslationService {
  /**
   * Busca tradução de uma região
   */
  async getTranslation(
    regionId: string,
    languageCode: LanguageCode
  ): Promise<RegionTranslation | null> {
    try {
      const { data, error } = await supabase
        .from('region_translations')
        .select('*')
        .eq('region_id', regionId)
        .eq('language_code', languageCode)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (normal se não existe tradução)
        console.error('Erro ao buscar tradução de região:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Erro ao buscar tradução de região:', error);
      return null;
    }
  }

  /**
   * Cria tradução para uma região (lazy translation)
   */
  async createTranslation(
    region: RegionData,
    targetLanguage: LanguageCode
  ): Promise<RegionTranslation | null> {
    try {
      // Traduzir campos usando Gemini
      const translatedFields: Partial<RegionTranslation> = {};

      if (region.name) {
        const result = await geminiTranslationService.translateText(
          region.name,
          { targetLanguage, context: 'Nome de região turística' }
        );
        if (result.success) {
          translatedFields.name = result.translatedText;
        }
      }

      if (region.description) {
        const result = await geminiTranslationService.translateText(
          region.description,
          { targetLanguage, context: 'Descrição de região turística' }
        );
        if (result.success) {
          translatedFields.description = result.translatedText;
        }
      }

      if (region.highlights && region.highlights.length > 0) {
        const translatedHighlights = await Promise.all(
          region.highlights.map((highlight) =>
            geminiTranslationService
              .translateText(highlight, {
                targetLanguage,
                context: 'Destaque de região turística',
              })
              .then((r) => (r.success ? r.translatedText : highlight))
          )
        );
        translatedFields.highlights = translatedHighlights;
      }

      // Salvar no banco
      const { data, error } = await supabase
        .from('region_translations')
        .insert({
          region_id: region.id,
          language_code: targetLanguage,
          ...translatedFields,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar tradução de região:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar tradução de região:', error);
      return null;
    }
  }

  /**
   * Busca ou cria tradução (lazy translation)
   */
  async getOrCreateTranslation(
    region: RegionData,
    targetLanguage: LanguageCode
  ): Promise<RegionTranslation | null> {
    // Se for português, não precisa traduzir
    if (targetLanguage === 'pt-BR') {
      return null;
    }

    // Buscar tradução existente
    const existing = await this.getTranslation(region.id, targetLanguage);
    if (existing) {
      return existing;
    }

    // Criar nova tradução
    return await this.createTranslation(region, targetLanguage);
  }

  /**
   * Busca múltiplas traduções de uma vez
   */
  async getTranslations(
    regionIds: string[],
    languageCode: LanguageCode
  ): Promise<Map<string, RegionTranslation>> {
    const translationMap = new Map<string, RegionTranslation>();

    try {
      const { data, error } = await supabase
        .from('region_translations')
        .select('*')
        .in('region_id', regionIds)
        .eq('language_code', languageCode);

      if (error) {
        console.error('Erro ao buscar traduções de regiões:', error);
        return translationMap;
      }

      (data || []).forEach((translation) => {
        translationMap.set(translation.region_id, translation);
      });
    } catch (error) {
      console.error('Erro ao buscar traduções de regiões:', error);
    }

    return translationMap;
  }
}

export const regionTranslationService = new RegionTranslationService();








