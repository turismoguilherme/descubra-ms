/**
 * Route Translation Service
 * Serviço para buscar/criar traduções de roteiros
 */

import { supabase } from '@/integrations/supabase/client';
import { geminiTranslationService } from './GeminiTranslationService';
import type { LanguageCode } from '@/utils/translationHelpers';

export interface RouteTranslation {
  id: string;
  route_id: string;
  language_code: string;
  title: string | null;
  description: string | null;
}

export interface RouteData {
  id: string;
  title: string;
  description: string | null;
}

class RouteTranslationService {
  /**
   * Busca tradução de um roteiro
   */
  async getTranslation(
    routeId: string,
    languageCode: LanguageCode
  ): Promise<RouteTranslation | null> {
    try {
      const { data, error } = await supabase
        .from('route_translations')
        .select('*')
        .eq('route_id', routeId)
        .eq('language_code', languageCode)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar tradução:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Erro ao buscar tradução de roteiro:', error);
      return null;
    }
  }

  /**
   * Cria tradução para um roteiro (lazy translation)
   */
  async createTranslation(
    route: RouteData,
    targetLanguage: LanguageCode
  ): Promise<RouteTranslation | null> {
    try {
      const translatedFields: Partial<RouteTranslation> = {};

      if (route.title) {
        const result = await geminiTranslationService.translateText(
          route.title,
          { targetLanguage, context: 'Título de roteiro turístico' }
        );
        if (result.success) {
          translatedFields.title = result.translatedText;
        }
      }

      if (route.description) {
        const result = await geminiTranslationService.translateText(
          route.description,
          { targetLanguage, context: 'Descrição de roteiro turístico' }
        );
        if (result.success) {
          translatedFields.description = result.translatedText;
        }
      }

      const { data, error } = await supabase
        .from('route_translations')
        .insert({
          route_id: route.id,
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
      console.error('Erro ao criar tradução de roteiro:', error);
      return null;
    }
  }

  /**
   * Busca ou cria tradução (lazy translation)
   */
  async getOrCreateTranslation(
    route: RouteData,
    targetLanguage: LanguageCode
  ): Promise<RouteTranslation | null> {
    if (targetLanguage === 'pt-BR') {
      return null;
    }

    const existing = await this.getTranslation(route.id, targetLanguage);
    if (existing) {
      return existing;
    }

    return await this.createTranslation(route, targetLanguage);
  }
}

export const routeTranslationService = new RouteTranslationService();

