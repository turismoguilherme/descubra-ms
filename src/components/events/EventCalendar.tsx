/**
 * Componente de Calendário de Eventos
 * 
 * FUNCIONALIDADE: Exibe eventos como um calendário do estado
 * SEGURANÇA: Interface limpa para usuários finais
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Play,
  Globe,
  Ticket,
  Phone,
  Mail,
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EventoCompleto } from '@/types/events';
import { eventService, TourismEvent } from '@/services/public/eventService';

interface EventCalendarProps {
  events?: EventoCompleto[];
  loading?: boolean;
  autoLoad?: boolean;
}

const EventCalendar: React.FC<EventCalendarProps> = ({ 
  events: propEvents, 
  loading: propLoading = false, 
  autoLoad = true 
}) => {
  const [events, setEvents] = useState<EventoCompleto[]>(propEvents || []);
  const [loading, setLoading] = useState(propLoading);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [selectedEvent, setSelectedEvent] = useState<EventoCompleto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredEvents, setFilteredEvents] = useState<EventoCompleto[]>([]);

  // Carregar eventos automaticamente
  useEffect(() => {
    if (autoLoad) {
      loadEvents();
    }
  }, [autoLoad]);

  // Carregar eventos aprovados do Supabase
  const loadEvents = async () => {
    setLoading(true);
    try {
      console.log("📅 EVENT CALENDAR: Carregando eventos aprovados...");
      
      // Buscar apenas eventos aprovados (do ViaJAR e Descubra MS)
      const dbEvents = await eventService.getEvents({
        approval_status: 'approved',
        is_public: true,
      });

      // Converter para formato EventoCompleto
      const convertedEvents: EventoCompleto[] = dbEvents.map((event: TourismEvent) => ({
        id: event.id,
        titulo: event.title || event.name || 'Evento sem título',
        descricao_resumida: event.description?.substring(0, 150) || 'Sem descrição',
        descricao_completa: event.description || 'Sem descrição completa',
        data_inicio: event.start_date || event.date || new Date().toISOString(),
        data_fim: event.end_date,
        local: event.location || 'Local não informado',
        cidade: event.city || 'MS',
        estado: event.state || 'MS',
        endereco_completo: event.location || '',
        categoria: (event.category || 'cultural') as any,
        tipo_entrada: 'gratuito', // Default, pode ser melhorado
        publico_alvo: 'geral',
        status: (event.status === 'active' ? 'ativo' : event.status === 'completed' ? 'finalizado' : 'ativo') as any,
        visibilidade: event.is_public !== false,
        destaque: false,
        organizador: 'Organizador não informado',
        fonte: 'manual' as const,
        processado_por_ia: false,
        confiabilidade: 100,
        ultima_atualizacao: event.updated_at || event.created_at || new Date().toISOString(),
        tags: [],
        palavras_chave: [],
        relevancia: 80,
        imagem_principal: event.images?.[0] || event.image_url,
        galeria_imagens: event.images || [],
        contato: {
          telefone: event.contact_phone,
          email: event.contact_email,
          site: event.contact_website,
        },
      }));

      setEvents(convertedEvents);
      setFilteredEvents(convertedEvents);
      console.log(`📅 EVENT CALENDAR: ${convertedEvents.length} eventos aprovados carregados`);
      
    } catch (error) {
      console.error("📅 EVENT CALENDAR: Erro ao carregar eventos:", error);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar eventos
  useEffect(() => {
    let filtered = events;

    // Filtro de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.titulo.toLowerCase().includes(searchLower) ||
        event.descricao_resumida.toLowerCase().includes(searchLower) ||
        event.local.toLowerCase().includes(searchLower) ||
        event.cidade.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.categoria === selectedCategory);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedCategory]);

  // Agrupar eventos por data
  const eventsByDate = events.reduce((acc, event) => {
    const date = new Date(event.data_inicio).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, EventoCompleto[]>);

  // Obter eventos do mês atual
  const getEventsForMonth = () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.data_inicio);
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    });
  };

  const formatEventDate = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      if (start.getFullYear() !== end.getFullYear()) {
        return `${format(start, 'dd/MM/yyyy', { locale: ptBR })} a ${format(end, 'dd/MM/yyyy', { locale: ptBR })}`;
      }
      return `${format(start, 'dd/MM', { locale: ptBR })} a ${format(end, 'dd/MM', { locale: ptBR })}`;
    }
    return format(start, 'dd/MM/yyyy', { locale: ptBR });
  };

  const getEventStatus = (event: EventoCompleto) => {
    const now = new Date();
    const startDate = new Date(event.data_inicio);
    const endDate = event.data_fim ? new Date(event.data_fim) : startDate;
    
    if (now < startDate) {
      return { label: 'Em Breve', variant: 'default' as const, color: 'bg-blue-500' };
    } else if (now >= startDate && now <= endDate) {
      return { label: 'Acontecendo', variant: 'default' as const, color: 'bg-green-500' };
    } else {
      return { label: 'Finalizado', variant: 'secondary' as const, color: 'bg-gray-500' };
    }
  };

  const getCategoryColor = (categoria: string) => {
    const colors = {
      'cultural': 'bg-purple-500',
      'esportivo': 'bg-green-500',
      'gastronomico': 'bg-orange-500',
      'turismo': 'bg-blue-500',
      'oficial': 'bg-red-500',
      'educativo': 'bg-indigo-500',
      'religioso': 'bg-yellow-500'
    };
    return colors[categoria as keyof typeof colors] || 'bg-gray-500';
  };

  const getCategoryLabel = (categoria: string) => {
    const labels = {
      'cultural': 'Cultural',
      'esportivo': 'Esportivo',
      'gastronomico': 'Gastronômico',
      'turismo': 'Turismo',
      'oficial': 'Oficial',
      'educativo': 'Educativo',
      'religioso': 'Religioso'
    };
    return labels[categoria as keyof typeof labels] || 'Geral';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ms-primary-blue"></div>
      </div>
    );
  }

  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'gastronomic', label: 'Gastronômico' },
    { value: 'sports', label: 'Esportivo' },
    { value: 'religious', label: 'Religioso' },
    { value: 'entertainment', label: 'Entretenimento' },
    { value: 'business', label: 'Negócios' },
  ];

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ms-primary-blue">Calendário de Eventos</h2>
          <p className="text-gray-600">Eventos aprovados de Mato Grosso do Sul</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
          >
            Lista
          </Button>
          <Button
            onClick={() => setViewMode('calendar')}
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
          >
            Calendário
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Eventos */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const status = getEventStatus(event);
              return (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Imagem do evento */}
                      {event.imagem_principal && (
                        <div className="md:w-1/3 h-48 md:h-auto overflow-hidden rounded-lg">
                          <img 
                            src={event.imagem_principal} 
                            alt={event.titulo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Conteúdo do evento */}
                      <div className="w-full">
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-ms-pantanal-green mb-2">
                              {event.titulo}
                            </h3>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-2">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatEventDate(event.data_inicio, event.data_fim)}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {event.local}, {event.cidade}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <Badge 
                                variant={status.variant}
                                className={`${status.color} text-white`}
                              >
                                {status.label}
                              </Badge>
                              <Badge 
                                variant="outline"
                                className={`${getCategoryColor(event.categoria)} text-white`}
                              >
                                {getCategoryLabel(event.categoria)}
                              </Badge>
                            </div>
                            {event.fonte && (
                              <span className="text-xs text-gray-500">
                                Fonte: {event.fonte}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {event.descricao_resumida}
                        </p>
                        
                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {event.tags.slice(0, 5).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            onClick={() => setSelectedEvent(event)}
                            variant="outline" 
                            size="sm"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                          
                          {event.video_promocional && (
                            <Button 
                              onClick={() => window.open(event.video_promocional, '_blank')}
                              variant="outline" 
                              size="sm"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Vídeo
                            </Button>
                          )}
                          
                          {event.site_oficial && (
                            <Button 
                              onClick={() => window.open(event.site_oficial, '_blank')}
                              variant="outline" 
                              size="sm"
                            >
                              <Globe className="h-4 w-4 mr-2" />
                              Site Oficial
                            </Button>
                          )}
                          
                          {event.link_inscricao && (
                            <Button 
                              onClick={() => window.open(event.link_inscricao, '_blank')}
                              variant="default" 
                              size="sm"
                              className="bg-ms-pantanal-green hover:bg-ms-pantanal-green/90"
                            >
                              <Ticket className="h-4 w-4 mr-2" />
                              Inscrições
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhum evento encontrado
                </h3>
                <p className="text-gray-500">
                  Não há eventos programados para este período.
                </p>
                <Button 
                  onClick={loadEvents}
                  variant="outline" 
                  className="mt-4"
                >
                  Recarregar Eventos
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Vista de Calendário (implementação futura) */}
      {viewMode === 'calendar' && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Vista de Calendário
            </h3>
            <p className="text-gray-500">
              Esta funcionalidade será implementada em breve.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalhes do Evento */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl font-bold text-ms-pantanal-green">
                  {selectedEvent.titulo}
                </CardTitle>
                <Button 
                  onClick={() => setSelectedEvent(null)}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Imagem principal */}
              {selectedEvent.imagem_principal && (
                <div className="aspect-video overflow-hidden rounded-lg">
                  <img 
                    src={selectedEvent.imagem_principal} 
                    alt={selectedEvent.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-600" />
                  <div>
                    <p className="font-medium">Data e Horário</p>
                    <p className="text-sm text-gray-600">
                      {formatEventDate(selectedEvent.data_inicio, selectedEvent.data_fim)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-gray-600" />
                  <div>
                    <p className="font-medium">Local</p>
                    <p className="text-sm text-gray-600">
                      {selectedEvent.local}, {selectedEvent.cidade}
                    </p>
                  </div>
                </div>
              </div>

              {/* Categorias e status */}
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant="outline"
                  className={`${getCategoryColor(selectedEvent.categoria)} text-white`}
                >
                  {getCategoryLabel(selectedEvent.categoria)}
                </Badge>
                <Badge variant="outline">
                  {selectedEvent.tipo_entrada === 'gratuito' ? 'Gratuito' : 'Pago'}
                </Badge>
                <Badge variant="outline">
                  {selectedEvent.publico_alvo}
                </Badge>
              </div>

              {/* Descrição completa */}
              <div>
                <h4 className="font-semibold mb-2">Sobre o Evento</h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedEvent.descricao_completa}
                </p>
              </div>

              {/* Tags */}
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedEvent.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Vídeo promocional */}
              {selectedEvent.video_promocional && (
                <div>
                  <h4 className="font-semibold mb-2">Vídeo Promocional</h4>
                  <Button 
                    onClick={() => window.open(selectedEvent.video_promocional, '_blank')}
                    variant="outline"
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Assistir Vídeo
                  </Button>
                </div>
              )}

              {/* Links e contato */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedEvent.site_oficial && (
                  <Button 
                    onClick={() => window.open(selectedEvent.site_oficial, '_blank')}
                    variant="outline"
                    className="w-full"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Site Oficial
                  </Button>
                )}
                
                {selectedEvent.link_inscricao && (
                  <Button 
                    onClick={() => window.open(selectedEvent.link_inscricao, '_blank')}
                    variant="default"
                    className="w-full bg-ms-pantanal-green hover:bg-ms-pantanal-green/90"
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    Fazer Inscrição
                  </Button>
                )}
                
                {selectedEvent.contato?.telefone && (
                  <Button 
                    onClick={() => window.open(`tel:${selectedEvent.contato?.telefone}`, '_blank')}
                    variant="outline"
                    className="w-full"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {selectedEvent.contato?.telefone}
                  </Button>
                )}
                
                {selectedEvent.contato?.email && (
                  <Button 
                    onClick={() => window.open(`mailto:${selectedEvent.contato?.email}`, '_blank')}
                    variant="outline"
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {selectedEvent.contato?.email}
                  </Button>
                )}
              </div>

              {/* Informações da fonte */}
              <div className="text-xs text-gray-500 border-t pt-4">
                <p>Fonte: {selectedEvent.fonte}</p>
                {selectedEvent.processado_por_ia && (
                  <p>Processado por IA (Confiança: {selectedEvent.confiabilidade}%)</p>
                )}
                <p>Última atualização: {new Date(selectedEvent.ultima_atualizacao).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
