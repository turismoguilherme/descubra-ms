
import { useState } from "react";
import { catAIService, CATAIQuery } from "@/services/catAIService";
import { useToast } from "@/hooks/use-toast";

export const useCATAI = () => {
  const [queries, setQueries] = useState<CATAIQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submitQuery = async (
    attendantId: string,
    attendantName: string,
    question: string,
    catLocation: string,
    latitude?: number,
    longitude?: number
  ) => {
    setLoading(true);
    try {
      const result = await catAIService.submitQuery(
        attendantId,
        attendantName,
        question,
        catLocation,
        latitude,
        longitude
      );

      if (result) {
        setQueries(prev => [result, ...prev]);
        toast({
          title: "Pergunta enviada",
          description: "Sua pergunta foi processada com sucesso!",
        });
        return result;
      }
    } catch (error) {
      console.error("Erro ao enviar pergunta:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a pergunta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserQueries = async (attendantId: string) => {
    setLoading(true);
    try {
      const userQueries = await catAIService.getUserQueries(attendantId);
      setQueries(userQueries);
      return userQueries;
    } catch (error) {
      console.error("Erro ao buscar perguntas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as perguntas",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (queryId: string, isUseful: boolean) => {
    try {
      const success = await catAIService.submitFeedback(queryId, isUseful);
      if (success) {
        toast({
          title: "Feedback enviado",
          description: "Obrigado pelo seu feedback!",
        });
      }
      return success;
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o feedback",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    queries,
    loading,
    submitQuery,
    getUserQueries,
    submitFeedback,
  };
};
