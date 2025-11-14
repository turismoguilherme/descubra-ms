import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';

const OverflowOneLogin: React.FC = () => {
  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState<'cadastur' | 'cnpj' | 'email'>('cadastur');
  
  // Verificar se o AuthProvider está disponível
  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('OverflowOneLogin: AuthProvider não disponível:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando sistema de autenticação...</p>
        </div>
      </div>
    );
  }
  
  const { signIn, signInWithProvider } = auth;
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let loginEmail = loginField;
      
      if (loginMethod === 'cadastur') {
        // Buscar email pelo CADASTUR no banco
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('cadastur', loginField)
          .single();
        
        if (!profile) {
          setError('CADASTUR não encontrado. Verifique o número ou cadastre-se.');
          return;
        }
        
        loginEmail = profile.email;
      } else if (loginMethod === 'cnpj') {
        // Buscar email pelo CNPJ no banco
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('cnpj', loginField)
          .single();
        
        if (!profile) {
          setError('CNPJ não encontrado. Verifique o número ou cadastre-se.');
          return;
        }
        
        loginEmail = profile.email;
      }
      // Se for email, usar diretamente

      const { error } = await signIn(loginEmail, password);
      
      if (error) {
        setError(error.message);
      } else {
        // Redirecionar baseado no contexto (MS ou ViaJAR)
        const currentPath = window.location.pathname;
        if (currentPath.includes('/ms/')) {
          navigate('/ms');
        } else {
          navigate('/viajar/dashboard');
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithProvider('google');
    } catch (err) {
      setError('Erro ao fazer login com Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-white">Entrar na</span>
              <span className="text-cyan-300"> ViaJAR</span>
          </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Acesse sua conta empresarial e continue transformando seu negócio turístico
          </p>
          </div>
        </div>
      </section>

      {/* Login Form */}
      <div className="max-w-md mx-auto px-4 py-12">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Entrar na ViaJAR
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Acesse sua conta empresarial
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Método de Login */}
              <div className="space-y-2">
                <Label>Método de Login</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={loginMethod === 'cadastur' ? 'default' : 'outline'}
                    onClick={() => setLoginMethod('cadastur')}
                    className="text-xs"
                  >
                    CADASTUR
                  </Button>
                  <Button
                    type="button"
                    variant={loginMethod === 'cnpj' ? 'default' : 'outline'}
                    onClick={() => setLoginMethod('cnpj')}
                    className="text-xs"
                  >
                    CNPJ
                  </Button>
                  <Button
                    type="button"
                    variant={loginMethod === 'email' ? 'default' : 'outline'}
                    onClick={() => setLoginMethod('email')}
                    className="text-xs"
                  >
                    Email
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loginField">
                  {loginMethod === 'cadastur' ? 'CADASTUR' : 
                   loginMethod === 'cnpj' ? 'CNPJ' : 'Email'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="loginField"
                    type={loginMethod === 'email' ? 'email' : 'text'}
                    placeholder={
                      loginMethod === 'cadastur' ? '123456789' :
                      loginMethod === 'cnpj' ? '12.345.678/0001-90' :
                      'seu@email.com'
                    }
                    value={loginField}
                    onChange={(e) => setLoginField(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {loginMethod === 'cadastur' && (
                  <p className="text-xs text-gray-500">
                    Digite seu número CADASTUR (Cadastro de Prestadores de Serviços Turísticos)
                  </p>
                )}
                {loginMethod === 'cnpj' && (
                  <p className="text-xs text-gray-500">
                    Digite seu CNPJ (com ou sem formatação)
                  </p>
                )}
                {loginMethod === 'email' && (
                  <p className="text-xs text-gray-500">
                    Digite seu email de cadastro
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link 
                  to="/viajar/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou continue com</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuar com Google
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link to="/viajar/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Cadastre-se aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Ao fazer login, você concorda com nossos{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-700">
              Termos de Serviço
            </Link>{' '}
            e{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OverflowOneLogin;