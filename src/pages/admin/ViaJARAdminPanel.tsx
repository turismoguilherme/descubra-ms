import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ModernAdminLayout from '@/components/admin/layout/ModernAdminLayout';
import AdminLogin from '@/components/admin/AdminLogin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, DollarSign, FileText, TrendingUp, AlertTriangle, Calendar, Brain, Sparkles, MessageSquare } from 'lucide-react';
import { lazy, Suspense } from 'react';
import LoadingFallback from '@/components/ui/loading-fallback';
import { financialDashboardService } from '@/services/admin/financialDashboardService';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Lazy load components
const ClientsManagement = lazy(() => import('@/components/admin/viajar/ClientsManagement'));
const SubscriptionsManagement = lazy(() => import('@/components/admin/viajar/SubscriptionsManagement'));
// MenuManager removido - desnecessário (menus são gerenciados via código)
const UsersManagement = lazy(() => import('@/components/admin/descubra_ms/UsersManagement'));
const WhatsAppSettingsManager = lazy(() => import('@/components/admin/descubra_ms/WhatsAppSettingsManager'));
const EventsManagement = lazy(() => import('@/components/admin/descubra_ms/EventsManagement'));
const PartnersManagement = lazy(() => import('@/components/admin/descubra_ms/PartnersManagement'));
const PartnerSettingsManager = lazy(() => import('@/components/admin/PartnerSettingsManager'));
const PantanalAvatarsManager = lazy(() => import('@/components/admin/descubra_ms/PantanalAvatarsManager'));
const CATLocationManager = lazy(() => import('@/components/admin/CATLocationManager'));
const FooterSettingsManager = lazy(() => import('@/components/admin/FooterSettingsManager'));
const TouristRegionsManager = lazy(() => import('@/components/admin/descubra_ms/TouristRegionsManager'));
const PaymentsList = lazy(() => import('@/components/admin/financial/PaymentsList'));
const FinancialReports = lazy(() => import('@/components/admin/financial/FinancialReports'));
const FinancialManagement = lazy(() => import('@/components/admin/financial/FinancialManagement'));
const ModernFinancialDashboard = lazy(() => import('@/components/admin/financial/ModernFinancialDashboard'));
const BillsManager = lazy(() => import('@/components/admin/financial/BillsManager'));
const FallbackConfig = lazy(() => import('@/components/admin/system/FallbackConfig'));
const SystemMonitoring = lazy(() => import('@/components/admin/system/SystemMonitoring'));
const AuditLogs = lazy(() => import('@/components/admin/system/AuditLogs'));
const AIAdminChat = lazy(() => import('@/components/admin/ai/AIAdminChat'));
const AISuggestions = lazy(() => import('@/components/admin/ai/AISuggestions'));
const AIActionsQueue = lazy(() => import('@/components/admin/ai/AIActionsQueue'));
const PassportAdmin = lazy(() => import('@/pages/admin/PassportAdmin'));
const PoliciesEditor = lazy(() => import('@/components/admin/settings/PoliciesEditor'));
const BankAccountsManager = lazy(() => import('@/components/admin/financial/BankAccountsManager'));
const DatabaseManager = lazy(() => import('@/components/admin/database/DatabaseManager'));
const VisualContentEditor = lazy(() => import('@/components/admin/editor/VisualContentEditor'));
const SystemHealthMonitor = lazy(() => import('@/components/admin/system/SystemHealthMonitor'));
const AutonomousAIAgent = lazy(() => import('@/components/admin/ai/AutonomousAIAgent'));
const TeamManagement = lazy(() => import('@/components/admin/team/TeamManagement'));
const ContactLeadsManagement = lazy(() => import('@/components/admin/financial/ContactLeadsManagement'));
const PlatformMetricsEditor = lazy(() => import('@/components/admin/settings/PlatformMetricsEditor'));
const UnifiedPlatformEditor = lazy(() => import('@/components/admin/platform/UnifiedPlatformEditor'));
const ViaJARTurSettingsManager = lazy(() => import('@/components/admin/ViaJARTurSettingsManager'));
const EmailDashboard = lazy(() => import('@/components/admin/email/EmailDashboard'));

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
    <ModernAdminLayout>
          <Routes>
            <Route index element={<DashboardOverview />} />
            
            {/* ViaJAR Routes */}
            <Route path="viajar/content" element={
              <Suspense fallback={<LoadingFallback />}>
                <UnifiedPlatformEditor initialPlatform="viajar" />
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
            <Route path="viajar/plan-settings" element={
              <Suspense fallback={<LoadingFallback />}>
                <ViaJARTurSettingsManager />
              </Suspense>
            } />
            
            {/* Descubra MS Routes */}
            <Route path="descubra-ms/cats" element={
              <Suspense fallback={<LoadingFallback />}>
                <CATLocationManager />
              </Suspense>
            } />
            <Route path="descubra-ms/footer" element={
              <Suspense fallback={<LoadingFallback />}>
                <FooterSettingsManager />
              </Suspense>
            } />
            <Route path="descubra-ms/tourist-regions" element={
              <Suspense fallback={<LoadingFallback />}>
                <TouristRegionsManager />
              </Suspense>
            } />
            {/* Rota de Menus removida - desnecessária */}
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
            <Route path="descubra-ms/partner-settings" element={
              <Suspense fallback={<LoadingFallback />}>
                <PartnerSettingsManager />
              </Suspense>
            } />
            <Route path="descubra-ms/whatsapp" element={
              <Suspense fallback={<LoadingFallback />}>
                <WhatsAppSettingsManager />
              </Suspense>
            } />
            <Route path="descubra-ms/passport" element={
              <Suspense fallback={<LoadingFallback />}>
                <PassportAdmin />
              </Suspense>
            } />
            <Route path="descubra-ms/avatars" element={
              <Suspense fallback={<LoadingFallback />}>
                <PantanalAvatarsManager />
              </Suspense>
            } />
            
        {/* Financial Routes - Novo dashboard moderno */}
            <Route path="financial" element={
              <Suspense fallback={<LoadingFallback />}>
            <ModernFinancialDashboard />
              </Suspense>
            } />
            <Route path="financial/bills" element={
              <Suspense fallback={<LoadingFallback />}>
                <BillsManager />
              </Suspense>
            } />
        <Route path="financial/revenue" element={
          <Suspense fallback={<LoadingFallback />}>
            <FinancialManagement />
          </Suspense>
        } />
        <Route path="financial/expenses" element={
          <Suspense fallback={<LoadingFallback />}>
            <FinancialManagement />
          </Suspense>
        } />
        <Route path="financial/salaries" element={
          <Suspense fallback={<LoadingFallback />}>
            <FinancialManagement />
              </Suspense>
            } />
            <Route path="financial/payments" element={
              <Suspense fallback={<LoadingFallback />}>
                <PaymentsList />
              </Suspense>
            } />
        <Route path="financial/reports" element={
          <Suspense fallback={<LoadingFallback />}>
            <FinancialReports />
          </Suspense>
        } />
            <Route path="financial/contact-leads" element={
              <Suspense fallback={<LoadingFallback />}>
                <ContactLeadsManagement />
              </Suspense>
            } />
        <Route path="financial/accounts" element={
          <Suspense fallback={<LoadingFallback />}>
            <BankAccountsManager />
          </Suspense>
        } />
        <Route path="financial/suppliers" element={
          <Suspense fallback={<LoadingFallback />}>
            <BankAccountsManager />
          </Suspense>
        } />
        
        {/* Gerenciador de Banco de Dados */}
        <Route path="database" element={
          <Suspense fallback={<LoadingFallback />}>
            <DatabaseManager />
          </Suspense>
        } />
        
        {/* Settings Routes */}
        <Route path="settings/policies" element={
          <Suspense fallback={<LoadingFallback />}>
            <PoliciesEditor />
          </Suspense>
        } />
        <Route path="settings/metrics" element={
          <Suspense fallback={<LoadingFallback />}>
            <PlatformMetricsEditor />
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
        <Route path="system/settings" element={
          <Suspense fallback={<LoadingFallback />}>
            <FallbackConfig />
              </Suspense>
            } />
            
            {/* AI Routes */}
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
            <Route path="ai/agent" element={
              <Suspense fallback={<LoadingFallback />}>
                <AutonomousAIAgent />
              </Suspense>
            } />
            <Route path="ai/tasks" element={
              <Suspense fallback={<LoadingFallback />}>
                <AutonomousAIAgent />
              </Suspense>
            } />
            
            {/* Team Routes */}
            <Route path="team/members" element={
              <Suspense fallback={<LoadingFallback />}>
                <TeamManagement />
              </Suspense>
            } />
            <Route path="team/activities" element={
              <Suspense fallback={<LoadingFallback />}>
                <TeamManagement />
              </Suspense>
            } />
            <Route path="team/permissions" element={
              <Suspense fallback={<LoadingFallback />}>
                <TeamManagement />
              </Suspense>
            } />
            
            {/* System Health */}
            <Route path="system/health" element={
              <Suspense fallback={<LoadingFallback />}>
                <SystemHealthMonitor />
              </Suspense>
            } />

            {/* Email Management */}
            <Route path="communication/emails" element={
              <Suspense fallback={<LoadingFallback />}>
                <EmailDashboard />
              </Suspense>
            } />

            <Route path="*" element={<Navigate to="/viajar/admin" replace />} />
          </Routes>
    </ModernAdminLayout>
  );
}

function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState({ total: 0, viajar: 0, events: 0, partners: 0, other: 0, byMonth: [] as any[] });
  const [expenses, setExpenses] = useState({ total: 0, byCategory: {} as Record<string, number>, byMonth: [] as any[] });
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

      const taxes = expensesData.byCategory.impostos || 0;
      const profitData = await financialDashboardService.calculateProfit(
        revenueData.total,
        expensesData.total,
        salariesData.total,
        taxes
      );
      setProfit(profitData);

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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const expenseCategoryData = Object.entries(expenses.byCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Number(value),
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const combinedChartData = revenue.byMonth.map((r, i) => ({
    month: r.month,
    receita: r.revenue,
    despesas: expenses.byMonth[i]?.expenses || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header com boas vindas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
          <h2 className="text-2xl font-bold text-slate-800">Bem-vindo ao Dashboard</h2>
          <p className="text-slate-500 mt-1">Visão geral das plataformas ViajARTur e Descubra MS</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
            <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
            Sistema Online
          </Badge>
        </div>
      </div>

      {/* AI Quick Insights */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-800 font-medium">Resumo da IA</p>
              <p className="text-xs text-slate-500">
                {loading ? 'Analisando dados...' : profit.profit >= 0 
                  ? `Seu negócio está com margem de ${profit.profitMargin.toFixed(1)}%. ${upcomingBills.length > 0 ? `Atenção: ${upcomingBills.length} conta(s) a vencer.` : 'Sem contas pendentes.'}`
                  : `Atenção: Resultado negativo este mês. Revise suas despesas.`
                }
              </p>
            </div>
            <Link to="/viajar/admin/ai/chat">
              <Badge variant="outline" className="cursor-pointer hover:bg-purple-500/10 border-purple-500/30 text-purple-400">
                <Brain className="h-3 w-3 mr-1" />
                Consultar IA
              </Badge>
            </Link>
          </div>
          </CardContent>
        </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita */}
        <Card className="bg-white border-slate-200 hover:border-green-500/30 transition-all overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                +12%
              </Badge>
            </div>
            <p className="text-slate-500 text-sm">Receita do Mês</p>
            <p className="text-xl font-bold text-slate-800 mt-1">
              {loading ? '...' : formatCurrency(revenue.total)}
            </p>
            <Progress value={75} className="h-1 mt-3 bg-[#27272A]" />
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card className="bg-white border-slate-200 hover:border-red-500/30 transition-all overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
            </div>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {revenue.total > 0 ? `${((expenses.total / revenue.total) * 100).toFixed(0)}%` : '0%'}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm">Despesas do Mês</p>
            <p className="text-xl font-bold text-red-400 mt-1">
              {loading ? '...' : formatCurrency(expenses.total)}
            </p>
            <Progress value={revenue.total > 0 ? (expenses.total / revenue.total) * 100 : 0} className="h-1 mt-3 bg-[#27272A]" />
          </CardContent>
        </Card>

        {/* Lucro */}
        <Card className="bg-white border-slate-200 hover:border-blue-500/30 transition-all overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="h-4 w-4 text-blue-500" />
            </div>
              <Badge className={cn(
                "text-xs",
                profit.profit >= 0 
                  ? "bg-green-500/20 text-green-400 border-green-500/30" 
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              )}>
                {profit.profitMargin.toFixed(1)}%
              </Badge>
            </div>
            <p className="text-slate-500 text-sm">Lucro Líquido</p>
            <p className={cn(
              "text-xl font-bold mt-1",
              profit.profit >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {loading ? '...' : formatCurrency(profit.profit)}
            </p>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card className="bg-white border-slate-200 hover:border-yellow-500/30 transition-all overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </div>
              {upcomingBills.length > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs animate-pulse">
                  Atenção
                </Badge>
              )}
            </div>
            <p className="text-slate-500 text-sm">Contas a Vencer</p>
            <p className="text-xl font-bold text-yellow-400 mt-1">
              {loading ? '...' : upcomingBills.length}
            </p>
            <Link to="/viajar/admin/financial/bills" className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block">
              Ver detalhes →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Receita vs Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={combinedChartData}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                  <XAxis dataKey="month" stroke="#71717A" fontSize={12} />
                  <YAxis stroke="#71717A" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181B', 
                      border: '1px solid #27272A',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="receita" stroke="#10B981" fillOpacity={1} fill="url(#colorReceita)" name="Receita" />
                  <Area type="monotone" dataKey="despesas" stroke="#EF4444" fillOpacity={1} fill="url(#colorDespesas)" name="Despesas" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181B', 
                      border: '1px solid #27272A',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acesso Rápido e Contas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Contas a Vencer (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Carregando...</div>
            ) : (
              <div className="space-y-2">
                {upcomingBills.length > 0 ? (
                  upcomingBills.slice(0, 4).map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-[#3F3F46] transition-colors">
                      <div>
                        <div className="font-medium text-slate-800 text-sm">{bill.description}</div>
                        <div className="text-xs text-slate-400">
                          Vence em {bill.days_until_due} {bill.days_until_due === 1 ? 'dia' : 'dias'}
                        </div>
                      </div>
                      <div className="font-bold text-yellow-400 text-sm">{formatCurrency(bill.amount)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400">
                    <div className="text-green-500 mb-2">✓</div>
                    Nenhuma conta a vencer
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Acesso Rápido
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            <Link to="/viajar/admin/financial" className="block p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-500/30 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium text-slate-800 text-sm">Dashboard Financeiro</div>
                  <div className="text-xs text-slate-400">Gráficos, análises e insights de IA</div>
                </div>
              </div>
            </Link>
            <Link to="/viajar/admin/descubra-ms/events" className="block p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-green-500/30 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <Calendar className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <div className="font-medium text-slate-800 text-sm">Gerenciar Eventos</div>
                  <div className="text-xs text-slate-400">{pendingEvents > 0 ? `${pendingEvents} pendentes` : 'Aprovar e gerenciar eventos'}</div>
                </div>
              </div>
            </Link>
            <Link to="/viajar/admin/settings/policies" className="block p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-purple-500/30 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <FileText className="h-4 w-4 text-purple-500" />
      </div>
              <div>
                  <div className="font-medium text-slate-800 text-sm">Políticas e Termos</div>
                  <div className="text-xs text-slate-400">Editar termos de uso, privacidade e mais</div>
                </div>
              </div>
            </Link>
            <Link to="/viajar/admin/descubra-ms/passport" className="block p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-yellow-500/30 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                  <Users className="h-4 w-4 text-yellow-500" />
            </div>
              <div>
                  <div className="font-medium text-slate-800 text-sm">Passaporte Digital</div>
                  <div className="text-xs text-slate-400">Gerenciar rotas e checkpoints</div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

