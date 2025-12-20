import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  Calendar,
  CreditCard,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { PartnerTransactionService, PartnerTransaction, TransactionFilters } from '@/services/partners/partnerTransactionService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';

interface PartnerTransactionHistoryProps {
  partnerId: string;
}

export const PartnerTransactionHistory: React.FC<PartnerTransactionHistoryProps> = ({ partnerId }) => {
  const [transactions, setTransactions] = useState<PartnerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadData();
  }, [partnerId, filters, dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Calcular datas baseado no range
      const dateFilters: TransactionFilters = { ...filters };
      if (dateRange !== 'all') {
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        dateFilters.startDate = startDate.toISOString();
      }

      const [transactionsData, summaryData] = await Promise.all([
        PartnerTransactionService.getTransactions(partnerId, dateFilters),
        PartnerTransactionService.getFinancialSummary(partnerId),
      ]);

      setTransactions(transactionsData);
      setSummary(summaryData);
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: PartnerTransaction['transaction_type']) => {
    switch (type) {
      case 'commission':
        return <TrendingUp className="w-4 h-4" />;
      case 'subscription_payment':
        return <CreditCard className="w-4 h-4" />;
      case 'payout':
        return <ArrowDownRight className="w-4 h-4" />;
      case 'refund':
        return <ArrowUpRight className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: PartnerTransaction['transaction_type'], amount: number) => {
    if (type === 'commission' || (type === 'payout' && amount < 0)) {
      return 'text-ms-pantanal-green';
    }
    if (type === 'subscription_payment' || amount < 0) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: 'Pago', className: 'bg-ms-pantanal-green/10 text-ms-pantanal-green border-ms-pantanal-green/20' },
      pending: { label: 'Pendente', className: 'bg-ms-cerrado-orange/10 text-ms-cerrado-orange border-ms-cerrado-orange/20' },
      failed: { label: 'Falhou', className: 'bg-red-100 text-red-700 border-red-200' },
      refunded: { label: 'Reembolsado', className: 'bg-gray-100 text-gray-700 border-gray-200' },
      cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-700 border-gray-200' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant="outline" className={cn('flex items-center gap-1 w-fit', config.className)}>
        {config.label}
      </Badge>
    );
  };

  // Preparar dados para gráfico
  const chartData = transactions
    .filter(t => t.status === 'paid')
    .reduce((acc, transaction) => {
      const date = format(new Date(transaction.created_at), 'dd/MM', { locale: ptBR });
      const existing = acc.find(item => item.date === date);
      
      if (existing) {
        existing.value += transaction.amount;
      } else {
        acc.push({ date, value: transaction.amount });
      }
      
      return acc;
    }, [] as Array<{ date: string; value: number }>)
    .sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-primary-blue mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Recebido</p>
                  <p className="text-2xl font-bold text-ms-pantanal-green">
                    R$ {summary.totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-ms-pantanal-green/10">
                  <DollarSign className="w-6 h-6 text-ms-pantanal-green" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Comissões</p>
                  <p className="text-2xl font-bold text-ms-discovery-teal">
                    R$ {summary.totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-ms-discovery-teal/10">
                  <TrendingUp className="w-6 h-6 text-ms-discovery-teal" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Assinaturas</p>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {summary.totalSubscriptionPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-red-100">
                  <CreditCard className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pendente</p>
                  <p className="text-2xl font-bold text-ms-cerrado-orange">
                    R$ {summary.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-ms-cerrado-orange/10">
                  <Calendar className="w-6 h-6 text-ms-cerrado-orange" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico de Evolução */}
      {chartData.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-ms-primary-blue">Evolução de Receitas</CardTitle>
            <CardDescription>Receitas ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-ms-primary-blue flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Período</label>
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="all">Todo o período</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo</label>
              <Select 
                value={filters.type || 'all'} 
                onValueChange={(value) => setFilters({ ...filters, type: value === 'all' ? undefined : value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="commission">Comissões</SelectItem>
                  <SelectItem value="subscription_payment">Assinaturas</SelectItem>
                  <SelectItem value="payout">Repasses</SelectItem>
                  <SelectItem value="refund">Reembolsos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select 
                value={filters.status || 'all'} 
                onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({});
                  setDateRange('30d');
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Transações */}
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-ms-primary-blue">Histórico de Transações</CardTitle>
              <CardDescription>
                {transactions.length} transação{transactions.length !== 1 ? 'ões' : ''} encontrada{transactions.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Nenhuma transação encontrada</p>
              <p className="text-sm text-gray-400 mt-2">
                Quando houver transações, elas aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      'p-3 rounded-lg',
                      transaction.transaction_type === 'commission' ? 'bg-ms-pantanal-green/10' :
                      transaction.transaction_type === 'subscription_payment' ? 'bg-red-100' :
                      'bg-gray-100'
                    )}>
                      {getTransactionIcon(transaction.transaction_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{transaction.description}</p>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          {format(new Date(transaction.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        {transaction.reservation_id && (
                          <span className="font-mono text-xs">
                            Reserva: {transaction.metadata?.reservation_code || 'N/A'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'text-xl font-bold',
                        getTransactionColor(transaction.transaction_type, transaction.amount)
                      )}>
                        {transaction.amount >= 0 ? '+' : ''}
                        R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      {transaction.paid_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Pago em {format(new Date(transaction.paid_date), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
