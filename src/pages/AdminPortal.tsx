import React, { useState } from 'react';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart3, Users, MapPin, Calendar, TrendingUp, Settings, Bell, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
// Utilities removidos - funcionalidade de teste não necessária em produção
import AtendenteDashboard from '@/components/admin/dashboards/AtendenteDashboard';
import MunicipalDashboard from '@/components/admin/dashboards/MunicipalDashboard';
import RegionalDashboard from '@/components/admin/dashboards/RegionalDashboard';
import EstadualDashboard from '@/components/admin/dashboards/EstadualDashboard';
import CommunityModerationTrigger from '@/components/admin/community-moderation/CommunityModerationTrigger';
import MasterDashboard from '@/components/admin/MasterDashboard';
import AttendantManager from '@/components/admin/AttendantManager';
import PlatformConfigCenter from '@/components/admin/PlatformConfigCenter';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import SecurityDashboard from '@/components/admin/SecurityDashboard';

const AdminPortal = () => {
  console.log('🚀 AdminPortal: Componente iniciando...');
  
  const { userRole, getDashboardComponent } = useRoleBasedAccess();

  // Debug logs mais detalhados
  console.log('🔍 AdminPortal Debug Detalhado:');
  console.log('userRole:', userRole);
  console.log('userRole type:', typeof userRole);
  
  // Verificar se é usuário de teste
  const testToken = localStorage.getItem('supabase.auth.token');
  const isTestUser = testToken === 'test-token';
  console.log('isTestUser:', isTestUser);
  
  console.log('getDashboardComponent:', getDashboardComponent());
  console.log('getDashboardComponent type:', typeof getDashboardComponent);

  // Renderizar dashboard específico baseado no role
  const renderDashboard = () => {
    console.log('🎯 Renderizando dashboard para role:', userRole);
    
    try {
      switch (userRole) {
        case 'atendente':
          console.log('✅ Renderizando AtendenteDashboard');
          return <AtendenteDashboard />;
        case 'gestor_municipal':
          console.log('✅ Renderizando MunicipalDashboard');
          return <MunicipalDashboard />;
        case 'gestor_igr':
          console.log('✅ Renderizando RegionalDashboard');
          return <RegionalDashboard />;
        case 'diretor_estadual':
          console.log('✅ Renderizando EstadualDashboard');
          return <EstadualDashboard />;
        case 'admin':
          console.log('✅ Renderizando MasterDashboard (novo)');
          return <MasterDashboard />;
        case 'tech':
          console.log('✅ Renderizando AdminDashboard');
          return <AdminDashboard />;
        default:
          console.log('⚠️ Role não reconhecido:', userRole, 'usando DefaultDashboard');
          return <DefaultDashboard />;
      }
    } catch (error) {
      console.error('❌ Erro ao renderizar dashboard:', error);
      return <ErrorDashboard error={error} />;
    }
  };

  console.log('🏁 AdminPortal: Renderizando componente...');

  return (
    <UniversalLayout>
      {renderDashboard()}
    </UniversalLayout>
  );
};

// AdminDashboard component para usuários admin/tech
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold">Painel Administrativo</h1>
                <p className="text-muted-foreground">
                  Gestão avançada da plataforma OverFlow One
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('attendants')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'attendants'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Atendentes
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'config'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Configurações
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Usuários
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="h-4 w-4 inline mr-2" />
                Segurança
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="mt-6">
            {activeTab === 'dashboard' && <MasterDashboard />}
            {activeTab === 'attendants' && <AttendantManager />}
            {activeTab === 'config' && <PlatformConfigCenter />}
            {activeTab === 'users' && <AdminUserManagement />}
            {activeTab === 'security' && <SecurityDashboard />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard padrão para usuários sem role específico
const DefaultDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              Acesso Restrito
            </h1>
            <p className="text-gray-100">
              Você não tem permissão para acessar esta área administrativa.
            </p>
          </div>
        </div>
      </section>
      
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">Acesso Negado</h2>
              <p className="text-gray-600 mb-6">
                Esta área é restrita a usuários com permissões administrativas específicas.
              </p>
              <Button asChild>
                <Link to="/">Voltar ao Início</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

// Componente de erro para capturar problemas
const ErrorDashboard = ({ error }: { error: any }) => {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              Erro no Dashboard
            </h1>
            <p className="text-red-100">
              Ocorreu um erro ao carregar o dashboard administrativo.
            </p>
          </div>
        </div>
      </section>
      
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold mb-4">Detalhes do Erro</h2>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                {error?.message || error?.toString() || 'Erro desconhecido'}
              </pre>
              <Button asChild className="mt-4">
                <Link to="/">Voltar ao Início</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AdminPortal;