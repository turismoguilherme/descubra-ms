import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sanitizeText, sanitizeEmail, validateInput } from "@/utils/sanitization";
import { z } from "zod";

// Enhanced validation schema with security
const commercialPartnerSchema = z.object({
  company_name: z.string()
    .trim()
    .min(2, "Nome da empresa deve ter pelo menos 2 caracteres")
    .max(100, "Nome da empresa deve ter no máximo 100 caracteres")
    .refine(val => !/<[^>]*>/g.test(val), "Nome da empresa não pode conter HTML"),
  
  trade_name: z.string()
    .trim()
    .max(100, "Nome fantasia deve ter no máximo 100 caracteres")
    .optional()
    .refine(val => !val || !/<[^>]*>/g.test(val), "Nome fantasia não pode conter HTML"),
  
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, "CNPJ deve estar no formato 00.000.000/0000-00 ou 14 dígitos"),
  
  contact_email: z.string()
    .email("Email deve ter formato válido")
    .max(254, "Email deve ter no máximo 254 caracteres"),
  
  contact_person: z.string()
    .trim()
    .min(2, "Nome do contato deve ter pelo menos 2 caracteres")
    .max(100, "Nome do contato deve ter no máximo 100 caracteres"),
  
  business_type: z.enum(['hotel', 'pousada', 'resort', 'agencia_turismo', 'restaurante', 'atrativo_turistico', 'transporte', 'guia_turismo', 'artesanato', 'evento', 'outro']),
  
  company_size: z.enum(['micro', 'small', 'medium', 'large']),
  
  subscription_plan: z.enum(['basic', 'premium', 'enterprise']),
  
  description: z.string()
    .trim()
    .max(1000, "Descrição deve ter no máximo 1000 caracteres")
    .optional(),
  
  website_url: z.string()
    .url("URL do website deve ser válida")
    .optional()
    .or(z.literal("")),
    
  contact_phone: z.string()
    .max(20, "Telefone deve ter no máximo 20 caracteres")
    .optional(),
    
  contact_whatsapp: z.string()
    .max(20, "WhatsApp deve ter no máximo 20 caracteres")
    .optional(),
    
  address: z.string()
    .trim()
    .max(200, "Endereço deve ter no máximo 200 caracteres")
    .optional(),
    
  city: z.string()
    .trim()
    .max(100, "Cidade deve ter no máximo 100 caracteres")
    .optional(),
    
  state: z.string()
    .trim()
    .max(100, "Estado deve ter no máximo 100 caracteres")
    .optional(),
    
  zip_code: z.string()
    .max(10, "CEP deve ter no máximo 10 caracteres")
    .optional(),
    
  services_offered: z.array(z.string()).optional(),
  target_audience: z.array(z.string()).optional(),
  price_range: z.enum(['budget', 'mid_range', 'luxury', 'ultra_luxury']).optional(),
});

export interface SecureCommercialPartner {
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
  operating_hours?: any;
  seasonal_info?: any;
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

export type NewSecureCommercialPartner = Pick<
  SecureCommercialPartner,
  'company_name' | 'trade_name' | 'cnpj' | 'business_type' | 'company_size' | 
  'contact_person' | 'contact_email' | 'contact_phone' | 'contact_whatsapp' | 
  'website_url' | 'description' | 'address' | 'city' | 'state' | 'zip_code' | 
  'services_offered' | 'target_audience' | 'price_range' | 'subscription_plan'
>;

const sanitizePartnerData = (data: NewSecureCommercialPartner): NewSecureCommercialPartner => {
  return {
    ...data,
    company_name: sanitizeText(data.company_name),
    trade_name: data.trade_name ? sanitizeText(data.trade_name) : undefined,
    contact_person: sanitizeText(data.contact_person),
    contact_email: sanitizeEmail(data.contact_email),
    description: data.description ? sanitizeText(data.description) : undefined,
    address: data.address ? sanitizeText(data.address) : undefined,
    city: data.city ? sanitizeText(data.city) : undefined,
    state: data.state ? sanitizeText(data.state) : undefined,
    // Clean CNPJ to digits only for validation
    cnpj: data.cnpj.replace(/\D/g, ''),
  };
};

const validateSecurePartnerData = (data: NewSecureCommercialPartner) => {
  try {
    return commercialPartnerSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(firstError.message);
    }
    throw new Error("Dados inválidos");
  }
};

const submitSecureCommercialPartnerRequest = async (partnerData: NewSecureCommercialPartner) => {
  // Sanitize input data
  const sanitizedData = sanitizePartnerData(partnerData);
  
  // Validate data
  const validatedData = validateSecurePartnerData(sanitizedData);
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  // Check rate limit before submission (client-side check)
  const rateLimitKey = `partner_submit_${user.id}`;
  const lastSubmission = localStorage.getItem(rateLimitKey);
  const now = Date.now();
  
  if (lastSubmission) {
    const timeSinceLastSubmission = now - parseInt(lastSubmission);
    const oneHour = 60 * 60 * 1000;
    
    if (timeSinceLastSubmission < oneHour) {
      throw new Error("Aguarde 1 hora antes de enviar outra solicitação");
    }
  }

  try {
    const { error } = await supabase
      .from('commercial_partners')
      .insert([{
        ...validatedData,
        business_type: validatedData.business_type,
        company_size: validatedData.company_size,
        subscription_plan: validatedData.subscription_plan,
        created_by: user.id,
        status: 'pending'
      }]);

    if (error) {
      // Log security event for failed submission
      await supabase.rpc('log_security_event', {
        event_action: 'commercial_partner_submission_failed',
        event_user_id: user.id,
        event_success: false,
        event_error_message: error.message,
      });
      
      console.error("Erro ao enviar solicitação:", error);
      throw new Error(`Erro ao enviar solicitação: ${error.message}`);
    }

    // Store successful submission timestamp
    localStorage.setItem(rateLimitKey, now.toString());

    // Log successful submission
    await supabase.rpc('log_security_event', {
      event_action: 'commercial_partner_submission_success',
      event_user_id: user.id,
      event_success: true,
    });

  } catch (error: any) {
    // Enhanced error logging
    await supabase.rpc('log_security_event', {
      event_action: 'commercial_partner_submission_error',
      event_user_id: user.id,
      event_success: false,
      event_error_message: error.message,
    });
    throw error;
  }
};

const fetchSecureCommercialPartners = async (filters?: {
  business_type?: string;
  city?: string;
  subscription_plan?: string;
  status?: string;
}): Promise<SecureCommercialPartner[]> => {
  let query = supabase
    .from("commercial_partners")
    .select("*")
    .order("company_name");

  // Apply filters with sanitization
  if (filters?.business_type) {
    const sanitizedType = sanitizeText(filters.business_type);
    query = query.eq('business_type', sanitizedType);
  }
  
  if (filters?.city) {
    const sanitizedCity = sanitizeText(filters.city);
    query = query.eq('city', sanitizedCity);
  }
  
  if (filters?.subscription_plan) {
    const sanitizedPlan = sanitizeText(filters.subscription_plan);
    query = query.eq('subscription_plan', sanitizedPlan);
  }
  
  if (filters?.status) {
    const sanitizedStatus = sanitizeText(filters.status);
    query = query.eq('status', sanitizedStatus);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar parceiros comerciais:", error);
    throw new Error(error.message);
  }

  return (data || []).map((item: any) => ({
    ...item,
    business_type: item.business_type as SecureCommercialPartner['business_type'],
    company_size: item.company_size as SecureCommercialPartner['company_size'],
    subscription_plan: item.subscription_plan as SecureCommercialPartner['subscription_plan'],
    subscription_status: item.subscription_status as SecureCommercialPartner['subscription_status'],
    status: item.status as SecureCommercialPartner['status'],
    price_range: item.price_range as SecureCommercialPartner['price_range'],
  }));
};

export const useSecureCommercialPartners = (filters?: {
  business_type?: string;
  city?: string;
  subscription_plan?: string;
  status?: string;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: partners = [], isLoading, error } = useQuery<SecureCommercialPartner[]>({
    queryKey: ["secure_commercial_partners", filters],
    queryFn: () => fetchSecureCommercialPartners(filters),
  });

  const submitMutation = useMutation({
    mutationFn: submitSecureCommercialPartnerRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secure_commercial_partners"] });
      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação de parceria comercial foi enviada com sucesso e será analisada em breve.",
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
    submitRequest: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["secure_commercial_partners"] }),
  };
};