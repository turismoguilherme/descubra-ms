import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook para sincronizar o perfil do usuário quando necessário
 * Separado do AuthProvider para evitar loops infinitos
 */
export const useProfileSync = () => {
  const { user, userProfile, fetchUserProfile } = useAuth();

  useEffect(() => {
    // Só buscar perfil se tiver usuário mas não tiver perfil carregado
    if (user && !userProfile) {
      console.log("🔄 PROFILE_SYNC: Sincronizando perfil do usuário");
      fetchUserProfile(user);
    }
  }, [user, userProfile, fetchUserProfile]);

  return {
    syncProfile: () => {
      if (user) {
        fetchUserProfile(user);
      }
    }
  };
};