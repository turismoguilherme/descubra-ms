
import { useState } from "react";
import { AIMessage } from "@/types/ai";
import { useToast } from "@/components/ui/use-toast";
import { delinhaService } from "@/services/ai";
import { useGuataMessages } from "@/hooks/useGuataMessages";

export const useGuataConversation = (knowledgeBase: any, usuarioInfo: any) => {
  const { mensagens, setMensagens, limparHistorico } = useGuataMessages();
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
      console.log("Enviando mensagem para o Guatá:", novaMensagemUsuario.text);
      
      // Adicionar mensagem de digitando...
      const mensagemDigitando: AIMessage = {
        id: Date.now() + 0.5,
        text: "Digitando...",
        isUser: false,
        timestamp: new Date(),
        isTyping: true
      };
      
      setMensagens(prev => [...prev, mensagemDigitando]);
      
      // Chamar o serviço da API Guatá
      const resposta = await delinhaService.askQuestion(
        novaMensagemUsuario.text,
        knowledgeBase,
        usuarioInfo
      );
      
      console.log("Resposta recebida do Guatá:", resposta);
      
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
        text: "Opa, tive um probleminha aqui no meu sistema! Pode tentar me perguntar de outro jeito? Às vezes a conexão do Pantanal falha um pouquinho!",
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
        description: "Sua conversa com o Guatá foi reiniciada."
      });
    }
  };

  const enviarFeedback = (positivo: boolean) => {
    toast({
      title: positivo ? "Obrigado pelo feedback!" : "Vou melhorar, prometo!",
      description: positivo 
        ? "Que bom que consegui te ajudar! Vamos continuar explorando o MS juntos!" 
        : "Desculpe se não consegui te ajudar dessa vez. Vou me esforçar mais!",
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
