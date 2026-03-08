// @ts-nocheck
/**
 * 🧠 GUATÁ MACHINE LEARNING SERVICE
 * Serviço principal que coordena todo aprendizado do Guatá
 * Integra aprendizado de preferências, qualidade e padrões
 */

import { PreferenceLearningService } from './preferenceLearningService';
import { QualityLearningService } from './qualityLearningService';
import { PatternDetectionService } from './patternDetectionService';
import { SupabaseMLIntegration } from './supabaseMLIntegration';
import { MLCacheService } from './mlCacheService';

export interface LearningInteraction {
  userId?: string;
  sessionId: string;
  question: string;
  answer: string;
  sources: string[];
  confidence: number;
  timestamp: Date;
  metadata?: {
    queryType?: 'tourism' | 'hotel' | 'restaurant' | 'attraction' | 'event' | 'transport' | 'other';
    location?: string;
    conversationHistory?: string[];
  };
}

export interface FeedbackData {
  userId?: string;
  sessionId: string;
  questionId: string;
  question: string;
  answer: string;
  rating: 'positive' | 'negative' | 'neutral';
  comment?: string;
  correction?: string;
}

export interface LearningMetrics {
  totalInteractions: number;
  preferencesLearned: number;
  patternsDetected: number;
  qualityImprovements: number;
  feedbackReceived: number;
}

class GuataMLService {
  private preferenceLearning: PreferenceLearningService;
  private qualityLearning: QualityLearningService;
  private patternDetection: PatternDetectionService;
  private supabaseIntegration: SupabaseMLIntegration;
  private cacheService: MLCacheService;
  
  private metrics: LearningMetrics = {
    totalInteractions: 0,
    preferencesLearned: 0,
    patternsDetected: 0,
    qualityImprovements: 0,
    feedbackReceived: 0
  };

  constructor() {
    this.preferenceLearning = new PreferenceLearningService();
    this.qualityLearning = new QualityLearningService();
    this.patternDetection = new PatternDetectionService();
    this.supabaseIntegration = new SupabaseMLIntegration();
    this.cacheService = new MLCacheService();
    
    // Guatá ML Service inicializado (log removido)
  }

  /**
   * Aprende automaticamente de cada interação
   */
  async learnFromInteraction(interaction: LearningInteraction): Promise<void> {
    try {
      this.metrics.totalInteractions++;

      // 1. Aprender preferências do usuário
      const preferencesLearned = await this.preferenceLearning.learnFromInteraction(interaction);
      if (preferencesLearned) {
        this.metrics.preferencesLearned++;
        
        // Salvar preferências no Supabase
        const extractedPreferences = this.preferenceLearning.extractPreferences(interaction);
        if (Object.keys(extractedPreferences).length > 0) {
          await this.supabaseIntegration.saveUserPreferences(
            interaction.userId,
            interaction.sessionId,
            extractedPreferences
          );
        }
      }

      // 2. Detectar padrões de perguntas
      const patternDetected = await this.patternDetection.detectPattern(interaction);
      if (patternDetected) {
        this.metrics.patternsDetected++;
      }

      // 3. Salvar no Supabase (assíncrono, não bloqueia)
      this.supabaseIntegration.saveInteraction(interaction).catch(() => {
        // Erro silencioso - não crítico
      });
    } catch (error) {
      // Erro silencioso - não crítico para o funcionamento
    }
  }

  /**
   * Aprende de feedback explícito do usuário
   */
  async learnFromFeedback(feedback: FeedbackData): Promise<void> {
    try {
      this.metrics.feedbackReceived++;

      // 1. Aprender melhorias de qualidade
      const qualityImproved = await this.qualityLearning.learnFromFeedback(feedback);
      if (qualityImproved) {
        this.metrics.qualityImprovements++;
        // Qualidade melhorada (log removido)
      }

      // 2. Atualizar padrões se houver correção
      if (feedback.correction) {
        await this.patternDetection.updatePatternWithCorrection(
          feedback.question,
          feedback.answer,
          feedback.correction
        );
      }

      // 3. Salvar feedback no Supabase
      await this.supabaseIntegration.saveFeedback(feedback);

      // 4. Invalidar cache relevante
      this.cacheService.invalidateUserCache(feedback.userId || feedback.sessionId);

      // Aprendizado de feedback concluído (log removido)
    } catch (error) {
      // Erro silencioso
    }
  }

  /**
   * Obtém preferências do usuário (com cache)
   */
  async getUserPreferences(userId?: string, sessionId?: string): Promise<any> {
    try {
      // Tentar cache primeiro
      const cacheKey = userId || sessionId || 'anonymous';
      const cached = this.cacheService.getUserPreferences(cacheKey);
      if (cached) {
        return cached;
      }

      // Buscar do Supabase
      const preferences = await this.supabaseIntegration.getUserPreferences(userId, sessionId);
      
      // Salvar no cache
      if (preferences) {
        this.cacheService.setUserPreferences(cacheKey, preferences);
      }

      return preferences;
    } catch (error) {
      console.error('❌ ML: Erro ao obter preferências:', error);
      return null;
    }
  }

  /**
   * Obtém melhorias de qualidade aplicáveis
   */
  async getQualityImprovements(question: string): Promise<any[]> {
    try {
      // Tentar cache primeiro
      const cached = this.cacheService.getQualityImprovements(question);
      if (cached) {
        return cached;
      }

      // Buscar do serviço de qualidade
      const improvements = await this.qualityLearning.getImprovementsForQuestion(question);
      
      // Salvar no cache
      if (improvements.length > 0) {
        this.cacheService.setQualityImprovements(question, improvements);
      }

      return improvements;
    } catch (error) {
      console.error('❌ ML: Erro ao obter melhorias de qualidade:', error);
      return [];
    }
  }

  /**
   * Obtém padrões frequentes (com cache)
   */
  async getFrequentPatterns(limit: number = 10): Promise<any[]> {
    try {
      const cached = this.cacheService.getFrequentPatterns();
      if (cached) {
        return cached.slice(0, limit);
      }

      const patterns = await this.patternDetection.getFrequentPatterns(limit);
      
      if (patterns.length > 0) {
        this.cacheService.setFrequentPatterns(patterns);
      }

      return patterns;
    } catch (error) {
      console.error('❌ ML: Erro ao obter padrões frequentes:', error);
      return [];
    }
  }

  /**
   * Aplica aprendizado para personalizar resposta
   */
  async personalizeResponse(
    question: string,
    baseAnswer: string,
    userId?: string,
    sessionId?: string
  ): Promise<string> {
    try {
      // Obter preferências do usuário
      const preferences = await this.getUserPreferences(userId, sessionId);
      
      // Obter melhorias de qualidade
      const improvements = await this.getQualityImprovements(question);
      
      // Personalizar resposta baseado em preferências e melhorias
      let personalizedAnswer = baseAnswer;
      
      if (preferences) {
        // Ajustar tom baseado em preferências
        if (preferences.travel_style === 'adventure') {
          personalizedAnswer = this.addAdventureTone(personalizedAnswer);
        } else if (preferences.travel_style === 'relaxation') {
          personalizedAnswer = this.addRelaxationTone(personalizedAnswer);
        }
      }

      // Aplicar melhorias de qualidade
      if (improvements.length > 0) {
        personalizedAnswer = this.applyQualityImprovements(personalizedAnswer, improvements);
      }

      return personalizedAnswer;
    } catch (error) {
      console.error('❌ ML: Erro ao personalizar resposta:', error);
      return baseAnswer; // Retornar resposta original em caso de erro
    }
  }

  /**
   * Obtém métricas de aprendizado
   */
  getMetrics(): LearningMetrics {
    return { ...this.metrics };
  }

  /**
   * Adiciona tom de aventura à resposta
   */
  private addAdventureTone(answer: string): string {
    // Adicionar palavras-chave de aventura se não estiverem presentes
    if (!answer.toLowerCase().includes('aventura') && !answer.toLowerCase().includes('emocionante')) {
      return answer.replace(/\.$/, ' - uma verdadeira aventura!');
    }
    return answer;
  }

  /**
   * Adiciona tom de relaxamento à resposta
   */
  private addRelaxationTone(answer: string): string {
    // Adicionar palavras-chave de relaxamento se não estiverem presentes
    if (!answer.toLowerCase().includes('relaxante') && !answer.toLowerCase().includes('tranquilo')) {
      return answer.replace(/\.$/, ' - perfeito para relaxar!');
    }
    return answer;
  }

  /**
   * Aplica melhorias de qualidade à resposta
   */
  private applyQualityImprovements(answer: string, improvements: any[]): string {
    // Aplicar melhorias mais relevantes
    const relevantImprovements = improvements
      .filter(imp => imp.confidence > 0.7)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2);

    for (const improvement of relevantImprovements) {
      if (improvement.suggestion) {
        // Aplicar sugestão de melhoria
        answer = this.applySuggestion(answer, improvement.suggestion);
      }
    }

    return answer;
  }

  /**
   * Aplica sugestão de melhoria
   */
  private applySuggestion(answer: string, suggestion: string): string {
    // Implementação simples - pode ser melhorada
    if (suggestion.includes('mais detalhes')) {
      return answer + ' Quer saber mais detalhes sobre isso?';
    }
    if (suggestion.includes('mais específico')) {
      return answer.replace(/geral/g, 'específico');
    }
    return answer;
  }
}

// Exportar instância única
export const guataMLService = new GuataMLService();
export type { LearningInteraction, FeedbackData, LearningMetrics };

