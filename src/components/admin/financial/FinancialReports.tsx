import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PeriodFilterTabs } from '@/components/admin/ui/PeriodFilterTabs';
import { Download, FileText, FileJson } from 'lucide-react';
import { financialService } from '@/services/admin/financialService';
import { useToast } from '@/hooks/use-toast';
import { PaymentReconciliation } from '@/types/admin';

export default function FinancialReports() {
  const [payments, setPayments] = useState<PaymentReconciliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await financialService.getPayments();
      setPayments(data || []);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao carregar pagamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await financialService.exportPayments('csv');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio-pagamentos-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Sucesso',
        description: 'Relatório exportado com sucesso',
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao exportar relatório',
        variant: 'destructive',
      });
    }
  };

  const handleExportJSON = async () => {
    try {
      const json = await financialService.exportPayments('json');
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio-pagamentos-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Sucesso',
        description: 'Relatório exportado com sucesso',
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao exportar relatório',
        variant: 'destructive',
      });
    }
  };

  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const reconciledRevenue = payments
    .filter(p => p.reconciled && p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingRevenue = totalRevenue - reconciledRevenue;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h2>
          <p className="text-gray-600 mt-1">Relatórios e exportação de dados financeiros</p>
        </div>
        <div className="flex gap-2 items-center">
          <PeriodFilterTabs value={period} onChange={setPeriod} />
          <Button variant="outline" onClick={handleExportCSV}>
            <FileText className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportJSON}>
            <FileJson className="h-4 w-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalRevenue.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-sm text-gray-500 mt-1">Total recebido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Reconciliado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {reconciledRevenue.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-sm text-gray-500 mt-1">Com baixa dada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {pendingRevenue.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-sm text-gray-500 mt-1">Aguardando reconciliação</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo do Período</CardTitle>
          <CardDescription>Estatísticas financeiras do período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Total de Pagamentos</span>
                <span className="text-lg font-bold">{payments.length}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Pagamentos Aprovados</span>
                <span className="text-lg font-bold text-green-600">
                  {payments.filter(p => p.status === 'paid').length}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Pagamentos Falhados</span>
                <span className="text-lg font-bold text-red-600">
                  {payments.filter(p => p.status === 'failed').length}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
