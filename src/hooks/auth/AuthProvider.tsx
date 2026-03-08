// @ts-nocheck
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import { AuthContext, AuthContextType } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      // Buscar role via Supabase SDK (respeitando RLS)
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, city_id, region_id')
        .eq('user_id', userId);
      
      if (roleError) {
        console.error("❌ AuthProvider: Erro ao buscar roles:", roleError);
      }
      
      // Criar perfil com role
      const profile: UserProfile = {
        user_id: userId,
        full_name: '',
        role: roleData?.[0]?.role || 'user',
        city_id: roleData?.[0]?.city_id || null,
        region_id: roleData?.[0]?.region_id || null
      };
      
      setUserProfile(profile);
    } catch (error: unknown) {
      console.error("❌ AuthProvider: Erro ao buscar perfil:", error);
    }
  };

  // Processar hash da URL após callback OAuth
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      console.log('🔐 [AuthProvider] Token OAuth detectado no hash da URL, processando...');
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          console.log('✅ [AuthProvider] Sessão OAuth processada com sucesso');
          window.history.replaceState(null, '', window.location.pathname);
        }
      });
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.dev("🔄 AuthProvider: onAuthStateChange disparado. Evento:", event);
        
        // Usar dados reais do Supabase
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log("🔄 AuthProvider: Usuário logado, buscando perfil...");
          await fetchUserProfile(session.user.id);
          
          // Se foi um login OAuth (SIGNED_IN), redirecionar para a página correta
          if (event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
            console.log('🔄 [AuthProvider] ========== OAUTH REDIRECT DETECTADO ==========');
            const currentHostname = window.location.hostname.toLowerCase();
            
            const { getOAuthCallbackRedirectPath, isDescubraMSContext } = await import('@/utils/authRedirect');
            
            let redirectPath = getOAuthCallbackRedirectPath();
            
            if ((currentHostname === 'descubrams.com' || currentHostname.includes('descubrams')) && redirectPath.startsWith('/')) {
              if (!redirectPath.startsWith('/descubrams') && redirectPath !== '/ms') {
                redirectPath = '/descubrams';
              }
              if (redirectPath === '/ms' || redirectPath.startsWith('/ms/')) {
                redirectPath = '/descubrams';
              }
            } else if (currentHostname === 'viajartur.com' || currentHostname.includes('viajartur') || currentHostname === 'viajar.com') {
              if (redirectPath === '/descubrams' || redirectPath.startsWith('/descubrams/')) {
                redirectPath = '/';
              }
            }

            setTimeout(() => {
              window.location.pathname = redirectPath;
            }, 100);
          }
        } else {
          console.log("🔄 AuthProvider: Usuário deslogado, resetando perfil.");
          setUserProfile(null);
        }

        setLoading(false);
      }
    );

    // Carregar sessão inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const currentPath = window.location.pathname;
      const pathSegments = currentPath.split('/').filter(Boolean);
      const currentTenant = pathSegments[0];
      const isDescubraMS = currentTenant === 'descubramatogrossodosul' || currentTenant === 'ms';
      const isViajar = currentTenant === 'viajar';
      
      let redirectUrl: string;
      if (isDescubraMS) {
        redirectUrl = `${window.location.origin}/descubrams`;
      } else if (isViajar) {
        redirectUrl = `${window.location.origin}/viajar/onboarding`;
      } else {
        redirectUrl = `${window.location.origin}/viajar/onboarding`;
      }
      
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

      if (data.user && !data.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu email para confirmar a conta antes de fazer login.",
          });
        } else if (signInData.session) {
          toast({
            title: "Conta criada com sucesso!",
            description: "Você já está logado. Bem-vindo!",
          });
          return { data: { user: signInData.user, session: signInData.session }, error: null };
        }
      } else if (data.session) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Você já está logado. Bem-vindo!",
        });
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta.",
        });
      }

      return { data, error: null };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      let errorMessage = err.message || "Ocorreu um erro inesperado.";
      
      if (err.message?.includes('User already registered') || err.message?.includes('already registered')) {
        errorMessage = "Este email já está cadastrado. Por favor, faça login em vez de criar uma nova conta.";
      } else if (err.message?.includes('Password should be')) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      } else if (err.message?.includes('Invalid email')) {
        errorMessage = "Email inválido. Verifique o formato do email.";
      }
      
      toast({
        title: err.message?.includes('already registered') ? "Email já cadastrado" : "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Login real no Supabase — sem test users
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      return { data, error: null };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      let errorMessage = "Erro ao fazer login";
      if (err.message?.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha inválidos";
      } else if (err.message?.includes("Email not confirmed")) {
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
      const { isDescubraMSContext } = await import('@/utils/authRedirect');
      const hostname = window.location.hostname.toLowerCase();
      
      let callbackPath: string;
      if (hostname === 'descubrams.com' || hostname.includes('descubrams')) {
        callbackPath = '/ms';
      } else if (hostname === 'viajartur.com' || hostname.includes('viajartur') || hostname === 'viajar.com') {
        callbackPath = '/auth/callback';
      } else {
        const isDescubraMS = isDescubraMSContext();
        callbackPath = isDescubraMS ? '/ms' : '/auth/callback';
      }
      
      let redirectPath: string;
      if (hostname === 'descubrams.com' || hostname.includes('descubrams')) {
        redirectPath = 'https://descubrams.com/ms';
      } else if (hostname === 'viajartur.com' || hostname.includes('viajartur') || hostname === 'viajar.com') {
        redirectPath = 'https://www.viajartur.com/auth/callback';
      } else {
        redirectPath = `${window.location.origin}${callbackPath}`;
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectPath,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: "Erro no login social",
        description: err.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      // Limpar qualquer resíduo de test users antigos do localStorage
      localStorage.removeItem('test_user_id');
      localStorage.removeItem('test_user_data');
      localStorage.removeItem('test-user-data');
      localStorage.removeItem('supabase.auth.token');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setUserProfile(null);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: "Erro no logout",
        description: err.message || "Ocorreu um erro inesperado.",
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: "Erro ao reenviar email",
        description: err.message || "Ocorreu um erro inesperado.",
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: "Erro ao redefinir senha",
        description: err.message || "Ocorreu um erro inesperado.",
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
