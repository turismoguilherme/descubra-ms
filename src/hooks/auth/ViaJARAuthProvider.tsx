import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { ViaJARUserProfile } from "@/types/viajar-auth";
import { ViaJARAuthContext, ViaJARAuthContextType } from "./ViaJARAuthContext";
import { useToast } from "@/hooks/use-toast";

export const ViaJARAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<ViaJARUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    // Temporariamente desabilitado devido a erros de tipo
    console.log("ViaJARAuthProvider: fetchUserProfile temporariamente desabilitado");
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 ViaJARAuthProvider: Auth state changed:", event);
        
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setSession(null);
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, companyName: string, contactPerson: string) => {
    try {
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

      if (error) throw error;
      // Profile creation temporariamente desabilitado
      return { data, error: null };
    } catch (error) {
      console.error("Erro no signUp:", error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Erro no signIn:", error);
      return { data: null, error };
    }
  };

  const signInWithProvider = async (provider: 'google' | 'facebook') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/viajar/dashboard`
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Erro no signInWithProvider:", error);
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
    } catch (error) {
      console.error("Erro no signOut:", error);
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Erro ao reenviar email:", error);
      return { data: null, error };
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/viajar/forgot-password`
      });

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      throw error;
    }
  };

  const value: ViaJARAuthContextType = {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resendConfirmationEmail,
    resetPassword
  };

  return (
    <ViaJARAuthContext.Provider value={value}>
      {children}
    </ViaJARAuthContext.Provider>
  );
};

