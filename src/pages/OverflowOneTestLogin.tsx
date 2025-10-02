import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Crown, Star, ArrowRight } from 'lucide-react';
import { overflowOneTestUsers, OverflowOneTestUser } from '@/utils/overflowOneTestUsers';
import { useOverflowOneAuth } from '@/hooks/useOverflowOneAuth';

const OverflowOneTestLogin: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<OverflowOneTestUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useOverflowOneAuth();
  const navigate = useNavigate();

  const handleTestLogin = async (user: OverflowOneTestUser) => {
    setIsLoading(true);
    try {
      // Simular login com usuário de teste
      console.log('🔄 Fazendo login com usuário de teste:', user.email);
      
      // Aqui você implementaria a lógica de login de teste
      // Por enquanto, vamos simular um login bem-sucedido
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirecionar para o dashboard baseado no tipo de usuário
      let dashboardPath = '/overflow-one/dashboard';
      
      switch (user.userType) {
        case 'empresa':
          dashboardPath = '/overflow-one/dashboard';
          break;
        case 'atendente':
          dashboardPath = '/overflow-one/atendente';
          break;
        case 'gestor_municipal':
          dashboardPath = '/overflow-one/municipal';
          break;
        case 'gestor_estadual':
          dashboardPath = '/overflow-one/estadual';
          break;
        case 'master_admin':
          dashboardPath = '/overflow-one/master';
          break;
        default:
          dashboardPath = '/overflow-one/dashboard';
      }
      
      navigate(dashboardPath);
    } catch (error) {
      console.error('Erro no login de teste:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (userType: string) => {
    switch (userType) {
      case 'master_admin': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'gestor_estadual': return <Star className="h-5 w-5 text-purple-500" />;
      case 'gestor_municipal': return <Building2 className="h-5 w-5 text-blue-500" />;
      case 'atendente': return <User className="h-5 w-5 text-green-500" />;
      case 'empresa': return <Building2 className="h-5 w-5 text-orange-500" />;
      default: return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRoleColor = (userType: string) => {
    switch (userType) {
      case 'master_admin': return 'bg-yellow-100 text-yellow-800';
      case 'gestor_estadual': return 'bg-purple-100 text-purple-800';
      case 'gestor_municipal': return 'bg-blue-100 text-blue-800';
      case 'atendente': return 'bg-green-100 text-green-800';
      case 'empresa': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'master_admin': return 'Master Admin';
      case 'gestor_estadual': return 'Gestor Estadual';
      case 'gestor_municipal': return 'Gestor Municipal';
      case 'atendente': return 'Atendente CAT';
      case 'empresa': return 'Empresa';
      default: return 'Usuário';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Teste de Login - Overflow One
          </h1>
          <p className="text-xl text-gray-600">
            Selecione um usuário de teste para fazer login na plataforma
          </p>
        </div>

        {/* Usuários de Teste */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {overflowOneTestUsers.map((user) => (
            <Card 
              key={user.email} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedUser?.email === user.email ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.userType)}
                    <CardTitle className="text-lg">{user.companyName}</CardTitle>
                  </div>
                  <Badge className={getRoleColor(user.userType)}>
                    {getUserTypeLabel(user.userType)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{user.contactPerson}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                  
                  <Badge className={getPlanColor(user.subscriptionPlan)}>
                    {user.subscriptionPlan}
                  </Badge>
                  
                  <p className="text-sm text-gray-500">{user.description}</p>
                  
                  <Button 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestLogin(user);
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entrando...' : 'Fazer Login'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Informações do Usuário Selecionado */}
        {selectedUser && (
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Usuário Selecionado</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Empresa:</p>
                  <p className="text-gray-900">{selectedUser.companyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Contato:</p>
                  <p className="text-gray-900">{selectedUser.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email:</p>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Plano:</p>
                  <Badge className={getPlanColor(selectedUser.subscriptionPlan)}>
                    {selectedUser.subscriptionPlan}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Card className="mt-8 bg-gray-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Instruções de Teste</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Clique em qualquer card para selecionar um usuário</p>
              <p>• Clique em "Fazer Login" para entrar na plataforma</p>
              <p>• Cada usuário tem diferentes permissões e planos</p>
              <p>• Use o usuário admin para acessar o Master Dashboard</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverflowOneTestLogin;
