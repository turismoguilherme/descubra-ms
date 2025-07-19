import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import { AuthContext, AuthContextType } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      // Buscar perfil do usuário
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      // Buscar role do usuário
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role, city_id, region_id")
        .eq("user_id", userId)
        .maybeSingle();

      // Criar perfil combinado
      const profile: UserProfile = {
        user_id: userId,
        full_name: profileData?.full_name || '',
        role: roleData?.role || 'user',
        city_id: roleData?.city_id || null,
        region_id: roleData?.region_id || null
      };

      setUserProfile(profile);
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }

        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Detectar tenant do path atual para manter contexto
      const currentPath = window.location.pathname;
      const pathSegments = currentPath.split('/').filter(Boolean);
      const currentTenant = pathSegments[0]; // 'ms', 'mt', etc.
      const isTenantPath = currentTenant && currentTenant.length === 2;
      
      console.log("🏛️ SIGNUP: Tenant detectado:", currentTenant, "isTenantPath:", isTenantPath);
      
      // Redirecionar mantendo contexto do tenant
      const redirectUrl = isTenantPath ? `${window.location.origin}/${currentTenant}` : `${window.location.origin}/`;
      console.log("🔄 SIGNUP: Redirecionando para:", redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      
      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar a conta.",
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      let errorMessage = "Erro ao fazer login";
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha inválidos";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Email não confirmado. Verifique sua caixa de entrada.";
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { data: null, error };
    }
  };

  const signInWithProvider = async (provider: 'google' | 'facebook') => {
    try {
      // Detectar tenant do path atual para manter contexto
      const currentPath = window.location.pathname;
      const pathSegments = currentPath.split('/').filter(Boolean);
      const currentTenant = pathSegments[0]; // 'ms', 'mt', etc.
      const isTenantPath = currentTenant && currentTenant.length === 2;
      
      console.log("🏛️ SOCIAL LOGIN: Tenant detectado:", currentTenant, "isTenantPath:", isTenantPath);
      
      // Redirecionar mantendo contexto do tenant
      const redirectPath = isTenantPath ? `${window.location.origin}/${currentTenant}` : `${window.location.origin}/`;
      console.log("🔄 SOCIAL LOGIN: Redirecionando para:", redirectPath);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectPath,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro no login social",
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
      
      setUser(null);
      setSession(null);
      setUserProfile(null);
    } catch (error: any) {
      toast({
        title: "Erro no logout",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao reenviar email",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      toast({
        title: "Email de recuperação enviado!",
        description: "Verifique sua caixa de entrada.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    userProfile,
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