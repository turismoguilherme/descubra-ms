
import { useState } from "react";
import { AIMessage } from "@/types/ai";
import { useToast } from "@/components/ui/use-toast";
import { delinhaService } from "@/services/ai";
import { useDelinhaMessages } from "@/hooks/useDelinhaMessages";

export const useDelinhaConversation = (knowledgeBase: any, usuarioInfo: any) => {
  const { mensagens, setMensagens, limparHistorico } = useDelinhaMessages();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const enviarMensagem = async (inputMensagem: string) => {
    if (inputMensagem.trim() === "") return;
    
    // Adiciona a mensagem do usuário
    const novaMensagemUsuario: AIMessage = {
      id: Date.now(),
      text: inputMensagem,
      isUser: true,
      timestamp: new Date()
    };
    
    setMensagens(prev => [...prev, novaMensagemUsuario]);
    setIsLoading(true);
    
    try {
      console.log("Enviando mensagem para a Delinha:", novaMensagemUsuario.text);
      
      // Adicionar mensagem de digitando...
      const mensagemDigitando: AIMessage = {
        id: Date.now() + 0.5,
        text: "Digitando...",
        isUser: false,
        timestamp: new Date(),
        isTyping: true
      };
      
      setMensagens(prev => [...prev, mensagemDigitando]);
      
      // Chamar o serviço da API Delinha
      const resposta = await delinhaService.askQuestion(
        novaMensagemUsuario.text,
        knowledgeBase,
        usuarioInfo
      );
      
      console.log("Resposta recebida da Delinha:", resposta);
      
      // Remover mensagem de digitando
      setMensagens(prev => prev.filter(msg => !msg.isTyping));
      
      const novaMensagemBot: AIMessage = {
        id: Date.now() + 1,
        text: resposta.response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMensagens(prev => [...prev, novaMensagemBot]);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      
      // Remover mensagem de digitando
      setMensagens(prev => prev.filter(msg => !msg.isTyping));
      
      // Mensagem de erro para o usuário
      toast({
        title: "Erro ao processar mensagem",
        description: "Não foi possível obter uma resposta. Por favor, tente novamente mais tarde.",
        variant: "destructive"
      });
      
      // Adicionar mensagem de erro do bot
      const mensagemErro: AIMessage = {
        id: Date.now() + 1,
        text: "Puxa vida, tive um probleminha aqui. Você pode tentar me perguntar de outro jeito, meu bem?",
        isUser: false,
        error: true,
        timestamp: new Date()
      };
      
      setMensagens(prev => [...prev, mensagemErro]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimparConversa = () => {
    // Mostrar confirmação antes de limpar
    if (window.confirm("Tem certeza que deseja apagar todo o histórico de conversa?")) {
      limparHistorico();
      toast({
        title: "Histórico limpo",
        description: "Sua conversa com a Delinha foi reiniciada."
      });
    }
  };

  const enviarFeedback = (positivo: boolean) => {
    toast({
      title: positivo ? "Obrigada pelo feedback!" : "Vou melhorar, prometo!",
      description: positivo 
        ? "Que bom que consegui te ajudar, meu bem!" 
        : "Desculpe se não consegui te ajudar dessa vez.",
    });
  };

  return {
    mensagens,
    isLoading,
    enviarMensagem,
    handleLimparConversa,
    enviarFeedback
  };
};
