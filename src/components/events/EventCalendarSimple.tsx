/**
 * Componente de Calendário de Eventos Simplificado
 * Integrado com GoogleSearchEventService (controle de limites)
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, ExternalLink, Globe, RefreshCw } from 'lucide-react';
import { GoogleSearchEventService } from '@/services/events/GoogleSearchEventService';

interface EventoSimples {
  id: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim?: string;
  local: string;
  cidade: string;
  categoria: string;
  tipo_entrada: string;
  organizador: string;
  fonte: string;
  imagem_principal?: string;
  site_oficial?: string;
  tags?: string[];
}

const EventCalendarSimple: React.FC = () => {
  const [events, setEvents] = useState<EventoSimples[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState<'Hoje' | 'Esta semana' | 'Este mês'>('Este mês');
  const [selectedEvent, setSelectedEvent] = useState<EventoSimples | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false); // Modo desenvolvedor

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      console.log("📅 EVENT CALENDAR: Carregando eventos...");
      
      const service = new GoogleSearchEventService();
      const result = await service.searchEvents();
      
      if (result.success && result.eventos.length > 0) {
        const eventosSimples: EventoSimples[] = result.eventos.map(evento => ({
          id: evento.id,
          titulo: evento.titulo,
          descricao: evento.descricao,
          data_inicio: evento.data_inicio,
          data_fim: evento.data_fim,
          local: evento.local,
          cidade: evento.cidade,
          categoria: evento.categoria,
          tipo_entrada: evento.tipo_entrada,
          organizador: evento.organizador,
          fonte: evento.fonte,
          imagem_principal: evento.imagem_principal,
          site_oficial: evento.site_oficial,
          tags: evento.tags
        }));
        
        setEvents(eventosSimples);
        setFromCache(result.fromCache);
        
        // LOGGING TÉCNICO (apenas console)
        console.log(`✅ ${eventosSimples.length} eventos carregados ${result.fromCache ? '(cache 24h)' : '(Google API)'}`);
        console.log(`📊 Requisições hoje: ${service.getUsageStats().requestsToday}/${service.getUsageStats().maxRequestsPerDay}`);
      } else {
        // FALLBACK: Eventos de demonstração quando API falha
        console.warn(`⚠️ API indisponível ou sem eventos. ${result.errors.join(', ')}`);
        console.log("📦 Carregando eventos de demonstração...");
        
        const hoje = new Date();
        const eventosFallback: EventoSimples[] = [
          {
            id: 'demo-1',
            titulo: 'Festival Cultural de Campo Grande',
            descricao: 'Grande celebração da cultura sul-mato-grossense com apresentações musicais, dança, teatro e gastronomia típica da região.',
            data_inicio: new Date(hoje.setDate(hoje.getDate() + 7)).toISOString().split('T')[0],
            local: 'Praça Ary Coelho',
            cidade: 'Campo Grande',
            categoria: 'cultural',
            tipo_entrada: 'gratuito',
            organizador: 'Prefeitura Municipal',
            fonte: 'demo',
            site_oficial: 'https://www.campogrande.ms.gov.br',
            tags: ['cultura', 'música', 'arte']
          },
          {
            id: 'demo-2',
            titulo: 'Feira de Artesanato e Produtos Regionais',
            descricao: 'Exposição e venda de artesanato local, produtos orgânicos e comidas típicas de Mato Grosso do Sul.',
            data_inicio: new Date(hoje.setDate(hoje.getDate() + 10)).toISOString().split('T')[0],
            local: 'Parque das Nações Indígenas',
            cidade: 'Campo Grande',
            categoria: 'gastronomico',
            tipo_entrada: 'gratuito',
            organizador: 'SEBRAE-MS',
            fonte: 'demo',
            site_oficial: 'https://ms.sebrae.com.br',
            tags: ['artesanato', 'gastronomia']
          },
          {
            id: 'demo-3',
            titulo: 'Caminhada Ecológica do Pantanal',
            descricao: 'Trilha guiada pelo Parque Estadual do Pantanal com observação de fauna e flora nativas.',
            data_inicio: new Date(hoje.setDate(hoje.getDate() + 14)).toISOString().split('T')[0],
            local: 'Parque Estadual do Pantanal',
            cidade: 'Corumbá',
            categoria: 'turismo',
            tipo_entrada: 'pago',
            organizador: 'Fundação de Turismo MS',
            fonte: 'demo',
            site_oficial: 'https://www.turismo.ms.gov.br',
            tags: ['ecoturismo', 'natureza', 'pantanal']
          }
        ];
        
        setEvents(eventosFallback);
        setFromCache(false);
        console.log(`📦 ${eventosFallback.length} eventos de demonstração carregados`);
      }
      
      const stats = service.getUsageStats();
      setUsageStats(stats);
      
      // LOG de estatísticas completo
      console.log("📊 ESTATÍSTICAS:", {
        total_eventos: result.eventos.length,
        from_cache: result.fromCache,
        requests_today: stats.requestsToday,
        requests_remaining: stats.remainingToday,
        cache_size: stats.cacheSize
      });
      
    } catch (error) {
      console.error("❌ Erro ao carregar eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    if (endDate) {
      const end = new Date(endDate);
      return `${start.toLocaleDateString('pt-BR', options)} a ${end.toLocaleDateString('pt-BR', options)}`;
    }
    return start.toLocaleDateString('pt-BR', options);
  };

  const getEventStatus = (event: EventoSimples) => {
    const now = new Date();
    const startDate = new Date(event.data_inicio);
    const endDate = event.data_fim ? new Date(event.data_fim) : startDate;

    if (now < startDate) {
      return { label: 'Em Breve', color: 'bg-blue-500' };
    } else if (now >= startDate && now <= endDate) {
      return { label: 'Acontecendo', color: 'bg-green-500' };
    } else {
      return { label: 'Finalizado', color: 'bg-gray-500' };
    }
  };

  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'cultural': 'bg-purple-500',
      'esportivo': 'bg-green-500',
      'gastronomico': 'bg-orange-500',
      'turismo': 'bg-blue-500',
      'oficial': 'bg-red-500'
    };
    return colors[categoria] || 'bg-gray-500';
  };

  const getCategoryLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      'cultural': 'Cultural',
      'esportivo': 'Esportivo',
      'gastronomico': 'Gastronômico',
      'turismo': 'Turismo',
      'oficial': 'Oficial'
    };
    return labels[categoria] || 'Geral';
  };

  const eventosFiltrados = events.filter(event => {
    const hoje = new Date();
    const dataEvento = new Date(event.data_inicio);

    switch (filtroAtivo) {
      case 'Hoje':
        return dataEvento.toDateString() === hoje.toDateString();
      case 'Esta semana':
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        return dataEvento >= inicioSemana && dataEvento <= fimSemana;
      case 'Este mês':
        return dataEvento.getMonth() === hoje.getMonth() && dataEvento.getFullYear() === hoje.getFullYear();
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ms-primary-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Próximos Eventos</h2>
          <div className="flex items-center gap-3 mt-1">
            {showDebugInfo && usageStats && (
              <p className="text-xs text-gray-400">
                {fromCache ? '📦 Cache (24h)' : '🔍 API'} | 
                {' '}{usageStats.requestsToday}/{usageStats.maxRequestsPerDay}
              </p>
            )}
            {events.length > 0 && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">
                  {events.length} {events.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
                </p>
                {events[0]?.fonte === 'demo' && (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                    📋 Demonstração
                  </Badge>
                )}
              </div>
            )}
            <Button
              onClick={() => {
                localStorage.removeItem('eventos_ms_cache');
                loadEvents();
              }}
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-ms-pantanal-green"
              title="Buscar eventos mais recentes"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Atualizar
            </Button>
            {/* Botão de emergência para resetar limites (apenas desenvolvimento) */}
            {import.meta.env.DEV && (
              <Button
                onClick={() => {
                  localStorage.removeItem('google_search_request_log');
                  localStorage.removeItem('eventos_ms_cache');
                  window.location.reload();
                }}
                variant="ghost"
                size="sm"
                className="text-xs text-red-400 hover:text-red-600"
                title="🚨 RESET TOTAL (apenas dev)"
              >
                🔄 Reset
              </Button>
            )}
            {/* Modo desenvolvedor (Ctrl+D) */}
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="text-xs text-gray-300 hover:text-gray-500"
              title="Alternar informações técnicas"
            >
              {showDebugInfo ? '👁️' : ''}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFiltroAtivo("Hoje")}
            className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
              filtroAtivo === "Hoje"
                ? "border-ms-pantanal-green bg-ms-pantanal-green text-white"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setFiltroAtivo("Esta semana")}
            className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
              filtroAtivo === "Esta semana"
                ? "border-ms-pantanal-green bg-ms-pantanal-green text-white"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Esta semana
          </button>
          <button
            onClick={() => setFiltroAtivo("Este mês")}
            className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
              filtroAtivo === "Este mês"
                ? "border-ms-pantanal-green bg-ms-pantanal-green text-white"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Este mês
          </button>
        </div>
      </div>

      {/* Alerta de Demonstração */}
      {events.length > 0 && events[0]?.fonte === 'demo' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-amber-600 text-xl">ℹ️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-1">Eventos de Demonstração</h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                Os eventos reais não puderam ser carregados no momento (limite de requisições atingido). 
                Estes são exemplos de eventos típicos da região. Use o botão <strong>"🔄 Reset"</strong> vermelho 
                para limpar os limites e buscar eventos reais novamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Eventos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventosFiltrados.length > 0 ? (
          eventosFiltrados.map((event) => {
            const status = getEventStatus(event);
            return (
              <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                {/* Banner do evento */}
                <div className="h-56 relative overflow-hidden">
                  {event.imagem_principal ? (
                    <img 
                      src={event.imagem_principal} 
                      alt={event.titulo}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) parent.querySelector('.gradient-fallback')?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`gradient-fallback absolute inset-0 bg-gradient-to-br from-ms-pantanal-green/90 to-ms-cerrado-orange/90 flex items-center justify-center ${event.imagem_principal ? 'hidden' : ''}`}>
                    <div className="text-center text-white p-4">
                      <Calendar className="h-16 w-16 mx-auto mb-3 opacity-80" />
                      <h3 className="font-bold text-lg leading-tight">{event.titulo}</h3>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className={`${getCategoryColor(event.categoria)} text-white shadow-lg`}>
                      {getCategoryLabel(event.categoria)}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800 leading-tight">{event.titulo}</h3>
                    <Badge className={`${status.color} text-white text-xs px-2 py-1`}>
                      {status.label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600 flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-ms-cerrado-orange flex-shrink-0" />
                      <span className="font-medium">{formatEventDate(event.data_inicio, event.data_fim)}</span>
                    </p>
                    
                    <p className="text-gray-600 flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-ms-guavira-purple flex-shrink-0" />
                      <span>{event.local}, {event.cidade}</span>
                    </p>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed text-sm mb-4 line-clamp-2">
                    {event.descricao}
                  </p>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => setSelectedEvent(event)}
                      variant="outline" 
                      size="sm"
                      className="flex-1 border-ms-pantanal-green text-ms-pantanal-green hover:bg-ms-pantanal-green hover:text-white transition-colors"
                    >
                      Ver Detalhes
                    </Button>
                    
                    <Button 
                      variant="default" 
                      size="sm"
                      className="flex-1 bg-ms-pantanal-green hover:bg-ms-pantanal-green/90 text-white transition-colors"
                      onClick={() => {
                        if (event.site_oficial) {
                          window.open(event.site_oficial, '_blank');
                        }
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Site Oficial
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16">
            <div className="max-w-md mx-auto">
              <Calendar className="h-20 w-20 mx-auto mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {events.length === 0 ? 'Buscando eventos em Mato Grosso do Sul' : 'Nenhum evento encontrado'}
              </h3>
              {events.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Estamos buscando os próximos eventos na região.
                  </p>
                  <p className="text-gray-500 text-sm">
                    Os eventos são atualizados diariamente através de fontes oficiais como 
                    prefeituras, agendas culturais e notícias regionais.
                  </p>
                  <Button
                    onClick={loadEvents}
                    variant="outline"
                    className="mt-4 border-ms-pantanal-green text-ms-pantanal-green hover:bg-ms-pantanal-green hover:text-white"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Buscar Eventos
                  </Button>
                  <p className="text-xs text-gray-400 mt-3">
                    Volte em breve para conferir os próximos eventos!
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">
                  Tente selecionar outro período de busca.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedEvent(null)}>
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-ms-pantanal-green">{selectedEvent.titulo}</h3>
                <Button onClick={() => setSelectedEvent(null)} variant="ghost" size="sm">✕</Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">Data e Horário</p>
                  <p className="text-gray-600">{formatEventDate(selectedEvent.data_inicio, selectedEvent.data_fim)}</p>
                </div>
                
                <div>
                  <p className="font-semibold">Local</p>
                  <p className="text-gray-600">{selectedEvent.local}, {selectedEvent.cidade}</p>
                </div>
                
                <div>
                  <p className="font-semibold">Descrição</p>
                  <p className="text-gray-700">{selectedEvent.descricao}</p>
                </div>
                
                <div>
                  <p className="font-semibold">Organizador</p>
                  <p className="text-gray-600">{selectedEvent.organizador}</p>
                </div>
                
                <div>
                  <Badge className={`${getCategoryColor(selectedEvent.categoria)} text-white mr-2`}>
                    {getCategoryLabel(selectedEvent.categoria)}
                  </Badge>
                  <Badge variant="outline">
                    {selectedEvent.tipo_entrada === 'gratuito' ? 'Gratuito' : 'Pago'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EventCalendarSimple;
