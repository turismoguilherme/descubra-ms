import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, CheckCircle, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const OverflowOneForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const location = useLocation();

  const isMsDescubrams = location.pathname.startsWith('/descubrams');
  const loginPath = isMsDescubrams ? '/descubrams/partner/login' : '/viajar/login';
  const siteHomePath = isMsDescubrams ? '/descubrams' : '/viajar';

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch {
      // Erro já notificado pelo AuthProvider (toast)
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    if (isMsDescubrams) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <Link
                to={loginPath}
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold text-white">Área do Parceiro</h1>
                  <p className="text-white/80 text-sm">Descubra Mato Grosso do Sul</p>
                </div>
              </div>
            </div>

            <Card className="border-0 shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">E-mail enviado</h2>
                <p className="text-gray-600 mb-6">
                  Enviamos um link para redefinir sua senha para <strong>{email}</strong>. Verifique sua caixa de
                  entrada e o spam.
                </p>
                <div className="space-y-3">
                  <Link to={loginPath} className="block">
                    <Button className="w-full bg-ms-primary-blue hover:bg-ms-discovery-teal text-white" size="lg">
                      Voltar para o login
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full border-ms-primary-blue text-ms-primary-blue hover:bg-ms-primary-blue/5"
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail('');
                    }}
                  >
                    Enviar para outro e-mail
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Email enviado!</h1>
              <p className="text-gray-600 mb-6">
                Enviamos um link para redefinir sua senha para <strong>{email}</strong>. Verifique sua caixa de entrada
                e siga as instruções.
              </p>
              <div className="space-y-3">
                <Link to={loginPath}>
                  <Button className="w-full">Voltar para o login</Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                >
                  Enviar para outro email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isMsDescubrams) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Link
              to={siteHomePath}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao site
            </Link>
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-white">Área do Parceiro</h1>
                <p className="text-white/80 text-sm">Descubra Mato Grosso do Sul</p>
              </div>
            </div>
            <p className="text-white/90 text-sm mt-2 max-w-sm mx-auto">
              Esqueceu sua senha? Informe o e-mail da sua conta de parceiro para receber o link de redefinição.
            </p>
          </div>

          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl flex items-center justify-center gap-2 text-gray-900">
                <Mail className="w-6 h-6 text-ms-primary-blue shrink-0" />
                Redefinir senha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-ms-primary-blue hover:bg-ms-discovery-teal text-white"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">Lembrou da senha? </span>
                <Link to={loginPath} className="text-ms-primary-blue hover:text-ms-discovery-teal font-medium">
                  Faça login aqui
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-white/80">
            <p>
              Precisa de ajuda?{' '}
              <Link to="/suporte" className="text-white hover:underline font-medium">
                Entre em contato conosco
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to={loginPath} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o login
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Esqueceu sua senha?</h1>
          <p className="text-gray-600">Digite seu email e enviaremos um link para redefinir sua senha</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Redefinir Senha</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-viajar">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email-viajar"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Lembrou da senha?{' '}
                <Link to={loginPath} className="text-blue-600 hover:text-blue-700 font-medium">
                  Faça login aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Precisa de ajuda?{' '}
            <Link to="/suporte" className="text-blue-600 hover:text-blue-700">
              Entre em contato conosco
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OverflowOneForgotPassword;
