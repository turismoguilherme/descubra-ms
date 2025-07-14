import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import { AuthContext, AuthContextType } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { signUp as signUpService } from "./services/index";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAndSetUserProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setUserProfile(null);
      setIsProfileComplete(null);
      return;
    }

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name, role, city_id, region_id')
        .eq('id', user.id)
        .maybeSingle(); // Alterado para maybeSingle para evitar erro se não houver perfil
        
      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = No rows found
        throw profileError;
      }

      const profile: UserProfile = {
        user_id: user.id,
        full_name: profileData?.full_name || user.user_metadata?.full_name || user.email || '',
        role: profileData?.role || 'user',
        city_id: profileData?.city_id || null,
        region_id: profileData?.region_id || null,
      };
      
      setUserProfile(profile);

      const hasFullNameInProfile = !!profileData?.full_name;
      const hasFullNameInMeta = !!user.user_metadata?.full_name;
      const completed = hasFullNameInProfile || hasFullNameInMeta;
      setIsProfileComplete(completed);
      
    } catch (e) {
      console.error("❌ Erro ao buscar perfil de usuário:", e);
      setUserProfile(null);
      setIsProfileComplete(false);
    }
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      // CORREÇÃO OFICIAL: Evitar deadlock despachando a chamada para fora do fluxo síncrono.
      setTimeout(() => {
        fetchAndSetUserProfile(session?.user ?? null).finally(() => {
          setLoading(false);
        });
      }, 0);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        // CORREÇÃO OFICIAL: Evitar deadlock despachando a chamada para fora do fluxo síncrono.
        setTimeout(() => {
          fetchAndSetUserProfile(session?.user ?? null).finally(() => {
            // Apenas para o listener, podemos não precisar do loading, 
            // mas é bom ter para consistência se a sessão mudar.
            if (loading) setLoading(false);
          });
        }, 0);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAndSetUserProfile, loading]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const result = await signUpService(email, password, fullName);
    if (result.data.user) {
      await fetchAndSetUserProfile(result.data.user); // Atualiza perfil após cadastro
    }
    return result;
  };
  
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({
        title: "Login bem-sucedido!",
        description: "Bem-vindo de volta!",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Sessão encerrada",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao desconectar",
        description: error.message || "Não foi possível desconectar.",
        variant: "destructive",
      });
    }
  };

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    isProfileComplete,
    loading,
    signUp,
    signIn,
    signOut,
    fetchUserProfile: fetchAndSetUserProfile, // Expor a função mesclada
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};