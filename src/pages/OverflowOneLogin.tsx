import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Mail, Lock, Sparkles, Building2, Landmark, FlaskConical } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import { isViajarTestLoginEnabled } from '@/utils/viajarTestLogin';
import { getTestUser, autoLoginTestUser, type TestUser } from '@/services/auth/TestUsers';

const OverflowOneLogin: React.FC = () => {
  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  let auth = null;
  try {
    auth = useAuth();
  } catch (err) {
    console.error('OverflowOneLogin: AuthProvider não disponível:', err);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando sistema de autenticação...</p>
        </div>
      </div>
    );
  }

  const { signIn } = auth;
  const { toast } = useToast();
  const navigate = useNavigate();
  const testLoginEnabled = isViajarTestLoginEnabled();

  const navigateAfterTestUser = (user: TestUser) => {
    switch (user.role) {
      case 'admin':
        navigate('/viajar/dashboard');
        break;
      case 'gestor_municipal':
        navigate('/secretary-dashboard');
        break;
      case 'user':
        navigate('/private-dashboard');
        break;
      case 'atendente':
      case 'cat_attendant':
        navigate('/attendant-dashboard');
        break;
      default:
        navigate('/unified');
    }
  };

  const handleTestCardClick = (userId: string) => {
    const u = getTestUser(userId);
    if (!u) return;
    autoLoginTestUser(userId);
    toast({
      title: 'Entrando em modo teste',
      description: `${u.name} — sem credenciais`,
    });
    window.setTimeout(() => navigateAfterTestUser(u), 450);
  };

  const detectLoginType = (value: string): 'cadastur' | 'cnpj' | 'email' => {
    const digitsOnly = value.replace(/\D/g, '');

    if (value.includes('@')) {
      return 'email';
    }

    if (digitsOnly.length === 15) {
      return 'cadastur';
    }

    if (digitsOnly.length === 14) {
      return 'cnpj';
    }

    return 'email';
  };

  const handleInputChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');

    if (digitsOnly.length <= 14) {
      let formatted = digitsOnly.replace(/^(\d{2})(\d)/, '$1.$2');
      formatted = formatted.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      formatted = formatted.replace(/\.(\d{3})(\d)/, '.$1/$2');
      formatted = formatted.replace(/(\d{4})(\d)/, '$1-$2');
      setLoginField(formatted);
    } else if (digitsOnly.length <= 15) {
      let formatted = digitsOnly.replace(/^(\d{2})(\d)/, '$1.$2');
      formatted = formatted.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      formatted = formatted.replace(/\.(\d{3})(\d)/, '.$1/$2');
      formatted = formatted.replace(/(\d{4})(\d)/, '$1-$2');
      setLoginField(formatted);
    } else {
      setLoginField(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const loginType = detectLoginType(loginField);
      let loginEmail = loginField;

      if (loginType === 'cadastur') {
        const cleanCadastur = loginField.replace(/\D/g, '');
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('email')
          .eq('cadastur', cleanCadastur)
          .maybeSingle();

        if (!profile) {
          setError('CADASTUR não encontrado. Verifique o número ou cadastre-se.');
          setIsLoading(false);
          return;
        }

        loginEmail = profile.email;
      } else if (loginType === 'cnpj') {
        const cleanCnpj = loginField.replace(/\D/g, '');
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('email')
          .eq('cnpj', cleanCnpj)
          .maybeSingle();

        if (!profile) {
          setError('CNPJ não encontrado. Verifique o número ou cadastre-se.');
          setIsLoading(false);
          return;
        }

        loginEmail = profile.email;
      }

      const { error: signErr } = await signIn(loginEmail, password);

      if (signErr) {
        setError(signErr.message);
      } else {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/descubrams/') || currentPath.includes('/ms/')) {
          navigate('/ms');
        } else {
          navigate('/viajar/dashboard');
        }
      }
    } catch {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ViaJARNavbar />

      <section className="relative overflow-hidden bg-gradient-to-b from-viajar-slate to-slate-800 py-20">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="absolute top-20 left-1/4 w-96 h-96 bg-viajar-cyan/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 text-viajar-cyan" />
              <span className="text-sm text-white/90 font-medium">Acesso à Plataforma</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Entrar na ViajARTur</h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Acesse sua conta empresarial e continue transformando seu negócio turístico
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 -mt-10">
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${testLoginEnabled ? 'max-w-5xl' : 'max-w-md'}`}>
          {testLoginEnabled && (
            <div className="mb-10 rounded-2xl border-2 border-dashed border-viajar-cyan/40 bg-gradient-to-br from-slate-50 to-cyan-50/40 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center mb-6">
                <FlaskConical className="h-6 w-6 text-viajar-cyan shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Login de teste — sem credenciais</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Setor privado (empresas) ou setor público (gestão / CAT). Um clique para entrar.
                  </p>
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2 mb-3 text-gray-800 font-semibold">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Setor privado
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'hotel-owner-1', title: 'Hotel / Pousada', sub: 'Pousada do Sol', icon: '🏨' },
                      { id: 'agency-owner-1', title: 'Agência', sub: 'Viagens & Cia', icon: '🚌' },
                      { id: 'restaurant-owner-1', title: 'Restaurante', sub: 'Sabores do MS', icon: '🍽️' },
                      { id: 'attraction-owner-1', title: 'Atração', sub: 'Parque das Cachoeiras', icon: '🎯' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleTestCardClick(c.id)}
                        className="text-left rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-viajar-cyan hover:shadow-md transition-all"
                      >
                        <div className="text-2xl mb-1">{c.icon}</div>
                        <div className="font-medium text-gray-900">{c.title}</div>
                        <div className="text-xs text-gray-500">{c.sub}</div>
                        <Badge variant="secondary" className="mt-2 text-[10px]">
                          Privado
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3 text-gray-800 font-semibold">
                    <Landmark className="h-5 w-5 text-emerald-700" />
                    Setor público / gestão
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'municipal-1', title: 'Gestor municipal', sub: 'Secretaria Bonito', icon: '🏛️' },
                      { id: 'attendant-1', title: 'Atendente CAT', sub: 'CAT Centro', icon: '👩‍💼' },
                      { id: 'cat-attendant-1', title: 'Atendente CAT', sub: 'CAT Aeroporto', icon: '👨‍💼' },
                      { id: 'admin-1', title: 'Admin plataforma', sub: 'ViajARTur', icon: '⚙️' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleTestCardClick(c.id)}
                        className="text-left rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-emerald-500/60 hover:shadow-md transition-all"
                      >
                        <div className="text-2xl mb-1">{c.icon}</div>
                        <div className="font-medium text-gray-900">{c.title}</div>
                        <div className="text-xs text-gray-500">{c.sub}</div>
                        <Badge variant="outline" className="mt-2 text-[10px] border-emerald-600/30">
                          Público
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-6">
                Ativo em desenvolvimento; em produção use{' '}
                <code className="rounded bg-muted px-1">VITE_ENABLE_TEST_LOGIN=true</code>
              </p>
            </div>
          )}

          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {testLoginEnabled ? 'Ou entre com credenciais' : 'Entrar na ViajARTur'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {testLoginEnabled
                  ? 'CNPJ, CADASTUR, e-mail e senha da sua conta real'
                  : 'Acesse sua conta empresarial'}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate={testLoginEnabled}>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="loginField">CNPJ, CADASTUR ou Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="loginField"
                      type="text"
                      placeholder="00.000.000/0000-00, 00.000.000/0000-000 ou seu@email.com"
                      value={loginField}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="pl-10"
                      required={!testLoginEnabled}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const loginType = detectLoginType(loginField);
                      const digitsOnly = loginField.replace(/\D/g, '');

                      if (loginType === 'email') {
                        return 'Email detectado';
                      }
                      if (loginType === 'cnpj' && digitsOnly.length === 14) {
                        return 'CNPJ detectado (14 dígitos)';
                      }
                      if (loginType === 'cadastur' && digitsOnly.length === 15) {
                        return 'CADASTUR detectado (15 dígitos)';
                      }
                      if (digitsOnly.length > 0 && digitsOnly.length < 14) {
                        return 'Digite o CNPJ completo (14 dígitos)';
                      }
                      if (digitsOnly.length > 14 && digitsOnly.length < 15) {
                        return 'Digite o CADASTUR completo (15 dígitos)';
                      }
                      return 'Digite seu CNPJ, CADASTUR ou email de cadastro';
                    })()}
                  </p>
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
                      required={!testLoginEnabled}
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
                  <Link to="/viajar/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
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

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Ao fazer login, você concorda com nossos{' '}
              <Link to="/terms" className="text-viajar-cyan hover:underline">
                Termos de Serviço
              </Link>{' '}
              e{' '}
              <Link to="/privacy" className="text-viajar-cyan hover:underline">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default OverflowOneLogin;
