// Integração RAG com Guatá - Fallback para o sistema consciente
// Mantém compatibilidade com RAG quando o sistema principal falha

import { ragService } from './ragService';

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
  private ragEnabled: boolean = true;

  /**
   * Processa pergunta usando RAG como fallback
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
      // 1. Tentar RAG
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

      // 2. Fallback de emergência
      console.log('🔄 RAG: Usando resposta de emergência');
      
      return {
        answer: "Desculpe, não consegui encontrar informações específicas sobre isso. Pode tentar reformular a pergunta?",
        confidence: 0.3,
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
   * Health check do RAG
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    ragEnabled: boolean;
    averageResponseTime: number;
  }> {
    try {
      const ragHealth = await ragService.healthCheck();
      
      return {
        status: ragHealth.status,
        ragEnabled: this.ragEnabled,
        averageResponseTime: ragHealth.metrics.averageResponseTime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        ragEnabled: this.ragEnabled,
        averageResponseTime: 0
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
