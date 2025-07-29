
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
  cnpj?: string; // Novo campo
  contact_person?: string; // Novo campo
  partnership_interest?: 'destaque_plataforma' | 'patrocinio_evento' | 'conteudo_colaborativo' | 'outro'; // Novo campo
}

export interface NewPartner {
  name: string;
  description?: string; // Pode vir da mensagem ou ser preenchido no backend
  logo_url?: string;
  segment: string;
  city: string;
  category: 'local' | 'regional' | 'estadual';
  website_link?: string;
  contact_email?: string;
  contact_whatsapp?: string;
  message?: string;
  status: string;
  cnpj?: string; // Novo campo
  contact_person?: string; // Novo campo
  partnership_interest: 'destaque_plataforma' | 'patrocinio_evento' | 'conteudo_colaborativo' | 'outro'; // Novo campo
}

// Refatorado: buscar parceiros por status
const fetchPartnersByStatus = async (status?: string): Promise<Partner[]> => {
  console.log(`🔍 usePartners: Iniciando fetchPartnersByStatus para status: ${status || 'todos'}...`);
  let query = supabase.from("institutional_partners").select("*").order("name");

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ usePartners: Erro ao buscar parceiros:", error);
    throw new Error(error.message);
  }
  console.log(`✅ usePartners: Dados de parceiros (${status || 'todos'}) recebidos:`, data);
  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    logo_url: item.logo_url,
    website_url: item.website_link || item.website_url,
    contact_email: item.contact_email,
    category: item.category as 'local' | 'regional' | 'estadual',
    city: item.city || '',
    segment: item.segment || '',
    tier: item.tier || '',
    status: item.status || 'pending', // Garante que o status seja mapeado
    created_at: item.created_at,
    updated_at: item.updated_at,
    contact_whatsapp: item.contact_whatsapp,
    message: item.message,
    cnpj: item.cnpj,
    contact_person: item.contact_person,
    partnership_interest: item.partnership_interest,
    approved_at: item.approved_at,
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

export const usePartners = (status?: string) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: partners = [], isLoading, error } = useQuery<Partner[]>({
        queryKey: ["partners", status],
        queryFn: () => fetchPartnersByStatus(status),
    });

    const mutation = useMutation({
        mutationFn: submitPartnershipRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partners"] }); // Invalida todas as queries de parceiros
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
        refetch: () => queryClient.invalidateQueries({ queryKey: ["partners", status] }), // Adiciona refetch explícito
    };
};
