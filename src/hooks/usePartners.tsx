
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Partner {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  segment?: string;
  city?: string;
  category: 'local' | 'regional' | 'estadual';
  website_link?: string;
  contact_email?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  tier?: string;
  contact_whatsapp?: string;
  message?: string;
  approved_at?: string;
  website_url?: string;
}

export interface NewPartner {
  name: string;
  description?: string;
  logo_url?: string;
  segment: string;
  city: string;
  category: 'local' | 'regional' | 'estadual';
  website_link?: string;
  contact_email?: string;
  contact_whatsapp?: string;
  message?: string;
  status: string;
}

// Fetch approved partners
const fetchApprovedPartners = async (): Promise<Partner[]> => {
  const { data, error } = await supabase
    .from("institutional_partners")
    .select("*")
    .eq('status', 'approved')
    .order("name");

  if (error) throw new Error(error.message);
  return (data || []).map(item => ({
    ...item,
    category: item.category as 'local' | 'regional' | 'estadual'
  }));
};

// Submit a partnership request
const submitPartnershipRequest = async (partnerData: NewPartner) => {
    const { error } = await supabase
        .from('institutional_partners')
        .insert([partnerData]);

    if (error) {
        console.error("Supabase insert error:", error);
        throw new Error(`Erro ao enviar solicitação: ${error.message}`);
    }
};

export const usePartners = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: partners = [], isLoading, error } = useQuery<Partner[]>({
        queryKey: ["approved_partners"],
        queryFn: fetchApprovedPartners,
    });

    const mutation = useMutation({
        mutationFn: submitPartnershipRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pending_partners"] });
            toast({
                title: "Solicitação enviada!",
                description: "Sua solicitação de parceria foi enviada com sucesso e será analisada pela nossa equipe.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Erro ao enviar solicitação",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return {
        partners,
        isLoading,
        error,
        submitRequest: mutation.mutate,
        isSubmitting: mutation.isPending,
    };
};
