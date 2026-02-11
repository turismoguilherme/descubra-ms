// @ts-nocheck
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
      // Buscar role diretamente via REST API (mais estável que o cliente Supabase)
      const SUPABASE_URL = "https://hvtrpkbjgbuypkskqcqm.supabase.co";
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q";
      
      const roleResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}&select=role,city_id,region_id`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      );
      
      const roleData = await roleResponse.json();
      
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

  useEffect(() => {
    // Função para configurar usuário de teste
    const setupTestUser = (testUser: { id: string; email: string; user_metadata?: { full_name?: string } }) => {
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

  // Processar hash da URL após callback OAuth
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      console.log('🔐 [AuthProvider] Token OAuth detectado no hash da URL, processando...');
      // O Supabase deve processar automaticamente com detectSessionInUrl: true
      // Mas vamos garantir que a sessão seja obtida
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          console.log('✅ [AuthProvider] Sessão OAuth processada com sucesso');
          // Limpar hash da URL após processar
          window.history.replaceState(null, '', window.location.pathname);
        }
      });
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.dev("🔄 AuthProvider: onAuthStateChange disparado. Evento:", event);
        console.log('🔐 [AuthProvider] Evento de autenticação:', event, 'Session:', session ? 'presente' : 'ausente');
        
        // Usar dados reais do Supabase
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log("🔄 AuthProvider: Usuário logado, buscando perfil...");
          await fetchUserProfile(session.user.id);
          
          // Se foi um login OAuth (SIGNED_IN), redirecionar para a página correta
          // IMPORTANTE: Verificar se estamos no domínio correto antes de redirecionar
          if (event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {

            console.log('🔄 [AuthProvider] ========== OAUTH REDIRECT DETECTADO ==========');
            console.log('🔄 [AuthProvider] Origin atual:', window.location.origin);
            console.log('🔄 [AuthProvider] Hostname completo:', window.location.hostname);
            console.log('🔄 [AuthProvider] Pathname:', window.location.pathname);
            console.log('🔄 [AuthProvider] Hash:', window.location.hash ? 'presente' : 'ausente');

            // IMPORTANTE: Garantir que o redirecionamento use o DOMÍNIO ATUAL, não um domínio diferente
            // Não forçar mudança de domínio - o usuário deve permanecer onde está
            const currentHostname = window.location.hostname.toLowerCase();
            console.log('🔄 [AuthProvider] Hostname normalizado:', currentHostname);
            
            const { getOAuthCallbackRedirectPath, isDescubraMSContext } = await import('@/utils/authRedirect');
            
            let redirectPath = getOAuthCallbackRedirectPath();
            console.log('🔄 [AuthProvider] 🎯 Path inicial calculado:', redirectPath);
            
            // Se estamos em descubrams.com, garantir que o redirect path seja /descubrams (não /ms)
            if ((currentHostname === 'descubrams.com' || currentHostname.includes('descubrams')) && redirectPath.startsWith('/')) {
              console.log('🔄 [AuthProvider] ✅ Detectado Descubra MS');
              // Path já está correto e relativo, apenas garantir que seja /descubrams
              if (!redirectPath.startsWith('/descubrams') && redirectPath !== '/ms') {
                console.log('🔄 [AuthProvider]   ↳ Ajustando path para /descubrams');
                redirectPath = '/descubrams';
              }
              // Se o path for /ms (callback path), redirecionar para /descubrams
              if (redirectPath === '/ms' || redirectPath.startsWith('/ms/')) {
                console.log('🔄 [AuthProvider]   ↳ Convertendo /ms para /descubrams');
                redirectPath = '/descubrams';
              }
            }
            // Se estamos em viajartur.com, garantir que não redireciona para /descubrams
            else if (currentHostname === 'viajartur.com' || currentHostname.includes('viajartur') || currentHostname === 'viajar.com') {
              console.log('🔄 [AuthProvider] ✅ Detectado ViaJAR');
              // Não redirecionar para /descubrams se estiver em viajartur.com
              if (redirectPath === '/descubrams' || redirectPath.startsWith('/descubrams/')) {
                console.log('🔄 [AuthProvider]   ↳ Prevenindo redirecionamento para /descubrams, usando /');
                redirectPath = '/';
              }
            } else {
              console.log('🔄 [AuthProvider] ⚠️ Domínio não reconhecido:', currentHostname);
            }
            
            const isDescubraMS = isDescubraMSContext();

            console.log('🔄 [AuthProvider] 📋 RESUMO DO REDIRECIONAMENTO:');
            console.log('🔄 [AuthProvider]   - É contexto Descubra MS:', isDescubraMS);
            console.log('🔄 [AuthProvider]   - Path final calculado:', redirectPath);
            console.log('🔄 [AuthProvider]   - Domínio será mantido:', currentHostname);

            // IMPORTANTE: Usar window.location.pathname para atualizar o path mantendo o domínio atual
            // Não forçar mudança de domínio - o usuário deve permanecer onde está
            console.log('🔄 [AuthProvider] 🚀 Executando redirecionamento em 100ms...');
            setTimeout(() => {
              console.log('🔄 [AuthProvider] ✅ Atualizando pathname para:', redirectPath);
              window.location.pathname = redirectPath;
            }, 100);
          }
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
      const currentTenant = pathSegments[0]; // 'viajar', 'ms', 'descubramatogrossodosul', etc.
      const isDescubraMS = currentTenant === 'descubramatogrossodosul' || currentTenant === 'ms';
      const isViajar = currentTenant === 'viajar';
      
      console.log("🏛️ SIGNUP: Tenant detectado:", currentTenant, "isDescubraMS:", isDescubraMS, "isViajar:", isViajar);
      
      // Redirecionar mantendo contexto do tenant
      let redirectUrl: string;
      if (isDescubraMS) {
        redirectUrl = `${window.location.origin}/descubrams`;
      } else if (isViajar) {
        redirectUrl = `${window.location.origin}/viajar/onboarding`;
      } else {
        redirectUrl = `${window.location.origin}/viajar/onboarding`; // Default para ViaJAR
      }
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

      if (error) {
        console.error("❌ SIGNUP: Erro detalhado:", {
          message: error.message,
          status: error.status,
          name: error.name,
          error: error
        });
        throw error;
      }

      // Se não há sessão retornada (email confirmation habilitado), tentar login automático
      if (data.user && !data.session) {
        console.log("🔄 SIGNUP: Sem sessão retornada, tentando login automático...");
        // Tentar fazer login imediatamente após signup
        // Isso funcionará se email confirmation estiver desabilitado no Supabase
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.log("⚠️ SIGNUP: Login automático falhou (email confirmation necessário):", signInError.message);
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu email para confirmar a conta antes de fazer login.",
          });
        } else if (signInData.session) {
          console.log("✅ SIGNUP: Login automático bem-sucedido!");
          toast({
            title: "Conta criada com sucesso!",
            description: "Você já está logado. Bem-vindo!",
          });
          // Retornar dados com a sessão de login
          return { data: { user: signInData.user, session: signInData.session }, error: null };
        }
      } else if (data.session) {
        console.log("✅ SIGNUP: Sessão retornada diretamente do signup");
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
      let errorMessage = err.message || "Ocorreu um erro inesperado.";
      
      // Tratamento específico para email já cadastrado
      if (error.message?.includes('User already registered') || error.message?.includes('already registered')) {
        errorMessage = "Este email já está cadastrado. Por favor, faça login em vez de criar uma nova conta.";
      } else if (error.message?.includes('Password should be')) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "Email inválido. Verifique o formato do email.";
      }
      
      toast({
        title: error.message?.includes('already registered') ? "Email já cadastrado" : "Erro no cadastro",
        description: errorMessage,
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
    } catch (error: unknown) {
      let errorMessage = "Erro ao fazer login";
      if (err.message?.includes("Invalid login credentials")) {
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
      // Importar função utilitária para detectar plataforma
      const { isDescubraMSContext } = await import('@/utils/authRedirect');
      const hostname = window.location.hostname.toLowerCase();
      const isDescubraMS = isDescubraMSContext();
      
      // Detectar contexto baseado no domínio primeiro
      let callbackPath: string;
      if (hostname === 'descubrams.com' || hostname.includes('descubrams')) {
        callbackPath = '/ms';
      } else if (hostname === 'viajartur.com' || hostname.includes('viajartur') || hostname === 'viajar.com') {
        callbackPath = '/auth/callback';
      } else {
        // Fallback: usar contexto detectado
        callbackPath = isDescubraMS ? '/ms' : '/auth/callback';
      }
      
      // IMPORTANTE: Garantir que o redirectTo seja ABSOLUTO e correto
      // Se estamos em descubrams.com, FORÇAR https://descubrams.com/ms
      // Se estamos em viajartur.com, FORÇAR https://viajartur.com/auth/callback
      let redirectPath: string;
      if (hostname === 'descubrams.com' || hostname.includes('descubrams')) {
        // FORÇAR absoluto para descobrams.com
        redirectPath = 'https://descubrams.com/ms';
      } else if (hostname === 'viajartur.com' || hostname.includes('viajartur') || hostname === 'viajar.com') {
        // FORÇAR absoluto para viajartur.com
        redirectPath = 'https://www.viajartur.com/auth/callback';
      } else {
        // Fallback: usar origin atual
        redirectPath = `${window.location.origin}${callbackPath}`;
      }
      
      console.log('🔍 [AuthProvider] PRE_OAUTH:', {
        hostname,
        callbackPath,
        redirectPath,
        provider,
        isDescubraMS
      });
      
      console.log("🔄 SOCIAL LOGIN: Hostname:", hostname);
      console.log("🔄 SOCIAL LOGIN: É Descubra MS:", isDescubraMS);
      console.log("🔄 SOCIAL LOGIN: Redirecionando para:", redirectPath);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectPath,
        },
      });
      
      console.log('🔍 [AuthProvider] POST_OAUTH:', {
        hasData: !!data,
        hasError: !!error,
        errorMessage: error?.message,
        oauthUrl: data?.url,
        redirectPath
      });

      logger.dev("🔍 AuthProvider (signInWithOAuth): Dados de login recebidos");

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