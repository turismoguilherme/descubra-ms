import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  AlertCircle,
  Settings,
  Building2
} from 'lucide-react';
import PartnerBusinessEditor from './PartnerBusinessEditor';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface Partner {
  id: string;
  name: string;
  subscription_status: string;
  monthly_fee: number;
  commission_rate: number;
  subscription_end_date?: string;
}

export default function PartnerDashboard() {
  const { toast } = useToast();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [reservations, setReservations] = useState<PartnerReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reservations');
  const [reservationTab, setReservationTab] = useState('pending');

  useEffect(() => {
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    try {
      // Buscar parceiro pelo email do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        toast({
          title: 'Erro',
          description: 'Usuário não autenticado',
          variant: 'destructive',
        });
        return;
      }

      const { data: partnerData, error: partnerError } = await supabase
        .from('institutional_partners')
        .select('*')
        .eq('contact_email', user.email)
        .single();

      if (partnerError || !partnerData) {
        toast({
          title: 'Parceiro não encontrado',
          description: 'Você não está cadastrado como parceiro',
          variant: 'destructive',
        });
        return;
      }

      setPartner(partnerData);

      // Buscar reservas do parceiro
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('partner_reservations')
        .select('*')
        .eq('partner_id', partnerData.id)
        .order('created_at', { ascending: false });

      if (reservationsError) {
        console.error('Erro ao carregar reservas:', reservationsError);
      } else {
        setReservations(reservationsData || []);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReservationAction = async (
    reservationId: string, 
    action: 'confirm' | 'reject' | 'complete'
  ) => {
    try {
      const statusMap = {
        confirm: 'confirmed',
        reject: 'rejected',
        complete: 'completed',
      };

      const updateData: any = {
        status: statusMap[action],
        updated_at: new Date().toISOString(),
      };

      if (action === 'confirm') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (action === 'complete') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('partner_reservations')
        .update(updateData)
        .eq('id', reservationId);

      if (error) throw error;

      toast({
        title: 'Sucesso!',
        description: `Reserva ${action === 'confirm' ? 'confirmada' : action === 'reject' ? 'rejeitada' : 'completada'} com sucesso`,
      });

      loadPartnerData();
    } catch (error: any) {
      console.error('Erro ao atualizar reserva:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a reserva',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ms-primary-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Parceiro não encontrado</h3>
            <p className="text-gray-600 mb-4">
              Você não está cadastrado como parceiro ou não tem acesso a este dashboard.
            </p>
            <Button onClick={() => window.location.href = '/descubramatogrossodosul/seja-um-parceiro'}>
              Seja um Parceiro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
  const completedReservations = reservations.filter(r => r.status === 'completed');
  const allReservations = reservations;

  const totalRevenue = completedReservations.reduce((sum, r) => sum + r.total_amount, 0);
  const totalCommissions = completedReservations.reduce((sum, r) => sum + r.commission_amount, 0);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      confirmed: { label: 'Confirmada', variant: 'default' as const, icon: CheckCircle2 },
      completed: { label: 'Completada', variant: 'default' as const, icon: CheckCircle2 },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const, icon: XCircle },
      rejected: { label: 'Rejeitada', variant: 'destructive' as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ms-primary-blue mb-2">
          Dashboard do Parceiro
        </h1>
        <p className="text-gray-600">{partner.name}</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Reservas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReservations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allReservations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Comissões Geradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Reservas e Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento</CardTitle>
          <CardDescription>
            Gerencie suas reservas e informações do negócio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="reservations">
                Reservas ({allReservations.length})
              </TabsTrigger>
              <TabsTrigger value="business">
                <Building2 className="w-4 h-4 mr-2" />
                Meu Negócio
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reservations">
              <div className="space-y-4">
                <Tabs value={reservationTab} onValueChange={setReservationTab}>
                  <TabsList>
                    <TabsTrigger value="pending">
                      Pendentes ({pendingReservations.length})
                    </TabsTrigger>
                    <TabsTrigger value="confirmed">
                      Confirmadas ({confirmedReservations.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      Completadas ({completedReservations.length})
                    </TabsTrigger>
                    <TabsTrigger value="all">
                      Todas ({allReservations.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending">
                    <ReservationsTable
                      reservations={pendingReservations}
                      onAction={handleReservationAction}
                      showActions={true}
                    />
                  </TabsContent>

                  <TabsContent value="confirmed">
                    <ReservationsTable
                      reservations={confirmedReservations}
                      onAction={handleReservationAction}
                      showActions={true}
                    />
                  </TabsContent>

                  <TabsContent value="completed">
                    <ReservationsTable
                      reservations={completedReservations}
                      onAction={handleReservationAction}
                      showActions={false}
                    />
                  </TabsContent>

                  <TabsContent value="all">
                    <ReservationsTable
                      reservations={allReservations}
                      onAction={handleReservationAction}
                      showActions={false}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            <TabsContent value="business">
              <PartnerBusinessEditor
                partnerId={partner.id}
                onUpdate={loadPartnerData}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface ReservationsTableProps {
  reservations: PartnerReservation[];
  onAction: (id: string, action: 'confirm' | 'reject' | 'complete') => void;
  showActions: boolean;
}

function ReservationsTable({ reservations, onAction, showActions }: ReservationsTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      confirmed: { label: 'Confirmada', variant: 'default' as const, icon: CheckCircle2 },
      completed: { label: 'Completada', variant: 'default' as const, icon: CheckCircle2 },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const, icon: XCircle },
      rejected: { label: 'Rejeitada', variant: 'destructive' as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma reserva encontrada
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Data/Hora</TableHead>
          <TableHead>Hóspedes</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Comissão</TableHead>
          <TableHead>Status</TableHead>
          {showActions && <TableHead>Ações</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservations.map((reservation) => (
          <TableRow key={reservation.id}>
            <TableCell className="font-mono text-sm">{reservation.reservation_code}</TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{reservation.guest_name || 'N/A'}</div>
                <div className="text-sm text-gray-500">{reservation.guest_email}</div>
                {reservation.guest_phone && (
                  <div className="text-sm text-gray-500">{reservation.guest_phone}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div>{format(new Date(reservation.reservation_date), "dd/MM/yyyy", { locale: ptBR })}</div>
                {reservation.reservation_time && (
                  <div className="text-sm text-gray-500">{reservation.reservation_time}</div>
                )}
              </div>
            </TableCell>
            <TableCell>{reservation.guests}</TableCell>
            <TableCell className="font-medium">
              R$ {reservation.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </TableCell>
            <TableCell className="text-blue-600 font-medium">
              R$ {reservation.commission_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </TableCell>
            <TableCell>{getStatusBadge(reservation.status)}</TableCell>
            {showActions && (
              <TableCell>
                <div className="flex gap-2">
                  {reservation.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => onAction(reservation.id, 'confirm')}
                        className="bg-green-600 hover:bg-green-700"
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
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Completar
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

