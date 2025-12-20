import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  Building2,
  AlertCircle,
  LogOut,
  Menu
} from 'lucide-react';
import PartnerBusinessEditor from './PartnerBusinessEditor';
import PartnerPricingEditor from './PartnerPricingEditor';
import { PartnerMetricCard } from './PartnerMetricCard';
import { PartnerReservationsTable } from './PartnerReservationsTable';
import { PartnerCancellationDialog } from './PartnerCancellationDialog';
import { PartnerTransactionHistory } from './PartnerTransactionHistory';
import { PartnerNotifications } from './PartnerNotifications';
import { ReservationChat } from './ReservationChat';
import { ReservationMessageService } from '@/services/partners/reservationMessageService';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
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

interface Partner {
  id: string;
  name: string;
  contact_email: string;
  subscription_status: string;
  monthly_fee: number;
  commission_rate: number;
  subscription_end_date?: string;
  status: string;
  is_active: boolean;
}

export default function PartnerDashboard() {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const isMobile = useIsMobile();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [reservations, setReservations] = useState<PartnerReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reservations');
  const [reservationTab, setReservationTab] = useState('pending');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReservationForChat, setSelectedReservationForChat] = useState<string | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<Record<string, number>>({});

  useEffect(() => {
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    try {
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
      } else if (action === 'reject') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('partner_reservations')
        .update(updateData)
        .eq('id', reservationId);

      if (error) throw error;

      // Criar notificação se for cancelamento
      if (action === 'reject' && partner) {
        try {
          const reservation = reservations.find(r => r.id === reservationId);
          await supabase
            .from('partner_notifications')
            .insert({
              partner_id: partner.id,
              type: 'reservation_cancelled',
              title: 'Reserva Cancelada',
              message: `A reserva ${reservation?.reservation_code || reservationId} foi cancelada.`,
              reservation_id: reservationId,
              email_sent: false,
            });

          // Enviar email
          if (partner.contact_email) {
            await supabase.functions.invoke('send-notification-email', {
              body: {
                type: 'partner_notification',
                to: partner.contact_email,
                data: {
                  title: 'Reserva Cancelada',
                  message: `A reserva ${reservation?.reservation_code || reservationId} foi cancelada.`,
                  type: 'reservation_cancelled',
                  reservationId: reservationId,
                },
              },
            });
          }
        } catch (notifError) {
          console.warn('Erro ao criar notificação (não crítico):', notifError);
        }
      }

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

  // Preparar dados para gráficos (últimos 30 dias)
  const getChartData = (filterFn: (r: PartnerReservation) => boolean, valueFn: (r: PartnerReservation) => number) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayReservations = reservations.filter(r => {
        const resDate = new Date(r.reservation_date).toISOString().split('T')[0];
        return resDate === date && filterFn(r);
      });
      const value = dayReservations.reduce((sum, r) => sum + valueFn(r), 0);
      return {
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        value: value
      };
    });
  };

  const handleCancelPartnership = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <UniversalLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ms-primary-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  if (!partner) {
    return (
      <UniversalLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
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
      </UniversalLayout>
    );
  }

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
  const completedReservations = reservations.filter(r => r.status === 'completed');
  const allReservations = reservations;

  const totalRevenue = completedReservations.reduce((sum, r) => sum + r.total_amount, 0);
  const totalCommissions = completedReservations.reduce((sum, r) => sum + r.commission_amount, 0);

  // Dados para gráficos
  const reservationsChartData = getChartData(
    () => true,
    () => 1
  );
  const revenueChartData = getChartData(
    (r) => r.status === 'completed',
    (r) => r.total_amount
  );
  const commissionsChartData = getChartData(
    (r) => r.status === 'completed',
    (r) => r.commission_amount
  );
  const pendingChartData = getChartData(
    (r) => r.status === 'pending',
    () => 1
  );

  // Calcular tendências (comparar últimos 7 dias com 7 dias anteriores)
  const calculateTrend = (filterFn: (r: PartnerReservation) => boolean, valueFn: (r: PartnerReservation) => number) => {
    const now = new Date();
    const last7Days = reservations.filter(r => {
      const resDate = new Date(r.created_at);
      const daysDiff = Math.floor((now.getTime() - resDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7 && filterFn(r);
    });
    const previous7Days = reservations.filter(r => {
      const resDate = new Date(r.created_at);
      const daysDiff = Math.floor((now.getTime() - resDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 7 && daysDiff <= 14 && filterFn(r);
    });

    const last7Value = last7Days.reduce((sum, r) => sum + valueFn(r), 0);
    const previous7Value = previous7Days.reduce((sum, r) => sum + valueFn(r), 0);

    if (previous7Value === 0) return last7Value > 0 ? 100 : 0;
    return Math.round(((last7Value - previous7Value) / previous7Value) * 100);
  };

  const reservationsTrend = calculateTrend(() => true, () => 1);
  const revenueTrend = calculateTrend((r) => r.status === 'completed', (r) => r.total_amount);
  const commissionsTrend = calculateTrend((r) => r.status === 'completed', (r) => r.commission_amount);

  // Componente Sidebar
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Gerenciamento</h2>
        <p className="text-sm text-gray-500">Navegue pelas seções</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => {
            setActiveTab('reservations');
            if (isMobile) setSidebarOpen(false);
          }}
          className={cn(
            'w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3',
            activeTab === 'reservations'
              ? 'bg-ms-primary-blue text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          <Calendar className={cn('w-5 h-5', activeTab === 'reservations' ? 'text-white' : 'text-gray-500')} />
          <div className="flex-1">
            <div className="font-medium">Reservas</div>
            <div className={cn('text-xs', activeTab === 'reservations' ? 'text-white/80' : 'text-gray-500')}>
              {allReservations.length} total
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('business');
            setBusinessSubTab('info');
            if (isMobile) setSidebarOpen(false);
          }}
          className={cn(
            'w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3',
            activeTab === 'business'
              ? 'bg-ms-primary-blue text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          <Building2 className={cn('w-5 h-5', activeTab === 'business' ? 'text-white' : 'text-gray-500')} />
          <div className="flex-1">
            <div className="font-medium">Meu Negócio</div>
            <div className={cn('text-xs', activeTab === 'business' ? 'text-white/80' : 'text-gray-500')}>
              Informações
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('transactions');
            if (isMobile) setSidebarOpen(false);
          }}
          className={cn(
            'w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3',
            activeTab === 'transactions'
              ? 'bg-ms-primary-blue text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          <DollarSign className={cn('w-5 h-5', activeTab === 'transactions' ? 'text-white' : 'text-gray-500')} />
          <div className="flex-1">
            <div className="font-medium">Transações</div>
            <div className={cn('text-xs', activeTab === 'transactions' ? 'text-white/80' : 'text-gray-500')}>
              Histórico
            </div>
          </div>
        </button>
      </nav>
    </div>
  );

  return (
    <UniversalLayout>
      <main className="flex-grow bg-gradient-to-b from-blue-50/30 via-white to-green-50/30">
        {/* Hero Section Compacta */}
        <div className="bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green">
          <div className="ms-container py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Botão Menu Mobile */}
                {isMobile && (
                  <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                      >
                        <Menu className="w-5 h-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                      <SidebarContent />
                    </SheetContent>
                  </Sheet>
                )}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                    Dashboard do Parceiro
                  </h1>
                  <p className="text-white/90">{partner.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {partner && (
                  <PartnerNotifications partnerId={partner.id} />
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCancelDialog(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cancelar Parceria
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Container Principal com Sidebar */}
        <div className="flex">
          {/* Sidebar Desktop */}
          {!isMobile && (
            <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-[calc(100vh-200px)]">
              <SidebarContent />
            </aside>
          )}

          {/* Conteúdo Principal */}
          <div className="flex-1 ms-container py-8">
            {/* Cards de Métricas com Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <PartnerMetricCard
                title="Reservas Pendentes"
                value={pendingReservations.length}
                icon={Clock}
                variant="warning"
                trend={reservationsTrend}
                chartData={pendingChartData}
              />
              <PartnerMetricCard
                title="Total de Reservas"
                value={allReservations.length}
                icon={Calendar}
                variant="primary"
                trend={reservationsTrend}
                chartData={reservationsChartData}
              />
              <PartnerMetricCard
                title="Receita Total"
                value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                icon={DollarSign}
                variant="success"
                trend={revenueTrend}
                chartData={revenueChartData}
              />
              <PartnerMetricCard
                title="Comissões Geradas"
                value={`R$ ${totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                icon={TrendingUp}
                variant="info"
                trend={commissionsTrend}
                chartData={commissionsChartData}
              />
            </div>

            {/* Seção de Conteúdo */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                <CardTitle className="text-xl text-ms-primary-blue">
                  {activeTab === 'reservations' ? 'Reservas' : 
                   activeTab === 'transactions' ? 'Transações' :
                   'Meu Negócio'}
                </CardTitle>
                <CardDescription>
                  {activeTab === 'reservations' 
                    ? 'Gerencie suas reservas e acompanhe o status'
                    : activeTab === 'transactions'
                    ? 'Histórico completo de transações financeiras'
                    : 'Atualize as informações do seu negócio'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {activeTab === 'reservations' ? (
                  <div className="space-y-4">
                    <Tabs value={reservationTab} onValueChange={setReservationTab}>
                      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
                        <TabsTrigger 
                          value="pending"
                          className="text-xs md:text-sm data-[state=active]:bg-ms-cerrado-orange data-[state=active]:text-white"
                        >
                          Pendentes ({pendingReservations.length})
                        </TabsTrigger>
                        <TabsTrigger 
                          value="confirmed"
                          className="text-xs md:text-sm data-[state=active]:bg-ms-primary-blue data-[state=active]:text-white"
                        >
                          Confirmadas ({confirmedReservations.length})
                        </TabsTrigger>
                        <TabsTrigger 
                          value="completed"
                          className="text-xs md:text-sm data-[state=active]:bg-ms-pantanal-green data-[state=active]:text-white"
                        >
                          Completadas ({completedReservations.length})
                        </TabsTrigger>
                        <TabsTrigger 
                          value="all"
                          className="text-xs md:text-sm data-[state=active]:bg-ms-discovery-teal data-[state=active]:text-white"
                        >
                          Todas ({allReservations.length})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="pending">
                        <PartnerReservationsTable
                          reservations={pendingReservations}
                          onAction={handleReservationAction}
                          showActions={true}
                          isMobile={isMobile}
                          onOpenChat={setSelectedReservationForChat}
                          unreadMessagesCount={unreadMessagesCount}
                        />
                      </TabsContent>

                      <TabsContent value="confirmed">
                        <PartnerReservationsTable
                          reservations={confirmedReservations}
                          onAction={handleReservationAction}
                          showActions={true}
                          isMobile={isMobile}
                          onOpenChat={setSelectedReservationForChat}
                          unreadMessagesCount={unreadMessagesCount}
                        />
                      </TabsContent>

                      <TabsContent value="completed">
                        <PartnerReservationsTable
                          reservations={completedReservations}
                          onAction={handleReservationAction}
                          showActions={false}
                          isMobile={isMobile}
                          onOpenChat={setSelectedReservationForChat}
                          unreadMessagesCount={unreadMessagesCount}
                        />
                      </TabsContent>

                      <TabsContent value="all">
                        <PartnerReservationsTable
                          reservations={allReservations}
                          onAction={handleReservationAction}
                          showActions={false}
                          isMobile={isMobile}
                          onOpenChat={setSelectedReservationForChat}
                          unreadMessagesCount={unreadMessagesCount}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : activeTab === 'transactions' ? (
                  <PartnerTransactionHistory partnerId={partner.id} />
                ) : activeTab === 'business' ? (
                  <div className="space-y-6">
                    <Tabs value={businessSubTab} onValueChange={(v) => setBusinessSubTab(v as 'info' | 'pricing')}>
                      <TabsList>
                        <TabsTrigger value="info">Informações</TabsTrigger>
                        <TabsTrigger value="pricing">Preços e Disponibilidade</TabsTrigger>
                      </TabsList>
                      <TabsContent value="info">
                        <PartnerBusinessEditor
                          partnerId={partner.id}
                          onUpdate={loadPartnerData}
                        />
                      </TabsContent>
                      <TabsContent value="pricing">
                        <PartnerPricingEditor
                          partnerId={partner.id}
                          onUpdate={loadPartnerData}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog de Cancelamento */}
        {partner && (
          <PartnerCancellationDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
            partnerId={partner.id}
            partnerName={partner.name}
            partnerEmail={partner.contact_email}
            onCancel={handleCancelPartnership}
          />
        )}

        {/* Chat de Reserva */}
        {selectedReservationForChat && partner && (() => {
          const reservation = reservations.find(r => r.id === selectedReservationForChat);
          if (!reservation) return null;
          
          return (
            <ReservationChat
              key={`chat-${reservation.id}`}
              reservationId={reservation.id}
              reservationCode={reservation.reservation_code}
              guestName={reservation.guest_name}
              guestEmail={reservation.guest_email}
              partnerId={partner.id}
              partnerName={partner.name}
              partnerEmail={partner.contact_email}
              open={!!selectedReservationForChat}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedReservationForChat(null);
                  // Recarregar contadores ao fechar
                  loadPartnerData();
                }
              }}
            />
          );
        })()}
      </main>
    </UniversalLayout>
  );
}
