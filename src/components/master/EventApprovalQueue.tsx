// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, Building2, CheckCircle2, XCircle, Clock, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type EventRow = Database['public']['Tables']['events']['Row'];

interface PendingEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  category: string;
  company_id: string;
  submitted_by: string;
  created_at: string;
  company_name?: string;
  company_email?: string;
}

export default function EventApprovalQueue() {
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingEvents();
  }, [filterStatus]);

  const fetchPendingEvents = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          start_date,
          end_date,
          location,
          category,
          company_id,
          submitted_by,
          approval_status,
          source,
          created_at,
          user_profiles!events_company_id_fkey (
            full_name,
            email
          )
        `)
        .eq('source', 'viajar')
        .order('created_at', { ascending: false });

      if (filterStatus === 'pending') {
        query = query.eq('approval_status', 'pending');
      }

      const { data, error } = await query;

      if (error) throw error;

      const events = (data || []).map((event: EventRow) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start_date: event.start_date,
        end_date: event.end_date,
        location: event.location,
        category: event.category,
        company_id: event.company_id,
        submitted_by: event.submitted_by,
        created_at: event.created_at,
        approval_status: event.approval_status,
        company_name: event.user_profiles?.full_name || 'Empresa',
        company_email: event.user_profiles?.email || '',
      }));

      setPendingEvents(events);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao buscar eventos pendentes:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar eventos pendentes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedEvent) return;

    try {
      const { error } = await supabase
        .from('events')
        .update({
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          is_public: true, // Tornar público quando aprovado
        })
        .eq('id', selectedEvent.id);

      if (error) throw error;

      // Integrar evento com outros módulos (atrações, empresas, etc.)
      try {
        const { eventIntegrationService } = await import('@/services/events/eventIntegrationService');
        await eventIntegrationService.onEventApproved(selectedEvent.id);
        console.log('✅ Evento integrado com outros módulos');
      } catch (integrationError) {
        console.warn('⚠️ Erro na integração do evento (não crítico):', integrationError);
        // Não bloquear aprovação se integração falhar
      }

      // Traduzir evento automaticamente após aprovação
      try {
        const { data: event } = await supabase
          .from('events')
          .select('id, name, description, location, category')
          .eq('id', selectedEvent.id)
          .single();

        if (event) {
          const { autoTranslateEvent } = await import('@/utils/autoTranslation');
          // Traduzir em background (não bloquear UI)
          autoTranslateEvent({
            id: event.id,
            name: event.name || selectedEvent.title || '',
            description: event.description || null,
            location: event.location || null,
            category: event.category || null,
          });
        }
      } catch (translationError) {
        console.error('Erro ao traduzir evento (não crítico):', translationError);
        // Não bloquear aprovação se tradução falhar
      }

      toast({
        title: 'Evento aprovado!',
        description: 'O evento aparecerá no calendário público do Descubra MS.',
      });

      setShowApprovalDialog(false);
      setSelectedEvent(null);
      fetchPendingEvents();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao aprovar evento:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao aprovar evento',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedEvent || !rejectionReason.trim()) {
      toast({
        title: 'Motivo obrigatório',
        description: 'Informe o motivo da rejeição',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .update({
          approval_status: 'rejected',
          rejection_reason: rejectionReason,
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', selectedEvent.id);

      if (error) throw error;

      toast({
        title: 'Evento rejeitado',
        description: 'O evento foi rejeitado e a empresa será notificada.',
      });

      setShowRejectionDialog(false);
      setSelectedEvent(null);
      setRejectionReason('');
      fetchPendingEvents();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao rejeitar evento:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao rejeitar evento',
        variant: 'destructive',
      });
    }
  };

  const filteredEvents = pendingEvents.filter(event => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        event.title.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower) ||
        event.company_name?.toLowerCase().includes(searchLower) ||
        event.category?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle2 className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Fila de Aprovação de Eventos</CardTitle>
          <CardDescription>
            Eventos enviados por empresas do Mato Grosso do Sul aguardando aprovação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título, local, empresa ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={(value: 'pending' | 'all') => setFilterStatus(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Eventos */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Carregando eventos...
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhum evento {filterStatus === 'pending' ? 'pendente' : 'encontrado'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(event.approval_status)}
                          {event.category && (
                            <Badge variant="secondary">{event.category}</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(event.start_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          {event.end_date && event.end_date !== event.start_date && (
                            <> até {format(new Date(event.end_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{event.company_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Enviado em {format(new Date(event.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {event.approval_status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowApprovalDialog(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowRejectionDialog(true);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Aprovação */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Aprovação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja aprovar este evento? Ele aparecerá no calendário público do Descubra MS.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-2">
              <p className="font-medium">{selectedEvent.title}</p>
              <p className="text-sm text-muted-foreground">
                {selectedEvent.location} - {format(new Date(selectedEvent.start_date), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Rejeição */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Evento</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição. A empresa será notificada.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-2">Evento:</p>
                <p className="text-sm text-muted-foreground">{selectedEvent.title}</p>
              </div>
              <div>
                <Label htmlFor="rejection_reason">Motivo da Rejeição *</Label>
                <Textarea
                  id="rejection_reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex: Informações incompletas, evento não adequado ao calendário público, etc."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectionDialog(false);
              setRejectionReason('');
            }}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim()}>
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

