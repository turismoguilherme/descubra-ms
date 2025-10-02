import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface OverflowOnePartner {
  id: string;
  company_name: string;
  trade_name?: string;
  description?: string;
  logo_url?: string;
  business_type: 'technology' | 'consulting' | 'marketing' | 'design' | 'development' | 'infrastructure' | 'security' | 'analytics' | 'communication' | 'other';
  company_size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  city?: string;
  state?: string;
  country?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  services_offered?: string[];
  target_audience?: string[];
  subscription_plan: 'basic' | 'premium' | 'enterprise';
  subscription_status: 'pending' | 'active' | 'suspended' | 'cancelled';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  featured?: boolean;
  verified?: boolean;
  total_views?: number;
  total_clicks?: number;
  conversion_rate?: number;
  created_at?: string;
  updated_at?: string;
  approved_at?: string;
  created_by?: string;
  approved_by?: string;
}

export interface NewOverflowOnePartner {
  company_name: string;
  trade_name?: string;
  description?: string;
  logo_url?: string;
  business_type: OverflowOnePartner['business_type'];
  company_size: OverflowOnePartner['company_size'];
  city?: string;
  state?: string;
  country?: string;
  website_url?: string;
  contact_email: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  services_offered?: string[];
  target_audience?: string[];
  subscription_plan: OverflowOnePartner['subscription_plan'];
}

// Buscar parceiros por status e filtros
const fetchOverflowOnePartners = async (filters?: {
  status?: string;
  business_type?: string;
  city?: string;
  subscription_plan?: string;
  featured?: boolean;
}): Promise<OverflowOnePartner[]> => {
  console.log(`🔍 useOverflowOnePartners: Iniciando busca com filtros:`, filters);
  
  let query = supabase
    .from("overflow_one_partners")
    .select("*")
    .order("company_name");

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.business_type) {
    query = query.eq('business_type', filters.business_type);
  }
  
  if (filters?.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }
  
  if (filters?.subscription_plan) {
    query = query.eq('subscription_plan', filters.subscription_plan);
  }

  if (filters?.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ useOverflowOnePartners: Erro ao buscar parceiros:", error);
    throw new Error(error.message);
  }

  console.log(`✅ useOverflowOnePartners: Dados recebidos:`, data?.length || 0, "parceiros");
  
  return (data || []).map((item: any) => ({
    id: item.id,
    company_name: item.company_name,
    trade_name: item.trade_name,
    description: item.description,
    logo_url: item.logo_url,
    business_type: item.business_type as OverflowOnePartner['business_type'],
    company_size: item.company_size as OverflowOnePartner['company_size'],
    city: item.city,
    state: item.state,
    country: item.country,
    website_url: item.website_url,
    contact_email: item.contact_email,
    contact_phone: item.contact_phone,
    contact_whatsapp: item.contact_whatsapp,
    services_offered: item.services_offered || [],
    target_audience: item.target_audience || [],
    subscription_plan: item.subscription_plan as OverflowOnePartner['subscription_plan'],
    subscription_status: item.subscription_status as OverflowOnePartner['subscription_status'],
    status: item.status as OverflowOnePartner['status'],
    featured: item.featured || false,
    verified: item.verified || false,
    total_views: item.total_views || 0,
    total_clicks: item.total_clicks || 0,
    conversion_rate: item.conversion_rate || 0,
    created_at: item.created_at,
    updated_at: item.updated_at,
    approved_at: item.approved_at,
    created_by: item.created_by,
    approved_by: item.approved_by,
  }));
};

// Enviar solicitação de parceria
const submitOverflowOnePartnerRequest = async (partnerData: NewOverflowOnePartner) => {
  console.log("📝 useOverflowOnePartners: Enviando solicitação de parceria:", partnerData);
  
  const { error } = await supabase
    .from('overflow_one_partners')
    .insert([{
      ...partnerData,
      created_by: (await supabase.auth.getUser()).data.user?.id,
      status: 'pending',
      subscription_status: 'pending'
    }]);

  if (error) {
    console.error("❌ useOverflowOnePartners: Erro ao enviar solicitação:", error);
    throw new Error(`Erro ao enviar solicitação: ${error.message}`);
  }
};

// Atualizar parceiro
const updateOverflowOnePartner = async (id: string, updates: Partial<OverflowOnePartner>) => {
  console.log("🔄 useOverflowOnePartners: Atualizando parceiro:", id, updates);
  
  const { error } = await supabase
    .from('overflow_one_partners')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error("❌ useOverflowOnePartners: Erro ao atualizar parceiro:", error);
    throw new Error(`Erro ao atualizar parceiro: ${error.message}`);
  }
};

// Aprovar/rejeitar parceiro
const approveOverflowOnePartner = async (id: string, approved: boolean) => {
  console.log("✅ useOverflowOnePartners: Aprovando/rejeitando parceiro:", id, approved);
  
  const updates = {
    status: approved ? 'approved' : 'rejected',
    approved_at: approved ? new Date().toISOString() : null,
    approved_by: (await supabase.auth.getUser()).data.user?.id,
  };

  const { error } = await supabase
    .from('overflow_one_partners')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error("❌ useOverflowOnePartners: Erro ao aprovar/rejeitar parceiro:", error);
    throw new Error(`Erro ao ${approved ? 'aprovar' : 'rejeitar'} parceiro: ${error.message}`);
  }
};

export const useOverflowOnePartners = (filters?: {
  status?: string;
  business_type?: string;
  city?: string;
  subscription_plan?: string;
  featured?: boolean;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: partners = [], isLoading, error } = useQuery<OverflowOnePartner[]>({
    queryKey: ["overflow_one_partners", filters],
    queryFn: () => fetchOverflowOnePartners(filters),
  });

  const submitMutation = useMutation({
    mutationFn: submitOverflowOnePartnerRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overflow_one_partners"] });
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

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<OverflowOnePartner> }) =>
      updateOverflowOnePartner(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overflow_one_partners"] });
      toast({
        title: "Parceiro atualizado!",
        description: "Os dados do parceiro foram atualizados com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar parceiro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      approveOverflowOnePartner(id, approved),
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ["overflow_one_partners"] });
      toast({
        title: `Parceiro ${approved ? 'aprovado' : 'rejeitado'}!`,
        description: `O parceiro foi ${approved ? 'aprovado' : 'rejeitado'} com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao processar solicitação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    partners,
    isLoading,
    error,
    submitRequest: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
    updatePartner: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    approvePartner: approveMutation.mutate,
    isApproving: approveMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["overflow_one_partners"] }),
  };
};





