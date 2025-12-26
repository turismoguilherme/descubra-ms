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
  MapPin
} from 'lucide-react';
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
    </div>
  );
}
