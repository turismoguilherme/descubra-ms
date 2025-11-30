import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminHeader from '@/components/admin/layout/AdminHeader';
import AdminLogin from '@/components/admin/AdminLogin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, DollarSign, FileText } from 'lucide-react';
import { lazy, Suspense } from 'react';
import LoadingFallback from '@/components/ui/loading-fallback';

// Lazy load components
const EmployeesManagement = lazy(() => import('@/components/admin/viajar/EmployeesManagement'));
const ClientsManagement = lazy(() => import('@/components/admin/viajar/ClientsManagement'));
const SubscriptionsManagement = lazy(() => import('@/components/admin/viajar/SubscriptionsManagement'));
const CompanySettings = lazy(() => import('@/components/admin/viajar/CompanySettings'));
const ContentEditor = lazy(() => import('@/components/admin/descubra_ms/ContentEditor'));
const MenuManager = lazy(() => import('@/components/admin/descubra_ms/MenuManager'));
const UsersManagement = lazy(() => import('@/components/admin/descubra_ms/UsersManagement'));
const PlatformSettings = lazy(() => import('@/components/admin/descubra_ms/PlatformSettings'));
const EventsManagement = lazy(() => import('@/components/admin/descubra_ms/EventsManagement'));
const PartnersManagement = lazy(() => import('@/components/admin/descubra_ms/PartnersManagement'));
const PaymentsList = lazy(() => import('@/components/admin/financial/PaymentsList'));
const Reconciliation = lazy(() => import('@/components/admin/financial/Reconciliation'));
const FinancialReports = lazy(() => import('@/components/admin/financial/FinancialReports'));
const FallbackConfig = lazy(() => import('@/components/admin/system/FallbackConfig'));
const SystemMonitoring = lazy(() => import('@/components/admin/system/SystemMonitoring'));
const AuditLogs = lazy(() => import('@/components/admin/system/AuditLogs'));
const AIAdminChat = lazy(() => import('@/components/admin/ai/AIAdminChat'));
const AISuggestions = lazy(() => import('@/components/admin/ai/AISuggestions'));
const AIActionsQueue = lazy(() => import('@/components/admin/ai/AIActionsQueue'));
const PassportAdmin = lazy(() => import('@/pages/admin/PassportAdmin'));

export default function ViaJARAdminPanel() {
  const { user, userProfile, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user && userProfile) {
        const role = userProfile?.role || 'user';
        const allowedRoles = ['admin', 'master_admin', 'tech'];
        
        if (allowedRoles.includes(role)) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(false);
      }
    }
  }, [user, userProfile, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado ou não for admin, mostrar login
  if (!user || !isAuthorized) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col bg-white shadow-sm">
        <AdminHeader />
        
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          <Routes>
            <Route index element={<DashboardOverview />} />
            
            {/* ViaJAR Routes */}
            <Route path="viajar/employees" element={
              <Suspense fallback={<LoadingFallback />}>
                <EmployeesManagement />
              </Suspense>
            } />
            <Route path="viajar/clients" element={
              <Suspense fallback={<LoadingFallback />}>
                <ClientsManagement />
              </Suspense>
            } />
            <Route path="viajar/subscriptions" element={
              <Suspense fallback={<LoadingFallback />}>
                <SubscriptionsManagement />
              </Suspense>
            } />
            <Route path="viajar/settings" element={
              <Suspense fallback={<LoadingFallback />}>
                <CompanySettings />
              </Suspense>
            } />
            
            {/* Descubra MS Routes */}
            <Route path="descubra-ms/content" element={
              <Suspense fallback={<LoadingFallback />}>
                <ContentEditor />
              </Suspense>
            } />
            <Route path="descubra-ms/menus" element={
              <Suspense fallback={<LoadingFallback />}>
                <MenuManager />
              </Suspense>
            } />
            <Route path="descubra-ms/users" element={
              <Suspense fallback={<LoadingFallback />}>
                <UsersManagement />
              </Suspense>
            } />
            <Route path="descubra-ms/events" element={
              <Suspense fallback={<LoadingFallback />}>
                <EventsManagement />
              </Suspense>
            } />
            <Route path="descubra-ms/partners" element={
              <Suspense fallback={<LoadingFallback />}>
                <PartnersManagement />
              </Suspense>
            } />
            <Route path="descubra-ms/settings" element={
              <Suspense fallback={<LoadingFallback />}>
                <PlatformSettings />
              </Suspense>
            } />
            <Route path="descubra-ms/passport" element={
              <Suspense fallback={<LoadingFallback />}>
                <PassportAdmin />
              </Suspense>
            } />
            
            {/* Financial Routes */}
            <Route path="financial/payments" element={
              <Suspense fallback={<LoadingFallback />}>
                <PaymentsList />
              </Suspense>
            } />
            <Route path="financial/reconciliation" element={
              <Suspense fallback={<LoadingFallback />}>
                <Reconciliation />
              </Suspense>
            } />
            <Route path="financial/reports" element={
              <Suspense fallback={<LoadingFallback />}>
                <FinancialReports />
              </Suspense>
            } />
            
            {/* System Routes */}
            <Route path="system/fallback" element={
              <Suspense fallback={<LoadingFallback />}>
                <FallbackConfig />
              </Suspense>
            } />
            <Route path="system/monitoring" element={
              <Suspense fallback={<LoadingFallback />}>
                <SystemMonitoring />
              </Suspense>
            } />
            <Route path="system/logs" element={
              <Suspense fallback={<LoadingFallback />}>
                <AuditLogs />
              </Suspense>
            } />
            
            {/* AI Routes */}
            <Route path="ai/chat" element={
              <Suspense fallback={<LoadingFallback />}>
                <AIAdminChat />
              </Suspense>
            } />
            <Route path="ai/suggestions" element={
              <Suspense fallback={<LoadingFallback />}>
                <AISuggestions />
              </Suspense>
            } />
            <Route path="ai/actions" element={
              <Suspense fallback={<LoadingFallback />}>
                <AIActionsQueue />
              </Suspense>
            } />
            
            <Route path="*" element={<Navigate to="/viajar/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Administrativo</h2>
        <p className="text-sm text-gray-600">Visão geral das plataformas ViajARTur e Descubra MS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Usuários Ativos</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
            <p className="text-xs text-gray-500">Total de usuários</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Receita Mensal</CardTitle>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">R$ 0</div>
            <p className="text-xs text-gray-500">Este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Status Sistema</CardTitle>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-1">Online</div>
            <p className="text-xs text-gray-500">Todos os sistemas operacionais</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Conteúdo Pendente</CardTitle>
            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
            <p className="text-xs text-gray-500">Aguardando revisão</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <Card className="bg-white border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/viajar/admin/viajar/employees" className="block p-3 rounded-md hover:bg-gray-50 border border-gray-200 transition-colors">
              <div className="font-medium text-gray-900">Gerenciar Funcionários</div>
              <div className="text-xs text-gray-500 mt-1">Adicionar e editar funcionários ViajARTur</div>
            </Link>
            <Link to="/viajar/admin/descubra-ms/content" className="block p-3 rounded-md hover:bg-gray-50 border border-gray-200 transition-colors">
              <div className="font-medium text-gray-900">Editar Conteúdo</div>
              <div className="text-xs text-gray-500 mt-1">Gerenciar conteúdo do Descubra MS</div>
            </Link>
            <Link to="/viajar/admin/financial/payments" className="block p-3 rounded-md hover:bg-gray-50 border border-gray-200 transition-colors">
              <div className="font-medium text-gray-900">Ver Pagamentos</div>
              <div className="text-xs text-gray-500 mt-1">Revisar e gerenciar pagamentos</div>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
              <div>
                <div className="font-medium text-gray-900">Status da API</div>
                <div className="text-xs text-gray-500">Última verificação: agora</div>
              </div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
              <div>
                <div className="font-medium text-gray-900">Banco de Dados</div>
                <div className="text-xs text-gray-500">Conexão ativa</div>
              </div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

