import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { financialService } from '@/services/admin/financialService';
import { useToast } from '@/components/ui/use-toast';
import { PaymentReconciliation } from '@/types/admin';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function PaymentsList() {
  const [payments, setPayments] = useState<PaymentReconciliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentReconciliation | null>(null);
  const [isReconcileDialogOpen, setIsReconcileDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
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

  const handleReconcile = async (notes?: string) => {
    if (!selectedPayment || !user) return;

    try {
      await financialService.reconcilePayment(selectedPayment.id, user.id, notes);
      toast({ title: 'Sucesso', description: 'Pagamento reconciliado com sucesso' });
      setIsReconcileDialogOpen(false);
      setSelectedPayment(null);
      fetchPayments();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao reconciliar pagamento',
        variant: 'destructive',
      });
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.stripe_payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pagamentos</h2>
        <p className="text-gray-600 mt-1">Lista de pagamentos e transações</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar pagamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Stripe</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Reconciliado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum pagamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">{payment.stripe_payment_id || '-'}</TableCell>
                      <TableCell>
                        R$ {payment.amount.toFixed(2).replace('.', ',')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.payment_date 
                          ? new Date(payment.payment_date).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.reconciled ? 'default' : 'outline'}>
                          {payment.reconciled ? 'Sim' : 'Não'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {!payment.reconciled && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setIsReconcileDialogOpen(true);
                            }}
                          >
                            Dar Baixa
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isReconcileDialogOpen} onOpenChange={setIsReconcileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dar Baixa no Pagamento</DialogTitle>
            <DialogDescription>
              Confirme a reconciliação deste pagamento
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div>
                <Label>Valor</Label>
                <p className="text-lg font-semibold">
                  R$ {selectedPayment.amount.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div>
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione observações sobre este pagamento..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReconcileDialogOpen(false);
                setSelectedPayment(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                const notes = (document.getElementById('notes') as HTMLTextAreaElement)?.value;
                handleReconcile(notes);
              }}
            >
              Confirmar Baixa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
