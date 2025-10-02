import { useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { OverflowOneUserProfile } from "@/types/overflow-one-auth";
import { useToast } from "@/hooks/use-toast";
import { OverflowOneAuthContext, OverflowOneAuthContextType } from "./OverflowOneAuthContextShared";

export const OverflowOneAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<OverflowOneUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("🔄 OverflowOneAuthProvider: Buscando perfil para userId:", userId);
      
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
      console.log("🔄 OverflowOneAuthProvider: Iniciando signUp para:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyName,
            contact_person: contactPerson
          }
        }
      });

      if (error) {
        console.error("❌ OverflowOneAuthProvider: Erro no signUp:", error);
        throw error;
      }

      if (data.user) {
        // Criar perfil do usuário na tabela overflow_one_users
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
        } else {
          console.log("✅ OverflowOneAuthProvider: Perfil criado com sucesso");
        }
      }

      return data;
    } catch (error) {
      console.error("❌ OverflowOneAuthProvider: Erro no signUp:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔄 OverflowOneAuthProvider: Iniciando signIn para:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("❌ OverflowOneAuthProvider: Erro no signIn:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("❌ OverflowOneAuthProvider: Erro no signIn:", error);
      throw error;
    }
  };

  const signInWithProvider = async (provider: 'google' | 'facebook') => {
    try {
      console.log("🔄 OverflowOneAuthProvider: Iniciando signInWithProvider:", provider);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/viajar/dashboard`
        }
      });

      if (error) {
        console.error("❌ OverflowOneAuthProvider: Erro no signInWithProvider:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("❌ OverflowOneAuthProvider: Erro no signInWithProvider:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("🔄 OverflowOneAuthProvider: Iniciando signOut");
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("❌ OverflowOneAuthProvider: Erro no signOut:", error);
        throw error;
      }

      setUser(null);
      setSession(null);
      setUserProfile(null);
    } catch (error) {
      console.error("❌ OverflowOneAuthProvider: Erro no signOut:", error);
      throw error;
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      console.log("🔄 OverflowOneAuthProvider: Reenviando email de confirmação para:", email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        console.error("❌ OverflowOneAuthProvider: Erro ao reenviar email:", error);
        throw error;
      }

      toast({
        title: "Email reenviado",
        description: "Verifique sua caixa de entrada para confirmar sua conta.",
      });
    } catch (error) {
      console.error("❌ OverflowOneAuthProvider: Erro ao reenviar email:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log("🔄 OverflowOneAuthProvider: Iniciando reset de senha para:", email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/viajar/reset-password`
      });

      if (error) {
        console.error("❌ OverflowOneAuthProvider: Erro no reset de senha:", error);
        throw error;
      }

      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error) {
      console.error("❌ OverflowOneAuthProvider: Erro no reset de senha:", error);
      throw error;
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

