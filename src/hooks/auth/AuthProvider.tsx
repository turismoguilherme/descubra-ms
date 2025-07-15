import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import { AuthContext, AuthContextType } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { signUpService } from "./services/index";
import { signInWithProviderService } from "./services/signInWithProviderService";
import { secureLogger, securityLogger } from "@/utils/secureLogger";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const { toast } = useToast();

  const fetchAndSetUserProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setUserProfile(null);
      setIsProfileComplete(null);
      return;
    }

    // Evitar buscar perfil se já está carregando
    if (profileLoading) return;
    
    setProfileLoading(true);
    
    try {
      secureLogger.log("🔄 AUTH: Buscando perfil para usuário:", user.id);
      
      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name, user_type, created_at, updated_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("❌ AUTH: Erro ao buscar perfil:", profileError);
        throw profileError;
      }

      // Buscar role do usuário
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, city_id, region_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleError && roleError.code !== 'PGRST116') {
        console.error("❌ AUTH: Erro ao buscar role:", roleError);
        throw roleError;
      }

      const combinedProfile: UserProfile = {
        full_name: profileData?.full_name || user.user_metadata?.full_name || user.email || 'Usuário',
        role: roleData?.role || 'user',
        city_id: roleData?.city_id || null,
        region_id: roleData?.region_id || null,
        email: user.email || '',
        created_at: profileData?.created_at || new Date().toISOString(),
        updated_at: profileData?.updated_at || new Date().toISOString(),
      };

      setUserProfile(combinedProfile);
      setIsProfileComplete(!!profileData);
      secureLogger.log("✅ AUTH: Perfil carregado");

    } catch (error) {
      console.error("❌ AUTH: Erro ao carregar perfil:", error);
      setUserProfile(null);
      setIsProfileComplete(false);
    } finally {
      setProfileLoading(false);
    }
  }, [profileLoading]);

  useEffect(() => {
    let mounted = true;

    secureLogger.log("🔄 AUTH: Iniciando AuthProvider");

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Buscar perfil se tiver usuário
        if (session?.user && mounted) {
          await fetchAndSetUserProfile(session.user);
        }
      } catch (error) {
        console.error("❌ AUTH: Erro ao obter sessão inicial:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        securityLogger.log("Auth state changed", true, event);
        
        // Atualizar estado síncrono apenas
        setSession(session);
        setUser(session?.user ?? null);
        
        // Resetar perfil se não houver usuário
        if (!session?.user) {
          setUserProfile(null);
          setIsProfileComplete(null);
        } else if (event === 'SIGNED_IN') {
          // Buscar perfil apenas quando o usuário faz login
          setTimeout(() => {
            fetchAndSetUserProfile(session.user);
          }, 100);
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchAndSetUserProfile]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const result = await signUpService(email, password, fullName);
    // Não buscar perfil aqui - deixar o onAuthStateChange lidar com isso
    return result;
  };
  
  const signIn = async (email: string, password: string) => {
    try {
      securityLogger.log("Login attempt", true, "Email login initiated");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      securityLogger.log("Login successful", true);
      
      // Não buscar perfil aqui - deixar o onAuthStateChange lidar com isso
      
      toast({
        title: "Login bem-sucedido!",
        description: "Bem-vindo de volta!",
      });
      return { data, error: null };
    } catch (error: any) {
      console.error("❌ AUTH: Erro no login:", error);
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

  const signInWithProvider = async (provider: 'google' | 'facebook') => {
    const result = await signInWithProviderService(provider);
    return result;
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
      
      toast({
        title: "Email de confirmação enviado",
        description: "Verifique sua caixa de entrada.",
      });
      return { error: null };
    } catch (error: any) {
      console.error("Erro ao reenviar email:", error);
      toast({
        title: "Erro ao reenviar email",
        description: error.message || "Não foi possível reenviar o email.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/password-reset`,
      });
      if (error) throw error;
      
      toast({
        title: "Email de recuperação enviado",
        description: "Verifique sua caixa de entrada.",
      });
    } catch (error: any) {
      console.error("Erro ao recuperar senha:", error);
      toast({
        title: "Erro ao recuperar senha",
        description: error.message || "Não foi possível enviar o email.",
        variant: "destructive",
      });
      throw error;
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
    signInWithProvider,
    resendConfirmationEmail,
    resetPassword,
    fetchUserProfile: fetchAndSetUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};