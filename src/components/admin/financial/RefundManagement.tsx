// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, CheckCircle, XCircle, Clock, Eye, DollarSign, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PendingRefund {
  id: string;
  reservation_id: string;
  partner_id: string;
  refund_amount: number;
  refund_percent: number;
  total_amount: number;
  stripe_payment_intent_id?: string;
  stripe_checkout_session_id?: string;
  status: 'pending' | 'processing' | 'processed' | 'cancelled' | 'failed';
  reason?: string;
  days_until_reservation?: number;
  reservation_code?: string;
  created_at: string;
  processed_at?: string;
  processed_by?: string;
  stripe_refund_id?: string;
  admin_notes?: string;
  partner?: {
    id: string;
    name: string;
    contact_email?: string;
  };
  reservation?: {
    id: string;
    reservation_code?: string;
    customer_name?: string;
    customer_email?: string;
  };
}

export default function RefundManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [refunds, setRefunds] = useState<PendingRefund[]>([]);
  const [selectedRefund, setSelectedRefund] = useState<PendingRefund | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadRefunds();
  }, [filterStatus]);

  const loadRefunds = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('pending_refunds')
        .select(`
          *,
          institutional_partners!pending_refunds_partner_id_fkey (
            id,
            name,
            contact_email
          ),
          partner_reservations!pending_refunds_reservation_id_fkey (
            id,
            reservation_code,
            customer_name,
            customer_email
          )
        `)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Processar dados para incluir informações relacionadas
      const processedRefunds = (data || []).map((refund: any) => ({
        ...refund,
        partner: refund.institutional_partners,
        reservation: refund.partner_reservations,
      }));

      setRefunds(processedRefunds);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar reembolsos:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar reembolsos pendentes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedRefund) return;

    setLoading(true);
    try {
      // Atualizar status para "processing"
      const { error: updateError } = await supabase
        .from('pending_refunds')
        .update({
          status: 'processing',
          admin_notes: adminNotes || null,
        })
        .eq('id', selectedRefund.id);

      if (updateError) throw updateError;

      // Chamar função do Supabase para processar reembolso no Stripe
      const { data: refundData, error: refundError } = await supabase.functions.invoke('process-refund', {
        body: {
          refundId: selectedRefund.id,
          reservationId: selectedRefund.reservation_id,
          paymentIntentId: selectedRefund.stripe_payment_intent_id,
          checkoutSessionId: selectedRefund.stripe_checkout_session_id,
          amount: selectedRefund.refund_amount,
        },
      });

      if (refundError) throw refundError;

      // Atualizar status para "processed"
      const { error: finalUpdateError } = await supabase
        .from('pending_refunds')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
          stripe_refund_id: refundData?.stripe_refund_id || null,
          admin_notes: adminNotes || null,
        })
        .eq('id', selectedRefund.id);

      if (finalUpdateError) throw finalUpdateError;

      // Atualizar reserva com informações do reembolso
      await supabase
        .from('partner_reservations')
        .update({
          stripe_refund_id: refundData?.stripe_refund_id || null,
          refunded_at: new Date().toISOString(),
        })
        .eq('id', selectedRefund.reservation_id);

      toast({
        title: 'Sucesso',
        description: `Reembolso de R$ ${selectedRefund.refund_amount.toFixed(2)} processado com sucesso`,
      });

      setProcessDialogOpen(false);
      setSelectedRefund(null);
      setAdminNotes('');
      loadRefunds();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao processar reembolso:', err);

      // Atualizar status para "failed"
      await supabase
        .from('pending_refunds')
        .update({
          status: 'failed',
          admin_notes: `Erro: ${err.message}`,
        })
        .eq('id', selectedRefund.id);

      toast({
        title: 'Erro',
        description: `Erro ao processar reembolso: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRefund = async (refundId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este reembolso?')) return;

    try {
      const { error } = await supabase
        .from('pending_refunds')
        .update({
          status: 'cancelled',
          admin_notes: 'Cancelado pelo admin',
        })
        .eq('id', refundId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Reembolso cancelado',
      });

      loadRefunds();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: `Erro ao cancelar reembolso: ${err.message}`,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; icon: any }> = {
      pending: { variant: 'outline', label: 'Pendente', icon: Clock },
      processing: { variant: 'default', label: 'Processando', icon: RefreshCw },
      processed: { variant: 'default', label: 'Processado', icon: CheckCircle },
      cancelled: { variant: 'secondary', label: 'Cancelado', icon: XCircle },
      failed: { variant: 'destructive', label: 'Falhou', icon: AlertCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const pendingCount = refunds.filter((r) => r.status === 'pending').length;
  const totalPendingAmount = refunds
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + Number(r.refund_amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Reembolsos</h1>
          <p className="text-muted-foreground mt-1">
            Processe reembolsos de reservas canceladas manualmente
          </p>
        </div>
        <Button onClick={loadRefunds} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reembolsos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Total: R$ {totalPendingAmount.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {refunds.filter((r) => r.status === 'processed').length}
            </div>
            <p className="text-xs text-muted-foreground">Reembolsos concluídos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{refunds.length}</div>
            <p className="text-xs text-muted-foreground">Todos os reembolsos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="processing">Processando</option>
              <option value="processed">Processados</option>
              <option value="cancelled">Cancelados</option>
              <option value="failed">Falhados</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Reembolsos */}
      <Card>
        <CardHeader>
          <CardTitle>Reembolsos</CardTitle>
          <CardDescription>
            {refunds.length} reembolso(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : refunds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum reembolso encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {refunds.map((refund) => (
                <Card key={refund.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(refund.status)}
                        <span className="font-semibold">
                          R$ {Number(refund.refund_amount).toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({refund.refund_percent}% de R$ {Number(refund.total_amount).toFixed(2)})
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>
                          <strong>Parceiro:</strong> {refund.partner?.name || 'N/A'}
                        </div>
                        <div>
                          <strong>Código Reserva:</strong> {refund.reservation_code || 'N/A'}
                        </div>
                        <div>
                          <strong>Criado em:</strong>{' '}
                          {format(new Date(refund.created_at), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </div>
                        {refund.days_until_reservation !== null && (
                          <div>
                            <strong>Dias até reserva:</strong> {refund.days_until_reservation}
                          </div>
                        )}
                      </div>

                      {refund.reason && (
                        <div className="mt-2 text-sm">
                          <strong>Motivo:</strong> {refund.reason}
                        </div>
                      )}

                      {refund.admin_notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <strong>Notas do Admin:</strong> {refund.admin_notes}
                        </div>
                      )}

                      {refund.stripe_refund_id && (
                        <div className="mt-2 text-sm">
                          <strong>ID Stripe:</strong> {refund.stripe_refund_id}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRefund(refund);
                          setDetailsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>

                      {refund.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRefund(refund);
                              setProcessDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Processar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelRefund(refund.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Reembolso</DialogTitle>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedRefund.status)}</div>
                </div>
                <div>
                  <Label>Valor do Reembolso</Label>
                  <div className="text-lg font-semibold">
                    R$ {Number(selectedRefund.refund_amount).toFixed(2)}
                  </div>
                </div>
                <div>
                  <Label>Percentual</Label>
                  <div>{selectedRefund.refund_percent}%</div>
                </div>
                <div>
                  <Label>Valor Total</Label>
                  <div>R$ {Number(selectedRefund.total_amount).toFixed(2)}</div>
                </div>
                <div>
                  <Label>Parceiro</Label>
                  <div>{selectedRefund.partner?.name || 'N/A'}</div>
                </div>
                <div>
                  <Label>Código da Reserva</Label>
                  <div>{selectedRefund.reservation_code || 'N/A'}</div>
                </div>
                <div>
                  <Label>Cliente</Label>
                  <div>
                    {selectedRefund.reservation?.customer_name || 'N/A'}
                    {selectedRefund.reservation?.customer_email && (
                      <div className="text-sm text-muted-foreground">
                        {selectedRefund.reservation.customer_email}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Criado em</Label>
                  <div>
                    {format(new Date(selectedRefund.created_at), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </div>
                </div>
                {selectedRefund.stripe_payment_intent_id && (
                  <div>
                    <Label>Payment Intent ID</Label>
                    <div className="text-xs font-mono">{selectedRefund.stripe_payment_intent_id}</div>
                  </div>
                )}
                {selectedRefund.stripe_checkout_session_id && (
                  <div>
                    <Label>Checkout Session ID</Label>
                    <div className="text-xs font-mono">{selectedRefund.stripe_checkout_session_id}</div>
                  </div>
                )}
                {selectedRefund.stripe_refund_id && (
                  <div>
                    <Label>Stripe Refund ID</Label>
                    <div className="text-xs font-mono">{selectedRefund.stripe_refund_id}</div>
                  </div>
                )}
              </div>
              {selectedRefund.reason && (
                <div>
                  <Label>Motivo do Cancelamento</Label>
                  <div className="p-2 bg-muted rounded-md">{selectedRefund.reason}</div>
                </div>
              )}
              {selectedRefund.admin_notes && (
                <div>
                  <Label>Notas do Admin</Label>
                  <div className="p-2 bg-muted rounded-md">{selectedRefund.admin_notes}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Processar Reembolso */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Processar Reembolso</DialogTitle>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <div className="font-semibold mb-2">Resumo do Reembolso</div>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Valor:</strong> R$ {Number(selectedRefund.refund_amount).toFixed(2)}
                  </div>
                  <div>
                    <strong>Parceiro:</strong> {selectedRefund.partner?.name || 'N/A'}
                  </div>
                  <div>
                    <strong>Reserva:</strong> {selectedRefund.reservation_code || 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="admin_notes">Notas (opcional)</Label>
                <Textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Adicione notas sobre este reembolso..."
                  rows={3}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
                <AlertCircle className="h-4 w-4 inline mr-2 text-yellow-600" />
                O reembolso será processado no Stripe e o status será atualizado automaticamente.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleProcessRefund} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Processar Reembolso
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}




