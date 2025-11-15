/**
 * AI Conversation Service
 * Serviço para gerenciar conversas com IA nos CATs
 */

import { supabase } from '@/integrations/supabase/client';

export interface AIConversation {
  id: string;
  attendant_id: string | null;
  cat_id: string | null;
  tourist_id: string | null;
  session_id: string;
  question: string;
  answer: string;
  category: string | null;
  context: {
    [key: string]: any;
  } | null;
  confidence_score: number | null;
  sources: {
    title?: string;
    url?: string;
    relevance?: number;
  }[] | null;
  was_helpful: boolean | null;
  feedback: string | null;
  language: string;
  created_at: string;
}

export class AIConversationService {
  /**
   * Salvar conversa no Supabase
   */
  async saveConversation(
    data: {
      attendant_id?: string;
      cat_id?: string;
      tourist_id?: string;
      session_id: string;
      question: string;
      answer: string;
      category?: string;
      context?: AIConversation['context'];
      confidence_score?: number;
      sources?: AIConversation['sources'];
      language?: string;
    }
  ): Promise<AIConversation> {
    try {
      const { data: conversation, error } = await supabase
        .from('cat_ai_conversations')
        .insert({
          ...data,
          language: data.language || 'pt-BR'
        })
        .select()
        .single();

      if (error) throw error;
      return conversation as AIConversation;
    } catch (error) {
      console.error('Erro ao salvar conversa:', error);
      throw error;
    }
  }

  /**
   * Buscar histórico de conversas
   */
  async getConversations(filters?: {
    attendant_id?: string;
    cat_id?: string;
    tourist_id?: string;
    session_id?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
  }): Promise<AIConversation[]> {
    try {
      let query = supabase
        .from('cat_ai_conversations')
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

      if (filters?.session_id) {
        query = query.eq('session_id', filters.session_id);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as AIConversation[];
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      return [];
    }
  }

  /**
   * Buscar conversas de uma sessão específica
   */
  async getSessionConversations(sessionId: string): Promise<AIConversation[]> {
    try {
      const { data, error } = await supabase
        .from('cat_ai_conversations')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as AIConversation[];
    } catch (error) {
      console.error('Erro ao buscar conversas da sessão:', error);
      return [];
    }
  }

  /**
   * Adicionar feedback à conversa
   */
  async addFeedback(
    id: string,
    wasHelpful: boolean,
    feedback?: string
  ): Promise<AIConversation> {
    try {
      const { data, error } = await supabase
        .from('cat_ai_conversations')
        .update({
          was_helpful: wasHelpful,
          feedback: feedback || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as AIConversation;
    } catch (error) {
      console.error('Erro ao adicionar feedback:', error);
      throw error;
    }
  }

  /**
   * Buscar estatísticas de uso da IA
   */
  async getConversationStats(filters?: {
    attendant_id?: string;
    cat_id?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byCategory: { [key: string]: number };
    averageConfidence: number;
    helpfulRate: number;
    byDate: { [key: string]: number };
  }> {
    try {
      const conversations = await this.getConversations(filters);

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const todayConversations = conversations.filter(c => 
        c.created_at.startsWith(today)
      );
      const weekConversations = conversations.filter(c => 
        new Date(c.created_at) >= weekAgo
      );
      const monthConversations = conversations.filter(c => 
        new Date(c.created_at) >= monthAgo
      );

      const byCategory: { [key: string]: number } = {};
      conversations.forEach(c => {
        const category = c.category || 'outros';
        byCategory[category] = (byCategory[category] || 0) + 1;
      });

      const conversationsWithConfidence = conversations.filter(c => c.confidence_score !== null);
      const averageConfidence = conversationsWithConfidence.length > 0
        ? conversationsWithConfidence.reduce((sum, c) => sum + (c.confidence_score || 0), 0) / conversationsWithConfidence.length
        : 0;

      const feedbackConversations = conversations.filter(c => c.was_helpful !== null);
      const helpfulCount = feedbackConversations.filter(c => c.was_helpful === true).length;
      const helpfulRate = feedbackConversations.length > 0
        ? (helpfulCount / feedbackConversations.length) * 100
        : 0;

      const byDate: { [key: string]: number } = {};
      conversations.forEach(c => {
        const date = c.created_at.split('T')[0];
        byDate[date] = (byDate[date] || 0) + 1;
      });

      return {
        total: conversations.length,
        today: todayConversations.length,
        thisWeek: weekConversations.length,
        thisMonth: monthConversations.length,
        byCategory,
        averageConfidence: Math.round(averageConfidence * 100) / 100,
        helpfulRate: Math.round(helpfulRate * 100) / 100,
        byDate
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de conversas:', error);
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        byCategory: {},
        averageConfidence: 0,
        helpfulRate: 0,
        byDate: {}
      };
    }
  }
}

export const aiConversationService = new AIConversationService();


