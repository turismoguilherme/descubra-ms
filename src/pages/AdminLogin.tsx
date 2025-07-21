
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { simulateLogin, clearTestData, getTestData } from '@/utils/testDashboards';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implementar autenticação real com Supabase
      setError('Autenticação não implementada. Entre em contato com o administrador do sistema.');
      
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = (role: string) => {
    simulateLogin(role as any);
    setIsTestMode(true);
    console.log(`🧪 Login de teste rápido: ${role}`);
    navigate('/ms/admin');
  };

  const handleClearTest = () => {
    clearTestData();
    setIsTestMode(false);
    console.log('🧹 Dados de teste limpos');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/ms')}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Site
            </Button>
          </div>
          
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Portal Administrativo
            </CardTitle>
            <p className="text-sm text-gray-600">
              Acesso restrito para administradores e gestores
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Modo de Teste Ativo */}
          {isTestMode && (
            <Alert className="bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Modo de teste ativo. Use os botões abaixo para testar os dashboards.
              </AlertDescription>
            </Alert>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.gov.br"
                required
                className="border-gray-300 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="border-gray-300 focus:border-blue-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              className="text-blue-600 hover:text-blue-700 text-sm"
              onClick={() => navigate('/ms/password-reset')}
            >
              Esqueceu sua senha? <span className="font-medium">Recuperar acesso</span>
            </Button>
          </div>

          {/* Seção de Perfis de Acesso */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Perfis de Acesso:
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div>• Admin/Tech: Portal FlowTrip</div>
              <div>• Diretor Estadual: Gestão Estadual</div>
              <div>• Gestor IGR: Administração Técnica</div>
              <div>• Gestor Municipal: Administração Municipal</div>
            </div>
          </div>

          {/* Note: Bypass de teste removido por segurança */}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
