import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Check, 
  X, 
  Eye, 
  Star, 
  Clock, 
  MapPin,
  DollarSign,
  Phone,
  Globe,
  Mail,
  Building2,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { notifyEventApproved, notifyEventRejected } from '@/services/email/notificationEmailService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  image_url?: string;
  site_oficial?: string;
  video_url?: string;
  is_visible: boolean;
  is_sponsored: boolean;
  sponsor_tier?: string;
  sponsor_payment_status?: string;
  sponsor_amount?: number;
  organizador_nome?: string;
  organizador_email?: string;
  organizador_telefone?: string;
  organizador_empresa?: string;
  created_at: string;
}

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [approvingEventId, setApprovingEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar eventos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os eventos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const approveEvent = async (eventId: string) => {
    // Evitar múltiplas aprovações simultâneas
    if (approvingEventId === eventId) return;
    
    setApprovingEventId(eventId);
    
    try {
      // Buscar dados do evento para o email
      const event = events.find(e => e.id === eventId);
      
      if (!event) {
        toast({
          title: 'Erro',
          description: 'Evento não encontrado',
          variant: 'destructive',
        });
        setApprovingEventId(null);
        return;
      }

      console.log('Aprovando evento:', eventId, event.name);

      // Atualizar evento: tornar visível
      const updateData: any = {
        is_visible: true,
      };

      console.log('Dados para atualização:', updateData);

      // Atualizar evento
      const { data: updatedEvent, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)
        .select();

      if (error) {
        console.error('Erro ao atualizar evento:', error);
        throw error;
      }

      if (!updatedEvent || updatedEvent.length === 0) {
        throw new Error('Nenhum evento foi atualizado. Verifique se você tem permissão para atualizar este evento.');
      }

      console.log('Evento atualizado com sucesso:', updatedEvent);

      // Tentar atualizar approval_status separadamente (pode não existir ainda)
      try {
        const { error: approvalError } = await supabase
          .from('events')
          .update({ approval_status: 'approved' })
          .eq('id', eventId);
        
        if (approvalError && approvalError.code !== 'PGRST204') {
          console.warn('Aviso ao atualizar approval_status:', approvalError);
        } else if (!approvalError) {
          console.log('approval_status atualizado para approved');
        }
      } catch (err) {
        console.warn('Não foi possível atualizar approval_status (campo pode não existir):', err);
      }

      // MOSTRAR TOAST DE SUCESSO IMEDIATAMENTE (antes do email)
      toast({
        title: '✅ Evento aprovado com sucesso!',
        description: `O evento "${event.name}" agora está visível na plataforma.`,
        duration: 5000,
      });

      // Recarregar eventos para atualizar a lista (fazer antes do email)
      await loadEvents();

      // Enviar email de notificação em background (não bloqueia)
      if (event?.organizador_email) {
        notifyEventApproved({
          organizerEmail: event.organizador_email,
          organizerName: event.organizador_nome,
          eventName: event.name,
          eventDate: formatDate(event.start_date),
          eventLocation: event.location,
        })
        .then(result => {
          if (result.success) {
            console.log('✅ Email de notificação enviado com sucesso');
          } else {
            console.warn('⚠️ Email não foi enviado (não crítico):', result.error);
          }
        })
        .catch(err => {
          console.warn('⚠️ Erro ao enviar email (não crítico):', err);
        });
      }
      
    } catch (error: any) {
      console.error('Erro ao aprovar evento:', error);
      toast({
        title: '❌ Erro ao aprovar evento',
        description: error.message || 'Não foi possível aprovar o evento. Tente novamente.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setApprovingEventId(null);
    }
  };

  const rejectEvent = async (eventId: string, reason?: string) => {
    // Evitar múltiplas rejeições simultâneas
    if (approvingEventId === eventId) return;
    
    setApprovingEventId(eventId);
    
    try {
      // Buscar dados do evento para o email
      const event = events.find(e => e.id === eventId);
      
      if (!event) {
        toast({
          title: 'Erro',
          description: 'Evento não encontrado',
          variant: 'destructive',
        });
        setApprovingEventId(null);
        return;
      }

      // Marcar como rejeitado ao invés de deletar (melhor para auditoria)
      const updateData: any = {
        is_visible: false,
      };

      // Tentar atualizar approval_status se existir
      try {
        const { error: approvalError } = await supabase
          .from('events')
          .update({ approval_status: 'rejected' })
          .eq('id', eventId);
        
        if (approvalError && approvalError.code !== 'PGRST204') {
          console.warn('Aviso ao atualizar approval_status:', approvalError);
        }
      } catch (err) {
        console.warn('Não foi possível atualizar approval_status:', err);
      }

      // Atualizar evento
      const { data: updatedEvent, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)
        .select();

      if (error) {
        console.error('Erro ao rejeitar evento:', error);
        throw error;
      }

      if (!updatedEvent || updatedEvent.length === 0) {
        throw new Error('Nenhum evento foi atualizado. Verifique se você tem permissão.');
      }

      // MOSTRAR TOAST DE SUCESSO IMEDIATAMENTE
      toast({
        title: '❌ Evento rejeitado',
        description: `O evento "${event.name}" foi rejeitado e não está mais visível.`,
        duration: 5000,
      });

      // Recarregar eventos para atualizar a lista
      await loadEvents();

      // Enviar email de notificação em background (não bloqueia)
      if (event?.organizador_email) {
        notifyEventRejected({
          organizerEmail: event.organizador_email,
          organizerName: event.organizador_nome,
          eventName: event.name,
          reason: reason,
        })
        .then(result => {
          if (result.success) {
            console.log('✅ Email de rejeição enviado com sucesso');
          } else {
            console.warn('⚠️ Email não foi enviado (não crítico):', result.error);
          }
        })
        .catch(err => {
          console.warn('⚠️ Erro ao enviar email (não crítico):', err);
        });
      }
    } catch (error: any) {
      console.error('Erro ao rejeitar evento:', error);
      toast({
        title: '❌ Erro ao rejeitar evento',
        description: error.message || 'Não foi possível rejeitar o evento. Tente novamente.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setApprovingEventId(null);
    }
  };

  const toggleSponsorship = async (eventId: string, isSponsored: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ 
          is_sponsored: !isSponsored,
          sponsor_payment_status: !isSponsored ? 'paid' : 'cancelled'
        })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: isSponsored ? 'Destaque removido' : 'Destaque ativado!',
        description: isSponsored 
          ? 'O evento não aparece mais em destaque.' 
          : 'O evento agora aparece em destaque.',
      });
      loadEvents();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const pendingEvents = events.filter(e => !e.is_visible);
  const approvedEvents = events.filter(e => e.is_visible && !e.is_sponsored);
  const sponsoredEvents = events.filter(e => e.is_sponsored);

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return date;
    }
  };

  const EventCard = ({ event, showActions = true }: { event: Event; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {event.image_url && (
            <img 
              src={event.image_url} 
              alt={event.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{event.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {formatDate(event.start_date)}
                  {event.start_time && ` às ${event.start_time}`}
                </div>
              </div>
              <div className="flex gap-1">
                {event.is_sponsored && (
                  <Badge className="bg-yellow-500">
                    <Star className="w-3 h-3 mr-1" />
                    Destaque
                  </Badge>
                )}
                {!event.is_visible && (
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    Pendente
                  </Badge>
                )}
              </div>
            </div>

            {event.organizador_nome && (
              <div className="mt-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4 inline mr-1" />
                {event.organizador_nome}
                {event.organizador_empresa && ` - ${event.organizador_empresa}`}
              </div>
            )}

            {showActions && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedEvent(event)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver Detalhes
                </Button>
                
                {!event.is_visible && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => approveEvent(event.id)}
                      disabled={approvingEventId === event.id}
                    >
                      {approvingEventId === event.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-1" />
                      )}
                      {approvingEventId === event.id ? 'Aprovando...' : 'Aprovar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectEvent(event.id)}
                      disabled={approvingEventId === event.id}
                    >
                      {approvingEventId === event.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <X className="w-4 h-4 mr-1" />
                      )}
                      {approvingEventId === event.id ? 'Rejeitando...' : 'Rejeitar'}
                    </Button>
                  </>
                )}

                {event.is_visible && (
                  <Button
                    size="sm"
                    variant={event.is_sponsored ? "secondary" : "outline"}
                    onClick={() => toggleSponsorship(event.id, event.is_sponsored)}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    {event.is_sponsored ? 'Remover Destaque' : 'Dar Destaque'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Eventos</h2>
          <p className="text-gray-600">Aprovar, rejeitar e destacar eventos da plataforma</p>
        </div>
        <Button onClick={loadEvents} variant="outline">
          Atualizar Lista
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">{pendingEvents.length}</div>
            <p className="text-xs text-yellow-600">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Aprovados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{approvedEvents.length}</div>
            <p className="text-xs text-green-600">Visíveis na plataforma</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Em Destaque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{sponsoredEvents.length}</div>
            <p className="text-xs text-purple-600">Eventos patrocinados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de eventos */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pendentes ({pendingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <Check className="w-4 h-4" />
            Aprovados ({approvedEvents.length})
          </TabsTrigger>
          <TabsTrigger value="sponsored" className="gap-2">
            <Star className="w-4 h-4" />
            Em Destaque ({sponsoredEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : pendingEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum evento pendente de aprovação
            </div>
          ) : (
            pendingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-4">
          {approvedEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum evento aprovado
            </div>
          ) : (
            approvedEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </TabsContent>

        <TabsContent value="sponsored" className="space-y-4 mt-4">
          {sponsoredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum evento em destaque
            </div>
          ) : (
            sponsoredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes - Melhorado */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedEvent?.name}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Detalhes completos do evento para revisão
                </DialogDescription>
              </div>
              {selectedEvent && (
                <div className="flex gap-2">
                  {!selectedEvent.is_visible && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                      <Clock className="w-3 h-3 mr-1" />
                      Pendente
                    </Badge>
                  )}
                  {selectedEvent.is_sponsored && (
                    <Badge className="bg-yellow-500">
                      <Star className="w-3 h-3 mr-1" />
                      Destaque
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-6">
              {/* Imagem do evento */}
              {selectedEvent.image_url && (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={selectedEvent.image_url} 
                    alt={selectedEvent.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Informações principais em cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-700 uppercase">Local</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {selectedEvent.location}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-purple-700 uppercase">Data e Hora</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {formatDate(selectedEvent.start_date)}
                          {selectedEvent.start_time && ` às ${selectedEvent.start_time}`}
                        </p>
                        {selectedEvent.end_date && selectedEvent.end_date !== selectedEvent.start_date && (
                          <p className="text-xs text-gray-600 mt-1">
                            até {formatDate(selectedEvent.end_date)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Descrição */}
              {selectedEvent.description && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Descrição do Evento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Informações do Organizador */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    Informações do Organizador
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEvent.organizador_nome && (
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Instituição</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {selectedEvent.organizador_nome}
                            {selectedEvent.organizador_empresa && ` - ${selectedEvent.organizador_empresa}`}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedEvent.organizador_email && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Email</p>
                          <a 
                            href={`mailto:${selectedEvent.organizador_email}`}
                            className="text-sm font-medium text-blue-600 hover:underline mt-1 block"
                          >
                            {selectedEvent.organizador_email}
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedEvent.organizador_telefone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Telefone</p>
                          <a 
                            href={`tel:${selectedEvent.organizador_telefone}`}
                            className="text-sm font-medium text-gray-900 mt-1 block"
                          >
                            {selectedEvent.organizador_telefone}
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedEvent.site_oficial && (
                      <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Site Oficial</p>
                          <a 
                            href={selectedEvent.site_oficial} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm font-medium text-blue-600 hover:underline mt-1 block"
                          >
                            {selectedEvent.site_oficial}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Informações de Patrocínio - Sempre visível (igual para pago e não pago) */}
              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                    Informações de Patrocínio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 uppercase mb-2">Status do Pagamento</p>
                      <Badge 
                        variant={selectedEvent.sponsor_payment_status === 'paid' ? 'default' : 'secondary'}
                        className={selectedEvent.sponsor_payment_status === 'paid' ? 'bg-green-600' : 'bg-amber-500'}
                      >
                        {selectedEvent.sponsor_payment_status === 'paid' ? 'Pago' : selectedEvent.sponsor_payment_status || 'Não informado'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase mb-2">Valor</p>
                      {selectedEvent.sponsor_amount ? (
                        <p className="text-lg font-bold text-gray-900">
                          R$ {selectedEvent.sponsor_amount.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">Não informado</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ações */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {!selectedEvent.is_visible && (
                  <>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        approveEvent(selectedEvent.id);
                        setSelectedEvent(null);
                      }}
                      disabled={approvingEventId === selectedEvent.id}
                    >
                      {approvingEventId === selectedEvent.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      {approvingEventId === selectedEvent.id ? 'Aprovando...' : 'Aprovar Evento'}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        rejectEvent(selectedEvent.id);
                        setSelectedEvent(null);
                      }}
                      disabled={approvingEventId === selectedEvent.id}
                    >
                      {approvingEventId === selectedEvent.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <X className="w-4 h-4 mr-2" />
                      )}
                      {approvingEventId === selectedEvent.id ? 'Rejeitando...' : 'Rejeitar'}
                    </Button>
                  </>
                )}
                {selectedEvent.is_visible && (
                  <Button
                    variant={selectedEvent.is_sponsored ? "secondary" : "default"}
                    className="flex-1"
                    onClick={() => {
                      toggleSponsorship(selectedEvent.id, selectedEvent.is_sponsored);
                      setSelectedEvent(null);
                    }}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {selectedEvent.is_sponsored ? 'Remover Destaque' : 'Ativar Destaque'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

