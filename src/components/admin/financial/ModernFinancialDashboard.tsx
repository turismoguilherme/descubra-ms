import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { financialDashboardService } from '@/services/admin/financialDashboardService';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  TrendingUp, TrendingDown, DollarSign, Wallet, Receipt, PiggyBank,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Sparkles, Brain,
  Calendar, Target, Zap, BarChart3, PieChartIcon, Activity,
  CreditCard, Building, Users, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Cores do gráfico
const CHART_COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  pink: '#EC4899',
};

const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.danger, CHART_COLORS.purple, CHART_COLORS.cyan];

interface FinancialData {
  revenue: {
    total: number;
    viajar: number;
    events: number;
    partners: number;
    other: number;
    byMonth: Array<{ month: string; revenue: number; viajar: number; events: number }>;
  };
  expenses: {
    total: number;
    byCategory: Record<string, number>;
    byMonth: Array<{ month: string; expenses: number }>;
  };
  salaries: { total: number; employees: unknown[] };
  profit: { revenue: number; expenses: number; salaries: number; taxes: number; profit: number; profitMargin: number };
  upcomingBills: unknown[];
}

interface AIInsight {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  action?: string;
}

export default function ModernFinancialDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FinancialData | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const [revenueData, expensesData, salariesData, billsData] = await Promise.all([
        financialDashboardService.getMonthlyRevenue(),
        financialDashboardService.getMonthlyExpenses(),
        financialDashboardService.getMonthlySalaries(),
        financialDashboardService.getUpcomingBills(30),
      ]);

      const taxes = expensesData.byCategory.impostos || 0;
      const profitData = await financialDashboardService.calculateProfit(
        revenueData.total,
        expensesData.total,
        salariesData.total,
        taxes
      );

      setData({
        revenue: revenueData,
        expenses: expensesData,
        salaries: salariesData,
        profit: profitData,
        upcomingBills: billsData,
      });

      // Gerar insights da IA
      generateAIInsights(revenueData, expensesData, profitData, billsData);
    } catch (error: unknown) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados financeiros',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = (revenue: unknown, expenses: unknown, profit: unknown, bills: unknown[]) => {
    const insights: AIInsight[] = [];

    // Análise de lucro
    if (profit.profitMargin < 10) {
      insights.push({
        type: 'warning',
        title: 'Margem de lucro baixa',
        description: `Sua margem de lucro está em ${profit.profitMargin.toFixed(1)}%. Considere revisar seus custos ou aumentar preços.`,
        action: 'Ver despesas',
      });
    } else if (profit.profitMargin > 30) {
      insights.push({
        type: 'success',
        title: 'Excelente margem de lucro!',
        description: `Sua margem está em ${profit.profitMargin.toFixed(1)}%, bem acima da média do setor.`,
      });
    }

    // Análise de contas a vencer
    if (bills.length > 5) {
      const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
      insights.push({
        type: 'danger',
        title: `${bills.length} contas a vencer`,
        description: `Total de R$ ${totalBills.toFixed(2)} em contas nos próximos 30 dias. Organize seu fluxo de caixa.`,
        action: 'Ver contas',
      });
    }

    // Análise de despesas por categoria
    const topExpense = Object.entries(expenses.byCategory).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
    if (topExpense && (topExpense[1] as number) > expenses.total * 0.4) {
      insights.push({
        type: 'info',
        title: `${topExpense[0]} representa ${((topExpense[1] as number / expenses.total) * 100).toFixed(0)}% das despesas`,
        description: 'Considere diversificar seus gastos ou negociar melhores condições.',
      });
    }

    // Tendência de receita
    if (revenue.byMonth.length >= 2) {
      const lastMonth = revenue.byMonth[revenue.byMonth.length - 1]?.revenue || 0;
      const prevMonth = revenue.byMonth[revenue.byMonth.length - 2]?.revenue || 0;
      const growth = prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0;
      
      if (growth > 10) {
        insights.push({
          type: 'success',
          title: `Receita cresceu ${growth.toFixed(0)}%`,
          description: 'Sua receita está em tendência de alta. Continue o bom trabalho!',
        });
      } else if (growth < -10) {
        insights.push({
          type: 'warning',
          title: `Receita caiu ${Math.abs(growth).toFixed(0)}%`,
          description: 'Sua receita diminuiu em relação ao mês anterior. Analise as causas.',
          action: 'Ver detalhes',
        });
      }
    }

    setAiInsights(insights);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'danger': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Sparkles className="h-5 w-5 text-blue-500" />;
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/20';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'danger': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  // Preparar dados para gráficos
  const combinedChartData = data?.revenue.byMonth.map((r, i) => ({
    month: r.month,
    receita: r.revenue,
    despesas: data.expenses.byMonth[i]?.expenses || 0,
    lucro: r.revenue - (data.expenses.byMonth[i]?.expenses || 0),
  })) || [];

  const expensePieData = data ? Object.entries(data.expenses.byCategory)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Number(value),
    })) : [];

  const revenuePieData = data ? [
    { name: 'ViajARTur', value: data.revenue.viajar },
    { name: 'Eventos', value: data.revenue.events },
    { name: 'Parceiros', value: data.revenue.partners },
    { name: 'Outros', value: data.revenue.other },
  ].filter(d => d.value > 0) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h2>
          <p className="text-gray-600 mt-1">Visão completa das finanças da empresa</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <TabsList className="bg-gray-100">
              <TabsTrigger value="week">7 dias</TabsTrigger>
              <TabsTrigger value="month">30 dias</TabsTrigger>
              <TabsTrigger value="quarter">90 dias</TabsTrigger>
              <TabsTrigger value="year">1 ano</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Brain className="h-5 w-5 text-purple-500" />
              Insights da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg border transition-all hover:scale-[1.02]",
                    getInsightBg(insight.type)
                  )}
                >
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                      {insight.action && (
                        <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-xs">
                          {insight.action} →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita */}
        <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-gray-600 text-sm">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(data?.revenue.total || 0)}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs">
              <span className="text-gray-500">ViaJAR: {formatCurrency(data?.revenue.viajar || 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-red-500/10">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <Badge className="bg-red-500/20 text-red-600 border-red-500/30">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                -5%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-gray-600 text-sm">Despesas Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(data?.expenses.total || 0)}
              </p>
            </div>
            <div className="mt-4">
              <Progress 
                value={data ? (data.expenses.total / data.revenue.total) * 100 : 0} 
                className="h-1.5 bg-gray-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                {data ? ((data.expenses.total / data.revenue.total) * 100).toFixed(0) : 0}% da receita
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lucro */}
        <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <PiggyBank className="h-5 w-5 text-blue-500" />
              </div>
              <Badge className={cn(
                "border",
                (data?.profit.profit || 0) >= 0 
                  ? "bg-green-500/20 text-green-600 border-green-500/30"
                  : "bg-red-500/20 text-red-600 border-red-500/30"
              )}>
                {(data?.profit.profitMargin || 0).toFixed(1)}% margem
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-gray-600 text-sm">Lucro Líquido</p>
              <p className={cn(
                "text-2xl font-bold mt-1",
                (data?.profit.profit || 0) >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(data?.profit.profit || 0)}
              </p>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Após impostos e salários
            </div>
          </CardContent>
        </Card>

        {/* Contas a Pagar */}
        <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Receipt className="h-5 w-5 text-yellow-500" />
              </div>
              {(data?.upcomingBills.length || 0) > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 animate-pulse">
                  {data?.upcomingBills.length} pendentes
                </Badge>
              )}
            </div>
            <div className="mt-4">
              <p className="text-gray-600 text-sm">Contas a Pagar</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {formatCurrency(data?.upcomingBills.reduce((sum, b) => sum + b.amount, 0) || 0)}
              </p>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Próximos 30 dias
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Receita x Despesa */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Evolução Financeira
            </CardTitle>
            <CardDescription className="text-gray-600">
              Comparativo de receita, despesas e lucro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={combinedChartData}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.danger} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.danger} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `R$${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="receita" 
                  stroke={CHART_COLORS.success} 
                  fillOpacity={1} 
                  fill="url(#colorReceita)" 
                  name="Receita"
                />
                <Area 
                  type="monotone" 
                  dataKey="despesas" 
                  stroke={CHART_COLORS.danger} 
                  fillOpacity={1} 
                  fill="url(#colorDespesas)" 
                  name="Despesas"
                />
                <Line 
                  type="monotone" 
                  dataKey="lucro" 
                  stroke={CHART_COLORS.primary} 
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.primary }}
                  name="Lucro"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Despesas */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-purple-500" />
              Despesas por Categoria
            </CardTitle>
            <CardDescription className="text-gray-600">
              Onde o dinheiro está sendo gasto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expensePieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Contas a Vencer */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Contas a Vencer
              </CardTitle>
              <CardDescription className="text-gray-600">
                Próximas contas e compromissos financeiros
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Ver todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data?.upcomingBills && data.upcomingBills.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingBills.slice(0, 5).map((bill) => (
                <div 
                  key={bill.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      bill.days_until_due <= 3 ? "bg-red-500/10" : "bg-yellow-500/10"
                    )}>
                      <Receipt className={cn(
                        "h-5 w-5",
                        bill.days_until_due <= 3 ? "text-red-500" : "text-yellow-500"
                      )} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{bill.description}</p>
                      <p className="text-sm text-gray-600">
                        {bill.category} • Vence em {bill.days_until_due} {bill.days_until_due === 1 ? 'dia' : 'dias'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(bill.amount)}</p>
                    <Badge 
                      variant="outline"
                      className={cn(
                        bill.days_until_due <= 3 
                          ? "border-red-500/30 text-red-600" 
                          : "border-yellow-500/30 text-yellow-600"
                      )}
                    >
                      {format(new Date(bill.due_date), 'dd/MM', { locale: ptBR })}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-gray-600">Nenhuma conta pendente nos próximos 30 dias</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fontes de Receita */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-500" />
              Fontes de Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={revenuePieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {revenuePieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Receita por Fonte (Mensal)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.revenue.byMonth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `R$${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#111827',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="viajar" fill={CHART_COLORS.primary} name="ViajARTur" radius={[4, 4, 0, 0]} />
                <Bar dataKey="events" fill={CHART_COLORS.warning} name="Eventos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

