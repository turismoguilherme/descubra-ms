
import { KnowledgeItem } from "@/types/ai";
import { guataClient } from "./client/guataClient";
import { knowledgeService } from "./knowledge/knowledgeService";
import { geminiClient } from "@/config/gemini";
import { GuataResponse, GuataUserInfo } from "./types/guataTypes";
import { OfficialSources } from "./knowledge/knowledgeService";

/**
 * Serviço principal do Guatá que coordena os demais módulos
 */
export class GuataService {
  // Último prompt usado (para debugging)
  private lastPrompt: string = "";

  /**
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
export { OfficialSources };
export type { GuataResponse, GuataUserInfo };
