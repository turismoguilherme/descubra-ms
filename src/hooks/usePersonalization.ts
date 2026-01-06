import { useMemo } from 'react';
import { useUserProfile } from './useUserProfile';

/**
 * Hook para personalizar a experiência na plataforma baseado no perfil do usuário
 */
export const usePersonalization = () => {
  const {
    profile,
    getInterestsFromProfile,
    getTravelProfile,
    getPreferredCity,
    isTourist,
    isResident,
    hasCompleteProfile,
  } = useUserProfile();

  /**
   * Filtros sugeridos para destinos baseados no perfil
   */
  const destinationFilters = useMemo(() => {
    if (!hasCompleteProfile || !profile) {
      return null;
    }

    const interests = getInterestsFromProfile();
    const preferredCity = getPreferredCity();

    return {
      suggestedCity: preferredCity,
      suggestedInterests: interests,
      travelProfile: getTravelProfile(),
    };
  }, [profile, hasCompleteProfile, getInterestsFromProfile, getTravelProfile, getPreferredCity]);

  /**
   * Filtros sugeridos para eventos baseados no perfil
   */
  const eventFilters = useMemo(() => {
    if (!hasCompleteProfile || !profile) {
      return null;
    }

    const preferredCity = getPreferredCity();
    const interests = getInterestsFromProfile();

    return {
      suggestedCity: preferredCity,
      suggestedCategories: interests, // Mapear interesses para categorias de eventos
    };
  }, [profile, hasCompleteProfile, getPreferredCity, getInterestsFromProfile]);

  /**
   * Filtros sugeridos para parceiros baseados no perfil
   */
  const partnerFilters = useMemo(() => {
    if (!hasCompleteProfile || !profile) {
      return null;
    }

    const interests = getInterestsFromProfile();
    const preferredCity = getPreferredCity();

    // Mapear interesses para tipos de parceiros
    const interestToPartnerType: Record<string, string[]> = {
      'natureza': ['atrativo_turistico', 'agencia_turismo'],
      'gastronomia': ['restaurante'],
      'cultura': ['atrativo_turistico'],
      'aventura': ['agencia_turismo', 'atrativo_turistico'],
      'historia': ['atrativo_turistico'],
      'compras': ['atrativo_turistico'],
      'relaxamento': ['hotel', 'pousada', 'resort'],
    };

    const suggestedTypes: string[] = [];
    interests.forEach(interest => {
      const types = interestToPartnerType[interest] || [];
      types.forEach(type => {
        if (!suggestedTypes.includes(type)) {
          suggestedTypes.push(type);
        }
      });
    });

    return {
      suggestedCity: preferredCity,
      suggestedTypes: suggestedTypes.length > 0 ? suggestedTypes : undefined,
    };
  }, [profile, hasCompleteProfile, getInterestsFromProfile, getPreferredCity]);

  /**
   * Mensagem de personalização para exibir ao usuário
   */
  const personalizationMessage = useMemo(() => {
    if (!hasCompleteProfile) {
      return null;
    }

    if (isTourist) {
      return {
        title: 'Personalizado para você',
        description: `Mostrando conteúdo relevante para sua viagem baseado no seu perfil.`,
      };
    }

    if (isResident) {
      return {
        title: 'Conteúdo local',
        description: `Mostrando eventos e parceiros próximos a você.`,
      };
    }

    return null;
  }, [hasCompleteProfile, isTourist, isResident]);

  return {
    destinationFilters,
    eventFilters,
    partnerFilters,
    personalizationMessage,
    isPersonalized: hasCompleteProfile,
    userType: profile?.user_type || null,
  };
};
















