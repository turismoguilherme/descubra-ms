// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CommercialPartner {
  id: string;
  company_name: string;
  trade_name?: string;
  cnpj: string;
  business_type: 'hotel' | 'pousada' | 'resort' | 'agencia_turismo' | 'restaurante' | 'atrativo_turistico' | 'transporte' | 'guia_turismo' | 'artesanato' | 'evento' | 'outro';
  company_size: 'micro' | 'small' | 'medium' | 'large';
  contact_person: string;
  contact_email: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  website_url?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
  cover_image_url?: string;
  gallery_images?: string[];
  services_offered?: string[];
  target_audience?: string[];
  price_range?: 'budget' | 'mid_range' | 'luxury' | 'ultra_luxury';
  operating_hours?: unknown;
  seasonal_info?: unknown;
  subscription_plan: 'basic' | 'premium' | 'enterprise';
  subscription_status: 'pending' | 'active' | 'suspended' | 'cancelled';
  subscription_start_date?: string;
  subscription_end_date?: string;
  monthly_fee?: number;
  total_views?: number;
  total_clicks?: number;
  conversion_rate?: number;
  featured?: boolean;
  verified?: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface NewCommercialPartner {
  company_name: string;
  trade_name?: string;
  cnpj: string;
  business_type: CommercialPartner['business_type'];
  company_size: CommercialPartner['company_size'];
  contact_person: string;
  contact_email: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  website_url?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  services_offered?: string[];
  target_audience?: string[];
  price_range?: CommercialPartner['price_range'];
  subscription_plan: CommercialPartner['subscription_plan'];
}

const fetchCommercialPartners = async (filters?: {
  business_type?: string;
  city?: string;
  subscription_plan?: string;
  status?: string;
}): Promise<CommercialPartner[]> => {
  let query = supabase
    .from("commercial_partners")
    .select("*")
    .order("company_name");

  if (filters?.business_type) {
    query = query.eq('business_type', filters.business_type);
  }
  
  if (filters?.city) {
    query = query.eq('city', filters.city);
  }
  
  if (filters?.subscription_plan) {
    query = query.eq('subscription_plan', filters.subscription_plan);
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar parceiros comerciais:", error);
    throw new Error(error.message);
  }

  return (data || []).map((item: unknown) => ({
    ...item,
    business_type: item.business_type as CommercialPartner['business_type'],
    company_size: item.company_size as CommercialPartner['company_size'],
    subscription_plan: item.subscription_plan as CommercialPartner['subscription_plan'],
    subscription_status: item.subscription_status as CommercialPartner['subscription_status'],
    status: item.status as CommercialPartner['status'],
    price_range: item.price_range as CommercialPartner['price_range'],
  }));
};

const submitCommercialPartnerRequest = async (partnerData: NewCommercialPartner) => {
  const { error } = await supabase
    .from('commercial_partners')
    .insert([{
      ...partnerData,
      created_by: (await supabase.auth.getUser()).data.user?.id,
      status: 'pending'
    }]);

  if (error) {
    console.error("Erro ao enviar solicitação:", error);
    throw new Error(`Erro ao enviar solicitação: ${error.message}`);
  }
};

const updateCommercialPartner = async (id: string, updates: Partial<CommercialPartner>) => {
  const { error } = await supabase
    .from('commercial_partners')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error("Erro ao atualizar parceiro:", error);
    throw new Error(`Erro ao atualizar parceiro: ${error.message}`);
  }
};

export const useCommercialPartners = (filters?: {
  business_type?: string;
  city?: string;
  subscription_plan?: string;
  status?: string;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: partners = [], isLoading, error } = useQuery<CommercialPartner[]>({
    queryKey: ["commercial_partners", filters],
    queryFn: () => fetchCommercialPartners(filters),
  });

  const submitMutation = useMutation({
    mutationFn: submitCommercialPartnerRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commercial_partners"] });
      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação de parceria comercial foi enviada com sucesso.",
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
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CommercialPartner> }) =>
      updateCommercialPartner(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commercial_partners"] });
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

  return {
    partners,
    isLoading,
    error,
    submitRequest: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
    updatePartner: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["commercial_partners"] }),
  };
};