import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useProfileCompletion = () => {
  const auth = useAuth();
  const { user, loading: authLoading } = auth || { user: null, loading: true };
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (authLoading) return;
      
      if (!user) {
        setProfileComplete(null);
        setLoading(false);
        return;
      }

      console.log("🔍 PROFILE CHECK: Verificando completude do perfil para:", user.email);
      
      try {
        // Primeira verificação: user_metadata
        const hasUserType = !!user.user_metadata?.user_type;
        console.log("📋 PROFILE CHECK: user_metadata.user_type:", user.user_metadata?.user_type);

        // Segunda verificação: consulta à tabela user_profiles
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('user_id, user_type, full_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("❌ PROFILE CHECK: Erro ao consultar perfil:", error);
          // Em caso de erro, considerar perfil incompleto por segurança
          setProfileComplete(false);
          setLoading(false);
          return;
        }

        const hasDBProfile = profile && profile.user_type;
        console.log("💾 PROFILE CHECK: Perfil no banco:", profile);

        // Perfil é considerado completo se:
        // 1. Tem user_type nos metadados OU
        // 2. Tem registro completo na tabela user_profiles
        const isComplete = hasUserType || !!hasDBProfile;
        
        console.log("✅ PROFILE CHECK: Resultado final:", {
          hasUserType,
          hasDBProfile,
          isComplete,
          userEmail: user.email
        });

        setProfileComplete(isComplete);
        
      } catch (error) {
        console.error("❌ PROFILE CHECK: Erro inesperado:", error);
        setProfileComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfileCompletion();
  }, [user, authLoading]);

  return {
    profileComplete,
    loading: authLoading || loading,
    user
  };
};