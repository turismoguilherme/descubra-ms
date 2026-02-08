import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { financialDashboardService } from '@/services/admin/financialDashboardService';
import { DollarSign, Plus, Edit, Trash2, Check, X, Download, FileText, Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReportPreviewDialog } from './ReportPreviewDialog';
import { generateDREPDF, generateCashFlowPDF, generateProfitReportPDF } from '@/utils/financialReportGenerator';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';

interface RevenueItem {
  id: string;
  amount: number;
  paid_date?: string;
  source?: string;
  description?: string;
  status?: string;
}

interface ExpenseItem {
  id: string;
  amount: number;
  due_date?: string;
  paid_date?: string;
  payment_status?: string;
  category?: string;
  description?: string;
}

export default function FinancialManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('revenue');
  const [loading, setLoading] = useState(false);
  
  // Estados para preview de relatórios
  const [reportPreviewOpen, setReportPreviewOpen] = useState(false);
  const [reportPreviewData, setReportPreviewData] = useState<Record<string, unknown> | null>(null);
  const [reportPreviewType, setReportPreviewType] = useState<'dre' | 'cashflow' | 'profit'>('dre');
  const [reportPeriod, setReportPeriod] = useState({ startDate: '', endDate: '' });

  // Receitas
  const [revenues, setRevenues] = useState<RevenueItem[]>([]);
  const [revenueFilters, setRevenueFilters] = useState({ startDate: '', endDate: '', source: 'all' });

  // Despesas
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [expenseFilters, setExpenseFilters] = useState({ startDate: '', endDate: '', category: 'all', status: 'all' });
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    category: '',
    amount: '',
    due_date: '',
    recurring: 'one_time',
  });

  // Salários
  const [employees, setEmployees] = useState<Record<string, unknown>[]>([]);
  const [salaries, setSalaries] = useState<Record<string, unknown>[]>([]);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    employee_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    base_salary: '',
    bonuses: '',
    deductions: '',
    payment_date: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'revenue') {
        const data = await financialDashboardService.getAllRevenue(
          revenueFilters.startDate || undefined,
          revenueFilters.endDate || undefined
        );
        setRevenues(data);
      } else if (activeTab === 'expenses') {
        const data = await financialDashboardService.getAllExpenses(
          expenseFilters.startDate || undefined,
          expenseFilters.endDate || undefined
        );
        setExpenses(data);
      } else if (activeTab === 'salaries') {
        const empData = await financialDashboardService.getEmployees();
        setEmployees(empData);
        const salaryData = await financialDashboardService.getMonthlySalaries();
        setSalaries(salaryData.employees);
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar dados:', err);
      // Não mostrar toast para erros de sessão expirada (já são tratados silenciosamente)
      // O usuário verá dados vazios e pode recarregar a página se necessário
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async () => {
    console.log('handleCreateExpense chamado', expenseForm);
    
    // Validar campos obrigatórios
    if (!expenseForm.description || !expenseForm.description.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha a descrição da despesa.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!expenseForm.category) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma categoria.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!expenseForm.due_date) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione a data de vencimento.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!expenseForm.amount || expenseForm.amount === '') {
      toast({
        title: 'Erro',
        description: 'Por favor, insira o valor da despesa.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Validar e converter o valor
      let amountValue: number;
      if (typeof expenseForm.amount === 'string') {
        // Substituir vírgula por ponto e remover espaços/formatação
        const cleanAmount = expenseForm.amount.replace(',', '.').replace(/\s/g, '').replace(/[^\d.-]/g, '');
        amountValue = parseFloat(cleanAmount);
      } else {
        amountValue = Number(expenseForm.amount);
      }
      
      // Validar se é um número válido
      if (isNaN(amountValue) || amountValue <= 0) {
        toast({
          title: 'Erro',
          description: 'Por favor, insira um valor válido maior que zero.',
          variant: 'destructive',
        });
        return;
      }
      
      // Validar se não excede o limite (99.999.999,99)
      if (amountValue > 99999999.99) {
        toast({
          title: 'Erro',
          description: 'O valor máximo permitido é R$ 99.999.999,99.',
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Criando despesa com dados:', {
        description: expenseForm.description,
        category: expenseForm.category,
        amount: amountValue,
        due_date: expenseForm.due_date,
        recurring: expenseForm.recurring === 'one_time' ? undefined : expenseForm.recurring,
      });
      
      const result = await financialDashboardService.createExpense({
        description: expenseForm.description.trim(),
        category: expenseForm.category,
        amount: amountValue,
        due_date: expenseForm.due_date,
        recurring: expenseForm.recurring === 'one_time' ? undefined : expenseForm.recurring,
      });
      
      console.log('Despesa criada com sucesso:', result);
      
      // Adicionar a despesa criada ao estado local imediatamente (otimista)
      setExpenses(prev => [result, ...prev]);
      
      toast({
        title: 'Sucesso',
        description: 'Despesa criada com sucesso',
      });
      setExpenseDialogOpen(false);
      resetExpenseForm();
      
      // Recarregar dados em background para garantir sincronização
      loadData();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao criar despesa:', err);
      let errorMessage = err.message || 'Erro ao criar despesa';
      
      // Mensagem mais amigável para sessão expirada
      if (errorMessage.includes('Sessão expirada') || errorMessage.includes('JWT expired')) {
        errorMessage = 'Sua sessão expirou. Por favor, recarregue a página e faça login novamente.';
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExpense = async (id: string, status: string) => {
    try {
      await financialDashboardService.updateExpense(id, {
        payment_status: status,
        paid_date: status === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
      });
      toast({
        title: 'Sucesso',
        description: 'Despesa atualizada com sucesso',
      });
      loadData();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao atualizar despesa',
        variant: 'destructive',
      });
    }
  };

  const handleRegisterSalary = async () => {
    try {
      await financialDashboardService.registerSalaryPayment(
        salaryForm.employee_id,
        salaryForm.month,
        salaryForm.year,
        {
          base_salary: Number(salaryForm.base_salary),
          bonuses: Number(salaryForm.bonuses || 0),
          deductions: Number(salaryForm.deductions || 0),
          payment_date: salaryForm.payment_date || undefined,
          notes: salaryForm.notes || undefined,
        }
      );
      toast({
        title: 'Sucesso',
        description: 'Pagamento de salário registrado com sucesso',
      });
      setSalaryDialogOpen(false);
      resetSalaryForm();
      loadData();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao registrar pagamento',
        variant: 'destructive',
      });
    }
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      description: '',
      category: '',
      amount: '',
      due_date: '',
      recurring: 'one_time',
    });
    setEditingExpense(null);
  };

  const resetSalaryForm = () => {
    setSalaryForm({
      employee_id: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      base_salary: '',
      bonuses: '',
      deductions: '',
      payment_date: '',
      notes: '',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      servidores: 'bg-blue-100 text-blue-800',
      marketing: 'bg-purple-100 text-purple-800',
      infraestrutura: 'bg-green-100 text-green-800',
      impostos: 'bg-red-100 text-red-800',
      salarios: 'bg-yellow-100 text-yellow-800',
      outros: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.outros;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-gray-100 text-gray-800',
      overdue: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pending;
  };

  const exportToCSV = (data: unknown[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: 'Aviso',
        description: 'Nenhum dado para exportar',
        variant: 'destructive',
      });
      return;
    }

    const firstItem = data[0] as Record<string, unknown>;
    const headers = Object.keys(firstItem);
    const rows = data.map(item => {
      const itemRecord = item as Record<string, unknown>;
      return headers.map(header => itemRecord[header] || '');
    });
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Sucesso',
      description: 'Dados exportados com sucesso',
    });
  };

  const generateDRE = async () => {
    try {
      setLoading(true);
      
      // Usar período selecionado ou padrão
      const startDate = reportPeriod.startDate || undefined;
      const endDate = reportPeriod.endDate || undefined;
      
      // Buscar dados do período
      const revenueData = await financialDashboardService.getMonthlyRevenue(startDate, endDate);
      const expensesData = await financialDashboardService.getMonthlyExpenses(startDate, endDate);
      const salariesData = await financialDashboardService.getMonthlySalaries();
      const taxes = expensesData.byCategory.impostos || 0;
      const profitData = await financialDashboardService.calculateProfit(
        revenueData.total,
        expensesData.total,
        salariesData.total,
        taxes
      );

      // Preparar dados para preview
      const periodText = startDate && endDate 
        ? `${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}`
        : new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      const previewData = {
        period: periodText,
        revenue: revenueData.total,
        expenses: expensesData.total,
        expensesByCategory: expensesData.byCategory,
        salaries: salariesData.total,
        taxes: taxes,
        profit: profitData.profit,
        profitMargin: profitData.profitMargin,
      };

      setReportPreviewData(previewData);
      setReportPreviewType('dre');
      setReportPreviewOpen(true);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao gerar DRE:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao gerar DRE',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCashFlow = async () => {
    try {
      setLoading(true);
      
      // Usar período selecionado ou padrão
      const startDate = reportPeriod.startDate || undefined;
      const endDate = reportPeriod.endDate || undefined;
      
      // Buscar receitas e despesas
      const revenueData = await financialDashboardService.getMonthlyRevenue(startDate, endDate);
      const expensesData = await financialDashboardService.getMonthlyExpenses(startDate, endDate);
      const salariesData = await financialDashboardService.getMonthlySalaries();
      const allRevenues = await financialDashboardService.getAllRevenue(startDate, endDate);
      const allExpenses = await financialDashboardService.getAllExpenses(startDate, endDate);

      // Agrupar por mês
      const cashFlow: Record<string, { revenue: number; expenses: number; net: number }> = {};
      
      allRevenues.forEach((r: RevenueItem) => {
        const month = r.paid_date ? r.paid_date.substring(0, 7) : new Date().toISOString().substring(0, 7);
        if (!cashFlow[month]) {
          cashFlow[month] = { revenue: 0, expenses: 0, net: 0 };
        }
        cashFlow[month].revenue += Number(r.amount || 0);
      });

      allExpenses.forEach((e: ExpenseItem) => {
        const month = e.due_date ? e.due_date.substring(0, 7) : new Date().toISOString().substring(0, 7);
        if (!cashFlow[month]) {
          cashFlow[month] = { revenue: 0, expenses: 0, net: 0 };
        }
        if (e.payment_status === 'paid') {
          cashFlow[month].expenses += Number(e.amount || 0);
        }
      });

      // Calcular saldo líquido
      Object.keys(cashFlow).forEach(month => {
        cashFlow[month].net = cashFlow[month].revenue - cashFlow[month].expenses;
      });

      // Preparar dados para preview
      const months = Object.entries(cashFlow)
        .sort()
        .map(([month, data]) => ({
          month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          revenue: data.revenue,
          expenses: data.expenses,
          net: data.net,
        }));

      const previewData = {
        months,
        total: {
          revenue: revenueData.total,
          expenses: expensesData.total + salariesData.total,
          net: revenueData.total - expensesData.total - salariesData.total,
        },
      };

      setReportPreviewData(previewData);
      setReportPreviewType('cashflow');
      setReportPreviewOpen(true);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao gerar Fluxo de Caixa:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao gerar Fluxo de Caixa',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateProfitReport = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os dados de uma vez e agrupar por mês
      const allRevenues = await financialDashboardService.getAllRevenue();
      const allExpenses = await financialDashboardService.getAllExpenses();
      const allSalaries = await financialDashboardService.getMonthlySalaries();
      
      // Agrupar por mês
      const monthsMap: Record<string, { revenue: number; expenses: number; salaries: number }> = {};
      
      allRevenues.forEach((r: RevenueItem) => {
        const month = r.paid_date ? r.paid_date.substring(0, 7) : new Date().toISOString().substring(0, 7);
        if (!monthsMap[month]) {
          monthsMap[month] = { revenue: 0, expenses: 0, salaries: 0 };
        }
        monthsMap[month].revenue += Number(r.amount || 0);
      });

      allExpenses.forEach((e: ExpenseItem) => {
        if (e.payment_status === 'paid') {
          const month = e.paid_date ? e.paid_date.substring(0, 7) : e.due_date ? e.due_date.substring(0, 7) : new Date().toISOString().substring(0, 7);
          if (!monthsMap[month]) {
            monthsMap[month] = { revenue: 0, expenses: 0, salaries: 0 };
          }
          monthsMap[month].expenses += Number(e.amount || 0);
        }
      });

      // Processar salários (assumindo que são do mês atual por enquanto)
      const currentMonth = new Date().toISOString().substring(0, 7);
      if (allSalaries.employees && allSalaries.employees.length > 0) {
        if (!monthsMap[currentMonth]) {
          monthsMap[currentMonth] = { revenue: 0, expenses: 0, salaries: 0 };
        }
        monthsMap[currentMonth].salaries = allSalaries.total;
      }

      // Converter para array e ordenar
      const months = Object.entries(monthsMap)
        .map(([month, data]) => {
          const date = new Date(month + '-01');
          const taxes = data.expenses * 0.1; // Estimativa de 10% de impostos
          const profit = data.revenue - data.expenses - data.salaries - taxes;
          
          return {
            month: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            revenue: data.revenue,
            expenses: data.expenses,
            salaries: data.salaries,
            profit: profit,
            monthKey: month,
          };
        })
        .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
        .slice(-12); // Últimos 12 meses

      // Preparar dados para preview
      const monthsData = months.map(m => ({
        month: m.month,
        revenue: m.revenue,
        expenses: m.expenses,
        salaries: m.salaries,
        profit: m.profit,
        margin: m.revenue > 0 ? (m.profit / m.revenue) * 100 : 0,
      }));

      const totalRevenue = months.reduce((sum, m) => sum + m.revenue, 0);
      const totalExpenses = months.reduce((sum, m) => sum + m.expenses, 0);
      const totalSalaries = months.reduce((sum, m) => sum + m.salaries, 0);
      const totalProfit = months.reduce((sum, m) => sum + m.profit, 0);

      const previewData = {
        months: monthsData,
        total: {
          revenue: totalRevenue,
          expenses: totalExpenses,
          salaries: totalSalaries,
          profit: totalProfit,
          margin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
        },
      };

      setReportPreviewData(previewData);
      setReportPreviewType('profit');
      setReportPreviewOpen(true);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao gerar Relatório de Lucro:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao gerar Relatório de Lucro',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (type: 'dre' | 'cashflow' | 'profit', data: Record<string, unknown>) => {
    try {
      if (type === 'dre') {
        generateDREPDF(data);
      } else if (type === 'cashflow') {
        generateCashFlowPDF(data);
      } else if (type === 'profit') {
        generateProfitReportPDF(data);
      }
      toast({
        title: 'Sucesso',
        description: 'PDF gerado com sucesso',
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao gerar PDF:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao gerar PDF',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 pb-16 min-h-full">
      <div className="flex items-center justify-between">
        <AdminPageHeader
          title="Gestão Financeira"
          description="Gerencie receitas, despesas e salários da plataforma."
          helpText="Gerencie receitas, despesas e salários da plataforma."
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Receitas</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="salaries">Salários</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Aba Receitas */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Receitas</CardTitle>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={revenueFilters.startDate}
                    onChange={(e) => setRevenueFilters({ ...revenueFilters, startDate: e.target.value })}
                    className="w-40"
                  />
                  <Input
                    type="date"
                    value={revenueFilters.endDate}
                    onChange={(e) => setRevenueFilters({ ...revenueFilters, endDate: e.target.value })}
                    className="w-40"
                  />
                  <Select value={revenueFilters.source} onValueChange={(value) => setRevenueFilters({ ...revenueFilters, source: value })}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="viajar_subscription">ViaJAR</SelectItem>
                      <SelectItem value="event_sponsor">Eventos</SelectItem>
                      <SelectItem value="partner">Parceiros</SelectItem>
                      <SelectItem value="commission">Comissões</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={loadData} variant="outline">Filtrar</Button>
                  <Button onClick={() => exportToCSV(revenues, 'receitas')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <div className="space-y-2">
                  {Array.isArray(revenues) && revenues
                    .filter(r => revenueFilters.source === 'all' || r.source === revenueFilters.source)
                    .map((revenue) => (
                      <div key={revenue.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{revenue.description}</div>
                          <div className="text-sm text-gray-500">
                            {revenue.source === 'viajar_subscription' && 'ViaJAR'}
                            {revenue.source === 'event_sponsor' && 'Evento em Destaque'}
                            {revenue.source === 'partner' && 'Parceiro'}
                            {revenue.source === 'commission' && 'Comissão sobre Reserva'}
                            {!revenue.source && 'Outro'} • {revenue.paid_date && format(new Date(revenue.paid_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">R$ {Number(revenue.amount).toFixed(2).replace('.', ',')}</div>
                          <Badge className={getStatusColor(revenue.status)}>{revenue.status}</Badge>
                        </div>
                      </div>
                    ))}
                  {(!Array.isArray(revenues) || revenues.length === 0) && (
                    <div className="text-center py-8 text-gray-500">Nenhuma receita encontrada</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Despesas */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Despesas</CardTitle>
                <div className="flex gap-2">
                  <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => resetExpenseForm()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Despesa
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Descrição</Label>
                          <Input
                            value={expenseForm.description}
                            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Categoria</Label>
                          <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                            <SelectContent className="z-[10000]">
                              <SelectItem value="servidores">Servidores</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                              <SelectItem value="impostos">Impostos</SelectItem>
                              <SelectItem value="salarios">Salários</SelectItem>
                              <SelectItem value="outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Valor</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={expenseForm.amount}
                            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Data de Vencimento</Label>
                          <Input
                            type="date"
                            value={expenseForm.due_date}
                            onChange={(e) => setExpenseForm({ ...expenseForm, due_date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Recorrência</Label>
                          <Select value={expenseForm.recurring} onValueChange={(value) => setExpenseForm({ ...expenseForm, recurring: value })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione a recorrência" />
                            </SelectTrigger>
                            <SelectContent className="z-[10000]">
                              <SelectItem value="one_time">Única vez</SelectItem>
                              <SelectItem value="monthly">Mensal</SelectItem>
                              <SelectItem value="annual">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setExpenseDialogOpen(false)}
                          disabled={loading}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleCreateExpense}
                          disabled={loading}
                        >
                          {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={() => exportToCSV(expenses, 'despesas')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <div className="space-y-2">
                  {Array.isArray(expenses) && expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{expense.description}</div>
                        <div className="text-sm text-gray-500">
                          <Badge className={getCategoryColor(expense.category)}>{expense.category}</Badge> • 
                          Vencimento: {expense.due_date && format(new Date(expense.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-red-600">R$ {Number(expense.amount).toFixed(2).replace('.', ',')}</div>
                          <Badge className={getStatusColor(expense.payment_status)}>{expense.payment_status}</Badge>
                        </div>
                        {expense.payment_status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateExpense(expense.id, 'paid')}
                            variant="outline"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!Array.isArray(expenses) || expenses.length === 0) && (
                    <div className="text-center py-8 text-gray-500">Nenhuma despesa encontrada</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Salários */}
        <TabsContent value="salaries" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Salários</CardTitle>
                <Dialog open={salaryDialogOpen} onOpenChange={setSalaryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => resetSalaryForm()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar Pagamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Registrar Pagamento de Salário</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Funcionário</Label>
                        <Select value={salaryForm.employee_id} onValueChange={(value) => setSalaryForm({ ...salaryForm, employee_id: value })}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o funcionário" />
                          </SelectTrigger>
                          <SelectContent className="z-[10000]">
                            {employees.length > 0 ? (
                              employees.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id}>
                                  {emp.name} {emp.current_salary && `(R$ ${Number(emp.current_salary).toFixed(2)})`}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>Nenhum funcionário cadastrado</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Mês</Label>
                          <Select value={salaryForm.month.toString()} onValueChange={(value) => setSalaryForm({ ...salaryForm, month: Number(value) })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o mês" />
                            </SelectTrigger>
                            <SelectContent className="z-[10000]">
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                <SelectItem key={month} value={month.toString()}>
                                  {format(new Date(2024, month - 1, 1), 'MMMM', { locale: ptBR })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Ano</Label>
                          <Input
                            type="number"
                            value={salaryForm.year}
                            onChange={(e) => setSalaryForm({ ...salaryForm, year: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Salário Base</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={salaryForm.base_salary}
                          onChange={(e) => setSalaryForm({ ...salaryForm, base_salary: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Bônus</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={salaryForm.bonuses}
                            onChange={(e) => setSalaryForm({ ...salaryForm, bonuses: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Descontos</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={salaryForm.deductions}
                            onChange={(e) => setSalaryForm({ ...salaryForm, deductions: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Data de Pagamento (opcional)</Label>
                        <Input
                          type="date"
                          value={salaryForm.payment_date}
                          onChange={(e) => setSalaryForm({ ...salaryForm, payment_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Observações</Label>
                        <Input
                          value={salaryForm.notes}
                          onChange={(e) => setSalaryForm({ ...salaryForm, notes: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSalaryDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleRegisterSalary}>Registrar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <div className="space-y-2">
                  {Array.isArray(salaries) && salaries.map((salary) => (
                    <div key={salary.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{salary.name}</div>
                        <div className="text-sm text-gray-500">
                          <Badge className={getStatusColor(salary.status)}>{salary.status}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-yellow-600">R$ {Number(salary.salary).toFixed(2).replace('.', ',')}</div>
                      </div>
                    </div>
                  ))}
                  {(!Array.isArray(salaries) || salaries.length === 0) && (
                    <div className="text-center py-8 text-gray-500">Nenhum pagamento de salário registrado este mês</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Relatórios */}
        <TabsContent value="reports" className="space-y-4 pb-8">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
              <CardDescription>Gere relatórios detalhados das finanças</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Seleção de Período */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold mb-3">Período do Relatório</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data Inicial</Label>
                      <Input
                        type="date"
                        value={reportPeriod.startDate}
                        onChange={(e) => setReportPeriod({ ...reportPeriod, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Data Final</Label>
                      <Input
                        type="date"
                        value={reportPeriod.endDate}
                        onChange={(e) => setReportPeriod({ ...reportPeriod, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Deixe em branco para usar o período padrão (mês atual)
                  </p>
                </div>
                
                <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">DRE (Demonstração do Resultado do Exercício)</h3>
                  <p className="text-sm text-gray-600">Relatório completo de receitas, despesas e lucro líquido</p>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="outline"
                      onClick={generateDRE}
                      disabled={loading}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {loading ? 'Gerando...' : 'Visualizar DRE'}
                    </Button>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Fluxo de Caixa</h3>
                  <p className="text-sm text-gray-600">Análise de entradas e saídas de dinheiro</p>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="outline"
                      onClick={generateCashFlow}
                      disabled={loading}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {loading ? 'Gerando...' : 'Visualizar Fluxo de Caixa'}
                    </Button>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Lucro Mensal/Anual</h3>
                  <p className="text-sm text-gray-600">Evolução do lucro ao longo do tempo</p>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="outline"
                      onClick={generateProfitReport}
                      disabled={loading}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {loading ? 'Gerando...' : 'Visualizar Relatório de Lucro'}
                    </Button>
                  </div>
                </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog de Preview de Relatório */}
      <ReportPreviewDialog
        open={reportPreviewOpen}
        onOpenChange={setReportPreviewOpen}
        title={reportPreviewType === 'dre' ? 'DRE - Demonstração do Resultado do Exercício' : 
               reportPreviewType === 'cashflow' ? 'Fluxo de Caixa' : 'Relatório de Lucro Mensal/Anual'}
        reportData={reportPreviewData}
        type={reportPreviewType}
        onDownload={() => {
          if (reportPreviewData) {
            generatePDF(reportPreviewType, reportPreviewData);
          }
        }}
      />
    </div>
  );
}

