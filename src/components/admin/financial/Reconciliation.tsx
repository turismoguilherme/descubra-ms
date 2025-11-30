import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { financialService } from '@/services/admin/financialService';
import { useToast } from '@/hooks/use-toast';
import { PaymentReconciliation } from '@/types/admin';

export default function Reconciliation() {
  const [payments, setPayments] = useState<PaymentReconciliation[]>([]);
  const [loading, setLoading] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await financialService.getPayments();
      setPayments(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar pagamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoReconcile = async () => {
    setReconciling(true);
    try {
      // Sincronizar pagamentos do Stripe
      await financialService.syncStripePayments();
      
      // Buscar pagamentos atualizados
      await fetchPayments();
      
      toast({
        title: 'Sucesso',
        description: 'Pagamentos sincronizados e reconciliados automaticamente',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro na reconciliação automática',
        variant: 'destructive',
      });
    } finally {
      setReconciling(false);
    }
  };

  const unreconciledCount = payments.filter(p => !p.reconciled && p.status === 'paid').length;
  const reconciledCount = payments.filter(p => p.reconciled).length;
  const totalAmount = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reconciliação</h2>
          <p className="text-gray-600 mt-1">Dar baixa e reconciliar pagamentos</p>
        </div>
        <Button onClick={handleAutoReconcile} disabled={reconciling}>
          <RefreshCw className={`h-4 w-4 mr-2 ${reconciling ? 'animate-spin' : ''}`} />
          {reconciling ? 'Reconciliando...' : 'Reconciliação Automática'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalAmount.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Reconciliados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reconciledCount}</div>
            <p className="text-sm text-gray-500 mt-1">Pagamentos com baixa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{unreconciledCount}</div>
            <p className="text-sm text-gray-500 mt-1">Aguardando reconciliação</p>
          </CardContent>
        </Card>
      </div>

      {unreconciledCount > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Existem {unreconciledCount} pagamento(s) pendente(s) de reconciliação.
            Acesse a lista de pagamentos para dar baixa manualmente.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Resumo de Reconciliação</CardTitle>
          <CardDescription>Estatísticas de reconciliação de pagamentos</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Pagamentos Reconciliados</p>
                    <p className="text-sm text-gray-600">{reconciledCount} de {payments.length}</p>
                  </div>
                </div>
                <Badge variant="default">{reconciledCount}</Badge>
              </div>

              {unreconciledCount > 0 && (
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Pagamentos Pendentes</p>
                      <p className="text-sm text-gray-600">Requerem atenção</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{unreconciledCount}</Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
