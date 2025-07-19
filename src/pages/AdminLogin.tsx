
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro de autenticação",
          description: "Credenciais inválidas. Verifique seu e-mail e senha.",
          variant: "destructive",
        });
        return;
      }

      // Verificar se o usuário tem permissões administrativas
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (!userRole || !['admin', 'tech', 'diretor_estadual', 'gestor_igr', 'municipal_manager'].includes(userRole.role)) {
        await supabase.auth.signOut();
        toast({
          title: "Acesso negado",
          description: "Você não possui permissões administrativas.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o portal administrativo...",
      });

      // Redirecionar baseado no tipo de usuário
      if (['admin', 'tech'].includes(userRole.role)) {
        navigate('/admin-portal');
      } else if (userRole.role === 'diretor_estadual') {
        navigate('/ms/management');
      } else if (userRole.role === 'gestor_igr') {
        navigate('/ms/technical-admin');
      } else if (userRole.role === 'municipal_manager') {
        navigate('/ms/municipal-admin');
      } else {
        navigate('/ms/role-dashboard');
      }

    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro interno",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-white hover:bg-slate-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Site
        </Button>

        <Card className="bg-white shadow-xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 mx-auto">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Portal Administrativo</CardTitle>
            <CardDescription>
              Acesso restrito para administradores e gestores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">E-mail</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exemplo.gov.br"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Senha</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Autenticando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Esqueceu sua senha?{' '}
                <button 
                  onClick={() => navigate('/ms/password-reset')}
                  className="text-blue-600 hover:underline"
                >
                  Recuperar acesso
                </button>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Perfis de Acesso:</strong></p>
                <p>• Admin/Tech: Portal FlowTrip</p>
                <p>• Diretor Estadual: Gestão Estadual</p>
                <p>• Gestor IGR: Administração Técnica</p>
                <p>• Gestor Municipal: Administração Municipal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Protegido por criptografia de ponta e auditoria completa
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
