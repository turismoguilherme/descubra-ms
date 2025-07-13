
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { guataService } from "@/services/ai";
import { exportConversationAsText, exportConversationAsPDF } from "@/utils/exportUtils";
import { ConversationItem } from "./types";

export const useIASupport = () => {
  const [iaQuery, setIaQuery] = useState("");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversations]);

  const handleIAQuery = async () => {
    if (!iaQuery.trim()) return;

    const queryId = `query-${Date.now()}`;
    const newQuery = {
      id: queryId,
      query: iaQuery,
      response: "",
      source: "",
      timestamp: new Date(),
      isLoading: true
    };

    setConversations(prev => [...prev, newQuery]);
    setIaQuery("");
    setIsLoading(true);
    
    try {
      // Usar o serviço da Delinha para obter resposta baseada em fontes oficiais
      const response = await guataService.askQuestion(
        iaQuery,
        [
          {
            id: "support-base",
            title: "Informações para Suporte",
            content: "Esta é uma consulta de um atendente do CAT buscando informações oficiais para auxiliar um turista.",
            category: "suporte",
            source: "Sistema de Suporte CAT",
            lastUpdated: new Date().toISOString()
          }
        ],
        { origem: "CAT - Sistema de Atendimento" }
      );
      
      setConversations(prev => 
        prev.map(item => 
          item.id === queryId 
            ? { 
                ...item, 
                response: response.response, 
                source: response.source || "Dados oficiais de turismo",
                isLoading: false 
              } 
            : item
        )
      );
      
      toast({
        title: "Resposta obtida",
        description: "Informação baseada em dados oficiais.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao consultar IA:", error);
      
      toast({
        title: "Erro ao processar consulta",
        description: "Não foi possível obter uma resposta neste momento.",
        variant: "destructive",
        duration: 3000,
      });
      
      setConversations(prev => 
        prev.map(item => 
          item.id === queryId 
            ? { 
                ...item, 
                response: "Desculpe, não foi possível processar sua consulta. Por favor, tente novamente mais tarde.", 
                source: "Sistema local",
                isLoading: false 
              } 
            : item
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleIAQuery();
    }
  };

  const handleFeedback = (positive: boolean) => {
    toast({
      title: positive ? "Feedback positivo registrado" : "Feedback negativo registrado",
      description: positive 
        ? "Obrigado pelo seu feedback! Isso ajuda a melhorar nosso sistema." 
        : "Lamentamos que a resposta não tenha sido útil. Vamos trabalhar para melhorar.",
      duration: 3000,
    });
  };

  const handleExportConversation = async (format: 'text' | 'pdf') => {
    if (conversations.length === 0) return;
    
    setIsExporting(true);
    
    try {
      const formattedConversations = conversations.map(conv => ({
        id: Number(conv.id.replace('query-', '')),
        text: format === 'text' 
          ? `Pergunta: ${conv.query}\n\nResposta: ${conv.response}`
          : conv.query,
        isUser: false,
        timestamp: conv.timestamp
      })).flatMap((item, index) => {
        // For PDF, we need to create separate entries for question and answer
        if (format === 'pdf') {
          const conv = conversations[index];
          return [
            item,
            {
              id: Number(item.id) + 0.5,
              text: conv.response,
              isUser: false,
              timestamp: new Date(conv.timestamp.getTime() + 1000) // 1 second after question
            }
          ];
        }
        return [item];
      });
      
      if (format === 'text') {
        exportConversationAsText(formattedConversations);
      } else {
        await exportConversationAsPDF(formattedConversations);
      }
      
      toast({
        title: "Exportação concluída",
        description: `Histórico de consultas exportado como ${format === 'text' ? 'texto' : 'PDF'}.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao exportar conversas:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o histórico de consultas.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    iaQuery,
    setIaQuery,
    conversations,
    isLoading,
    isExporting,
    messagesEndRef,
    handleIAQuery,
    handleKeyDown,
    handleFeedback,
    handleExportConversation
  };
};
