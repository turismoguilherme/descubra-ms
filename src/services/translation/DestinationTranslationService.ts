/**
 * Destination Translation Service
 * Serviço para buscar/criar traduções de destinos
 */

import { supabase } from '@/integrations/supabase/client';
import { geminiTranslationService } from './GeminiTranslationService';
import type { LanguageCode } from '@/utils/translationHelpers';

export interface DestinationTranslation {
  id: string;
  destination_id: string;
  language_code: string;
  name: string | null;
  description: string | null;
  promotional_text: string | null;
  highlights: string[] | null;
  how_to_get_there: string | null;
  best_time_to_visit: string | null;
}

export interface DestinationData {
  id: string;
  name: string;
  description: string | null;
  promotional_text?: string | null;
  highlights?: string[] | null;
  how_to_get_there?: string | null;
  best_time_to_visit?: string | null;
}

class DestinationTranslationService {
  /**
   * Busca tradução de um destino
   */
  async getTranslation(
    destinationId: string,
    languageCode: LanguageCode
  ): Promise<DestinationTranslation | null> {
    try {
      const { data, error } = await supabase
        .from('destination_translations')
        .select('*')
        .eq('destination_id', destinationId)
        .eq('language_code', languageCode)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (normal se não existe tradução)
        console.error('Erro ao buscar tradução:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Erro ao buscar tradução de destino:', error);
      return null;
    }
  }

  /**
   * Cria tradução para um destino (lazy translation)
   */
  async createTranslation(
    destination: DestinationData,
    targetLanguage: LanguageCode
  ): Promise<DestinationTranslation | null> {
    try {
      // Traduzir campos usando Gemini
      const translatedFields: Partial<DestinationTranslation> = {};

      if (destination.name) {
        const result = await geminiTranslationService.translateText(
          destination.name,
          { targetLanguage, context: 'Nome de destino turístico' }
        );
        if (result.success) {
          translatedFields.name = result.translatedText;
        }
      }

      if (destination.description) {
        const result = await geminiTranslationService.translateText(
          destination.description,
          { targetLanguage, context: 'Descrição de destino turístico' }
        );
        if (result.success) {
          translatedFields.description = result.translatedText;
        }
      }

      if (destination.promotional_text) {
        const result = await geminiTranslationService.translateText(
          destination.promotional_text,
          { targetLanguage, context: 'Texto promocional de destino turístico' }
        );
        if (result.success) {
          translatedFields.promotional_text = result.translatedText;
        }
      }

      if (destination.highlights && destination.highlights.length > 0) {
        const translatedHighlights = await Promise.all(
          destination.highlights.map((highlight) =>
            geminiTranslationService
              .translateText(highlight, {
                targetLanguage,
                context: 'Destaque de destino turístico',
              })
              .then((r) => (r.success ? r.translatedText : highlight))
          )
        );
        translatedFields.highlights = translatedHighlights;
      }

      if (destination.how_to_get_there) {
        const result = await geminiTranslationService.translateText(
          destination.how_to_get_there,
          { targetLanguage, context: 'Instruções de como chegar a destino turístico' }
        );
        if (result.success) {
          translatedFields.how_to_get_there = result.translatedText;
        }
      }

      if (destination.best_time_to_visit) {
        const result = await geminiTranslationService.translateText(
          destination.best_time_to_visit,
          { targetLanguage, context: 'Informações sobre melhor época para visitar destino' }
        );
        if (result.success) {
          translatedFields.best_time_to_visit = result.translatedText;
        }
      }

      // Salvar no banco
      const { data, error } = await supabase
        .from('destination_translations')
        .insert({
          destination_id: destination.id,
          language_code: targetLanguage,
          ...translatedFields,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar tradução:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar tradução de destino:', error);
      return null;
    }
  }

  /**
   * Busca ou cria tradução (lazy translation)
   */
  async getOrCreateTranslation(
    destination: DestinationData,
    targetLanguage: LanguageCode
  ): Promise<DestinationTranslation | null> {
    // Se for português, não precisa traduzir
    if (targetLanguage === 'pt-BR') {
      return null;
    }

    // Buscar tradução existente
    const existing = await this.getTranslation(destination.id, targetLanguage);
    if (existing) {
      return existing;
    }

    // Criar nova tradução
    return await this.createTranslation(destination, targetLanguage);
  }
}

export const destinationTranslationService = new DestinationTranslationService();
