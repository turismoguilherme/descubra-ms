
import { useState, useRef, useEffect } from "react";
import { Message } from "../types/CATSupportTypes";
import { useToast } from "@/components/ui/use-toast";
import { generateResponse, containsOffensiveContent } from "../utils/contentUtils";

export const useCATSupport = (onRecordQuestion?: (question: string, answer: string) => void) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Olá, sou a IA de Apoio ao Atendimento, aqui para auxiliar você a responder perguntas de turistas com informações precisas e oficiais. Como posso ajudar?", 
      isBot: true 
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Check for offensive content
    if (containsOffensiveContent(inputMessage)) {
      toast({
        title: "Conteúdo bloqueado",
        description: "Detectamos conteúdo potencialmente ofensivo em sua mensagem. Por favor, reformule sua pergunta.",
        variant: "destructive",
      });
      return;
    }
    
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    // Simulate AI response with a delay (would be an actual API call in production)
    setTimeout(() => {
      const response = generateResponse(inputMessage);
      
      const botMessage: Message = {
        id: messages.length + 2,
        text: response.text,
        isBot: true,
        source: response.source
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
      setIsLoading(false);
      
      // Record the question and answer if callback is provided
      if (onRecordQuestion) {
        onRecordQuestion(inputMessage, response.text);
      }
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return {
    messages,
    inputMessage,
    isLoading,
    messagesEndRef,
    setInputMessage,
    handleSendMessage,
    handleKeyDown
  };
};
