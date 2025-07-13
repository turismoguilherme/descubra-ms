import { supabase } from "@/integrations/supabase/client";
import { KnowledgeItem } from "../knowledge/knowledgeTypes";
import { GuataUserInfo, GuataResponse } from "../types/guataTypes";

/**
 * Cliente para comunicação com a API do Guatá
 */
export class GuataClient {
  private currentThreadId: string | null = null;

  /**
   * Envia uma pergunta para a API Guatá via função Supabase
   */
  async sendQuery(
    prompt: string,
    knowledgeBase?: KnowledgeItem[],
    userInfo?: GuataUserInfo
  ): Promise<GuataResponse> {
    try {
      console.log("Iniciando chamada para serviço do Guatá com prompt:", prompt);
      console.log("ThreadId atual:", this.currentThreadId);
      
      // Preparar contexto da base de conhecimento se fornecida
      let contextInfo = "";
      if (knowledgeBase && knowledgeBase.length > 0) {
        contextInfo = knowledgeBase.map(item => `
Título: ${item.titulo}
Categoria: ${item.categoria}
Conteúdo: ${item.conteudo}
${item.tags ? `Tags: ${item.tags.join(', ')}` : ''}
${item.regiao ? `Região: ${item.regiao}` : ''}
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
${contextInfo}
${userContext}

Pergunta do usuário: ${prompt}

Por favor, responda baseado nas informações fornecidas sobre turismo em Mato Grosso do Sul. Se não tiver informações específicas na base de conhecimento, indique isso claramente na resposta.`;

      console.log("Prompt completo preparado, enviando para a função Supabase...");

      // Chamar a função Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('guata-ai', {
        body: {
          prompt: fullPrompt,
          threadId: this.currentThreadId,
          userInfo: userInfo
        }
      });

      if (error) {
        console.error("Erro na chamada da função Supabase:", error);
        throw error;
      }

      console.log("Resposta recebida da função Supabase:", data);

      // Verificar se recebemos um threadId para futuras conversas
      if (data?.threadId) {
        this.currentThreadId = data.threadId;
        console.log("ThreadId atualizado:", this.currentThreadId);
      }

      return data as GuataResponse;
    } catch (error) {
      console.error("Erro no cliente Guatá:", error);
      
      return {
        resposta: "Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente em alguns instantes.",
        erro: error instanceof Error ? error.message : "Erro desconhecido"
      };
    }
  }

  /**
   * Limpa o thread ID atual, iniciando uma nova conversa
   */
  clearThread(): void {
    this.currentThreadId = null;
    console.log("Thread limpo, nova conversa iniciada");
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
    console.log("Thread ID definido:", threadId);
  }
}

// Instância singleton do cliente
export const guataClient = new GuataClient();