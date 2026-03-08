import { KnowledgeItem } from "@/types/ai";
import { knowledgeService } from "./knowledge/knowledgeService";
import { generateContent } from "@/config/gemini";
import { GuataResponse as GuataTypesResponse, GuataUserInfo } from "./types/guataTypes";
import { OfficialSources } from "./knowledge/knowledgeService";

// NOVO: Guatá Restaurado - Sistema principal inteligente
import { guataRestoredService, GuataQuery, GuataResponse } from "./guataRestoredService";

// NOVO: Guatá Adaptativo - IA que aprende continuamente
import { guataAdaptiveService, AdaptiveQuery, AdaptiveResponse } from "./guataAdaptiveService";

// NOVO: Guatá Supabase - IA via Supabase Edge Functions
import { guataSupabaseService, SupabaseQuery, SupabaseResponse } from "./guataSupabaseService";

// NOVO: Guatá Fallback - IA que funciona sem Edge Functions
import { guataFallbackService, FallbackQuery, FallbackResponse } from "./guataFallbackService";

// NOVO: Guatá Simple - Versão ultra-simples que sempre funciona
import { guataSimpleService, SimpleQuery, SimpleResponse } from "./guataSimpleService";

// NOVO: Guatá Ultra Fast - Versão ultra-rápida sem busca web
import { guataUltraFastService, UltraFastQuery, UltraFastResponse } from "./guataUltraFastService";

// NOVO: Guatá Web Search - Sempre pesquisa na web para informações reais
import { guataTrueApiService, TrueApiQuery, TrueApiResponse } from "./guataTrueApiService";

// NOVO: Guatá Intelligent - Chatbot verdadeiramente inteligente e interativo
import { guataIntelligentService, IntelligentQuery, IntelligentResponse } from "./guataIntelligentService";

// NOVO: Guatá Ultra Fast Intelligent - Resposta instantânea com personalidade
import { guataUltraFastIntelligentService, UltraFastIntelligentQuery, UltraFastIntelligentResponse } from "./guataUltraFastIntelligentService";

// NOVO: Guatá Smart Hybrid - Sistema híbrido inteligente (local + web)
import { guataSmartHybridService, SmartHybridQuery, SmartHybridResponse } from "./guataSmartHybridService";

// NOVO: Guatá Instant - Resposta instantânea e confiável
import { guataInstantService, InstantQuery, InstantResponse } from "./guataInstantService";

// NOVO: Guatá Smart Hybrid Real - Sistema híbrido inteligente real
import { guataSmartHybridRealService, SmartHybridRealQuery, SmartHybridRealResponse } from "./guataSmartHybridRealService";

// NOVO: Guatá Advanced Memory - Memória avançada e aprendizado contínuo
import { guataAdvancedMemoryService, AdvancedMemoryQuery, AdvancedMemoryResponse } from "./guataAdvancedMemoryService";

// NOVO: Guatá Emotional Intelligence - Inteligência emocional e personalização
import { guataEmotionalIntelligenceService, EmotionalIntelligenceQuery, EmotionalIntelligenceResponse } from "./guataEmotionalIntelligenceService";

// NOVO: Guatá Partners - Sistema de parceiros real
import { guataPartnersService, PartnersQuery, PartnersResponse } from "./guataPartnersService";

// Interfaces locais para compatibilidade (mantidas para compatibilidade)
interface GuataQueryLegacy {
  question: string;
  userId?: string;
  context?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface GuataResponseLegacy {
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

type GuataSmartResponse = GuataResponseLegacy;

/**
 * Serviço principal do Guatá que coordena os demais módulos
 * ATUALIZADO: Agora usa o Guatá Restaurado com IA inteligente
 */
export class GuataService {
  // Último prompt usado (para debugging)
  private lastPrompt: string = "";

  /**
   * NOVO: Método principal usando Guatá Intelligent
   * Chatbot verdadeiramente inteligente e interativo
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
      
      console.log("🦦 Guatá Intelligent processando:", prompt);
      
      // Usar o serviço True API que combina todos os recursos
      const intelligentResponse = await guataTrueApiService.processQuestion({
        question: prompt,
        userId: userId || 'Usuário',
        sessionId: sessionId || `session-${Date.now()}`,
        userLocation: location || 'Mato Grosso do Sul',
        conversationHistory: [],
        userPreferences: {},
        isTotemVersion: false,
        isFirstUserMessage: false
      });
      
      console.log("✅ Guatá True API: Resposta gerada em", intelligentResponse.processingTime, "ms");
      console.log("📊 Fontes utilizadas:", intelligentResponse.sources);
      console.log("🌐 Usou web search:", intelligentResponse.usedWebSearch);
      console.log("🧠 Fonte do conhecimento:", intelligentResponse.knowledgeSource);
      
      return {
        answer: intelligentResponse.answer,
        confidence: intelligentResponse.confidence,
        sources: intelligentResponse.sources,
        timestamp: new Date(),
        processingTime: intelligentResponse.processingTime,
        verificationStatus: 'verified' as const
      };
      
    } catch (error) {
      console.error("🦦 Erro no Guatá Intelligent:", error);
      
      return {
        answer: "🦦 *coçando a cabeça* Ops! Parece que algo deu errado aqui. Deixe-me tentar novamente...",
        confidence: 0.3,
        sources: ['erro'],
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
      
      // Usar o novo serviço restaurado como padrão
      const restoredResponse = await guataRestoredService.processQuestion({
        question: prompt,
        userId: userInfo?.nome || 'Usuário',
        sessionId: `session-${Date.now()}`,
        userLocation: userInfo?.localizacao || 'Mato Grosso do Sul'
      });
      
      return {
        resposta: restoredResponse.answer,
        response: restoredResponse.answer,
        source: 'guata-restored'
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
        const model = geminiClient.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(fallbackPrompt);
        const geminiResponse = result.response.text();
        return {
          resposta: geminiResponse,
          response: geminiResponse,
          fontesUtilizadas: ['gemini-fallback']
        } as GuataTypesResponse;
      } catch (geminiError) {
        console.error("🦦 Guatá: Erro no fallback Gemini:", geminiError);
        return {
          resposta: "Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes.",
          response: "Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes.",
          fontesUtilizadas: ['error']
        } as GuataTypesResponse;
      }
    }
  }
}

// Exportar uma única instância do serviço e os tipos necessários
export const guataService = new GuataService();

// NOVO: Exportar os serviços diretamente
export { guataRestoredService };
export { guataAdaptiveService };
export { guataSupabaseService };
export { guataFallbackService };
export { guataSimpleService };
export { guataUltraFastService };
export { guataTrueApiService };
export { guataIntelligentService };
export { guataUltraFastIntelligentService };
export { guataSmartHybridService };
export { guataInstantService };
export { guataSmartHybridRealService };
export { guataAdvancedMemoryService };
export { guataEmotionalIntelligenceService };
export { guataPartnersService };

// Exportar tipos
export { OfficialSources };
export type { GuataResponse, GuataUserInfo };