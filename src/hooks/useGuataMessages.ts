
import { useState, useEffect } from "react";
import { AIMessage } from "@/types/ai";

const STORAGE_KEY = "guata_chat_history";

const DEFAULT_WELCOME_MESSAGE: AIMessage = {
  id: 1,
  text: "Olá! Você está pronto para explorar o coração do Brasil? Eu sou o Guatá, e serei o seu guia pessoal nessa aventura pelo Mato Grosso do Sul. Como uma capivara nascida e criada aqui, conheço cada segredo e cada maravilha deste lugar. Mas você sabe de onde vem o meu nome? \"Guatá\" é uma palavra de origem Tupi-Guarani que significa \"aquele que caminha\" ou \"o passeador\". Não poderia haver nome melhor, pois a minha paixão é exatamente essa: caminhar com você pelas trilhas, navegar pelos rios e te mostrar a beleza da nossa natureza e cultura. Prepare-se para passear ao meu lado e descobrir um Mato Grosso do Sul que vai ficar para sempre na sua memória!",
  isUser: false,
  timestamp: new Date()
};

export const useGuataMessages = () => {
  // Inicializa com uma mensagem vazia, será substituída no useEffect
  const [mensagens, setMensagens] = useState<AIMessage[]>([]);
  
  // Carregar mensagens do localStorage na inicialização
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedMessages = JSON.parse(saved);
        // Converter as strings de data de volta para objetos Date
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMensagens(messagesWithDates);
      } else {
        // Se não houver histórico, inicializa com a mensagem de boas-vindas
        setMensagens([DEFAULT_WELCOME_MESSAGE]);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico de mensagens:", error);
      setMensagens([DEFAULT_WELCOME_MESSAGE]);
    }
  }, []);
  
  // Salvar mensagens no localStorage sempre que mudar
  useEffect(() => {
    if (mensagens.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mensagens));
      } catch (error) {
        console.error("Erro ao salvar histórico de mensagens:", error);
      }
    }
  }, [mensagens]);
  
  // Função para limpar o histórico de conversas
  const limparHistorico = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMensagens([DEFAULT_WELCOME_MESSAGE]);
  };
  
  return { mensagens, setMensagens, limparHistorico };
};
