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
  Loader2,
  Video,
  Image as ImageIcon,
  User,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { notifyEventApproved, notifyEventRejected } from '@/services/email/notificationEmailService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Event {
  id: string;
  name: string;
  description: string;
  category?: string; // Adicionar categoria
  location: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  image_url?: string;
  logo_evento?: string; // Adicionar logo_evento
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
  approval_status?: string; // pending, approved, rejected
  created_at: string;
}

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [approvingEventId, setApprovingEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('📥 Eventos carregados:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('📊 Exemplo de evento:', {
          id: data[0].id,
          name: data[0].name,
          is_visible: data[0].is_visible,
          approval_status: (data[0] as any).approval_status,
        });
      }
      
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

      // Atualizar evento: tornar visível e marcar como aprovado
      const updateData: any = {
        is_visible: true,
        approval_status: 'approved',
        updated_at: new Date().toISOString(),
      };

      // Não adicionar approved_by ou approved_at pois podem não existir na tabela
      console.log('Dados para atualização:', updateData);

      // Atualizar evento com todos os campos de uma vez
      let { data: updatedEvent, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)
        .select();

      // Se der erro porque approval_status não existe, tentar sem ele
      if (error && error.code === 'PGRST204' && error.message?.includes('approval_status')) {
        console.warn('⚠️ Campo approval_status não existe, atualizando apenas is_visible');
        const fallbackData = {
          is_visible: true,
          updated_at: new Date().toISOString(),
        };
        const result = await supabase
          .from('events')
          .update(fallbackData)
          .eq('id', eventId)
          .select();
        
        if (result.error) {
          console.error('Erro ao atualizar evento:', result.error);
          throw result.error;
        }
        
        updatedEvent = result.data;
        error = null;
      } else if (error) {
        console.error('Erro ao atualizar evento:', error);
        throw error;
      }

      if (!updatedEvent || updatedEvent.length === 0) {
        throw new Error('Nenhum evento foi atualizado. Verifique se você tem permissão para atualizar este evento.');
      }

      console.log('✅ Evento atualizado com sucesso:', updatedEvent);

      // Atualizar estado local imediatamente para feedback visual instantâneo
      setEvents(prevEvents => 
        prevEvents.map(e => 
          e.id === eventId 
            ? { ...e, is_visible: true, approval_status: 'approved' }
            : e
        )
      );

      // MOSTRAR TOAST DE SUCESSO IMEDIATAMENTE (antes do email)
      toast({
        title: '✅ Evento aprovado com sucesso!',
        description: `O evento "${event.name}" agora está visível na plataforma.`,
        duration: 5000,
      });

      // Traduzir evento automaticamente após aprovação
      try {
        if (updatedEvent && updatedEvent[0]) {
          const { autoTranslateEvent } = await import('@/utils/autoTranslation');
          // Traduzir em background (não bloquear UI)
          autoTranslateEvent({
            id: updatedEvent[0].id,
            name: updatedEvent[0].name || event.name || '',
            description: updatedEvent[0].description || null,
            location: updatedEvent[0].location || null,
            category: updatedEvent[0].category || null,
          });
        }
      } catch (translationError) {
        console.error('Erro ao traduzir evento (não crítico):', translationError);
        // Não bloquear aprovação se tradução falhar
      }

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

      // Marcar como rejeitado - atualizar apenas campos que existem na tabela
      const updateData: any = {
        is_visible: false,
        updated_at: new Date().toISOString(),
      };

      // Tentar adicionar approval_status (pode não existir na tabela ainda)
      // Se der erro, será ignorado e apenas is_visible será atualizado
      updateData.approval_status = 'rejected';
      
      // Não adicionar approved_by, approved_at ou rejection_reason pois podem não existir
      // Esses campos serão adicionados apenas se as migrações estiverem aplicadas

      console.log('🔄 Atualizando evento com dados:', updateData);

      // Tentar atualizar com approval_status primeiro
      let { data: updatedEvent, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)
        .select('*');

      // Se der erro porque approval_status não existe, tentar sem ele
      if (error && error.code === 'PGRST204' && error.message?.includes('approval_status')) {
        console.warn('⚠️ Campo approval_status não existe, atualizando apenas is_visible');
        const fallbackData = {
          is_visible: false,
          updated_at: new Date().toISOString(),
        };
        const result = await supabase
          .from('events')
          .update(fallbackData)
          .eq('id', eventId)
          .select('*');
        
        if (result.error) {
          console.error('❌ Erro ao rejeitar evento (fallback):', result.error);
          throw result.error;
        }
        
        updatedEvent = result.data;
        error = null;
      } else if (error) {
        // Se o erro for por outro campo (como approved_by), tentar sem campos opcionais
        if (error.code === 'PGRST204' && error.message?.includes('approved_by')) {
          console.warn('⚠️ Campo approved_by não existe, removendo do update');
          const fallbackData = {
            is_visible: false,
            updated_at: new Date().toISOString(),
            approval_status: 'rejected',
          };
          const result = await supabase
            .from('events')
            .update(fallbackData)
            .eq('id', eventId)
            .select('*');
          
          if (result.error) {
            console.error('❌ Erro ao rejeitar evento (fallback 2):', result.error);
            throw result.error;
          }
          
          updatedEvent = result.data;
          error = null;
        } else {
          console.error('❌ Erro ao rejeitar evento:', error);
          console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
          throw error;
        }
      }

      if (!updatedEvent || updatedEvent.length === 0) {
        throw new Error('Nenhum evento foi atualizado. Verifique se você tem permissão.');
      }

      console.log('✅ Evento rejeitado com sucesso:', updatedEvent);
      console.log('📊 approval_status do evento atualizado:', updatedEvent[0]?.approval_status);

      // MOSTRAR TOAST DE SUCESSO IMEDIATAMENTE
      toast({
        title: '✅ Evento rejeitado',
        description: `O evento "${event.name}" foi rejeitado e removido da lista de pendentes.`,
        duration: 5000,
      });

      // Atualizar estado local imediatamente para feedback visual instantâneo
      // Usar os dados retornados do banco para garantir sincronização
      setEvents(prevEvents => {
        const updated = prevEvents.map(e => {
          if (e.id === eventId) {
            // Usar os dados atualizados do banco se disponíveis
            const updatedFromDb = updatedEvent[0] as any;
            const newEvent = {
              ...e,
              is_visible: false,
            };
            // Adicionar approval_status se existir
            if (updatedFromDb?.approval_status !== undefined) {
              (newEvent as any).approval_status = updatedFromDb.approval_status;
            } else {
              // Se não existir no banco, marcar como rejeitado no estado local
              (newEvent as any).approval_status = 'rejected';
            }
            return newEvent;
          }
          return e;
        });
        const pending = updated.filter(e => {
          const approvalStatus = (e as any).approval_status;
          return !e.is_visible && approvalStatus !== 'rejected';
        });
        const rejected = updated.filter(e => (e as any).approval_status === 'rejected');
        console.log('🔄 Estado atualizado. Eventos pendentes agora:', pending.length);
        console.log('🔄 Eventos rejeitados agora:', rejected.length);
        return updated;
      });

      // Recarregar eventos após um pequeno delay para garantir sincronização completa
      setTimeout(async () => {
        await loadEvents();
      }, 500);

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

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEvent) return;

    try {
      const { error } = await supabase
        .from('events')
        .update({
          titulo: editingEvent.name,
          descricao: editingEvent.description,
          data_inicio: editingEvent.start_date,
          data_fim: editingEvent.end_date,
          local: editingEvent.location,
          cidade: editingEvent.cidade || editingEvent.location.split(',')[0]?.trim(),
          categoria: editingEvent.category,
          tipo_entrada: editingEvent.tipo_entrada || (editingEvent.is_free ? 'gratuito' : 'pago'),
          organizador: editingEvent.organizador_nome || editingEvent.organizador,
          site_oficial: editingEvent.site_oficial,
          contato_telefone: editingEvent.organizador_telefone || editingEvent.contato_telefone,
          contato_email: editingEvent.organizador_email || editingEvent.contato_email,
          imagem_principal: editingEvent.image_url,
          video_promocional: editingEvent.video_url,
          logo_evento: editingEvent.logo_evento,
          publico_alvo: editingEvent.publico_alvo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingEvent.id);

      if (error) throw error;

      toast({
        title: 'Evento atualizado!',
        description: 'As alterações foram salvas com sucesso.',
      });

      setEditDialogOpen(false);
      setEditingEvent(null);
      loadEvents();
    } catch (error: any) {
      console.error('Erro ao editar evento:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    }
  };

  // Filtrar eventos: pendentes são os que não estão visíveis E não foram rejeitados
  // Se approval_status não existir, considerar apenas is_visible
  const pendingEvents = events.filter(e => {
    const approvalStatus = (e as any).approval_status;
    // Se não tem approval_status definido e não está visível, é pendente
    if (approvalStatus === undefined || approvalStatus === null) {
      return !e.is_visible; // Considerar pendente se não estiver visível
    }
    // Se tem approval_status, verificar se não é rejeitado
    return !e.is_visible && approvalStatus !== 'rejected';
  });
  const approvedEvents = events.filter(e => e.is_visible && !e.is_sponsored);
  const sponsoredEvents = events.filter(e => e.is_sponsored);
  const rejectedEvents = events.filter(e => {
    const approvalStatus = (e as any).approval_status;
    return approvalStatus === 'rejected';
  });

  // Função para extrair ID do YouTube
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    
    // Padrões comuns de URLs do YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  // Função para obter URL de embed do YouTube
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const videoId = extractYouTubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  // Função para determinar região turística
  const getTouristRegion = (location: string) => {
    const locationLower = location.toLowerCase();
    const regionMappings = {
      'pantanal': ['corumbá', 'ladário', 'aquidauana', 'miranda', 'anastácio'],
      'bonito-serra-bodoquena': ['bonito', 'bodoquena', 'jardim', 'bela vista', 'caracol', 'guia lopes', 'nioaque', 'porto murtinho'],
      'vale-aguas': ['nova andradina', 'angélica', 'batayporã', 'ivinhema', 'jateí', 'novo horizonte do sul', 'taquarussu'],
      'vale-apore': ['cassilândia', 'chapadão do sul', 'inocência'],
      'rota-norte': ['coxim', 'alcinópolis', 'bandeirantes', 'camapuã', 'costa rica', 'figueirão', 'paraíso das águas', 'pedro gomes', 'rio verde de mato grosso', 'são gabriel do oeste', 'sonora'],
      'caminho-ipes': ['campo grande', 'corguinho', 'dois irmãos do buriti', 'jaraguari', 'nova alvorada', 'ribas do rio pardo', 'rio negro', 'sidrolândia', 'terenos'],
      'caminhos-fronteira': ['ponta porã', 'antônio joão', 'laguna carapã'],
      'costa-leste': ['três lagoas', 'água clara', 'aparecida do taboado', 'bataguassu', 'brasilândia', 'paranaíba', 'santa rita do pardo'],
      'grande-dourados': ['dourados', 'caarapó', 'deodápolis', 'douradina', 'fátima do sul', 'glória de dourados', 'itaporã', 'maracaju', 'rio brilhante', 'vicentina']
    };

    for (const [region, cities] of Object.entries(regionMappings)) {
      if (cities.some(city => locationLower.includes(city))) {
        return region;
      }
    }
    return 'descubra-ms';
  };

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
                {event.approval_status === 'rejected' && (
                  <Badge variant="destructive">
                    <X className="w-3 h-3 mr-1" />
                    Rejeitado
                  </Badge>
                )}
                {!event.is_visible && event.approval_status !== 'rejected' && (
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
                
                {event.approval_status === 'rejected' && (
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => approveEvent(event.id)}
                    disabled={approvingEventId === event.id}
                  >
                    {approvingEventId === event.id ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-1" />
                    )}
                    {approvingEventId === event.id ? 'Reativando...' : 'Reativar'}
                  </Button>
                )}
                
                {!event.is_visible && event.approval_status !== 'rejected' && (
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
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={event.is_sponsored ? "secondary" : "outline"}
                      onClick={() => toggleSponsorship(event.id, event.is_sponsored)}
                    >
                      <Star className="w-4 h-4 mr-1" />
                      {event.is_sponsored ? 'Remover Destaque' : 'Dar Destaque'}
                    </Button>
                  </>
                )}

                {!event.is_visible && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditEvent(event)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Rejeitados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{rejectedEvents.length}</div>
            <p className="text-xs text-red-600">Eventos rejeitados</p>
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
          <TabsTrigger value="rejected" className="gap-2">
            <X className="w-4 h-4" />
            Rejeitados ({rejectedEvents.length})
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

        <TabsContent value="rejected" className="space-y-4 mt-4">
          {rejectedEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum evento rejeitado
            </div>
          ) : (
            rejectedEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
          </DialogHeader>

          {editingEvent && (
            <div className="space-y-6 py-4">
              {/* Nome */}
              <div>
                <Label htmlFor="edit-name">Nome do Evento *</Label>
                <Input
                  id="edit-name"
                  value={editingEvent.name}
                  onChange={(e) => setEditingEvent({...editingEvent, name: e.target.value})}
                  placeholder="Nome do evento"
                />
              </div>

              {/* Descrição */}
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                  placeholder="Descrição detalhada do evento"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Data de início */}
                <div>
                  <Label htmlFor="edit-start-date">Data de Início</Label>
                  <Input
                    id="edit-start-date"
                    type="datetime-local"
                    value={editingEvent.start_date ? new Date(editingEvent.start_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingEvent({...editingEvent, start_date: e.target.value})}
                  />
                </div>

                {/* Data de fim */}
                <div>
                  <Label htmlFor="edit-end-date">Data de Fim</Label>
                  <Input
                    id="edit-end-date"
                    type="datetime-local"
                    value={editingEvent.end_date ? new Date(editingEvent.end_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingEvent({...editingEvent, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Local */}
                <div>
                  <Label htmlFor="edit-location">Local</Label>
                  <Input
                    id="edit-location"
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})}
                    placeholder="Local do evento"
                  />
                </div>

                {/* Categoria */}
                <div>
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Input
                    id="edit-category"
                    value={editingEvent.category || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, category: e.target.value})}
                    placeholder="Ex: cultural, esportivo, etc."
                  />
                </div>
              </div>

              {/* Organizadores */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-organizer">Organizador</Label>
                  <Input
                    id="edit-organizer"
                    value={editingEvent.organizador_nome || editingEvent.organizador || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, organizador_nome: e.target.value})}
                    placeholder="Nome do organizador"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-company">Empresa</Label>
                  <Input
                    id="edit-company"
                    value={(editingEvent as any).organizador_empresa || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, organizador_empresa: e.target.value})}
                    placeholder="Empresa organizadora"
                  />
                </div>
              </div>

              {/* Contatos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingEvent.organizador_email || editingEvent.contato_email || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, organizador_email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-phone">Telefone</Label>
                  <Input
                    id="edit-phone"
                    value={editingEvent.organizador_telefone || editingEvent.contato_telefone || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, organizador_telefone: e.target.value})}
                    placeholder="(67) 99999-9999"
                  />
                </div>
              </div>

              {/* URLs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-website">Site Oficial</Label>
                  <Input
                    id="edit-website"
                    value={editingEvent.site_oficial || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, site_oficial: e.target.value})}
                    placeholder="https://site.com"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-video">Vídeo (YouTube)</Label>
                  <Input
                    id="edit-video"
                    value={editingEvent.video_url || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, video_url: e.target.value})}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              {/* Imagens */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-image">Imagem Principal</Label>
                  <Input
                    id="edit-image"
                    value={editingEvent.image_url || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, image_url: e.target.value})}
                    placeholder="URL da imagem"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-logo">Logo do Evento</Label>
                  <Input
                    id="edit-logo"
                    value={editingEvent.logo_evento || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, logo_evento: e.target.value})}
                    placeholder="URL do logo"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes - Prévia do que aparece para os usuários */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl [&>button]:hidden">
          {selectedEvent && (() => {
            const touristRegion = getTouristRegion(selectedEvent.location);
            const regionColors = {
              'pantanal': 'from-blue-600 to-cyan-600',
              'bonito-serra-bodoquena': 'from-green-600 to-emerald-600',
              'vale-aguas': 'from-purple-600 to-indigo-600',
              'vale-apore': 'from-orange-600 to-red-600',
              'rota-norte': 'from-yellow-600 to-amber-600',
              'caminho-ipes': 'from-pink-600 to-rose-600',
              'caminhos-fronteira': 'from-teal-600 to-cyan-600',
              'costa-leste': 'from-indigo-600 to-purple-600',
              'grande-dourados': 'from-lime-600 to-green-600',
              'descubra-ms': 'from-ms-primary-blue to-ms-discovery-teal'
            };

            const regionEmojis = {
              'pantanal': '🐊',
              'bonito-serra-bodoquena': '🏔️',
              'vale-aguas': '💧',
              'vale-apore': '🏞️',
              'rota-norte': '🧭',
              'caminho-ipes': '🌸',
              'caminhos-fronteira': '🌎',
              'costa-leste': '🌊',
              'grande-dourados': '🌾',
              'descubra-ms': '🇧🇷'
            };

            const regionNames = {
              'pantanal': 'Pantanal',
              'bonito-serra-bodoquena': 'Bonito-Serra da Bodoquena',
              'vale-aguas': 'Vale das Águas',
              'vale-apore': 'Vale do Aporé',
              'rota-norte': 'Rota Norte',
              'caminho-ipes': 'Caminho dos Ipês',
              'caminhos-fronteira': 'Caminhos da Fronteira',
              'costa-leste': 'Costa Leste',
              'grande-dourados': 'Grande Dourados',
              'descubra-ms': 'Descubra MS'
            };

            return (
              <div className="relative max-h-[90vh] overflow-y-auto">
                {/* Header com imagem/vídeo - Igual ao que aparece para usuários */}
                <div className={`relative h-72 bg-gradient-to-br ${regionColors[touristRegion as keyof typeof regionColors] || regionColors['descubra-ms']} flex-shrink-0`}>
                  {selectedEvent.video_url && getYouTubeEmbedUrl(selectedEvent.video_url) ? (
                    <iframe
                      src={getYouTubeEmbedUrl(selectedEvent.video_url)!}
                      className="w-full h-full"
                      allowFullScreen
                      title="Vídeo do evento"
                    />
                  ) : (selectedEvent.logo_evento || selectedEvent.image_url) ? (
                    <img
                      src={selectedEvent.logo_evento || selectedEvent.image_url}
                      alt={selectedEvent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="w-24 h-24 text-white/30" />
                    </div>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Badges no topo */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {/* Badge Pendente (apenas admin) */}
                    {!selectedEvent.is_visible && (
                      <Badge className="bg-amber-500 text-white border-0 px-3 py-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendente de Aprovação
                      </Badge>
                    )}
                    {/* Badge destaque */}
                    {selectedEvent.is_sponsored && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-3 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        Em Destaque
                      </Badge>
                    )}
                    {/* Badge da região turística */}
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1">
                      <span className="mr-2">{regionEmojis[touristRegion as keyof typeof regionEmojis] || regionEmojis['descubra-ms']}</span>
                      <span className="font-medium">{regionNames[touristRegion as keyof typeof regionNames] || regionNames['descubra-ms']}</span>
                    </Badge>
                    {/* Badge categoria */}
                    {selectedEvent.category && (
                      <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1 capitalize">
                        {selectedEvent.category}
                      </Badge>
                    )}
                  </div>

                  {/* Título no overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                      {selectedEvent.name}
                    </h2>
                    <p className="text-white/90 text-sm drop-shadow">
                      {selectedEvent.description?.substring(0, 150)}...
                    </p>
                  </div>
                </div>

                {/* Conteúdo principal */}
                <div className="p-6 space-y-6 bg-white">
                  {/* Informações principais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Data e horário */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-ms-primary-blue" />
                        Data e Horário
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 bg-blue-50 text-ms-primary-blue px-4 py-2 rounded-lg">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">{formatDate(selectedEvent.start_date)}</span>
                          {selectedEvent.end_date && selectedEvent.end_date !== selectedEvent.start_date && (
                            <span className="text-sm"> até {formatDate(selectedEvent.end_date)}</span>
                          )}
                        </div>
                        {selectedEvent.start_time && (
                          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              {selectedEvent.start_time}
                              {selectedEvent.end_time && ` - ${selectedEvent.end_time}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Localização */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-ms-primary-blue" />
                        Localização
                      </h3>
                      <div className="bg-gray-50 px-4 py-3 rounded-lg">
                        <p className="text-gray-700 font-medium">{selectedEvent.location}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {regionNames[touristRegion as keyof typeof regionNames] || regionNames['descubra-ms']}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Descrição completa */}
                  {selectedEvent.description && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900">Sobre o Evento</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Categoria */}
                  {selectedEvent.category && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900">Categoria</h3>
                      <div className="bg-indigo-50 px-4 py-2 rounded-lg inline-block">
                        <Badge className="bg-indigo-600 text-white capitalize">
                          {selectedEvent.category}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Logo do Evento (se diferente da imagem principal) */}
                  {selectedEvent.logo_evento && selectedEvent.logo_evento !== selectedEvent.image_url && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-ms-primary-blue" />
                        Logo do Evento
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
                        <img 
                          src={selectedEvent.logo_evento} 
                          alt="Logo do evento"
                          className="max-w-xs max-h-48 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Informações do organizador */}
                  {(selectedEvent.organizador_nome || selectedEvent.organizador_email || selectedEvent.organizador_telefone) && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-ms-primary-blue" />
                        Organização
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        {selectedEvent.organizador_nome && (
                          <p className="text-gray-700">
                            <span className="font-medium">Organizado por:</span> {selectedEvent.organizador_nome}
                            {selectedEvent.organizador_empresa && ` - ${selectedEvent.organizador_empresa}`}
                          </p>
                        )}
                        {selectedEvent.organizador_email && (
                          <p className="text-gray-600 text-sm">
                            <span className="font-medium">Email:</span>{' '}
                            <a href={`mailto:${selectedEvent.organizador_email}`} className="text-blue-600 hover:underline">
                              {selectedEvent.organizador_email}
                            </a>
                          </p>
                        )}
                        {selectedEvent.organizador_telefone && (
                          <p className="text-gray-600 text-sm">
                            <span className="font-medium">Telefone:</span>{' '}
                            <a href={`tel:${selectedEvent.organizador_telefone}`} className="text-blue-600 hover:underline">
                              {selectedEvent.organizador_telefone}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Site oficial */}
                  {selectedEvent.site_oficial && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-ms-primary-blue" />
                        Site Oficial
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <a 
                          href={selectedEvent.site_oficial} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-2"
                        >
                          {selectedEvent.site_oficial}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Informações de Patrocínio */}
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-yellow-600" />
                      Informações de Patrocínio
                    </h3>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 uppercase mb-2">Status do Pagamento</p>
                          <Badge 
                            variant={selectedEvent.sponsor_payment_status === 'paid' ? 'default' : 'secondary'}
                            className={selectedEvent.sponsor_payment_status === 'paid' ? 'bg-green-600' : 'bg-amber-500'}
                          >
                            {selectedEvent.sponsor_payment_status === 'paid' ? 'Pago' : selectedEvent.sponsor_payment_status || 'Gratuito'}
                          </Badge>
                        </div>
                        {selectedEvent.sponsor_amount && (
                          <div>
                            <p className="text-xs text-gray-600 uppercase mb-2">Valor</p>
                            <p className="text-lg font-bold text-gray-900">
                              R$ {selectedEvent.sponsor_amount.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação - Apenas para admin */}
                  {!selectedEvent.is_visible && (
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full"
                        onClick={() => {
                          approveEvent(selectedEvent.id);
                          setSelectedEvent(null);
                        }}
                        disabled={approvingEventId === selectedEvent.id}
                        size="lg"
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
                        className="flex-1 rounded-full"
                        onClick={async () => {
                          try {
                            await rejectEvent(selectedEvent.id);
                            // Fechar modal após atualização
                            setSelectedEvent(null);
                          } catch (error) {
                            console.error('Erro ao rejeitar evento:', error);
                            // Não fechar modal se houver erro
                          }
                        }}
                        disabled={approvingEventId === selectedEvent.id}
                        size="lg"
                      >
                        {approvingEventId === selectedEvent.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <X className="w-4 h-4 mr-2" />
                        )}
                        {approvingEventId === selectedEvent.id ? 'Rejeitando...' : 'Rejeitar'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

