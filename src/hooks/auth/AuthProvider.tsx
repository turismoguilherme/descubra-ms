
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, AuthContextType } from "./AuthContext";
import { showToast } from "./authToast";
import { enhancedSignInService } from "./services/enhancedSignIn";
import { signInWithProviderService, signOutService, resendConfirmationEmailService } from "./services";
import { signUpService } from "./services/signUpService";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && session?.user) {
          const provider = session.user.app_metadata?.provider;
          
          if (provider === 'google' || provider === 'facebook') {
            showToast("Login realizado!", `Bem-vindo via ${provider}!`);
            
            // Limpar parâmetros OAuth da URL
            if (window.location.search) {
              const newUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
            }
          } else if (provider === 'email') {
            showToast("Login realizado!", "Bem-vindo!");
          }
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
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
          setUser(session?.user ?? null);
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
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    const result = await signUpService(email, password, fullName);
    setLoading(false);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await enhancedSignInService(email, password);
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
