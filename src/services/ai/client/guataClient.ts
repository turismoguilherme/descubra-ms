import { supabase } from "@/integrations/supabase/client";
import { KnowledgeItem } from "../knowledge/knowledgeTypes";
import { GuataUserInfo, GuataResponse } from "../types/guataTypes";
import { geminiClient } from "@/config/gemini";

/**
 * Cliente para comunicação com a API do Guatá
 */
export class GuataClient {
  private currentThreadId: string | null = null;

  /**
   * Envia uma pergunta para a API Guatá usando Gemini
   */
  async sendQuery(
    prompt: string,
    knowledgeBase?: KnowledgeItem[],
    userInfo?: GuataUserInfo
  ): Promise<GuataResponse> {
    try {
      console.log("🦦 Guatá: Iniciando chamada com Gemini API");
      
      // Preparar contexto da base de conhecimento
      let contextInfo = "";
      if (knowledgeBase?.length > 0) {
        contextInfo = knowledgeBase.map(item => `
Título: ${item.title}
Categoria: ${item.category}
Conteúdo: ${item.content}
${item.source ? `Fonte: ${item.source}` : ''}
---`).join('\n');
      }

      // Preparar informações do usuário
      let userContext = "";
      if (userInfo) {
        userContext = `
Informações do usuário:
${userInfo.nome ? `Nome: ${userInfo.nome}` : ''}
${userInfo.localizacao ? `Localização: ${userInfo.localizacao}` : ''}
${userInfo.interesses ? `Interesses: ${userInfo.interesses.join(', ')}` : ''}
${userInfo.tipoViagem ? `Tipo de viagem: ${userInfo.tipoViagem}` : ''}
${userInfo.duracao ? `Duração: ${userInfo.duracao}` : ''}
${userInfo.orcamento ? `Orçamento: ${userInfo.orcamento}` : ''}
${userInfo.acessibilidade ? `Acessibilidade: ${userInfo.acessibilidade}` : ''}
${userInfo.idade ? `Idade: ${userInfo.idade}` : ''}
${userInfo.viajandoCom ? `Viajando com: ${userInfo.viajandoCom}` : ''}
---`;
      }

      // Montar prompt completo
      const fullPrompt = `
Você é o Guatá, o assistente virtual de turismo do Mato Grosso do Sul. Você é representado por uma capivara simpática usando chapéu de safari.

Contexto sobre MS:
${contextInfo}

Informações do usuário:
${userContext}

Pergunta do usuário: ${prompt}

Responda de forma amigável e natural, usando o conhecimento fornecido sobre MS. Se não tiver informações específicas, seja honesto e sugira alternativas ou indique onde encontrar a informação.`;

      console.log("🦦 Guatá: Prompt preparado, chamando Gemini API...");

      // Usar Gemini API diretamente
      const response = await geminiClient.generateContent(fullPrompt);
      
      if (!response.ok) {
        throw new Error(`Erro na Gemini API: ${response.error}`);
      }

      console.log("🦦 Guatá: Resposta recebida com sucesso");

      return {
        resposta: response.text,
        response: response.text,
        threadId: this.currentThreadId
      };

    } catch (error) {
      console.error("🦦 Guatá: Erro ao processar pergunta:", error);
      
      return {
        resposta: "Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes. Se o problema persistir, você pode entrar em contato com nosso suporte.",
        response: "Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes. Se o problema persistir, você pode entrar em contato com nosso suporte.",
        erro: error instanceof Error ? error.message : "Erro desconhecido"
      };
    }
  }

  /**
   * Limpa o thread ID atual, iniciando uma nova conversa
   */
  clearThread(): void {
    this.currentThreadId = null;
    console.log("🦦 Guatá: Nova conversa iniciada");
  }

  /**
   * Obtém o thread ID atual
   */
  getCurrentThreadId(): string | null {
    return this.currentThreadId;
  }

  /**
   * Define um thread ID específico
   */
  setThreadId(threadId: string): void {
    this.currentThreadId = threadId;
    console.log("🦦 Guatá: Thread ID definido:", threadId);
  }
}

// Instância singleton do cliente
export const guataClient = new GuataClient();