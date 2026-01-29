import { useState } from "react";

interface AIMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const useGuataConversation = (knowledgeBase: unknown, usuarioInfo: Record<string, unknown>) => {
  const [mensagens, setMensagens] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      // Simula resposta do Guatá
      const responses = [
        "Que pergunta interessante! Mato Grosso do Sul tem muitas opções incríveis para você explorar.",
        "Excelente pergunta! Posso te ajudar com informações sobre Bonito, Pantanal, Campo Grande e muito mais.",
        "Ótima pergunta! MS é um estado repleto de belezas naturais e cultura rica. O que mais te interessa?",
        "Interessante! Posso te dar dicas sobre roteiros, hospedagem, gastronomia local e muito mais.",
        "Perfeita pergunta! Mato Grosso do Sul tem desde o Pantanal até as águas cristalinas de Bonito."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Simula delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const novaMensagemBot: AIMessage = {
        id: Date.now() + 1,
        text: randomResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMensagens(prev => [...prev, novaMensagemBot]);
      
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimparConversa = () => {
    setMensagens([]);
  };

  const enviarFeedback = (positivo: boolean) => {
    // Implementação simples de feedback
    console.log("Feedback:", positivo ? "positivo" : "negativo");
  };

  return {
    mensagens,
    isLoading,
    enviarMensagem,
    handleLimparConversa,
    enviarFeedback
  };
};