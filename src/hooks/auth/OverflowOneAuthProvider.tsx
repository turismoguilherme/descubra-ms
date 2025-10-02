import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { OverflowOneUserProfile } from "@/types/overflow-one-auth";
import { OverflowOneAuthContext, OverflowOneAuthContextType } from "./OverflowOneAuthContext";
import { useToast } from "@/hooks/use-toast";

export const OverflowOneAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<OverflowOneUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("🔄 OverflowOneAuthProvider: Buscando perfil para userId:", userId);
      
      // Buscar perfil do usuário na tabela overflow_one_users
      const { data: profileData } = await supabase
        .from("overflow_one_users")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileData) {
        const profile: OverflowOneUserProfile = {
          user_id: userId,
          company_name: profileData.company_name || '',
          contact_person: profileData.contact_person || '',
          role: profileData.role || 'user',
          subscription_plan: profileData.subscription_plan || 'basic',
          subscription_status: profileData.subscription_status || 'active',
          created_at: profileData.created_at,
          updated_at: profileData.updated_at
        };

        setUserProfile(profile);
        console.log("✅ OverflowOneAuthProvider: Perfil do usuário definido como:", profile);
      }
    } catch (error) {
      console.error("❌ OverflowOneAuthProvider: Erro ao buscar perfil:", error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 OverflowOneAuthProvider: Auth state changed:", event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, companyName: string, contactPerson: string) => {
    try {
      console.log("🔄 OverflowOneAuthProvider: Iniciando cadastro para:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyName,
            contact_person: contactPerson,
            platform: 'overflow_one'
          }
        }
      });

      if (error) {
        console.error("❌ OverflowOneAuthProvider: Erro no cadastro:", error);
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user) {
        // Criar perfil na tabela overflow_one_users
        const { error: profileError } = await supabase
          .from("overflow_one_users")
          .insert({
            user_id: data.user.id,
            company_name: companyName,
            contact_person: contactPerson,
            role: 'user',
            subscription_plan: 'basic',
            subscription_status: 'active'
          });

        if (profileError) {
          console.error("❌ OverflowOneAuthProvider: Erro ao criar perfil:", profileError);
        }
      }

      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar a conta.",
      });

      return { data, error: null };
    } catch (error) {
      console.error("❌ OverflowOneAuthProvider: Erro inesperado no cadastro:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔄 OverflowOneAuthProvider: Iniciando login para:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ OverflowOneAuthProvider: Erro no login:", error);
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Login realizado!",
        description: "Bem-vindo à Overflow One!",
      });

      return { data, error: null };
    } catch (error) {
      console.error("❌ OverflowOneAuthProvider: Erro inesperado no login:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signInWithProvider = async (provider: 'google' | 'facebook') => {
    try {
      console.log("🔄 OverflowOneAuthProvider: Iniciando login com:", provider);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/overflow-one/dashboard`
        }
      });

      if (error) {
        console.error("❌ OverflowOneAuthProvider: Erro no login com provider:", error);
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("❌ OverflowOneAuthProvider: Erro inesperado no login com provider:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("🔄 OverflowOneAuthProvider: Iniciando logout");
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("❌ OverflowOneAuthProvider: Erro no logout:", error);
        toast({
          title: "Erro no logout",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setUser(null);
      setSession(null);
      setUserProfile(null);

      toast({
        title: "Logout realizado!",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error("❌ OverflowOneAuthProvider: Erro inesperado no logout:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      console.log("🔄 OverflowOneAuthProvider: Reenviando email de confirmação para:", email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        console.error("❌ OverflowOneAuthProvider: Erro ao reenviar email:", error);
        toast({
          title: "Erro ao reenviar email",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada.",
      });

      return { error: null };
    } catch (error) {
      console.error("❌ OverflowOneAuthProvider: Erro inesperado ao reenviar email:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log("🔄 OverflowOneAuthProvider: Iniciando reset de senha para:", email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/overflow-one/reset-password`
      });

      if (error) {
        console.error("❌ OverflowOneAuthProvider: Erro ao resetar senha:", error);
        toast({
          title: "Erro ao resetar senha",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error) {
      console.error("❌ OverflowOneAuthProvider: Erro inesperado ao resetar senha:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const value: OverflowOneAuthContextType = {
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
    <OverflowOneAuthContext.Provider value={value}>
      {children}
    </OverflowOneAuthContext.Provider>
  );
};





