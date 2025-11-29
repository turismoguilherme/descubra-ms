import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import { AuthContext, AuthContextType } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getCurrentTestUser, type TestUser } from "@/services/auth/TestUsers";
import { logger } from "@/utils/logger";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      logger.dev("🔄 AuthProvider: Buscando perfil para userId:", userId);
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
      logger.dev("✅ AuthProvider: Perfil do usuário definido");
    } catch (error) {
      console.error("❌ AuthProvider: Erro ao buscar perfil:", error);
    }
  };

  useEffect(() => {
    // Função para configurar usuário de teste
    const setupTestUser = (testUser: any) => {
      logger.dev("🧪 AuthProvider: Configurando usuário de teste");
      
      // Criar usuário simulado
      const simulatedUser = {
        id: testUser.id,
        email: testUser.email,
        created_at: new Date().toISOString()
      } as User;
      
      // Criar perfil simulado
      const testProfile: UserProfile = {
        user_id: testUser.id,
        full_name: testUser.name,
        role: testUser.role,
        city_id: testUser.role === 'gestor_municipal' ? 'campo-grande' : 
                 testUser.role === 'gestor_igr' ? 'dourados' : 'campo-grande',
        region_id: testUser.role === 'gestor_igr' ? 'igr-grande-dourados' : 'regiao-pantanal'
      };
      
      setSession(null);
      setUser(simulatedUser);
      setUserProfile(testProfile);
      setLoading(false);
      logger.dev("✅ AuthProvider: Perfil de teste definido");
    };
    
    // Verificar usuário de teste imediatamente
    const testUser = getCurrentTestUser();
    
    if (testUser) {
      setupTestUser(testUser);
      return;
    }
    
    // Se não há usuário de teste, configurar Supabase
    setLoading(false);
  }, []);

  // Adicionar listener para mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'test_user_id' && e.newValue) {
        logger.dev("🧪 AuthProvider: localStorage mudou, verificando usuário de teste");
        const testUser = getCurrentTestUser();
        if (testUser) {
          logger.dev("🧪 AuthProvider: Usuário de teste encontrado após mudança no localStorage");
          
          // Criar usuário simulado
          const simulatedUser = {
            id: testUser.id,
            email: testUser.email,
            created_at: new Date().toISOString()
          } as User;
          
          // Criar perfil simulado
        const testProfile: UserProfile = {
            user_id: testUser.id,
            full_name: testUser.name,
            role: testUser.role,
            city_id: testUser.role === 'gestor_municipal' ? 'campo-grande' : 
                     (testUser.role === 'gestor_igr' || testUser.role === 'diretor_estadual') ? 'dourados' : 'campo-grande',
            region_id: (testUser.role === 'gestor_igr' || testUser.role === 'diretor_estadual') ? 'igr-grande-dourados' : 'regiao-pantanal'
          };
          
          setSession(null);
          setUser(simulatedUser);
          setUserProfile(testProfile);
          setLoading(false);
          logger.dev("✅ AuthProvider: Perfil de teste atualizado");
        }
      }
    };

    // Listener para mudanças no localStorage (mesmo tab)
    const handleLocalStorageChange = () => {
      const testUser = getCurrentTestUser();
      if (testUser && !user) {
        logger.dev("🧪 AuthProvider: Usuário de teste detectado via polling");
        
        // Criar usuário simulado
        const simulatedUser = {
          id: testUser.id,
          email: testUser.email,
          created_at: new Date().toISOString()
        } as User;
        
        // Criar perfil simulado
        const testProfile: UserProfile = {
          user_id: testUser.id,
          full_name: testUser.name,
          role: testUser.role,
          city_id: testUser.role === 'gestor_municipal' ? 'campo-grande' : 
                   (testUser.role === 'gestor_igr' || testUser.role === 'diretor_estadual') ? 'dourados' : 'campo-grande',
          region_id: (testUser.role === 'gestor_igr' || testUser.role === 'diretor_estadual') ? 'igr-grande-dourados' : 'regiao-pantanal'
        };
        
        setSession(null);
        setUser(simulatedUser);
        setUserProfile(testProfile);
        setLoading(false);
        logger.dev("✅ AuthProvider: Perfil de teste detectado e configurado");
      }
    };

    // Polling para detectar mudanças no localStorage (mais agressivo)
    const interval = setInterval(handleLocalStorageChange, 5); // Reduced to 5ms for faster detection

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

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
        } else {
          console.log("🔄 AuthProvider: Usuário deslogado, resetando perfil.");
          setUserProfile(null);
        }

        setLoading(false);
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
        logger.dev("🧪 AuthProvider: Dados de teste encontrados no carregamento inicial");
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
        logger.dev("✅ AuthProvider: Perfil de teste carregado");
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
      const redirectUrl = isTenantPath ? `${window.location.origin}/${currentTenant}` : `${window.location.origin}/ms`;
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
      // Verificar se é um usuário de teste
      const testUsers = {
        'teste@viajar.com': { password: '123456', name: 'Usuário Teste ViaJAR', role: 'user' },
        'atendente@ms.gov.br': { password: '123456', name: 'Atendente MS', role: 'atendente' },
        'admin@viajar.com': { password: '123456', name: 'Admin ViaJAR', role: 'admin' },
        'gestor@ms.gov.br': { password: '123456', name: 'Gestor MS', role: 'gestor_municipal' },
        // Usuários dos CATs
        'atendente@cat-campo-grande.com': { password: '123456', name: 'Atendente CAT Campo Grande', role: 'cat_attendant' },
        'atendente@cat-dourados.com': { password: '123456', name: 'Atendente CAT Dourados', role: 'cat_attendant' },
        'atendente@cat-corumba.com': { password: '123456', name: 'Atendente CAT Corumbá', role: 'cat_attendant' },
        'atendente@cat-bonito.com': { password: '123456', name: 'Atendente CAT Bonito', role: 'cat_attendant' }
      };

      if (testUsers[email as keyof typeof testUsers] && testUsers[email as keyof typeof testUsers].password === password) {
        logger.dev("🧪 AuthProvider: Login com usuário de teste:", email);
        
        // Criar usuário simulado
        const testUser = {
          id: `test-${email.replace('@', '-').replace('.', '-')}`,
          email: email,
          created_at: new Date().toISOString()
        } as User;
        
        // Criar perfil simulado
        const testProfile: UserProfile = {
          user_id: testUser.id,
          full_name: testUsers[email as keyof typeof testUsers].name,
          role: testUsers[email as keyof typeof testUsers].role,
          city_id: email.includes('ms') ? 'campo-grande' : 
                   email.includes('cat-campo-grande') ? 'campo-grande' :
                   email.includes('cat-dourados') ? 'dourados' :
                   email.includes('cat-corumba') ? 'corumba' :
                   email.includes('cat-bonito') ? 'bonito' : null,
          region_id: email.includes('ms') ? 'regiao-pantanal' : 
                     email.includes('cat') ? 'regiao-pantanal' : null
        };
        
        // Salvar dados de teste no localStorage
        localStorage.setItem('test-user-data', JSON.stringify({
          id: testUser.id,
          email: testUser.email,
          name: testProfile.full_name,
          role: testProfile.role,
          created_at: testUser.created_at
        }));
        localStorage.setItem('supabase.auth.token', 'test-token');
        
        // Simular login bem-sucedido
        setUser(testUser);
        setUserProfile(testProfile);
        setSession(null);
        
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${testProfile.full_name}!`,
        });
        
        return { data: { user: testUser }, error: null };
      }

      // Tentar login real no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      logger.dev("🔍 AuthProvider (signIn): Dados de login recebidos");

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
      const redirectPath = isTenantPath ? `${baseUrl}/${currentTenant}` : `${baseUrl}/ms`;
      console.log("🔄 SOCIAL LOGIN: Redirecionando para:", redirectPath);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectPath,
        },
      });

      logger.dev("🔍 AuthProvider (signInWithOAuth): Dados de login recebidos");

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