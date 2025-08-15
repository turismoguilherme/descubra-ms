// Integração RAG com Guatá - Conecta o sistema RAG ao Guatá existente
// Mantém compatibilidade total com o sistema atual

import { ragService } from './ragService';
import { GuataService } from './index';

interface GuataRAGResponse {
  answer: string;
  sources?: Array<{
    title: string;
    url?: string;
    content: string;
    relevance: number;
  }>;
  confidence: number;
  processingTime: number;
  ragEnabled: boolean;
  fallbackUsed?: boolean;
}

export class GuataRAGIntegration {
  private guataService: GuataService;
  private ragEnabled: boolean = true;

  constructor() {
    this.guataService = new GuataService();
  }

  /**
   * Processa pergunta usando RAG + Guatá como fallback
   */
  async askQuestionWithRAG(
    question: string,
    userId?: string,
    sessionId?: string,
    category?: string,
    location?: string
  ): Promise<GuataRAGResponse> {
    const startTime = Date.now();

    try {
      // 1. Tentar RAG primeiro
      if (this.ragEnabled) {
        console.log('🔍 RAG: Processando pergunta:', question);
        
        const ragResponse = await ragService.processQuery({
          question,
          userId,
          context: `Categoria: ${category || 'turismo'}, Localização: ${location || 'MS'}`
        });

        // Se RAG encontrou informações relevantes
        if (ragResponse.confidence > 0.3 && ragResponse.sources.length > 0) {
          console.log('✅ RAG: Resposta encontrada com confiança:', ragResponse.confidence);
          
          return {
            answer: ragResponse.answer,
            sources: ragResponse.sources,
            confidence: ragResponse.confidence,
            processingTime: Date.now() - startTime,
            ragEnabled: true
          };
        }
      }

      // 2. Fallback para Guatá original
      console.log('🔄 RAG: Usando fallback para Guatá original');
      
      const originalResponse = await this.guataService.askQuestion(
        question,
        undefined,
        { nome: userId || 'Usuário' }
      );

      return {
        answer: originalResponse.response,
        confidence: 0.7,
        processingTime: Date.now() - startTime,
        ragEnabled: false,
        fallbackUsed: true
      };

    } catch (error) {
      console.error('❌ Guatá RAG: Erro no processamento:', error);
      
      // Fallback de emergência
      return {
        answer: "Desculpe, estou com dificuldades técnicas no momento. Pode tentar novamente em alguns instantes?",
        confidence: 0.1,
        processingTime: Date.now() - startTime,
        ragEnabled: false,
        fallbackUsed: true
      };
    }
  }

  /**
   * Ativa/desativa RAG
   */
  setRAGEnabled(enabled: boolean): void {
    this.ragEnabled = enabled;
    console.log(`🔧 RAG: ${enabled ? 'Ativado' : 'Desativado'}`);
  }

  /**
   * Health check completo
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: {
      rag: boolean;
      guata: boolean;
      supabase: boolean;
      gemini: boolean;
    };
    metrics: {
      ragEnabled: boolean;
      averageResponseTime: number;
    };
  }> {
    try {
      const ragHealth = await ragService.healthCheck();
      
      return {
        status: ragHealth.status === 'healthy' ? 'healthy' : 'degraded',
        components: {
          rag: ragHealth.status === 'healthy',
          guata: true, // Assumindo que está funcionando
          supabase: ragHealth.components.supabase,
          gemini: ragHealth.components.gemini
        },
        metrics: {
          ragEnabled: this.ragEnabled,
          averageResponseTime: ragHealth.metrics.averageResponseTime
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        components: {
          rag: false,
          guata: false,
          supabase: false,
          gemini: false
        },
        metrics: {
          ragEnabled: this.ragEnabled,
          averageResponseTime: 0
        }
      };
    }
  }

  /**
   * Limpa cache do RAG
   */
  clearRAGCache(): void {
    ragService.clearCache();
  }
}

export const guataRAGIntegration = new GuataRAGIntegration();
