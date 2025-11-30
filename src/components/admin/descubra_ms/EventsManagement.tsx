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
  Building2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_visible: true })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: 'Evento aprovado!',
        description: 'O evento agora está visível na plataforma.',
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

  const rejectEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: 'Evento rejeitado',
        description: 'O evento foi removido.',
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
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectEvent(event.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rejeitar
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

      {/* Modal de detalhes */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.name}</DialogTitle>
            <DialogDescription>Detalhes completos do evento</DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              {selectedEvent.image_url && (
                <img 
                  src={selectedEvent.image_url} 
                  alt={selectedEvent.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Local</label>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedEvent.location}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data</label>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedEvent.start_date)}
                  </p>
                </div>
              </div>

              {selectedEvent.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Descrição</label>
                  <p className="text-gray-700 mt-1">{selectedEvent.description}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Informações do Organizador</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedEvent.organizador_nome && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {selectedEvent.organizador_nome}
                    </div>
                  )}
                  {selectedEvent.organizador_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedEvent.organizador_email}
                    </div>
                  )}
                  {selectedEvent.organizador_telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {selectedEvent.organizador_telefone}
                    </div>
                  )}
                  {selectedEvent.site_oficial && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href={selectedEvent.site_oficial} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Site Oficial
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {selectedEvent.is_sponsored && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Informações de Patrocínio
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>{' '}
                      <Badge variant={selectedEvent.sponsor_payment_status === 'paid' ? 'default' : 'secondary'}>
                        {selectedEvent.sponsor_payment_status === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                    {selectedEvent.sponsor_amount && (
                      <div>
                        <span className="text-gray-500">Valor:</span>{' '}
                        R$ {selectedEvent.sponsor_amount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                {!selectedEvent.is_visible && (
                  <>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        approveEvent(selectedEvent.id);
                        setSelectedEvent(null);
                      }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Aprovar Evento
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        rejectEvent(selectedEvent.id);
                        setSelectedEvent(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  </>
                )}
                {selectedEvent.is_visible && (
                  <Button
                    variant={selectedEvent.is_sponsored ? "secondary" : "default"}
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

