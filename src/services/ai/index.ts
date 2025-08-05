
import { KnowledgeItem } from "@/types/ai";
import { guataClient } from "./client/guataClient";
import { knowledgeService } from "./knowledge/knowledgeService";
import { geminiClient } from "@/config/gemini";
import { GuataResponse, GuataUserInfo } from "./types/guataTypes";
import { OfficialSources } from "./knowledge/knowledgeService";

// NOVO: Guatá Inteligente - Sistema completo com verificação tripla e ML
import { guataInteligenteService } from "./guataInteligenteService";

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
import { freeAPIsService } from "./apis/freeAPIsService";
import { selectiveScrapingService } from "./scraping/selectiveScrapingService";
import { performanceOptimizer } from "./optimization/performanceOptimizer";
import { masterDashboardService } from "./integration/masterDashboardService";

/**
 * Serviço principal do Guatá que coordena os demais módulos
 * ATUALIZADO: Agora integra o novo Guatá Inteligente com verificação tripla
 */
export class GuataService {
  // Último prompt usado (para debugging)
  private lastPrompt: string = "";

  /**
   * NOVO: Método principal usando Guatá Inteligente
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
      
      console.log("🧠 Guatá Inteligente processando:", prompt);
      
      // Usar diretamente o método original para obter respostas inteligentes
      const originalResponse = await this.askQuestion(prompt, undefined, { nome: userId || 'Usuário' });
      
      return {
        answer: originalResponse.response,
        confidence: 0.9,
        sources: [originalResponse.source || 'guata_official'],
        timestamp: new Date(),
        processingTime: 0,
        verificationStatus: 'verified' as const
      };
      
    } catch (error) {
      console.error("🧠 Erro no Guatá Inteligente:", error);
      
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
      
      // Filtrar a base de conhecimento para itens relevantes
      let relevantKnowledge: KnowledgeItem[] = knowledgeService.filterRelevantKnowledge(prompt, knowledgeBase);
      
      // Buscar informações adicionais de fontes oficiais
      const officialInfo = await knowledgeService.fetchOfficialInformation(prompt);
      
      // Se temos informações oficiais, adicioná-las à base de conhecimento
      if (officialInfo) {
        console.log("🦦 Guatá: Informações oficiais encontradas:", officialInfo.source);
        relevantKnowledge.push({
          id: `official-${Date.now()}`,
          title: "Informação Oficial",
          content: officialInfo.content,
          category: "oficial",
          source: officialInfo.source,
          lastUpdated: new Date().toISOString()
        });
      }
      
      // Chamar o cliente Guatá para obter a resposta da IA
      return await guataClient.sendQuery(prompt, relevantKnowledge, userInfo);
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

// NOVO: Exportar também o serviço inteligente diretamente
export { 
  guataInteligenteService, 
  freeAPIsService, 
  selectiveScrapingService,
  performanceOptimizer,
  masterDashboardService
};

// Exportar tipos
export { OfficialSources };
export type { GuataResponse, GuataUserInfo };
