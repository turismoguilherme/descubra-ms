import { useEffect, useState } from "react";

export interface Partner {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active?: boolean;
  partner_type?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  gallery_images?: string[];
  youtube_url?: string;
  discount_offer?: string;
  address?: string;
}

const SUPABASE_URL = "https://hvtrpkbjgbuypkskqcqm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q";

export const usePartners = (status?: string) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPartners = async () => {
    console.log("🔍 usePartners: Iniciando fetch...");
    setIsLoading(true);
    
    try {
      const url = status 
        ? `${SUPABASE_URL}/rest/v1/institutional_partners?status=eq.${status}&order=name`
        : `${SUPABASE_URL}/rest/v1/institutional_partners?order=name`;
      
      console.log("🔍 usePartners: URL:", url);
      
      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      console.log("📦 usePartners: Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("📦 usePartners: Data:", data);
      
      const mapped = (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    logo_url: item.logo_url,
        website_url: item.website_url,
    contact_email: item.contact_email,
        contact_phone: item.contact_phone,
        is_active: item.is_active,
        partner_type: item.partner_type,
    status: item.status || 'pending',
    created_at: item.created_at,
    updated_at: item.updated_at,
        gallery_images: item.gallery_images || [],
        youtube_url: item.youtube_url,
        discount_offer: item.discount_offer,
        address: item.address,
      }));
      
      console.log(`✅ usePartners: ${mapped.length} parceiros carregados`);
      setPartners(mapped);
      setError(null);
      
    } catch (err: any) {
      console.error("💥 usePartners: Erro:", err);
      setError(err);
      setPartners([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [status]);

    return {
        partners,
        isLoading,
        error,
    refetch: fetchPartners,
    };
};
