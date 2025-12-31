import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const OverflowOneLogin: React.FC = () => {
  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
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
  
  const { signIn } = auth;
  const { toast } = useToast();
  const navigate = useNavigate();

  // Detectar automaticamente o tipo de login (CADASTUR, CNPJ ou Email)
  const detectLoginType = (value: string): 'cadastur' | 'cnpj' | 'email' => {
    const digitsOnly = value.replace(/\D/g, '');
    
    // Se contém @, é email
    if (value.includes('@')) {
      return 'email';
    }
    
    // Se tem 15 dígitos, é CADASTUR
    if (digitsOnly.length === 15) {
      return 'cadastur';
    }
    
    // Se tem 14 dígitos, é CNPJ
    if (digitsOnly.length === 14) {
      return 'cnpj';
    }
    
    // Por padrão, tentar como email se não conseguir detectar
    return 'email';
  };

  const handleInputChange = (value: string) => {
    // Formatar automaticamente se for CNPJ ou CADASTUR
    const digitsOnly = value.replace(/\D/g, '');
    
    if (digitsOnly.length <= 14) {
      // Formatar como CNPJ: 00.000.000/0000-00
      let formatted = digitsOnly.replace(/^(\d{2})(\d)/, '$1.$2');
      formatted = formatted.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      formatted = formatted.replace(/\.(\d{3})(\d)/, '.$1/$2');
      formatted = formatted.replace(/(\d{4})(\d)/, '$1-$2');
      setLoginField(formatted);
    } else if (digitsOnly.length <= 15) {
      // Formatar como CADASTUR: 00.000.000/0000-000
      let formatted = digitsOnly.replace(/^(\d{2})(\d)/, '$1.$2');
      formatted = formatted.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      formatted = formatted.replace(/\.(\d{3})(\d)/, '.$1/$2');
      formatted = formatted.replace(/(\d{4})(\d)/, '$1-$2');
      setLoginField(formatted);
    } else {
      // Email ou texto sem formatação
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
        // Buscar email pelo CADASTUR no banco
        const cleanCadastur = loginField.replace(/\D/g, '');
        const { data: profile } = await supabase
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
        // Buscar email pelo CNPJ no banco
        const cleanCnpj = loginField.replace(/\D/g, '');
        const { data: profile } = await supabase
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
      // Se for email, usar diretamente

      const { error } = await signIn(loginEmail, password);
      
      if (error) {
        setError(error.message);
      } else {
        // Redirecionar baseado no contexto (MS ou ViaJAR)
        const currentPath = window.location.pathname;
        if (currentPath.includes('/descubrams/') || currentPath.includes('/ms/')) {
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


  return (
    <div className="min-h-screen bg-background">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-viajar-slate to-slate-800 py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-viajar-cyan/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 text-viajar-cyan" />
              <span className="text-sm text-white/90 font-medium">Acesso à Plataforma</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Entrar na ViajARTur
          </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Acesse sua conta empresarial e continue transformando seu negócio turístico
          </p>
          </div>
        </div>
      </section>

      {/* Login Form */}
      <section className="py-20 -mt-10">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Entrar na ViajARTur
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

              {/* Campo Unificado de Login */}
              <div className="space-y-2">
                <Label htmlFor="loginField">
                  CNPJ, CADASTUR ou Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="loginField"
                    type="text"
                    placeholder="00.000.000/0000-00, 00.000.000/0000-000 ou seu@email.com"
                    value={loginField}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {(() => {
                    const loginType = detectLoginType(loginField);
                    const digitsOnly = loginField.replace(/\D/g, '');
                    
                    if (loginType === 'email') {
                      return 'Email detectado';
                    } else if (loginType === 'cnpj' && digitsOnly.length === 14) {
                      return 'CNPJ detectado (14 dígitos)';
                    } else if (loginType === 'cadastur' && digitsOnly.length === 15) {
                      return 'CADASTUR detectado (15 dígitos)';
                    } else if (digitsOnly.length > 0 && digitsOnly.length < 14) {
                      return 'Digite o CNPJ completo (14 dígitos)';
                    } else if (digitsOnly.length > 14 && digitsOnly.length < 15) {
                      return 'Digite o CADASTUR completo (15 dígitos)';
                    } else {
                      return 'Digite seu CNPJ, CADASTUR ou email de cadastro';
                    }
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