
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SuggestionFormData {
  type: string;
  title: string;
  description: string;
  location?: string;
  contact?: string;
  category?: string;
}

export const useSuggestionForm = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submitSuggestion = async (formData: SuggestionFormData) => {
    try {
      setLoading(true);
      
      // Como a tabela user_suggestions não existe no schema, 
      // vamos usar a tabela institutional_partners como alternativa para sugestões
      const suggestionData = {
        name: formData.title,
        description: formData.description,
        city: formData.location || 'Campo Grande',
        segment: formData.category || 'sugestao',
        contact_email: formData.contact,
        status: 'pending',
        category: 'local' as const,
        message: `Tipo: ${formData.type} | ${formData.description}`
      };

      const { error } = await supabase
        .from('institutional_partners')
        .insert([suggestionData]);

      if (error) {
        console.error("Erro ao inserir sugestão:", error);
        throw new Error(`Erro ao enviar sugestão: ${error.message}`);
      }

      toast({
        title: "Sugestão enviada!",
        description: "Sua sugestão foi enviada com sucesso e será analisada pela nossa equipe.",
      });

      return true;
    } catch (error) {
      console.error("Erro ao enviar sugestão:", error);
      toast({
        title: "Erro ao enviar sugestão",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitSuggestion,
    loading
  };
};
