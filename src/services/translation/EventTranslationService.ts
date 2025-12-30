/**
 * Event Translation Service
 * Serviço para buscar/criar traduções de eventos
 */

import { supabase } from '@/integrations/supabase/client';
import { geminiTranslationService } from './GeminiTranslationService';
import type { LanguageCode } from '@/utils/translationHelpers';

export interface EventTranslation {
  id: string;
  event_id: string;
  language_code: string;
  name: string | null;
  description: string | null;
  location: string | null;
  category: string | null;
}

export interface EventData {
  id: string;
  name: string;
  description: string | null;
  location?: string | null;
  category?: string | null;
}

class EventTranslationService {
  /**
   * Busca tradução de um evento
   */
  async getTranslation(
    eventId: string,
    languageCode: LanguageCode
  ): Promise<EventTranslation | null> {
    try {
      const { data, error } = await supabase
        .from('event_translations')
        .select('*')
        .eq('event_id', eventId)
        .eq('language_code', languageCode)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar tradução:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Erro ao buscar tradução de evento:', error);
      return null;
    }
  }

  /**
   * Cria tradução para um evento (lazy translation)
   */
  async createTranslation(
    event: EventData,
    targetLanguage: LanguageCode
  ): Promise<EventTranslation | null> {
    try {
      const translatedFields: Partial<EventTranslation> = {};

      if (event.name) {
        const result = await geminiTranslationService.translateText(
          event.name,
          { targetLanguage, context: 'Nome de evento turístico' }
        );
        if (result.success) {
          translatedFields.name = result.translatedText;
        }
      }

      if (event.description) {
        const result = await geminiTranslationService.translateText(
          event.description,
          { targetLanguage, context: 'Descrição de evento turístico' }
        );
        if (result.success) {
          translatedFields.description = result.translatedText;
        }
      }

      if (event.location) {
        const result = await geminiTranslationService.translateText(
          event.location,
          { targetLanguage, context: 'Localização de evento' }
        );
        if (result.success) {
          translatedFields.location = result.translatedText;
        }
      }

      if (event.category) {
        const result = await geminiTranslationService.translateText(
          event.category,
          { targetLanguage, context: 'Categoria de evento' }
        );
        if (result.success) {
          translatedFields.category = result.translatedText;
        }
      }

      const { data, error } = await supabase
        .from('event_translations')
        .insert({
          event_id: event.id,
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
      console.error('Erro ao criar tradução de evento:', error);
      return null;
    }
  }

  /**
   * Busca ou cria tradução (lazy translation)
   */
  async getOrCreateTranslation(
    event: EventData,
    targetLanguage: LanguageCode
  ): Promise<EventTranslation | null> {
    if (targetLanguage === 'pt-BR') {
      return null;
    }

    const existing = await this.getTranslation(event.id, targetLanguage);
    if (existing) {
      return existing;
    }

    return await this.createTranslation(event, targetLanguage);
  }
}

export const eventTranslationService = new EventTranslationService();

