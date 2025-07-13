
import { KnowledgeItem } from "@/types/ai";
import { guataClient } from "./client/guataClient";
import { knowledgeService } from "./knowledge/knowledgeService";
import { localProcessor } from "./processing/localProcessor";
import { GuataResponse, GuataUserInfo } from "./types/guataTypes";
import { OfficialSources } from "./knowledge/knowledgeService";

/**
 * Serviço principal do Guatá que coordena os demais módulos
 */
export class GuataService {
  // Último prompt usado (para debugging)
  private lastPrompt: string = "";

  /**
   * Envia uma pergunta para a IA Delinha e retorna a resposta
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
        console.log("Informações oficiais encontradas:", officialInfo.source);
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
      console.error("Erro no serviço do Guatá:", error);
      
      // Usar processamento local como fallback
      console.log("Usando processamento local de fallback após erro");
      return localProcessor.processQuery(prompt, knowledgeBase, userInfo);
    }
  }
}

// Exportar uma única instância do serviço e os tipos necessários
export const guataService = new GuataService();
export { OfficialSources };
export type { GuataResponse, GuataUserInfo };
