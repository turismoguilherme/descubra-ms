import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

/**
 * Hook simplificado para verificar a completude do perfil do usuário.
 * Ele consome diretamente os dados do AuthContext, que agora é a única
 * fonte de verdade sobre o estado do perfil.
 */
export const useProfileCompletion = () => {
  const { isProfileComplete, loading, user } = useAuth();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  useEffect(() => {
    console.log("🔄 PROFILE_COMPLETION: Atualizando estado", { isProfileComplete, loading, user: !!user });
    
    // Só definir como completo se tiver dados definitivos
    if (!loading && user) {
      setProfileComplete(isProfileComplete);
    } else if (!user) {
      setProfileComplete(null);
    }
  }, [isProfileComplete, loading, user]);

  return {
    profileComplete,
    loading,
    user,
  };
};