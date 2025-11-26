/**
 * Translation Service
 * Serviço para gerenciar traduções realizadas nos CATs
 */

import { supabase } from '@/integrations/supabase/client';

export interface Translation {
  id: string;
  attendant_id: string | null;
  cat_id: string | null;
  tourist_id: string | null;
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  context: string | null;
  category: string | null;
  confidence_score: number | null;
  translation_provider: 'google' | 'mock';
  was_accurate: boolean | null;
  feedback: string | null;
  created_at: string;
}

export class TranslationService {
  /**
   * Salvar tradução realizada
   */
  async saveTranslation(
    data: {
      attendant_id?: string;
      cat_id?: string;
      tourist_id?: string;
      original_text: string;
      translated_text: string;
      source_language: string;
      target_language: string;
      context?: string;
      category?: string;
      confidence_score?: number;
      translation_provider?: 'google' | 'mock';
    }
  ): Promise<Translation> {
    try {
      const { data: translation, error } = await supabase
        .from('cat_translations')
        .insert({
          ...data,
          translation_provider: data.translation_provider || 'mock'
        })
        .select()
        .single();

      if (error) throw error;
      return translation as Translation;
    } catch (error) {
      console.error('Erro ao salvar tradução:', error);
      throw error;
    }
  }

  /**
   * Buscar histórico de traduções
   */
  async getTranslations(filters?: {
    attendant_id?: string;
    cat_id?: string;
    tourist_id?: string;
    startDate?: string;
    endDate?: string;
    source_language?: string;
    target_language?: string;
  }): Promise<Translation[]> {
    try {
      let query = supabase
        .from('cat_translations')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.attendant_id) {
        query = query.eq('attendant_id', filters.attendant_id);
      }

      if (filters?.cat_id) {
        query = query.eq('cat_id', filters.cat_id);
      }

      if (filters?.tourist_id) {
        query = query.eq('tourist_id', filters.tourist_id);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters?.source_language) {
        query = query.eq('source_language', filters.source_language);
      }

      if (filters?.target_language) {
        query = query.eq('target_language', filters.target_language);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as Translation[];
    } catch (error) {
      console.error('Erro ao buscar traduções:', error);
      return [];
    }
  }

  /**
   * Traduzir texto (mockado, preparado para Google Translate)
   */
  async translateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<{
    original_text: string;
    translated_text: string;
    source_language: string;
    target_language: string;
    confidence_score: number;
  }> {
    try {
      // Por enquanto retorna tradução mockada
      // TODO: Integrar com Google Translate API quando disponível
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock de tradução (apenas exemplo)
      const mockTranslations: { [key: string]: string } = {
        'hello': 'olá',
        'thank you': 'obrigado',
        'where is': 'onde fica',
        'how much': 'quanto custa'
      };

      const lowerText = text.toLowerCase();
      const translatedText = mockTranslations[lowerText] || `[Traduzido: ${text}]`;

      return {
        original_text: text,
        translated_text: translatedText,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        confidence_score: mockTranslations[lowerText] ? 0.95 : 0.70
      };
    } catch (error) {
      console.error('Erro ao traduzir texto:', error);
      throw error;
    }
  }

  /**
   * Adicionar feedback à tradução
   */
  async addFeedback(
    id: string,
    wasAccurate: boolean,
    feedback?: string
  ): Promise<Translation> {
    try {
      const { data, error } = await supabase
        .from('cat_translations')
        .update({
          was_accurate: wasAccurate,
          feedback: feedback || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Translation;
    } catch (error) {
      console.error('Erro ao adicionar feedback:', error);
      throw error;
    }
  }

  /**
   * Buscar estatísticas de traduções
   */
  async getTranslationStats(filters?: {
    attendant_id?: string;
    cat_id?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byLanguage: { [key: string]: number };
    averageConfidence: number;
    accuracyRate: number;
  }> {
    try {
      const translations = await this.getTranslations(filters);

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const todayTranslations = translations.filter(t => 
        t.created_at.startsWith(today)
      );
      const weekTranslations = translations.filter(t => 
        new Date(t.created_at) >= weekAgo
      );
      const monthTranslations = translations.filter(t => 
        new Date(t.created_at) >= monthAgo
      );

      const byLanguage: { [key: string]: number } = {};
      translations.forEach(t => {
        const langPair = `${t.source_language} → ${t.target_language}`;
        byLanguage[langPair] = (byLanguage[langPair] || 0) + 1;
      });

      const translationsWithConfidence = translations.filter(t => t.confidence_score !== null);
      const averageConfidence = translationsWithConfidence.length > 0
        ? translationsWithConfidence.reduce((sum, t) => sum + (t.confidence_score || 0), 0) / translationsWithConfidence.length
        : 0;

      const feedbackTranslations = translations.filter(t => t.was_accurate !== null);
      const accurateCount = feedbackTranslations.filter(t => t.was_accurate === true).length;
      const accuracyRate = feedbackTranslations.length > 0
        ? (accurateCount / feedbackTranslations.length) * 100
        : 0;

      return {
        total: translations.length,
        today: todayTranslations.length,
        thisWeek: weekTranslations.length,
        thisMonth: monthTranslations.length,
        byLanguage,
        averageConfidence: Math.round(averageConfidence * 100) / 100,
        accuracyRate: Math.round(accuracyRate * 100) / 100
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de traduções:', error);
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        byLanguage: {},
        averageConfidence: 0,
        accuracyRate: 0
      };
    }
  }
}

export const translationService = new TranslationService();














