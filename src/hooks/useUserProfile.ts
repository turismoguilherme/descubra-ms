import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Interface para dados completos do perfil do usuário
 */
export interface UserProfileData {
  // Dados básicos
  user_id: string;
  full_name: string | null;
  user_type: 'tourist' | 'resident' | null;
  
  // Dados demográficos
  occupation: string | null;
  birth_date: string | null;
  gender: string | null;
  sexuality_identity: string | null;
  accessibility_preference: string | null;
  
  // Dados de turista
  country: string | null;
  state: string | null;
  city: string | null;
  travel_organization: string | null;
  stay_duration: string | null;
  travel_motives: string[] | null;
  other_motive: string | null;
  
  // Dados de morador
  residence_city: string | null;
  neighborhood: string | null;
  time_in_city: string | null;
  wants_to_collaborate: boolean | null;
  
  // Timestamps
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Hook para buscar dados completos do perfil do usuário
 * Usa dados do "completar perfil" para personalização
 */
export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError) {
          console.error('Erro ao buscar perfil:', fetchError);
          setError(fetchError.message);
          setProfile(null);
        } else {
          setProfile(data as UserProfileData | null);
        }
      } catch (err: any) {
        console.error('Erro ao carregar perfil:', err);
        setError(err.message || 'Erro desconhecido');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  /**
   * Mapeia travel_motives para interesses de roteiros
   */
  const getInterestsFromProfile = (): string[] => {
    if (!profile?.travel_motives) return [];
    
    const motiveToInterest: Record<string, string> = {
      'turismo': 'natureza',
      'ecoturismo': 'natureza',
      'aventura': 'aventura',
      'cultura': 'cultura',
      'história': 'historia',
      'gastronomia': 'gastronomia',
      'compras': 'compras',
      'relaxamento': 'relaxamento',
      'negócios': 'cultura', // Negócios pode incluir cultura local
    };

    const interests: string[] = [];
    profile.travel_motives.forEach(motive => {
      const interest = motiveToInterest[motive.toLowerCase()];
      if (interest && !interests.includes(interest)) {
        interests.push(interest);
      }
    });

    // Se não encontrou nenhum, adiciona padrões baseados no tipo
    if (interests.length === 0) {
      if (profile.user_type === 'tourist') {
        interests.push('natureza', 'gastronomia');
      } else {
        interests.push('cultura', 'gastronomia');
      }
    }

    return interests;
  };

  /**
   * Determina perfil de viagem baseado em travel_organization
   */
  const getTravelProfile = (): 'solo' | 'casal' | 'família' | 'grupo' => {
    if (!profile?.travel_organization) return 'solo';
    
    const org = profile.travel_organization.toLowerCase();
    if (org.includes('família') || org.includes('familia')) return 'família';
    if (org.includes('casal') || org.includes('casais')) return 'casal';
    if (org.includes('grupo') || org.includes('amigos')) return 'grupo';
    return 'solo';
  };

  /**
   * Obtém cidade preferida para roteiros
   */
  const getPreferredCity = (): string => {
    if (profile?.user_type === 'tourist' && profile?.city) {
      return profile.city;
    }
    if (profile?.user_type === 'resident' && profile?.residence_city) {
      return profile.residence_city;
    }
    return 'Campo Grande'; // Default
  };

  /**
   * Obtém duração preferida baseada em stay_duration
   */
  const getPreferredDuration = (): string => {
    if (profile?.stay_duration) {
      return profile.stay_duration;
    }
    return '3 dias'; // Default
  };

  return {
    profile,
    loading,
    error,
    // Helpers para roteiros personalizados
    getInterestsFromProfile,
    getTravelProfile,
    getPreferredCity,
    getPreferredDuration,
    // Flags úteis
    isTourist: profile?.user_type === 'tourist',
    isResident: profile?.user_type === 'resident',
    hasCompleteProfile: !!profile && !!profile.user_type,
  };
};


















