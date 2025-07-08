
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface InstitutionalContent {
  id: string;
  content_key: string;
  content_value: string;
  content_type: string;
  description: string | null;
}

const fetchInstitutionalContent = async (): Promise<InstitutionalContent[]> => {
  const { data, error } = await supabase
    .from("institutional_content")
    .select("*")
    .order("content_key");

  if (error) throw new Error(error.message);
  return data || [];
};

const updateInstitutionalContent = async (content: Pick<InstitutionalContent, 'id' | 'content_value'>) => {
    const { error } = await supabase
        .from('institutional_content')
        .update({ content_value: content.content_value })
        .eq('id', content.id);

    if (error) {
        throw new Error(error.message);
    }
};

export const useInstitutionalContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: content = [], isLoading, error } = useQuery<InstitutionalContent[]>({
    queryKey: ["institutional_content"],
    queryFn: fetchInstitutionalContent,
  });

  const mutation = useMutation({
    mutationFn: updateInstitutionalContent,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["institutional_content"] });
        toast({
            title: "Conteúdo atualizado!",
            description: "As alterações foram salvas com sucesso.",
        });
    },
    onError: (error: Error) => {
        toast({
            title: "Erro ao atualizar",
            description: error.message,
            variant: "destructive",
        });
    },
  });

  const getContentValue = (key: string): string => {
    return content.find(c => c.content_key === key)?.content_value || '';
  }
  
  return { 
    content, 
    isLoading, 
    error,
    updateContent: mutation.mutate,
    isUpdating: mutation.isPending,
    getContentValue,
  };
};
