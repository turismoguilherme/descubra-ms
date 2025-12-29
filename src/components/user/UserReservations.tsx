import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  MessageSquare, 
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  X,
  AlertTriangle
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ReservationChat } from '@/components/partners/ReservationChat';
import { ReservationMessageService } from '@/services/partners/reservationMessageService';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface UserReservation {
  id: string;
  reservation_code: string;
  reservation_type: string;
  service_name: string;
  reservation_date: string;
  reservation_time?: string;
  guests: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  partner_id: string;
  partner_name?: string;
  partner_email?: string;
  created_at: string;
  confirmed_at?: string;
}

export default function UserReservations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<UserReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservationForChat, setSelectedReservationForChat] = useState<string | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<Record<string, number>>({});
  const [cancellingReservation, setCancellingReservation] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelPolicy, setCancelPolicy] = useState<{
    refundPercent: number;
    refundAmount: number;
    daysUntilReservation: number;
  } | null>(null);
  const [processingCancel, setProcessingCancel] = useState(false);

  useEffect(() => {
    if (user?.email) {
      loadReservations();
    }
  }, [user]);

  const loadReservations = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      
      // Buscar reservas do cliente pelo email
      const { data, error } = await supabase
        .from('partner_reservations')
        .select(`
          *,
          institutional_partners (
            id,
            name,
            contact_email
          )
        `)
        .eq('guest_email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReservations: UserReservation[] = (data || []).map((reservation: any) => ({
        id: reservation.id,
        reservation_code: reservation.reservation_code,
        reservation_type: reservation.reservation_type,
        service_name: reservation.service_name,
        reservation_date: reservation.reservation_date,
        reservation_time: reservation.reservation_time,
        guests: reservation.guests,
        total_amount: reservation.total_amount,
        status: reservation.status,
        partner_id: reservation.partner_id,
        partner_name: reservation.institutional_partners?.name,
        partner_email: reservation.institutional_partners?.contact_email,
        created_at: reservation.created_at,
        confirmed_at: reservation.confirmed_at,
      }));

      setReservations(formattedReservations);

      // Carregar contadores de mensagens não lidas
      if (formattedReservations.length > 0) {
        const counts: Record<string, number> = {};
        await Promise.all(
          formattedReservations.map(async (reservation) => {
            try {
              const count = await ReservationMessageService.getUnreadCount(reservation.id, false);
              counts[reservation.id] = count;
            } catch (error) {
              counts[reservation.id] = 0;
            }
          })
        );
        setUnreadMessagesCount(counts);
      }
    } catch (error: any) {
      console.error('Erro ao carregar reservas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar suas reservas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = async (reservation: UserReservation) => {
    if (reservation.status === 'cancelled' || reservation.status === 'completed') {
      return;
    }

    // Calcular dias até a reserva
    const reservationDate = new Date(reservation.reservation_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    reservationDate.setHours(0, 0, 0, 0);
    
    const daysUntilReservation = Math.floor(
      (reservationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Buscar política de cancelamento
    try {
      const { data: partnerPolicy } = await supabase
        .from('partner_cancellation_policies')
        .select('*')
        .eq('partner_id', reservation.partner_id)
        .eq('is_active', true)
        .maybeSingle();

      const { data: defaultPolicy } = await supabase
        .from('partner_cancellation_policies')
        .select('*')
        .is('partner_id', null)
        .eq('is_default', true)
        .eq('is_active', true)
        .maybeSingle();

      const policy = partnerPolicy || defaultPolicy;

      if (!policy) {
        toast({
          title: 'Erro',
          description: 'Política de cancelamento não encontrada',
          variant: 'destructive',
        });
        return;
      }

      // Calcular percentual de reembolso
      let refundPercent = 0;
      if (daysUntilReservation >= 7) {
        refundPercent = policy.days_before_7_refund_percent;
      } else if (daysUntilReservation >= 1 && daysUntilReservation <= 2) {
        refundPercent = policy.days_before_1_2_refund_percent;
      } else {
        refundPercent = policy.days_before_0_refund_percent;
      }

      const refundAmount = (reservation.total_amount * refundPercent) / 100;

      setCancelPolicy({
        refundPercent,
        refundAmount,
        daysUntilReservation,
      });
      setCancellingReservation(reservation.id);
      setCancelReason('');
    } catch (error: any) {
      console.error('Erro ao buscar política de cancelamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a política de cancelamento',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingReservation) return;

    try {
      setProcessingCancel(true);

      const { data, error } = await supabase.functions.invoke('cancel-reservation', {
        body: {
          reservationId: cancellingReservation,
          reason: cancelReason || null,
        },
      });

      if (error) throw error;

      toast({
        title: 'Reserva cancelada',
        description: data.message || 'Cancelamento processado com sucesso',
      });

      setCancellingReservation(null);
      setCancelReason('');
      setCancelPolicy(null);
      await loadReservations();
    } catch (error: any) {
      console.error('Erro ao cancelar reserva:', error);
      toast({
        title: 'Erro ao cancelar',
        description: error.message || 'Não foi possível cancelar a reserva',
        variant: 'destructive',
      });
    } finally {
      setProcessingCancel(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: 'Pendente', 
        variant: 'secondary' as const, 
        icon: Clock,
        className: 'bg-ms-cerrado-orange/10 text-ms-cerrado-orange border-ms-cerrado-orange/20'
      },
      confirmed: { 
        label: 'Confirmada', 
        variant: 'default' as const, 
        icon: CheckCircle2,
        className: 'bg-ms-primary-blue/10 text-ms-primary-blue border-ms-primary-blue/20'
      },
      completed: { 
        label: 'Completada', 
        variant: 'default' as const, 
        icon: CheckCircle2,
        className: 'bg-ms-pantanal-green/10 text-ms-pantanal-green border-ms-pantanal-green/20'
      },
      cancelled: { 
        label: 'Cancelada', 
        variant: 'destructive' as const, 
        icon: XCircle,
        className: 'bg-red-100 text-red-700 border-red-200'
      },
      rejected: { 
        label: 'Rejeitada', 
        variant: 'destructive' as const, 
        icon: XCircle,
        className: 'bg-red-100 text-red-700 border-red-200'
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={cn('flex items-center gap-1 w-fit', config.className)}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-primary-blue mx-auto mb-4"></div>
        <p className="text-gray-500">Carregando suas reservas...</p>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Nenhuma reserva encontrada</p>
        <p className="text-sm text-gray-400 mt-2">
          Quando você fizer uma reserva, ela aparecerá aqui
        </p>
      </div>
    );
  }

  const selectedReservation = reservations.find(r => r.id === selectedReservationForChat);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Minhas Reservas</h2>
        <p className="text-gray-600">Gerencie suas reservas e converse com os parceiros</p>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="font-semibold">Código</TableHead>
              <TableHead className="font-semibold">Serviço</TableHead>
              <TableHead className="font-semibold">Parceiro</TableHead>
              <TableHead className="font-semibold">Data/Hora</TableHead>
              <TableHead className="font-semibold">Hóspedes</TableHead>
              <TableHead className="font-semibold">Valor</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-mono text-sm text-ms-primary-blue font-medium">
                  {reservation.reservation_code}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">{reservation.service_name}</div>
                  <div className="text-sm text-gray-500">{reservation.reservation_type}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">{reservation.partner_name || 'N/A'}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        {format(new Date(reservation.reservation_date), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      {reservation.reservation_time && (
                        <div className="text-sm text-gray-500">{reservation.reservation_time}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{reservation.guests}</span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-gray-900">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span>R$ {reservation.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedReservationForChat(reservation.id)}
                      className="border-ms-primary-blue text-ms-primary-blue hover:bg-ms-primary-blue hover:text-white relative"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Chat
                      {unreadMessagesCount[reservation.id] > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                          {unreadMessagesCount[reservation.id]}
                        </span>
                      )}
                    </Button>
                    {reservation.status !== 'cancelled' && 
                     reservation.status !== 'completed' && 
                     reservation.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelClick(reservation)}
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Chat de Reserva */}
      {selectedReservationForChat && selectedReservation && (
        <ReservationChat
          key={selectedReservation.id}
          reservationId={selectedReservation.id}
          reservationCode={selectedReservation.reservation_code}
          guestName={user?.user_metadata?.full_name || user?.email}
          guestEmail={user?.email}
          partnerId={selectedReservation.partner_id}
          partnerName={selectedReservation.partner_name || 'Parceiro'}
          partnerEmail={selectedReservation.partner_email || ''}
          open={!!selectedReservationForChat}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedReservationForChat(null);
              // Recarregar contadores ao fechar
              loadReservations();
            }
          }}
        />
      )}

      {/* Modal de Cancelamento */}
      <Dialog open={!!cancellingReservation} onOpenChange={(open) => {
        if (!open) {
          setCancellingReservation(null);
          setCancelReason('');
          setCancelPolicy(null);
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Cancelar Reserva
            </DialogTitle>
            <DialogDescription>
              Confirme o cancelamento da sua reserva. O reembolso será processado automaticamente conforme a política de cancelamento.
            </DialogDescription>
          </DialogHeader>

          {cancelPolicy && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-900 mb-2">Política de Cancelamento</p>
                    <div className="space-y-1 text-sm text-yellow-800">
                      <p>
                        <strong>Dias até a reserva:</strong> {cancelPolicy.daysUntilReservation} {cancelPolicy.daysUntilReservation === 1 ? 'dia' : 'dias'}
                      </p>
                      <p>
                        <strong>Reembolso:</strong> {cancelPolicy.refundPercent}% ({cancelPolicy.refundPercent === 0 ? 'Sem reembolso' : `R$ ${cancelPolicy.refundAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`})
                      </p>
                      {cancelPolicy.daysUntilReservation >= 7 && (
                        <p className="text-xs text-yellow-700 mt-2">
                          ✓ Cancelamento com 7+ dias de antecedência: 100% de reembolso
                        </p>
                      )}
                      {cancelPolicy.daysUntilReservation >= 1 && cancelPolicy.daysUntilReservation <= 2 && (
                        <p className="text-xs text-yellow-700 mt-2">
                          ⚠ Cancelamento com 1-2 dias de antecedência: 50% de reembolso
                        </p>
                      )}
                      {cancelPolicy.daysUntilReservation < 1 && (
                        <p className="text-xs text-yellow-700 mt-2">
                          ✗ Cancelamento no dia ou após: sem reembolso
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Motivo do cancelamento (opcional)
                </label>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Informe o motivo do cancelamento..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancellingReservation(null);
                setCancelReason('');
                setCancelPolicy(null);
              }}
              disabled={processingCancel}
            >
              Não, manter reserva
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={processingCancel}
            >
              {processingCancel ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Confirmar Cancelamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
