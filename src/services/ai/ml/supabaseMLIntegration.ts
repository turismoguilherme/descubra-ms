/**
 * 💾 SUPABASE ML INTEGRATION
 * Integração com Supabase para persistir dados de aprendizado
 */

import { supabase } from '@/integrations/supabase/client';
import { LearningInteraction, FeedbackData } from './guataMLService';
import { UserPreferences } from './preferenceLearningService';

export class SupabaseMLIntegration {
  /**
   * Salva interação no Supabase
   */
  async saveInteraction(interaction: LearningInteraction): Promise<void> {
    try {
      // Salvar na tabela guata_user_memory como learning_data
      const { error } = await supabase
        .from('guata_user_memory')
        .insert({
          user_id: interaction.userId || null,
          session_id: interaction.sessionId,
          memory_type: 'learning_data',
          memory_key: `interaction-${Date.now()}`,
          memory_value: {
            question: interaction.question,
            answer: interaction.answer,
            sources: interaction.sources,
            confidence: interaction.confidence,
            metadata: interaction.metadata
          },
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 ano
        });

      if (error) {
        console.warn('⚠️ Erro ao salvar interação no Supabase:', error);
      } else {
        console.log('✅ Interação salva no Supabase');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao salvar interação:', error);
    }
  }

  /**
   * Salva feedback no Supabase
   */
  async saveFeedback(feedback: FeedbackData): Promise<void> {
    try {
      const { error } = await supabase
        .from('guata_feedback')
        .insert({
          session_id: feedback.sessionId,
          user_id: feedback.userId || null,
          question_id: feedback.questionId,
          original_question: feedback.question,
          original_answer: feedback.answer,
          rating: feedback.rating,
          comment: feedback.comment || null,
          correction: feedback.correction || null,
          learning_patterns: {
            hasCorrection: !!feedback.correction,
            correctionLength: feedback.correction?.length || 0
          },
          applied_corrections: {}
        });

      if (error) {
        console.warn('⚠️ Erro ao salvar feedback no Supabase:', error);
      } else {
        console.log('✅ Feedback salvo no Supabase');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao salvar feedback:', error);
    }
  }

  /**
   * Obtém preferências do usuário do Supabase
   */
  async getUserPreferences(userId?: string, sessionId?: string): Promise<UserPreferences | null> {
    try {
      let query = supabase
        .from('guata_user_memory')
        .select('*')
        .eq('memory_type', 'user_preferences')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (sessionId) {
        query = query.eq('session_id', sessionId);
      } else {
        return null;
      }

      const { data, error } = await query;

      if (error) {
        console.warn('⚠️ Erro ao buscar preferências:', error);
        return null;
      }

      if (data && data.length > 0) {
        return data[0].memory_value as UserPreferences;
      }

      return null;
    } catch (error) {
      console.warn('⚠️ Erro ao buscar preferências:', error);
      return null;
    }
  }

  /**
   * Salva preferências do usuário no Supabase
   */
  async saveUserPreferences(
    userId: string | undefined,
    sessionId: string,
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    try {
      // Buscar preferências existentes
      const existing = await this.getUserPreferences(userId, sessionId);
      
      // Mesclar com preferências existentes
      const mergedPreferences: UserPreferences = {
        preferred_destinations: [],
        interests: [],
        accessibility_needs: [],
        ...existing,
        ...preferences,
        // Mesclar arrays
        preferred_destinations: [
          ...(existing?.preferred_destinations || []),
          ...(preferences.preferred_destinations || [])
        ].filter((v, i, a) => a.indexOf(v) === i), // Remover duplicatas
        interests: [
          ...(existing?.interests || []),
          ...(preferences.interests || [])
        ].filter((v, i, a) => a.indexOf(v) === i),
        accessibility_needs: [
          ...(existing?.accessibility_needs || []),
          ...(preferences.accessibility_needs || [])
        ].filter((v, i, a) => a.indexOf(v) === i)
      };

      const { error } = await supabase
        .from('guata_user_memory')
        .upsert({
          user_id: userId || null,
          session_id: sessionId,
          memory_type: 'user_preferences',
          memory_key: 'main_preferences',
          memory_value: mergedPreferences,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 ano
        }, {
          onConflict: 'user_id,session_id,memory_type,memory_key'
        });

      if (error) {
        console.warn('⚠️ Erro ao salvar preferências:', error);
      } else {
        console.log('✅ Preferências salvas no Supabase');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao salvar preferências:', error);
    }
  }

  /**
   * Obtém histórico de feedback
   */
  async getFeedbackHistory(userId?: string, sessionId?: string, limit: number = 10): Promise<FeedbackData[]> {
    try {
      let query = supabase
        .from('guata_feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('⚠️ Erro ao buscar histórico de feedback:', error);
        return [];
      }

      if (!data) return [];

      return data.map(item => ({
        userId: item.user_id,
        sessionId: item.session_id,
        questionId: item.question_id,
        question: item.original_question,
        answer: item.original_answer,
        rating: item.rating as 'positive' | 'negative' | 'neutral',
        comment: item.comment || undefined,
        correction: item.correction || undefined
      }));
    } catch (error) {
      console.warn('⚠️ Erro ao buscar histórico de feedback:', error);
      return [];
    }
  }

  /**
   * Obtém padrões frequentes do Supabase
   */
  async getFrequentPatterns(limit: number = 10): Promise<any[]> {
    try {
      // Buscar padrões de conversas anteriores
      const { data, error } = await supabase
        .from('guata_user_memory')
        .select('memory_value')
        .eq('memory_type', 'learning_data')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.warn('⚠️ Erro ao buscar padrões:', error);
        return [];
      }

      if (!data) return [];

      // Extrair perguntas e contar frequência
      const questionCounts = new Map<string, number>();
      
      for (const item of data) {
        const question = item.memory_value?.question;
        if (question) {
          const normalized = question.toLowerCase().trim();
          questionCounts.set(normalized, (questionCounts.get(normalized) || 0) + 1);
        }
      }

      // Retornar perguntas mais frequentes
      return Array.from(questionCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([question, frequency]) => ({
          question,
          frequency
        }));
    } catch (error) {
      console.warn('⚠️ Erro ao buscar padrões frequentes:', error);
      return [];
    }
  }
}


