// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import logoDescubra from '@/assets/images/logo-descubra-ms-v2.png';
import { getLoginRedirectPath, isDescubraMSContext } from '@/utils/authRedirect';
import { useBrand } from '@/context/BrandContext';
import {
  consumeGuataLoginReturn,
  peekGuataLoginReturn,
  saveGuataLoginReturn,
} from '@/utils/guataPendingAction';

/** Resolve para onde voltar após login — nunca manda para Guatá Labs (`/`). */
function resolvePostLoginPath(redirectUrlParam: string | null): string {
  const fromQuery = redirectUrlParam?.trim();
  if (fromQuery && fromQuery.startsWith('/') && !fromQuery.startsWith('//') && fromQuery !== '/') {
    if (!fromQuery.startsWith('/viajar') && fromQuery !== '/login') {
      // Limpa cópia no storage para não sobrar path antigo no próximo OAuth
      try { sessionStorage.removeItem('guata_login_return'); } catch { /* ignore */ }
      return fromQuery;
    }
  }

  const fromStorage = consumeGuataLoginReturn();
  if (fromStorage) return fromStorage;

  // Em contexto Descubra MS / chat Guatá, preferir chat a home ViaJAR
  if (isDescubraMSContext() || peekGuataLoginReturn()) {
    return '/descubrams/guata';
  }

  const fallback = getLoginRedirectPath();
  if (fallback === '/' || fallback.startsWith('/viajar')) {
    return '/descubrams/guata';
  }
  return fallback;
}

const AuthPage = () => {
  console.log('🔐 [AuthPage] ========== COMPONENTE RENDERIZADO ==========');
  console.log('🔐 [AuthPage] URL atual:', window.location.pathname);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useSecureAuth();
  
  // Tentar obter logo do BrandContext, com fallback
  let logoUrl = logoDescubra;
  try {
    const brand = useBrand();
    if (brand && brand.isMS) {
      logoUrl = brand.config.logo.src;
    }
  } catch (error) {
    // BrandContext não disponível, usar fallback
  }
  
  // Obter URL de redirect dos parâmetros da query
  const redirectUrlParam = searchParams.get('redirect') || searchParams.get('next');

  // Garantir que o retorno ao chat sobreviva ao OAuth (query some no callback)
  useEffect(() => {
    if (redirectUrlParam?.startsWith('/') && redirectUrlParam !== '/') {
      saveGuataLoginReturn(redirectUrlParam);
    }
  }, [redirectUrlParam]);
  
  console.log('🔐 [AuthPage] Estado inicial:', {
    isAuthenticated,
    authLoading,
    email: email ? 'preenchido' : 'vazio',
    password: password ? 'preenchido' : 'vazio',
    redirectUrlParam
  });

  // Redirecionar se já autenticado - RECALCULAR path baseado no domínio atual
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const calculatedRedirectPath = resolvePostLoginPath(redirectUrlParam);
      
      console.log('✅ [AuthPage] Usuário já autenticado, redirecionando para:', calculatedRedirectPath);
      console.log('✅ [AuthPage] Domínio atual:', window.location.hostname);
      navigate(calculatedRedirectPath, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, redirectUrlParam]);

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    console.log(`🔐 [AuthPage] SOCIAL LOGIN: Tentativa de login com ${provider}`);
    
    try {
      setLoading(true);
      
      // Detectar contexto baseado no domínio primeiro
      const hostname = window.location.hostname.toLowerCase();
      const isDescubraMS = isDescubraMSContext();
      
      // Se está em descubrams.com, usar /ms para callback OAuth
      // Se está em viajartur.com, usar /auth/callback
      // O componente OAuthCallback processará o token e redirecionará corretamente
      let callbackPath: string;
      if (hostname === 'descubrams.com' || hostname.includes('descubrams')) {
        callbackPath = '/ms';
      } else if (hostname === 'viajartur.com' || hostname.includes('viajartur') || hostname === 'viajar.com') {
        callbackPath = '/auth/callback';
      } else {
        // Fallback: usar contexto detectado
        callbackPath = isDescubraMS ? '/ms' : '/auth/callback';
      }
      
      console.log("🏛️ [AuthPage] SOCIAL LOGIN: Hostname:", hostname);
      console.log("🏛️ [AuthPage] SOCIAL LOGIN: É Descubra MS:", isDescubraMS);
      console.log("🔄 [AuthPage] SOCIAL LOGIN: Callback path:", callbackPath);
      
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
      
      console.log('🔍 [AuthPage] PRE_OAUTH:', {
        hostname,
        callbackPath,
        redirectPath,
        provider,
        isDescubraMS
      });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectPath,
        },
      });
      
      console.log('🔍 [AuthPage] POST_OAUTH:', {
        hasData: !!data,
        hasError: !!error,
        errorMessage: error?.message,
        oauthUrl: data?.url,
        redirectPath
      });

      if (error) {
        throw error;
      }

      console.log('✅ [AuthPage] SOCIAL LOGIN: Redirecionamento iniciado');
    } catch (error: unknown) {
      console.error(`❌ [AuthPage] SOCIAL LOGIN: Erro no login com ${provider}:`, error);
      setLoading(false);
      toast({
        title: "Erro no Login",
        description: `Erro ao fazer login com ${provider}: ${error?.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔐 [AuthPage] ========== INÍCIO LOGIN ==========');
    console.log('🔐 [AuthPage] Event:', e);
    console.log('🔐 [AuthPage] Email:', email);
    console.log('🔐 [AuthPage] Password:', password ? '***' : 'vazio');
    console.log('🔐 [AuthPage] Loading:', loading);
    
    if (!email || !password) {
      console.warn('⚠️ [AuthPage] Campos vazios');
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (loading) {
      console.warn('⚠️ [AuthPage] Já está processando login');
      return;
    }

    console.log('🔐 [AuthPage] Campos preenchidos, iniciando login...');
    setLoading(true);
    
    try {
      console.log('🔐 [AuthPage] Chamando supabase.auth.signInWithPassword...');
      
      // Fazer login diretamente com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log('🔐 [AuthPage] Resultado do login:', {
        hasUser: !!data?.user,
        userId: data?.user?.id,
        error: error ? {
          message: error.message,
          status: error.status,
          name: error.name
        } : null
      });

      if (error) {
        console.error('❌ [AuthPage] Erro do Supabase:', error);
        throw error;
      }

      if (data?.user) {
        console.log('✅ [AuthPage] Login bem-sucedido!');
        console.log('✅ [AuthPage] User ID:', data.user.id);
        console.log('✅ [AuthPage] User Email:', data.user.email);
        
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!",
        });
        
        // Aguardar um pouco para garantir que a sessão foi estabelecida
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // IMPORTANTE: query ?redirect= OU sessionStorage (OAuth) — nunca Guatá Labs `/`
        const redirectPath = resolvePostLoginPath(redirectUrlParam);
        
        console.log('✅ [AuthPage] Redirecionando para:', redirectPath);
        console.log('✅ [AuthPage] Domínio atual:', window.location.hostname);
        console.log('✅ [AuthPage] É contexto Descubra MS:', isDescubraMSContext());
        navigate(redirectPath, { replace: true });
      } else {
        console.error('❌ [AuthPage] Login retornou sem usuário');
        throw new Error('Login retornou sem dados do usuário');
      }
    } catch (error: unknown) {
      console.error('❌ [AuthPage] Erro no login:', {
        error,
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      
      let errorMessage = "Erro ao fazer login";
      if (error?.message?.includes('Invalid login credentials') || 
          error?.message?.includes('invalid_credentials') ||
          error?.status === 400) {
        errorMessage = "Email ou senha incorretos";
      } else if (error?.message?.includes('Email not confirmed') || 
                 error?.message?.includes('email_not_confirmed')) {
        errorMessage = "Email não confirmado. Verifique sua caixa de entrada.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro no Login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log('🔐 [AuthPage] Finalizando (setLoading false)');
      setLoading(false);
      console.log('🔐 [AuthPage] ========== FIM LOGIN ==========');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin mx-auto rounded-full border-4 border-blue-200 border-t-blue-600 h-12 w-12 mb-4"></div>
          <div className="text-gray-600">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header com logo */}
      <div className="flex justify-center py-6 bg-white">
        <img
          src={logoUrl}
          alt="Descubra Mato Grosso do Sul"
          className="h-[60px] w-auto"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('logo-descubra-ms.png')) {
              target.src = "/images/logo-descubra-ms.png";
            }
          }}
        />
      </div>

      {/* Formulário de login com gradient de fundo */}
      <div className="flex-grow bg-gradient-to-br from-blue-600 via-teal-500 to-green-600 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Descubra Mato Grosso do Sul
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Entre na sua conta
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <form 
                onSubmit={(e) => {
                  console.log('🔐 [AuthPage] ========== FORM SUBMIT DISPARADO ==========');
                  console.log('🔐 [AuthPage] Event:', e);
                  console.log('🔐 [AuthPage] Target:', e.target);
                  handleLogin(e);
                }} 
                className="space-y-4"
                noValidate
                id="login-form"
              >
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    required
                    disabled={loading}
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-gray-700 font-medium">Senha</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      required
                      disabled={loading}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-gray-100"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="button"
                  className="w-full bg-yellow-500 text-blue-900 hover:bg-yellow-400 font-semibold py-2.5 mt-6"
                  disabled={loading || !email || !password}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('🔐 [AuthPage] ========== BOTÃO CLICADO ==========');
                    console.log('🔐 [AuthPage] Estado:', { 
                      email, 
                      hasPassword: !!password, 
                      loading,
                      disabled: loading || !email || !password
                    });
                    
                    if (!email || !password) {
                      console.warn('⚠️ [AuthPage] Campos vazios');
                      toast({
                        title: "Erro",
                        description: "Por favor, preencha todos os campos",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    if (loading) {
                      console.warn('⚠️ [AuthPage] Já está processando');
                      return;
                    }
                    
                    // Chamar handleLogin diretamente
                    console.log('✅ [AuthPage] Chamando handleLogin diretamente');
                    const fakeEvent = {
                      preventDefault: () => {},
                      stopPropagation: () => {},
                    } as React.FormEvent<HTMLFormElement>;
                    
                    await handleLogin(fakeEvent);
                  }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-900 border-t-transparent rounded-full"></div>
                      Entrando...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Entrar
                    </>
                  )}
                </Button>
              </form>

              {/* Login Social */}
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Ou continue com</span>
                  </div>
                </div>
                
                <SocialLoginButtons onSocialLogin={handleSocialLogin} />
              </div>

              {/* Link para Cadastro */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => navigate(`/descubrams/register${window.location.search || ''}`)}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Criar conta
                  </button>
                </p>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;