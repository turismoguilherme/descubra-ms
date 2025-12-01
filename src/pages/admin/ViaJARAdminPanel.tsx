import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import VercelHeader from '@/components/admin/layout/VercelHeader';
import HorizontalNav from '@/components/admin/layout/HorizontalNav';
import AdminLogin from '@/components/admin/AdminLogin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, DollarSign, FileText, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { lazy, Suspense } from 'react';
import LoadingFallback from '@/components/ui/loading-fallback';
import { financialDashboardService } from '@/services/admin/financialDashboardService';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

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
const FinancialManagement = lazy(() => import('@/components/admin/financial/FinancialManagement'));
const BillsManager = lazy(() => import('@/components/admin/financial/BillsManager'));
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
    <div className="min-h-screen bg-[#0A0A0A] dark:bg-[#0A0A0A]">
      <VercelHeader />
      <HorizontalNav />
      
      <main className="pt-28 px-8 pb-8 min-h-screen">
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
            <Route path="viajar/pages" element={
              <Suspense fallback={<LoadingFallback />}>
                <CompanySettings />
              </Suspense>
            } />
            <Route path="viajar/settings" element={
              <Suspense fallback={<LoadingFallback />}>
                <CompanySettings />
              </Suspense>
            } />
            
            {/* Descubra MS Routes */}
            <Route path="descubra-ms/homepage" element={
              <Suspense fallback={<LoadingFallback />}>
                <ContentEditor />
              </Suspense>
            } />
            <Route path="descubra-ms/destinations" element={
              <Suspense fallback={<LoadingFallback />}>
                <ContentEditor />
              </Suspense>
            } />
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
            <Route path="financial" element={
              <Suspense fallback={<LoadingFallback />}>
                <FinancialManagement />
              </Suspense>
            } />
            <Route path="financial/bills" element={
              <Suspense fallback={<LoadingFallback />}>
                <BillsManager />
              </Suspense>
            } />
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
  );
}

function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState({ total: 0, viajar: 0, events: 0, partners: 0, other: 0, byMonth: [] });
  const [expenses, setExpenses] = useState({ total: 0, byCategory: {}, byMonth: [] });
  const [salaries, setSalaries] = useState({ total: 0, employees: [] });
  const [profit, setProfit] = useState({ revenue: 0, expenses: 0, salaries: 0, taxes: 0, profit: 0, profitMargin: 0 });
  const [upcomingBills, setUpcomingBills] = useState<any[]>([]);
  const [pendingEvents, setPendingEvents] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [revenueData, expensesData, salariesData, billsData] = await Promise.all([
        financialDashboardService.getMonthlyRevenue(),
        financialDashboardService.getMonthlyExpenses(),
        financialDashboardService.getMonthlySalaries(),
        financialDashboardService.getUpcomingBills(7),
      ]);

      setRevenue(revenueData);
      setExpenses(expensesData);
      setSalaries(salariesData);
      setUpcomingBills(billsData);

      // Calcular lucro
      const taxes = expensesData.byCategory.impostos || 0;
      const profitData = await financialDashboardService.calculateProfit(
        revenueData.total,
        expensesData.total,
        salariesData.total,
        taxes
      );
      setProfit(profitData);

      // Buscar eventos pendentes
      try {
        const { data: eventsData } = await supabase
          .from('events')
          .select('id')
          .eq('is_visible', false)
          .is('is_visible', null);
        setPendingEvents(eventsData?.length || 0);
      } catch (error) {
        console.error('Erro ao buscar eventos pendentes:', error);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const expenseCategoryData = Object.entries(expenses.byCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Number(value),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold text-white mb-2">Dashboard</h2>
        <p className="text-sm text-[#A1A1AA]">Visão geral das plataformas ViajARTur e Descubra MS</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#111111] border border-[#1F1F1F] hover:border-[#2F2F2F] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Receita do Mês</CardTitle>
            <div className="h-9 w-9 rounded-md bg-[#1F1F1F] flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-[#16A34A]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-white mb-1">
              {loading ? '...' : `R$ ${revenue.total.toFixed(2).replace('.', ',')}`}
            </div>
            <p className="text-xs text-[#A1A1AA]">ViaJAR: R$ {revenue.viajar.toFixed(2)} • Eventos: R$ {revenue.events.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border border-[#1F1F1F] hover:border-[#2F2F2F] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Despesas do Mês</CardTitle>
            <div className="h-9 w-9 rounded-md bg-[#1F1F1F] flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-[#DC2626]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-[#DC2626] mb-1">
              {loading ? '...' : `R$ ${expenses.total.toFixed(2).replace('.', ',')}`}
            </div>
            <p className="text-xs text-[#A1A1AA]">Total de despesas</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border border-[#1F1F1F] hover:border-[#2F2F2F] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Lucro Líquido</CardTitle>
            <div className="h-9 w-9 rounded-md bg-[#1F1F1F] flex items-center justify-center">
              <DollarSign className={`h-4 w-4 ${profit.profit >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold mb-1 ${profit.profit >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              {loading ? '...' : `R$ ${profit.profit.toFixed(2).replace('.', ',')}`}
            </div>
            <p className="text-xs text-[#A1A1AA]">Margem: {profit.profitMargin.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border border-[#1F1F1F] hover:border-[#2F2F2F] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Eventos Pendentes</CardTitle>
            <div className="h-9 w-9 rounded-md bg-[#1F1F1F] flex items-center justify-center">
              <Calendar className="h-4 w-4 text-[#F59E0B]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-[#F59E0B] mb-1">
              {loading ? '...' : pendingEvents}
            </div>
            <p className="text-xs text-[#A1A1AA]">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border border-[#1F1F1F] hover:border-[#2F2F2F] transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Contas a Vencer</CardTitle>
            <div className="h-9 w-9 rounded-md bg-[#1F1F1F] flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-[#EF4444] mb-1">
              {loading ? '...' : upcomingBills.length}
            </div>
            <p className="text-xs text-[#A1A1AA]">Próximos 7 dias</p>
            <Link 
              to="/viajar/admin/financial/bills"
              className="text-xs text-[#3B82F6] hover:text-[#2563EB] mt-2 inline-block"
            >
              Gerenciar contas →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#111111] border border-[#1F1F1F]">
          <CardHeader className="border-b border-[#1F1F1F]">
            <CardTitle className="text-base font-semibold text-white">Evolução de Receitas (6 meses)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenue.byMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#0088FE" name="Receita Total" />
                  <Line type="monotone" dataKey="viajar" stroke="#00C49F" name="ViaJAR" />
                  <Line type="monotone" dataKey="events" stroke="#FFBB28" name="Eventos" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border border-[#1F1F1F]">
          <CardHeader className="border-b border-[#1F1F1F]">
            <CardTitle className="text-base font-semibold text-white">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparativo Receita vs Despesas */}
      <Card className="bg-[#111111] border border-[#1F1F1F]">
        <CardHeader className="border-b border-[#1F1F1F]">
          <CardTitle className="text-base font-semibold text-white">Comparativo Receita vs Despesas</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenue.byMonth.map((r, i) => ({
                month: r.month,
                Receita: r.revenue,
                Despesas: expenses.byMonth[i]?.expenses || 0,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Receita" fill="#00C49F" />
                <Bar dataKey="Despesas" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#111111] border border-[#1F1F1F]">
          <CardHeader className="border-b border-[#1F1F1F]">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
              Contas a Vencer (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 text-[#A1A1AA]">Carregando...</div>
            ) : (
              <div className="space-y-2">
                {upcomingBills.length > 0 ? (
                  upcomingBills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-3 border border-[#1F1F1F] rounded-md hover:bg-[#1A1A1A] transition-colors">
                      <div>
                        <div className="font-medium text-white">{bill.description}</div>
                        <div className="text-sm text-[#A1A1AA]">
                          Vence em {bill.days_until_due} {bill.days_until_due === 1 ? 'dia' : 'dias'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#EF4444]">R$ {bill.amount.toFixed(2).replace('.', ',')}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-[#A1A1AA]">Nenhuma conta a vencer</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border border-[#1F1F1F]">
          <CardHeader className="border-b border-[#1F1F1F]">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#3B82F6]" />
              Acesso Rápido
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-2">
            <Link to="/viajar/admin/financial/bills" className="block p-3 rounded-md hover:bg-[#1A1A1A] border border-[#1F1F1F] transition-colors">
              <div className="font-medium text-white">Contas a Pagar</div>
              <div className="text-xs text-[#A1A1AA] mt-1">Gerenciar contas e despesas</div>
            </Link>
            <Link to="/viajar/admin/descubra-ms/events" className="block p-3 rounded-md hover:bg-[#1A1A1A] border border-[#1F1F1F] transition-colors">
              <div className="font-medium text-white">Gerenciar Eventos</div>
              <div className="text-xs text-[#A1A1AA] mt-1">Aprovar e gerenciar eventos</div>
            </Link>
            <Link to="/viajar/admin/viajar/employees" className="block p-3 rounded-md hover:bg-[#1A1A1A] border border-[#1F1F1F] transition-colors">
              <div className="font-medium text-white">Gerenciar Funcionários</div>
              <div className="text-xs text-[#A1A1AA] mt-1">Adicionar e editar funcionários</div>
            </Link>
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

