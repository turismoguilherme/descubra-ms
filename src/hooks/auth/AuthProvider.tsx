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
      console.log("🔄 AuthProvider: Buscando perfil para userId:", userId);
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
      console.log("✅ AuthProvider: Perfil do usuário definido como:", profile);
    } catch (error) {
      console.error("❌ AuthProvider: Erro ao buscar perfil:", error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => { // Adicionado 'async' aqui
        console.log("🔄 AuthProvider: onAuthStateChange disparado. Evento:", event, "Sessão:", session);
        
        // Verificar dados de teste se não houver sessão real
        const testUserData = localStorage.getItem('test-user-data');
        const testToken = localStorage.getItem('supabase.auth.token');
        
        if (!session && testUserData && testToken === 'test-token') {
          // Usar dados de teste
          console.log("🧪 AuthProvider: Usando dados de teste");
          const testData = JSON.parse(testUserData);
          
          // Criar usuário simulado
          const testUser = {
            id: testData.id,
            email: testData.email,
            created_at: testData.created_at
          } as User;
          
          // Criar perfil simulado
          const testProfile: UserProfile = {
            user_id: testData.id,
            full_name: testData.name,
            role: testData.role,
            city_id: testData.role === 'gestor_municipal' ? 'campo-grande' : 
                     testData.role === 'gestor_igr' ? 'dourados' : 'campo-grande',
            region_id: testData.role === 'gestor_igr' ? 'igr-grande-dourados' : 'regiao-pantanal'
          };
          
          setSession(null);
          setUser(testUser);
          setUserProfile(testProfile);
          console.log("✅ AuthProvider: Perfil de teste definido:", testProfile);
        } else {
          // Usar dados reais do Supabase
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            console.log("🔄 AuthProvider: Usuário logado, buscando perfil...");
            await fetchUserProfile(session.user.id); // Garante que o perfil é buscado e esperado aqui também
          } else {
            console.log("🔄 AuthProvider: Usuário deslogado, resetando perfil.");
            setUserProfile(null);
          }
        }

        setLoading(false); // Agora, setLoading(false) é chamado após o perfil ser carregado em ambos os cenários.
        console.log("🏁 AuthProvider: Carregamento finalizado. Loading:", false);
      }
    );

    // Remover o getSession inicial, pois o onAuthStateChange já cobre o carregamento inicial e subsequente.
    // supabase.auth.getSession().then(async ({ data: { session } }) => {
    //   setSession(session);
    //   setUser(session?.user ?? null);
    //   
    //   if (session?.user) {
    //     await fetchUserProfile(session.user.id);
    //   }
    //   
    //   setLoading(false);
    // });

    // Verificação inicial de dados de teste
    const checkInitialTestData = () => {
      const testUserData = localStorage.getItem('test-user-data');
      const testToken = localStorage.getItem('supabase.auth.token');
      
      if (testUserData && testToken === 'test-token') {
        console.log("🧪 AuthProvider: Dados de teste encontrados no carregamento inicial");
        const testData = JSON.parse(testUserData);
        
        // Criar usuário simulado
        const testUser = {
          id: testData.id,
          email: testData.email,
          created_at: testData.created_at
        } as User;
        
        // Criar perfil simulado
        const testProfile: UserProfile = {
          user_id: testData.id,
          full_name: testData.name,
          role: testData.role,
          city_id: testData.role === 'gestor_municipal' ? 'campo-grande' : 
                   testData.role === 'gestor_igr' ? 'dourados' : 'campo-grande',
          region_id: testData.role === 'gestor_igr' ? 'igr-grande-dourados' : 'regiao-pantanal'
        };
        
        setSession(null);
        setUser(testUser);
        setUserProfile(testProfile);
        setLoading(false);
        console.log("✅ AuthProvider: Perfil de teste carregado:", testProfile);
      }
    };
    
    // Verificar dados de teste se não há sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        checkInitialTestData();
      }
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
      
      console.log("🔍 AuthProvider (signIn): Dados de login:", data);

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
      
      console.log("🏛️ SOCIAL LOGIN: Tenant detectado:", currentTenant, "isTenantPath:", isTenantPath, "Current Path:", currentPath);
      
      // Redirecionar mantendo contexto do tenant e usando URL específica para produção
      const isProduction = window.location.hostname === 'flow-trip.vercel.app';
      const baseUrl = isProduction ? 'https://flow-trip.vercel.app' : window.location.origin;
      const redirectPath = isTenantPath ? `${baseUrl}/${currentTenant}` : `${baseUrl}/auth/callback`;
      console.log("🔄 SOCIAL LOGIN: Redirecionando para:", redirectPath);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectPath,
        },
      });

      console.log("🔍 AuthProvider (signInWithOAuth): Dados de login:", data);

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