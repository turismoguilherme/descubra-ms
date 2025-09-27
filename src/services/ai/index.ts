
import { KnowledgeItem } from "@/types/ai";
import { guataClient } from "./client/guataClient";
import { knowledgeService } from "./knowledge/knowledgeService";
import { geminiClient } from "@/config/gemini";
import { GuataResponse, GuataUserInfo } from "./types/guataTypes";
import { OfficialSources } from "./knowledge/knowledgeService";

// NOVO: Guatá Consciente - Sistema principal
import { guataConsciousService } from "./guataConsciousService";

// Interfaces locais para compatibilidade
interface GuataQuery {
  question: string;
  userId?: string;
  context?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface GuataResponse {
  answer: string;
  confidence: number;
  sources: string[];
  timestamp: Date;
  processingTime: number;
  enrichedData?: {
    weather?: any;
    wikipedia?: any;
    scraping?: any;
    ibge?: any;
  };
  verificationStatus: 'verified' | 'partial' | 'unverified';
  learningInsights?: {
    knowledgeGap?: string;
    accuracyImprovement?: number;
    newPattern?: string;
  };
}

type GuataSmartResponse = GuataResponse;

/**
 * Serviço principal do Guatá que coordena os demais módulos
 * ATUALIZADO: Agora integra o novo Guatá Consciente com verificação tripla
 */
export class GuataService {
  // Último prompt usado (para debugging)
  private lastPrompt: string = "";

  /**
   * NOVO: Método principal usando Guatá Consciente
   * Usa verificação tripla, base verificada e machine learning
   */
  async askQuestionSmart(
    prompt: string,
    userId?: string,
    sessionId?: string,
    category?: string,
    location?: string
  ): Promise<GuataSmartResponse> {
    try {
      this.lastPrompt = prompt;
      
      console.log("🧠 Guatá Consciente processando:", prompt);
      
      // Usar o novo serviço consciente
      const consciousResponse = await guataConsciousService.processQuestion({
        question: prompt,
        userId: userId || 'Usuário',
        sessionId: sessionId || `session-${Date.now()}`,
        context: category || 'turismo',
        userLocation: location || 'Mato Grosso do Sul'
      });
      
      return {
        answer: consciousResponse.answer,
        confidence: consciousResponse.confidence,
        sources: consciousResponse.sources.map(s => s.title),
        timestamp: new Date(),
        processingTime: consciousResponse.metadata.processingTime,
        verificationStatus: consciousResponse.metadata.verificationStatus
      };
      
    } catch (error) {
      console.error("🧠 Erro no Guatá Consciente:", error);
      
      return {
        answer: "Desculpe, tive um problema técnico. Pode tentar novamente?",
        confidence: 0.1,
        sources: ['fallback'],
        timestamp: new Date(),
        processingTime: 0,
        verificationStatus: 'unverified' as const
      };
    }
  }

  /**
   * Método original (mantido para compatibilidade)
   * Envia uma pergunta para a IA Guatá e retorna a resposta
   */
  async askQuestion(
    prompt: string,
    knowledgeBase?: KnowledgeItem[],
    userInfo?: GuataUserInfo
  ): Promise<GuataResponse> {
    try {
      this.lastPrompt = prompt;
      
      // Usar o novo serviço consciente como padrão
      const consciousResponse = await guataConsciousService.processQuestion({
        question: prompt,
        userId: userInfo?.nome || 'Usuário',
        sessionId: `session-${Date.now()}`,
        context: 'turismo',
        userLocation: userInfo?.localizacao || 'Mato Grosso do Sul'
      });
      
      return {
        resposta: consciousResponse.answer,
        response: consciousResponse.answer,
        source: 'guata-conscious'
      };
      
    } catch (error) {
      console.error("🦦 Guatá: Erro no serviço principal:", error);
      
      // Usar Gemini diretamente como fallback
      console.log("🦦 Guatá: Usando Gemini como fallback após erro");
      
      const fallbackPrompt = `
Você é o Guatá, o assistente virtual de turismo do Mato Grosso do Sul, representado por uma capivara simpática usando chapéu de safari.

Contexto disponível:
${knowledgeBase?.map(item => `${item.title}: ${item.content}`).join('\n')}

Informações do usuário:
${userInfo ? JSON.stringify(userInfo, null, 2) : 'Não disponível'}

Pergunta do usuário: ${prompt}

Responda de forma amigável e natural, usando o conhecimento fornecido sobre MS. Se não tiver informações específicas, seja honesto e sugira alternativas ou indique onde encontrar a informação.`;

      try {
        const geminiResponse = await geminiClient.generateContent(fallbackPrompt);
        return {
          resposta: geminiResponse,
          response: geminiResponse,
          source: 'gemini-fallback'
        };
      } catch (geminiError) {
        console.error("🦦 Guatá: Erro no fallback Gemini:", geminiError);
        return {
          resposta: "Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes.",
          response: "Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes.",
          source: 'error'
        };
      }
    }
  }
}

// Exportar uma única instância do serviço e os tipos necessários
export const guataService = new GuataService();

// NOVO: Exportar o serviço consciente diretamente
export { guataConsciousService };

// Exportar tipos
export { OfficialSources };
export type { GuataResponse, GuataUserInfo };
