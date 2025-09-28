import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface CommercialPartner {
  id: string;
  company_name: string;
  contact_email: string;
  contact_phone: string;
  business_type: string;
  description: string;
  website?: string;
  city: string;
  state: string;
  services: string;
  target_audience: string;
  subscription_plan: 'basic' | 'premium' | 'enterprise';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface NewCommercialPartner {
  company_name: string;
  contact_email: string;
  contact_phone: string;
  business_type: string;
  description: string;
  website?: string;
  city: string;
  state: string;
  services: string;
  target_audience: string;
  subscription_plan: 'basic' | 'premium' | 'enterprise';
}

export const useCommercialPartners = (filters?: {
  business_type?: string;
  status?: string;
  search?: string;
}) => {
  const queryClient = useQueryClient();

  // Buscar parceiros comerciais
  const { data: partners = [], isLoading, error } = useQuery({
    queryKey: ['commercial-partners', filters],
    queryFn: async () => {
      let query = supabase
        .from('commercial_partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.business_type && filters.business_type !== 'all') {
        query = query.eq('business_type', filters.business_type);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`company_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar parceiros: ${error.message}`);
      }

      return data as CommercialPartner[];
    },
  });

  // Criar novo parceiro comercial
  const createPartner = useMutation({
    mutationFn: async (newPartner: NewCommercialPartner) => {
      const { data, error } = await supabase
        .from('commercial_partners')
        .insert([newPartner])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar parceiro: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial-partners'] });
    },
  });

  // Atualizar parceiro comercial
  const updatePartner = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CommercialPartner> }) => {
      const { data, error } = await supabase
        .from('commercial_partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar parceiro: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial-partners'] });
    },
  });

  // Aprovar parceiro
  const approvePartner = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('commercial_partners')
        .update({ status: 'approved' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao aprovar parceiro: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial-partners'] });
    },
  });

  // Rejeitar parceiro
  const rejectPartner = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('commercial_partners')
        .update({ status: 'rejected' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao rejeitar parceiro: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial-partners'] });
    },
  });

  return {
    partners,
    isLoading,
    error,
    createPartner,
    updatePartner,
    approvePartner,
    rejectPartner,
  };
};
