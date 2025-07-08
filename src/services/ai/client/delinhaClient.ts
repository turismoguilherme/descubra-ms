
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeItem } from "@/types/ai";
import { DelinhaUserInfo, DelinhaResponse } from "../types/delinhaTypes";

/**
 * Cliente para comunicação com a API da Delinha
 */
export class DelinhaClient {
  private currentThreadId: string | null = null;
  private retryCount: number = 0;
  private readonly maxRetries: number = 3;
  
  /**
   * Envia uma pergunta para a API Delinha via função Supabase
   */
  async sendQuery(
    prompt: string,
    knowledgeBase?: KnowledgeItem[],
    userInfo?: DelinhaUserInfo
  ): Promise<DelinhaResponse> {
    try {
      console.log("Iniciando chamada para serviço da Delinha com prompt:", prompt);
      console.log("ThreadId atual:", this.currentThreadId);
      
      // Chamar a função do Supabase que usa o OpenAI Assistant
      const { data, error } = await supabase.functions.invoke("delinha-ai", {
        body: { 
          prompt, 
          knowledgeBase,
          userInfo,
          threadId: this.currentThreadId,
          useOfficialSources: true
        }
      });

      if (error) {
        console.error("Erro na resposta do Supabase:", error);
        
        // Se o erro parecer relacionado à API, tentar novamente com nova thread
        if (error.message && (
            error.message.includes("API") || 
            error.message.includes("OpenAI") || 
            error.message.includes("assistant") ||
            error.message.includes("thread") ||
            error.message.includes("tempo esgotado")
          )) {
          console.log("Erro parece relacionado à API. Tentando com thread nova...");
          this.currentThreadId = null;
          
          if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`Tentativa ${this.retryCount}/${this.maxRetries}`);
            // Recursivamente tentar novamente
            return this.sendQuery(prompt, knowledgeBase, userInfo);
          }
        }
        
        throw error;
      }
      
      if (!data || !data.response) {
        console.error("Resposta inválida da função do Supabase:", data);
        throw new Error("Resposta inválida recebida da API");
      }
      
      console.log("Resposta da função do Supabase:", data);
      
      // Resetar contador de tentativas em caso de sucesso
      this.retryCount = 0;
      
      // Armazenar threadId para próximas chamadas
      if (data.threadId) {
        this.currentThreadId = data.threadId;
        console.log("ThreadId atualizado:", this.currentThreadId);
      }
      
      return data as DelinhaResponse;
    } catch (error) {
      console.error("Erro no cliente Delinha:", error);
      
      // Se o erro for relacionado à API do OpenAI e ainda não excedemos o número máximo de tentativas
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        
        // Limpar threadId para iniciar nova thread (pode resolver problemas de incompatibilidade de versão)
        if (error.message && (
            error.message.includes("invalid_beta") || 
            error.message.includes("deprecated") || 
            error.message.includes("assistants=v2") ||
            error.message.includes("thread") ||
            error.message.includes("OpenAI"))) {
          console.log("Erro parece estar relacionado à versão da API. Limpando threadId e tentando novamente...");
          this.currentThreadId = null;
        }
        
        console.log(`Tentativa ${this.retryCount}/${this.maxRetries} de chamar o serviço...`);
        return this.sendQuery(prompt, knowledgeBase, userInfo);
      }
      
      // Se excedeu o número máximo de tentativas
      this.retryCount = 0; // Reset para futuras chamadas
      throw error;
    }
  }
}

// Instância única do cliente
export const delinhaClient = new DelinhaClient();
