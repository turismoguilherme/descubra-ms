/**
 * 🦦 GUATÁ SUPABASE SERVICE - IA que usa Supabase Edge Functions
 * 
 * Funcionalidades:
 * - Acesso seguro ao Gemini via Supabase Edge Functions
 * - Busca web real via Supabase RAG
 * - Aprendizado contínuo baseado em interações
 * - Sistema de memória persistente no Supabase
 */

import { supabase } from "@/integrations/supabase/client";

export interface SupabaseQuery {
  question: string;
  userId?: string;
  sessionId?: string;
  userLocation?: string;
  conversationHistory?: string[];
  userPreferences?: any;
}

export interface SupabaseResponse {
  answer: string;
  confidence: number;
  sources: string[];
  processingTime: number;
  learningInsights: any;
  adaptiveImprovements: string[];
  memoryUpdates: any[];
}

class GuataSupabaseService {
  private readonly LEARNING_THRESHOLD = 0.7;
  
  /**
   * PROCESSAMENTO PRINCIPAL VIA SUPABASE
   */
  async processQuestion(query: SupabaseQuery): Promise<SupabaseResponse> {
    const startTime = Date.now();
    console.log('🦦 Guatá Supabase: Processando pergunta via Edge Functions...');
    
    try {
      // 1. CHAMAR SUPABASE EDGE FUNCTION PARA IA
      console.log('🧠 Chamando Supabase Edge Function para IA...');
      const { data: aiData, error: aiError } = await supabase.functions.invoke("guata-ai", {
        body: {
          question: query.question,
          userId: query.userId || 'convidado',
          sessionId: query.sessionId || `session-${Date.now()}`,
          userLocation: query.userLocation || 'Mato Grosso do Sul',
          conversationHistory: query.conversationHistory || [],
          userPreferences: query.userPreferences || {}
        }
      });
      
      if (aiError) {
        console.error('❌ Erro na Edge Function de IA:', aiError);
        throw aiError;
      }
      
      console.log('✅ Resposta da IA recebida:', aiData);
      
      // 2. CHAMAR SUPABASE EDGE FUNCTION PARA RAG
      console.log('🌐 Chamando Supabase Edge Function para RAG...');
      const { data: ragData, error: ragError } = await supabase.functions.invoke("guata-web-rag", {
        body: {
          question: query.question,
          state_code: 'MS',
          max_results: 5,
          include_sources: true
        }
      });
      
      if (ragError) {
        console.warn('⚠️ Erro na Edge Function de RAG:', ragError);
      }
      
      // 3. COMBINAR RESULTADOS
      const combinedResponse = this.combineResponses(aiData, ragData);
      
      const processingTime = Date.now() - startTime;
      
      return {
        answer: combinedResponse.answer,
        confidence: combinedResponse.confidence,
        sources: combinedResponse.sources,
        processingTime,
        learningInsights: combinedResponse.learningInsights || {},
        adaptiveImprovements: combinedResponse.adaptiveImprovements || [],
        memoryUpdates: combinedResponse.memoryUpdates || []
      };
      
    } catch (error) {
      console.error('❌ Erro no Guatá Supabase:', error);
      
      return {
        answer: "🦦 Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Como posso te ajudar hoje?",
        confidence: 0.6,
        sources: ['fallback'],
        processingTime: Date.now() - startTime,
        learningInsights: {
          questionType: 'error',
          userIntent: 'unknown',
          knowledgeGaps: ['technical_issue'],
          improvementSuggestions: ['Melhorar conectividade com Supabase'],
          contextRelevance: 0
        },
        adaptiveImprovements: ['Melhorar conectividade com Supabase'],
        memoryUpdates: []
      };
    }
  }

  /**
   * COMBINA RESPOSTAS DA IA E RAG
   */
  private combineResponses(aiData: any, ragData: any): any {
    // Se temos dados da IA, usar como base
    if (aiData && aiData.answer) {
      return {
        answer: aiData.answer,
        confidence: aiData.confidence || 0.9,
        sources: [
          ...(aiData.sources || []),
          ...(ragData?.sources?.map((s: any) => s.source || 'web') || [])
        ].filter((source, index, self) => self.indexOf(source) === index),
        learningInsights: aiData.learningInsights || {},
        adaptiveImprovements: aiData.adaptiveImprovements || [],
        memoryUpdates: aiData.memoryUpdates || []
      };
    }
    
    // Se não temos IA, usar RAG como fallback
    if (ragData && ragData.answer) {
      return {
        answer: ragData.answer,
        confidence: ragData.confidence || 0.8,
        sources: ragData.sources?.map((s: any) => s.source || 'web') || ['web'],
        learningInsights: {
          questionType: 'general',
          userIntent: 'information_seeking',
          knowledgeGaps: [],
          improvementSuggestions: ['Melhorar integração com IA'],
          contextRelevance: 0.7
        },
        adaptiveImprovements: ['Melhorar integração com IA'],
        memoryUpdates: []
      };
    }
    
    // Fallback final
    return {
      answer: "🦦 Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Como posso te ajudar hoje?",
      confidence: 0.6,
      sources: ['fallback'],
      learningInsights: {},
      adaptiveImprovements: [],
      memoryUpdates: []
    };
  }

  /**
   * SALVAR APRENDIZADO NO SUPABASE
   */
  async saveLearning(learningData: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('guata_learning')
        .insert({
          user_id: learningData.userId,
          session_id: learningData.sessionId,
          question: learningData.question,
          response: learningData.response,
          learning_insights: learningData.learningInsights,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.warn('⚠️ Erro ao salvar aprendizado:', error);
      } else {
        console.log('✅ Aprendizado salvo no Supabase');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao salvar aprendizado:', error);
    }
  }

  /**
   * BUSCAR HISTÓRICO DE APRENDIZADO
   */
  async getLearningHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('guata_learning')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.warn('⚠️ Erro ao buscar histórico:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.warn('⚠️ Erro ao buscar histórico:', error);
      return [];
    }
  }
}

// Exportar instância única
export const guataSupabaseService = new GuataSupabaseService();
export type { SupabaseQuery, SupabaseResponse };















