/**
 * Componente de Calendário de Eventos
 * Cards em grid com eventos patrocinados em destaque
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  Calendar, 
  MapPin, 
  Play,
  Globe,
  Phone,
  Search,
  Filter,
  Star,
  Megaphone,
  ExternalLink,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventCalendarProps {
  autoLoad?: boolean;
}

interface EventItem {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  location: string;
  image_url?: string;
  is_sponsored: boolean;
  site_oficial?: string;
  video_url?: string;
  organizador_telefone?: string;
  organizador_email?: string;
  organizador_nome?: string;
}

const EventCalendar: React.FC<EventCalendarProps> = ({ autoLoad = true }) => {
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    if (autoLoad) {
      loadAllEvents();
    }
  }, [autoLoad]);

  const loadAllEvents = async () => {
    setLoading(true);
    try {
      // Usar fetch direto (workaround para problema com cliente Supabase)
      const SUPABASE_URL = "https://hvtrpkbjgbuypkskqcqm.supabase.co";
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q";
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/events?is_visible=eq.true&select=*`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      );
      
      if (!response.ok) {
        console.error("Erro ao carregar eventos");
        return;
      }
      
      const data = await response.json();

      const events: EventItem[] = (data || []).map((event: any) => ({
        id: event.id,
        name: event.name,
        description: event.description || '',
        start_date: event.start_date,
        end_date: event.end_date,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location || '',
        image_url: event.image_url,
        is_sponsored: event.is_sponsored && event.sponsor_payment_status === 'paid',
        site_oficial: event.site_oficial,
        video_url: event.video_url,
        organizador_telefone: event.organizador_telefone,
        organizador_email: event.organizador_email,
        organizador_nome: event.organizador_nome,
      }));

      // Ordenar: patrocinados primeiro, depois por data
      events.sort((a, b) => {
        if (a.is_sponsored && !b.is_sponsored) return -1;
        if (!a.is_sponsored && b.is_sponsored) return 1;
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      });

      setAllEvents(events);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = !searchTerm || 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por região turística
    let matchesRegion = selectedRegion === 'all';
    if (!matchesRegion && selectedRegion in regionCities) {
      const cities = regionCities[selectedRegion];
      matchesRegion = cities.some(city => 
        event.location.toLowerCase().includes(city.toLowerCase())
      );
    }
    
    return matchesSearch && matchesRegion;
  });

  const sponsoredEvents = filteredEvents.filter(e => e.is_sponsored);
  const regularEvents = filteredEvents.filter(e => !e.is_sponsored);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const formatShortDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
  };

  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'gastronomico', label: 'Gastronômico' },
    { value: 'musical', label: 'Musical' },
    { value: 'esportivo', label: 'Esportivo' },
  ];

  // Regiões Turísticas Oficiais de MS
  const regions = [
    { value: 'all', label: 'Todas as Regiões' },
    { value: 'bonito-serra-bodoquena', label: '🏔️ Bonito-Serra da Bodoquena' },
    { value: 'caminho-ipes', label: '🌸 Caminho dos Ipês' },
    { value: 'caminhos-fronteira', label: '🌎 Caminhos da Fronteira' },
    { value: 'costa-leste', label: '🌊 Costa Leste' },
    { value: 'grande-dourados', label: '🌾 Grande Dourados' },
    { value: 'pantanal', label: '🐊 Pantanal' },
    { value: 'rota-norte', label: '🧭 Rota Norte' },
    { value: 'vale-aguas', label: '💧 Vale das Águas' },
    { value: 'vale-apore', label: '🏞️ Vale do Aporé' },
  ];

  // Cidades por região para filtro
  const regionCities: Record<string, string[]> = {
    'bonito-serra-bodoquena': ['bonito', 'bodoquena', 'jardim', 'bela vista', 'caracol', 'guia lopes', 'nioaque', 'porto murtinho'],
    'caminho-ipes': ['campo grande', 'corguinho', 'dois irmãos do buriti', 'jaraguari', 'nova alvorada', 'ribas do rio pardo', 'rio negro', 'sidrolândia', 'terenos'],
    'caminhos-fronteira': ['ponta porã', 'antônio joão', 'laguna carapã'],
    'costa-leste': ['três lagoas', 'água clara', 'aparecida do taboado', 'bataguassu', 'brasilândia', 'paranaíba', 'santa rita do pardo'],
    'grande-dourados': ['dourados', 'caarapó', 'deodápolis', 'douradina', 'fátima do sul', 'glória de dourados', 'itaporã', 'maracaju', 'rio brilhante', 'vicentina'],
    'pantanal': ['corumbá', 'aquidauana', 'miranda', 'ladário', 'anastácio', 'pantanal'],
    'rota-norte': ['coxim', 'alcinópolis', 'bandeirantes', 'camapuã', 'costa rica', 'figueirão', 'paraíso das águas', 'pedro gomes', 'rio verde de mato grosso', 'são gabriel do oeste', 'sonora'],
    'vale-aguas': ['nova andradina', 'angélica', 'batayporã', 'ivinhema', 'jateí', 'novo horizonte do sul', 'taquarussu'],
    'vale-apore': ['cassilândia', 'chapadão do sul', 'inocência'],
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-ms-primary-blue border-t-transparent"></div>
      </div>
    );
  }

  const EventCard = ({ event, showBadge = false }: { event: EventItem; showBadge?: boolean }) => (
    <Card 
      className={`overflow-hidden hover:shadow-xl transition-all cursor-pointer group ${
        showBadge ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
      }`}
      onClick={() => setSelectedEvent(event)}
    >
      {/* Badge Destaque */}
      {showBadge && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 flex items-center gap-2">
          <Star className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-semibold">Em Destaque</span>
        </div>
      )}
      
      {/* Imagem */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-ms-primary-blue to-ms-discovery-teal">
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-16 h-16 text-white/50" />
          </div>
        )}
        {/* Indicador de vídeo */}
        {event.video_url && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Play className="w-3 h-3" />
            Vídeo
          </div>
        )}
        </div>
        
      <CardContent className="p-5">
        {/* Título */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-ms-primary-blue transition-colors line-clamp-2">
          {event.name}
        </h3>
        
        {/* Data */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Calendar className="w-4 h-4 text-ms-primary-blue flex-shrink-0" />
          <span>{formatShortDate(event.start_date)}</span>
      </div>

        {/* Local */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-ms-primary-blue flex-shrink-0" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Filtros - PRIMEIRO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger>
            <MapPin className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Região Turística" />
          </SelectTrigger>
          <SelectContent>
            {regions.map(region => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {/* CTA Cadastrar Evento */}
      <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Megaphone className="w-6 h-6 text-white" />
                        </div>
          <div className="text-white">
            <h3 className="font-bold text-lg">Tem um evento para divulgar?</h3>
            <p className="text-white/80 text-sm">Cadastre gratuitamente ou destaque seu evento</p>
                              </div>
                            </div>
        <Link to="/descubramatogrossodosul/cadastrar-evento">
          <Button className="bg-white text-ms-primary-blue hover:bg-white/90 font-semibold">
            <Calendar className="w-4 h-4 mr-2" />
            Cadastrar Evento
          </Button>
        </Link>
                          </div>
                          
      {/* Eventos em Destaque */}
      {sponsoredEvents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-xl font-bold text-ms-primary-blue">Eventos em Destaque</h3>
                            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsoredEvents.map((event) => (
              <EventCard key={event.id} event={event} showBadge={true} />
                            ))}
                          </div>
        </div>
      )}

      {/* Todos os Eventos */}
      <div className="space-y-4">
        {regularEvents.length === 0 && sponsoredEvents.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-500">Não há eventos programados para este período.</p>
        </Card>
        ) : regularEvents.length > 0 && (
          <>
            <h3 className="text-xl font-bold text-gray-800">Todos os Eventos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularEvents.map((event) => (
                <EventCard key={event.id} event={event} showBadge={false} />
                            ))}
                          </div>
          </>
                          )}
                        </div>

      {/* Modal de Detalhes - MODERNO */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl [&>button]:hidden">
      {selectedEvent && (
            <div className="relative max-h-[90vh] overflow-y-auto">
              {/* Header com imagem/vídeo */}
              <div className="relative h-64 bg-gradient-to-br from-ms-primary-blue to-ms-discovery-teal flex-shrink-0">
                {selectedEvent.video_url && getYouTubeEmbedUrl(selectedEvent.video_url) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(selectedEvent.video_url)!}
                    className="w-full h-full"
                    allowFullScreen
                    title="Vídeo do evento"
                  />
                ) : selectedEvent.image_url ? (
                  <img 
                    src={selectedEvent.image_url} 
                    alt={selectedEvent.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="w-24 h-24 text-white/30" />
                </div>
              )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Badge destaque no modal */}
                {selectedEvent.is_sponsored && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-3 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Em Destaque
                    </Badge>
                  </div>
                )}
                </div>
                
              {/* Conteúdo */}
              <div className="p-6 space-y-5">
                {/* Título */}
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedEvent.name}
                </h2>
                
                {/* Data, Hora e Local */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-blue-50 text-ms-primary-blue px-4 py-2 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium text-sm">{formatDate(selectedEvent.start_date)}</span>
                  </div>
                  {selectedEvent.start_time && (
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium text-sm">
                        {selectedEvent.start_time}
                        {selectedEvent.end_time && ` - ${selectedEvent.end_time}`}
                      </span>
                </div>
                  )}
              </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 text-ms-primary-blue" />
                  <span className="font-medium">{selectedEvent.location}</span>
              </div>

                {/* Descrição */}
                {selectedEvent.description && (
                  <div className="border-t pt-5">
                    <p className="text-gray-700 leading-relaxed">{selectedEvent.description}</p>
                </div>
              )}

                {/* Contato */}
                {selectedEvent.organizador_nome && (
                  <div className="text-sm text-gray-500">
                    Organizado por: <span className="font-medium text-gray-700">{selectedEvent.organizador_nome}</span>
                </div>
              )}

                {/* Botões de Ação */}
                <div className="flex flex-wrap gap-3 pt-2">
                {selectedEvent.site_oficial && (
                    <Button asChild size="lg" className="bg-ms-primary-blue hover:bg-ms-primary-blue/90 rounded-full">
                      <a href={selectedEvent.site_oficial} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Visitar Site Oficial
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                  </Button>
                )}
                  {selectedEvent.organizador_telefone && (
                    <Button variant="outline" size="lg" asChild className="rounded-full border-2">
                      <a href={`https://wa.me/55${selectedEvent.organizador_telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                        <Phone className="w-4 h-4 mr-2" />
                        WhatsApp
                      </a>
                  </Button>
                )}
              </div>
              </div>
        </div>
      )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventCalendar;
