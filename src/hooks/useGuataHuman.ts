// Hook principal para o Guatá Human
// Integra todos os sistemas: persona, memória, feedback e sites oficiais

import { useState, useCallback, useRef } from 'react';
import { guataHumanService, GuataHumanQuery, GuataHumanResponse } from '@/services/ai/guataHumanService';

export interface GuataMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  confidence?: number;
  sources?: Array<{
    title: string;
    url?: string;
    type: string;
    reliability: string;
  }>;
  suggestions?: string[];
  followUpQuestions?: string[];
  metadata?: any;
}

export interface GuataSession {
  sessionId: string;
  messages: GuataMessage[];
  isLoading: boolean;
  error: string | null;
  stats: {
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    averageConfidence: number;
  };
}

export const useGuataHuman = (userId?: string) => {
  const [session, setSession] = useState<GuataSession>({
    sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    messages: [],
    isLoading: false,
    error: null,
    stats: {
      totalMessages: 0,
      userMessages: 0,
      assistantMessages: 0,
      averageConfidence: 0
    }
  });

  const sessionRef = useRef(session);

  // Atualizar referência da sessão
  const updateSession = useCallback((updates: Partial<GuataSession>) => {
    setSession(prev => {
      const newSession = { ...prev, ...updates };
      sessionRef.current = newSession;
      return newSession;
    });
  }, []);

  // Adicionar mensagem à sessão
  const addMessage = useCallback((message: Omit<GuataMessage, 'id' | 'timestamp'>) => {
    const newMessage: GuataMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    updateSession(prev => ({
      messages: [...prev.messages, newMessage],
      stats: {
        totalMessages: prev.messages.length + 1,
        userMessages: prev.messages.filter(m => m.isUser).length + (message.isUser ? 1 : 0),
        assistantMessages: prev.messages.filter(m => !m.isUser).length + (message.isUser ? 0 : 1),
        averageConfidence: message.confidence 
          ? (prev.stats.averageConfidence * (prev.messages.length) + message.confidence) / (prev.messages.length + 1)
          : prev.stats.averageConfidence
      }
    }));
  }, [updateSession]);

  // Enviar mensagem para o Guatá
  const sendMessage = useCallback(async (text: string, options?: {
    includeWeather?: boolean;
    includePlaces?: boolean;
    includeTransportation?: boolean;
  }) => {
    if (!text.trim()) return;

    try {
      // 1. Adicionar mensagem do usuário
      addMessage({
        text: text.trim(),
        isUser: true
      });

      // 2. Mostrar indicador de carregamento
      updateSession({ isLoading: true, error: null });

      // 3. Preparar query para o Guatá
      const query: GuataHumanQuery = {
        question: text.trim(),
        userId,
        sessionId: sessionRef.current.sessionId,
        context: {
          previousMessages: sessionRef.current.messages.slice(-5), // Últimas 5 mensagens
          userPreferences: null // Será preenchido pelo serviço
        },
        includeWeather: options?.includeWeather,
        includePlaces: options?.includePlaces,
        includeTransportation: options?.includeTransportation
      };

      // 4. Processar pergunta
      const response: GuataHumanResponse = await guataHumanService.processQuestion(query);

      // 5. Adicionar resposta do assistente
      addMessage({
        text: response.answer,
        isUser: false,
        confidence: response.confidence,
        sources: response.sources,
        suggestions: response.suggestions,
        followUpQuestions: response.followUpQuestions,
        metadata: response.metadata
      });

      // 6. Limpar estado de carregamento
      updateSession({ isLoading: false });

      console.log(`✅ Mensagem processada com sucesso. Confiança: ${response.confidence}`);

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      
      // Adicionar mensagem de erro
      addMessage({
        text: 'Desculpe, tive um problema técnico. Tente novamente em alguns instantes.',
        isUser: false,
        confidence: 0
      });

      updateSession({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  }, [userId, addMessage, updateSession]);

  // Registrar feedback do usuário
  const registerFeedback = useCallback((
    questionId: string,
    originalQuestion: string,
    originalAnswer: string,
    rating: 'positive' | 'negative' | 'neutral',
    comment?: string,
    correction?: string
  ) => {
    try {
      const feedbackId = guataHumanService.registerFeedback(
        sessionRef.current.sessionId,
        questionId,
        originalQuestion,
        originalAnswer,
        rating,
        comment,
        correction
      );

      console.log(`📊 Feedback registrado: ${feedbackId}`);
      return feedbackId;

    } catch (error) {
      console.error('❌ Erro ao registrar feedback:', error);
      return null;
    }
  }, []);

  // Limpar conversa
  const clearConversation = useCallback(() => {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    updateSession({
      sessionId: newSessionId,
      messages: [],
      error: null,
      stats: {
        totalMessages: 0,
        userMessages: 0,
        assistantMessages: 0,
        averageConfidence: 0
      }
    });

    console.log(`🧹 Conversa limpa. Nova sessão: ${newSessionId}`);
  }, [updateSession]);

  // Obter estatísticas do sistema
  const getSystemStats = useCallback(() => {
    try {
      return guataHumanService.getSystemStats();
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return null;
    }
  }, []);

  // Gerar relatório de aprendizado
  const generateLearningReport = useCallback(() => {
    try {
      return guataHumanService.generateLearningReport();
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      return null;
    }
  }, []);

  // Sugestões rápidas
  const quickSuggestions = [
    '🗺️ Quero um roteiro para Bonito',
    '🏨 Indique hotéis em Campo Grande',
    '🍽️ Restaurantes típicos de MS',
    '🚌 Como chegar no Pantanal?',
    '📅 Eventos em MS este mês',
    '💰 Preços de passeios em Bonito'
  ];

  // Usar sugestão rápida
  const useQuickSuggestion = useCallback((suggestion: string) => {
    sendMessage(suggestion);
  }, [sendMessage]);

  // Obter contexto da sessão
  const getSessionContext = useCallback(() => {
    const currentSession = sessionRef.current;
    
    return {
      sessionId: currentSession.sessionId,
      messageCount: currentSession.messages.length,
      lastUserMessage: currentSession.messages.filter(m => m.isUser).pop()?.text,
      userMood: currentSession.messages.length > 0 ? 'engaged' : 'new',
      averageConfidence: currentSession.stats.averageConfidence
    };
  }, []);

  // Verificar se a sessão está ativa
  const isSessionActive = useCallback(() => {
    const currentSession = sessionRef.current;
    const lastMessage = currentSession.messages[currentSession.messages.length - 1];
    
    if (!lastMessage) return false;
    
    // Sessão ativa se última mensagem foi há menos de 30 minutos
    const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
    return lastMessage.timestamp.getTime() > thirtyMinutesAgo;
  }, []);

  return {
    // Estado da sessão
    session,
    
    // Ações principais
    sendMessage,
    registerFeedback,
    clearConversation,
    
    // Estatísticas e relatórios
    getSystemStats,
    generateLearningReport,
    
    // Sugestões rápidas
    quickSuggestions,
    useQuickSuggestion,
    
    // Contexto e utilidades
    getSessionContext,
    isSessionActive,
    
    // Estado de carregamento
    isLoading: session.isLoading,
    error: session.error
  };
};
