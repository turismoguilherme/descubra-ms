import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle2, 
  XCircle, 
  Clock,
  Calendar,
  Users,
  DollarSign,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface PartnerReservation {
  id: string;
  reservation_code: string;
  reservation_type: string;
  service_name: string;
  reservation_date: string;
  reservation_time?: string;
  guests: number;
  total_amount: number;
  commission_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  special_requests?: string;
  created_at: string;
  confirmed_at?: string;
}

interface PartnerReservationsTableProps {
  reservations: PartnerReservation[];
  onAction: (id: string, action: 'confirm' | 'reject' | 'complete') => void;
  showActions: boolean;
  isMobile?: boolean;
  onOpenChat?: (reservationId: string) => void;
  unreadMessagesCount?: Record<string, number>;
}

export const PartnerReservationsTable: React.FC<PartnerReservationsTableProps> = ({
  reservations,
  onAction,
  showActions,
  isMobile = false,
  onOpenChat,
  unreadMessagesCount = {}
}) => {
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

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Nenhuma reserva encontrada</p>
        <p className="text-sm text-gray-400 mt-2">
          Quando houver reservas, elas aparecerão aqui
        </p>
      </div>
    );
  }

  // Versão Mobile (Cards)
  if (isMobile) {
    return (
      <div className="space-y-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-ms-primary-blue mb-1">
                    {reservation.reservation_code}
                  </p>
                  <h4 className="font-semibold text-gray-900">{reservation.guest_name || 'N/A'}</h4>
                </div>
                {getStatusBadge(reservation.status)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(reservation.reservation_date), "dd/MM/yyyy", { locale: ptBR })}
                    {reservation.reservation_time && ` às ${reservation.reservation_time}`}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{reservation.guests} {reservation.guests === 1 ? 'hóspede' : 'hóspedes'}</span>
                </div>

                {reservation.guest_email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-xs truncate">{reservation.guest_email}</span>
                  </div>
                )}

                {reservation.guest_phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{reservation.guest_phone}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Valor Total</p>
                    <p className="font-semibold text-gray-900">
                      R$ {reservation.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Comissão</p>
                    <p className="font-semibold text-ms-discovery-teal">
                      R$ {reservation.commission_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  {showActions && (
                    <>
                      {reservation.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onAction(reservation.id, 'confirm')}
                            className="flex-1 bg-ms-pantanal-green hover:bg-ms-pantanal-green/90"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onAction(reservation.id, 'reject')}
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                      {reservation.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => onAction(reservation.id, 'complete')}
                          className="flex-1 bg-ms-discovery-teal hover:bg-ms-discovery-teal/90"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Completar
                        </Button>
                      )}
                    </>
                  )}
                  {onOpenChat && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenChat(reservation.id)}
                      className={cn(
                        "flex-1 border-ms-primary-blue text-ms-primary-blue hover:bg-ms-primary-blue hover:text-white relative",
                        !showActions && "w-full"
                      )}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Chat
                      {unreadMessagesCount[reservation.id] > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                          {unreadMessagesCount[reservation.id]}
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Versão Desktop (Tabela)
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="font-semibold">Código</TableHead>
            <TableHead className="font-semibold">Cliente</TableHead>
            <TableHead className="font-semibold">Data/Hora</TableHead>
            <TableHead className="font-semibold">Hóspedes</TableHead>
            <TableHead className="font-semibold">Valor</TableHead>
            <TableHead className="font-semibold">Comissão</TableHead>
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
                <div>
                  <div className="font-medium text-gray-900">{reservation.guest_name || 'N/A'}</div>
                  {reservation.guest_email && (
                    <div className="text-sm text-gray-500">{reservation.guest_email}</div>
                  )}
                  {reservation.guest_phone && (
                    <div className="text-sm text-gray-500">{reservation.guest_phone}</div>
                  )}
                </div>
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
              <TableCell className="font-semibold text-ms-discovery-teal">
                R$ {reservation.commission_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>{getStatusBadge(reservation.status)}</TableCell>
              <TableCell>
                <div className="flex gap-2 items-center">
                  {showActions && (
                    <>
                      {reservation.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onAction(reservation.id, 'confirm')}
                            className="bg-ms-pantanal-green hover:bg-ms-pantanal-green/90 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onAction(reservation.id, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                      {reservation.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => onAction(reservation.id, 'complete')}
                          className="bg-ms-discovery-teal hover:bg-ms-discovery-teal/90 text-white"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Completar
                        </Button>
                      )}
                    </>
                  )}
                  {onOpenChat && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenChat(reservation.id)}
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
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
