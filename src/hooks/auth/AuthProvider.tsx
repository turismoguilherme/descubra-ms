
import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, AuthContextType } from "./AuthContext";
import { showToast } from "./authToast";
import { enhancedSignInService } from "./services/enhancedSignIn";
import { signInWithProviderService, signOutService, resendConfirmationEmailService } from "./services";
import { signUpService } from "./services/signUpService";
import { UserProfile } from "@/types/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    try {
      // Passo 1: Buscar o perfil do usuário em `user_profiles`
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("❌ Erro ao buscar perfil (user_profiles):", profileError);
      }

      // Passo 2: Buscar o papel e localidades em `user_roles`
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, city_id, region_id')
        .eq('user_id', user.id)
        .single();

      if (roleError) {
        console.error("❌ Erro ao buscar papéis (user_roles):", roleError);
        // Não definir como nulo aqui, um usuário pode não ter um papel ainda
      }

      // Passo 3: Combinar os dados
      if (user) {
        const profile: UserProfile = {
          user_id: user.id,
          full_name: profileData?.full_name || user.email || '',
          role: roleData?.role || 'user', // Padrão para 'user' se não houver papel
          city_id: roleData?.city_id || null,
          region_id: roleData?.region_id || null,
        };
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

    } catch (e) {
      console.error("❌ Exceção ao buscar perfil:", e);
      setUserProfile(null);
    }
  }, []);


  useEffect(() => {
    // Verificar parâmetros OAuth na URL
    const urlParams = new URLSearchParams(window.location.search);
    const hasError = urlParams.has('error');
    
    if (hasError) {
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      console.error("❌ Erro OAuth:", error, errorDescription);
      showToast("Erro na autenticação", errorDescription || "Erro durante login social", "destructive");
      
      // Limpar URL
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
    
    // Configurar listener de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        await fetchUserProfile(currentUser); // Buscar perfil ao logar
        setLoading(false);

        if (event === 'SIGNED_IN' && session?.user) {
          const provider = session.user.app_metadata?.provider;
          
          if (provider === 'google' || provider === 'facebook') {
            console.log("🔐 AUTH PROVIDER: Login OAuth detectado", {
              provider,
              userEmail: session.user.email,
              hasUserType: !!session.user.user_metadata?.user_type
            });
            
            showToast("Login realizado!", `Bem-vindo via ${provider}!`);
            
            // Limpar parâmetros OAuth da URL
            if (window.location.search) {
              const newUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
            }
            
            // Para usuários OAuth, verificar se o perfil está completo
            // O ProfileCompletionChecker vai lidar com isso
          } else if (provider === 'email') {
            showToast("Login realizado!", "Bem-vindo!");
          }
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setUserProfile(null); // Limpar perfil ao deslogar
        }
      }
    );

    // Verificar sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Erro ao obter sessão:", error);
        } else {
          setSession(session);
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          await fetchUserProfile(currentUser); // Buscar perfil na sessão inicial
        }
      } catch (error) {
        console.error("❌ Erro em getInitialSession:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    const result = await signUpService(email, password, fullName);
    setLoading(false);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await enhancedSignInService(email, password);
    // O onAuthStateChange vai cuidar de buscar o perfil
    setLoading(false);
    return result;
  };

  const signInWithProvider = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    const result = await signInWithProviderService(provider);
    if (result.error) {
      setLoading(false);
    }
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    await signOutService();
    setUserProfile(null); // Limpar perfil
    setLoading(false);
  };

  const resendConfirmationEmail = async (email: string) => {
    setLoading(true);
    const result = await resendConfirmationEmailService(email);
    setLoading(false);
    return result;
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      showToast("Erro ao redefinir senha", error.message, "destructive");
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    userProfile, // Adicionado ao contexto
    loading,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resendConfirmationEmail,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
