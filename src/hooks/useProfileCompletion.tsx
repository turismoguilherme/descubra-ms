import { useAuth } from "@/hooks/useAuth";

/**
 * Hook simplificado para verificar a completude do perfil do usuário.
 * Ele consome diretamente os dados do AuthContext, que agora é a única
 * fonte de verdade sobre o estado do perfil.
 */
export const useProfileCompletion = () => {
  const { isProfileComplete, loading, user } = useAuth();

  return {
    profileComplete: isProfileComplete,
    loading,
    user,
  };
};