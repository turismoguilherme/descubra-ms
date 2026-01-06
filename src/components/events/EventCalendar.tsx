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
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Clock,
  User,
  Sparkles,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePersonalization } from '@/hooks/usePersonalization';
import { useLanguage } from '@/hooks/useLanguage';

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
  logo_evento?: string;
  is_sponsored: boolean;
  site_oficial?: string;
  video_url?: string;
  organizador_telefone?: string;
  organizador_email?: string;
  organizador_nome?: string;
  tourist_region_id?: string;
  tourist_region?: {
    id: string;
    name: string;
    slug: string;
    color: string;
    color_hover: string;
  };
}

const EventCalendar: React.FC<EventCalendarProps> = ({ autoLoad = true }) => {
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [translations, setTranslations] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [showPersonalization, setShowPersonalization] = useState(true);
  const { language } = useLanguage();
  
  // Personalização baseada no perfil
  const { eventFilters, personalizationMessage, isPersonalized } = usePersonalization();
  
  // Aplicar sugestões de personalização
  useEffect(() => {
    if (eventFilters && isPersonalized && !searchTerm && selectedRegion === 'all') {
      // Sugerir cidade, mas não aplicar automaticamente
      // O usuário pode ver a sugestão e aplicar se quiser
    }
  }, [eventFilters, isPersonalized, searchTerm, selectedRegion]);

  useEffect(() => {
    if (autoLoad) {
      loadAllEvents();
    }
  }, [autoLoad]);

  // Buscar traduções quando idioma ou eventos mudarem
  useEffect(() => {
    const loadTranslations = async () => {
      if (language === 'pt-BR' || allEvents.length === 0) {
        setTranslations(new Map());
        return;
      }

      try {
        const { eventTranslationService } = await import('@/services/translation/EventTranslationService');
        const translationMap = new Map();

        // Buscar traduções para todos os eventos em paralelo
        const translationPromises = allEvents.map(async (event) => {
          try {
            const translation = await eventTranslationService.getTranslation(event.id, language);
            if (translation) {
              translationMap.set(event.id, translation);
            }
          } catch (error) {
            console.error(`Erro ao buscar tradução para evento ${event.id}:`, error);
          }
        });

        await Promise.all(translationPromises);
        setTranslations(translationMap);
      } catch (error) {
        console.error('Erro ao carregar traduções:', error);
      }
    };

    loadTranslations();
  }, [allEvents, language]);

  // Helper para obter nome traduzido
  const getTranslatedName = (event: EventItem) => {
    if (language === 'pt-BR') return event.name;
    const translation = translations.get(event.id);
    return translation?.name || event.name;
  };

  // Helper para obter descrição traduzida
  const getTranslatedDescription = (event: EventItem) => {
    if (language === 'pt-BR') return event.description;
    const translation = translations.get(event.id);
    return translation?.description || event.description;
  };

  // Helper para obter localização traduzida
  const getTranslatedLocation = (event: EventItem) => {
    if (language === 'pt-BR') return event.location;
    const translation = translations.get(event.id);
    return translation?.location || event.location;
  };

  const loadAllEvents = async () => {
    setLoading(true);
    try {
      // Usar fetch direto (workaround para problema com cliente Supabase)
      const SUPABASE_URL = "https://hvtrpkbjgbuypkskqcqm.supabase.co";
      const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q";

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/events?is_visible=eq.true&select=*,tourist_region:tourist_regions(id,name,slug,color,color_hover)`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          }
        }
      );

      if (!response.ok) {
        console.error("Erro ao carregar eventos");
        setLoading(false);
        return;
      }

      const data = await response.json();

      const events: EventItem[] = (data || []).map((event: any) => {
        try {
          return {
            id: event.id,
            name: event.name || '',
            description: event.description || '',
            start_date: event.start_date,
            end_date: event.end_date,
            start_time: event.start_time,
            end_time: event.end_time,
            location: event.location || '',
            image_url: event.image_url,
            logo_evento: event.logo_evento,
            is_sponsored: event.is_sponsored && (event.sponsor_payment_status === 'paid' || !event.sponsor_payment_status), // Fix: tratar caso onde sponsor_payment_status não existe
            site_oficial: event.site_oficial,
            video_url: event.video_url,
            organizador_telefone: event.organizador_telefone,
            organizador_email: event.organizador_email,
            organizador_nome: event.organizador_nome,
            tourist_region_id: event.tourist_region_id,
            tourist_region: event.tourist_region || null,
          };
        } catch (error) {
          console.error('Erro ao mapear evento:', error, event);
          return null;
        }
      }).filter((event): event is EventItem => event !== null);

      // Ordenar: patrocinados primeiro, depois por data
      events.sort((a, b) => {
        if (a.is_sponsored && !b.is_sponsored) return -1;
        if (!a.is_sponsored && b.is_sponsored) return 1;
        try {
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        } catch {
          return 0;
        }
      });

      setAllEvents(events);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      setAllEvents([]); // Garantir que não fique undefined
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = (allEvents || []).filter(event => {
    if (!event || !event.name) return false; // Validar evento antes de processar
    
    try {
      const matchesSearch = !searchTerm || 
        (event.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.location || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por região turística - usar tourist_region.slug se disponível, senão fallback para mapeamento por cidade
      let matchesRegion = selectedRegion === 'all';
      if (!matchesRegion) {
        // Prioridade 1: usar tourist_region.slug se disponível
        if (event.tourist_region?.slug) {
          matchesRegion = event.tourist_region.slug === selectedRegion;
        } 
        // Prioridade 2: usar tourist_region_id se disponível (buscar slug correspondente)
        else if (event.tourist_region_id) {
          // Se temos tourist_region_id mas não temos o objeto completo, usar fallback
          // Mas como já buscamos com join, devemos ter o objeto
          matchesRegion = false; // Se não temos slug, não podemos fazer match direto
        }
        // Fallback: mapeamento por cidade (para eventos antigos sem tourist_region_id)
        if (!matchesRegion && selectedRegion in regionCities) {
          const cities = regionCities[selectedRegion];
          matchesRegion = cities.some(city => 
            (event.location || '').toLowerCase().includes(city.toLowerCase())
          );
        }
      }
      
      return matchesSearch && matchesRegion;
    } catch (error) {
      return false; // Excluir eventos com erro
    }
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

    // Padrões mais abrangentes para URLs do YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    return null;
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

  const EventCard = ({ event, showBadge = false }: { event: EventItem; showBadge?: boolean }) => {
    
    // Função para determinar a região turística (do banco ou baseada na localização)
    const getTouristRegion = () => {
      try {
        // Se o evento já tem uma região associada no banco, usar ela
        if (event?.tourist_region) {
          return event.tourist_region.slug;
        }

        // Fallback: detectar baseada na localização
        const locationLower = (event?.location || '').toLowerCase();
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

        return 'descubra-ms'; // Fallback
      } catch (error) {
        return 'descubra-ms'; // Fallback seguro
      }
    };

    const touristRegion = getTouristRegion();

    // Cores por região turística
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
        <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${regionColors[touristRegion as keyof typeof regionColors] || regionColors['descubra-ms']}`}>
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
          {/* Badge da Região Turística */}
          <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <span>{regionEmojis[touristRegion as keyof typeof regionEmojis] || regionEmojis['descubra-ms']}</span>
            <span>{regionNames[touristRegion as keyof typeof regionNames] || regionNames['descubra-ms']}</span>
          </div>
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
  };

  return (
    <div className="space-y-8">
      {/* Personalização - Alerta */}
      {isPersonalized && showPersonalization && personalizationMessage && (
        <Alert className="bg-gradient-to-r from-ms-primary-blue/10 to-ms-discovery-teal/10 border-ms-primary-blue/30">
          <Sparkles className="h-4 w-4 text-ms-primary-blue" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong className="text-ms-primary-blue">{personalizationMessage.title}</strong>
              <p className="text-sm text-gray-700 mt-1">{personalizationMessage.description}</p>
              {eventFilters?.suggestedCity && (
                <p className="text-xs text-gray-600 mt-1">
                  💡 Sugestão: Eventos em {eventFilters.suggestedCity}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPersonalization(false)}
              className="ml-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
        <Link to="/descubrams/cadastrar-evento">
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

      {/* Modal de Detalhes - MELHORADO */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] p-0 overflow-hidden rounded-3xl shadow-2xl [&>button]:hidden border-0">
          {selectedEvent && (() => {
            // Usar tourist_region do evento se disponível, senão calcular pela localização
            const getTouristRegionSlug = () => {
              if (selectedEvent.tourist_region?.slug) {
                return selectedEvent.tourist_region.slug;
              }
              
              // Fallback: calcular pela localização
              const locationLower = (selectedEvent.location || '').toLowerCase();
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

            const touristRegion = getTouristRegionSlug();
            
            // Definir mapeamentos de regiões
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
            
            const touristRegionName = selectedEvent.tourist_region?.name || regionNames[touristRegion as keyof typeof regionNames] || regionNames['descubra-ms'];
            
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

            const regionDescriptions = {
              'pantanal': 'A maior planície alagável do mundo, santuário de vida selvagem com onças-pintadas, ariranhas e mais de 650 espécies de aves.',
              'bonito-serra-bodoquena': 'Paraíso das águas cristalinas, cachoeiras e grutas. Experiência única de mergulho em rios e contato com a natureza.',
              'vale-aguas': 'Região de águas termais e cachoeiras, com cultura rica e tradições preservadas.',
              'vale-apore': 'Terra de belezas naturais exuberantes, com serras, vales e uma cultura profundamente enraizada.',
              'rota-norte': 'Rota de descobertas que conecta diferentes ecossistemas, da fauna à cultura local.',
              'caminho-ipes': 'Rota histórica que floresce na primavera, conectando cidades com riquezas culturais e naturais.',
              'caminhos-fronteira': 'Região de fronteira viva, com história rica e cultura diversificada.',
              'costa-leste': 'Costa verde com praias paradisíacas, cultura caiçara e belezas naturais deslumbrantes.',
              'grande-dourados': 'Região produtiva com história rica, cultura diversificada e belezas naturais.',
              'descubra-ms': 'Descubra toda a diversidade turística de Mato Grosso do Sul.'
            };

            return (
              <div className="relative max-h-[95vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {/* Header com imagem/vídeo - melhorado visualmente */}
                <div className={`relative h-72 md:h-96 bg-gradient-to-br ${regionColors[touristRegion as keyof typeof regionColors] || regionColors['descubra-ms']} flex-shrink-0 overflow-hidden shadow-lg`}>
                  {(() => {
                    console.log('🔍 Evento selecionado:', {
                      id: selectedEvent.id,
                      name: selectedEvent.name,
                      video_url: selectedEvent.video_url,
                      logo_evento: selectedEvent.logo_evento,
                      image_url: selectedEvent.image_url,
                      hasVideo: !!selectedEvent.video_url,
                      embedUrl: selectedEvent.video_url ? getYouTubeEmbedUrl(selectedEvent.video_url) : null
                    });

                    const embedUrl = selectedEvent.video_url ? getYouTubeEmbedUrl(selectedEvent.video_url) : null;

                    if (selectedEvent.video_url && embedUrl) {
                      console.log('🎥 Exibindo vídeo:', embedUrl);
                      return (
                        <iframe
                          src={embedUrl}
                          className="w-full h-full object-cover"
                          allowFullScreen
                          title="Vídeo do evento"
                        />
                      );
                    } else if (selectedEvent.logo_evento || selectedEvent.image_url) {
                      const imageSrc = selectedEvent.logo_evento || selectedEvent.image_url;
                      console.log('🖼️ Exibindo imagem:', imageSrc);
                      return (
                        <img
                          src={imageSrc}
                          alt={getTranslatedName(selectedEvent)}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      );
                    } else {
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="w-16 h-16 md:w-24 md:h-24 text-white/30" />
                    </div>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Badges no topo - melhorados */}
                  <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 z-10">
                    {/* Badge destaque */}
                    {selectedEvent.is_sponsored && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-4 py-1.5 shadow-lg animate-pulse">
                        <Star className="w-4 h-4 mr-1.5 fill-white" />
                        <span className="font-semibold">Em Destaque</span>
                      </Badge>
                    )}

                    {/* Badge da região turística */}
                    <Badge className="bg-white/90 backdrop-blur-md text-gray-800 border-0 px-4 py-1.5 shadow-lg font-semibold">
                      <span className="mr-2 text-lg">{regionEmojis[touristRegion as keyof typeof regionEmojis] || regionEmojis['descubra-ms']}</span>
                      <span>{touristRegionName}</span>
                    </Badge>
                  </div>

                  {/* Título e região no overlay - melhorado */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-2xl leading-tight">
                      {getTranslatedName(selectedEvent)}
                    </h2>
                    <p className="text-white/95 text-sm md:text-base drop-shadow-lg line-clamp-2 font-medium">
                      {regionDescriptions[touristRegion as keyof typeof regionDescriptions] || regionDescriptions['descubra-ms']}
                    </p>
                  </div>
                </div>

                {/* Conteúdo - melhorado */}
                <div className="p-6 md:p-8 space-y-6 md:space-y-8 bg-gradient-to-b from-white to-gray-50">
                  {/* Informações principais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <p className="text-gray-700 font-medium">{getTranslatedLocation(selectedEvent)}</p>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {touristRegionName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Descrição */}
                  {getTranslatedDescription(selectedEvent) && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900">Sobre o Evento</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">{getTranslatedDescription(selectedEvent)}</p>
                      </div>
                    </div>
                  )}

                  {/* Informações do organizador */}
                  {selectedEvent.organizador_nome && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-ms-primary-blue" />
                        Organização
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700">
                          <span className="font-medium">Organizado por:</span> {selectedEvent.organizador_nome}
                        </p>
                        {selectedEvent.organizador_email && (
                          <p className="text-gray-600 text-sm mt-2">
                            <span className="font-medium">Email:</span> {selectedEvent.organizador_email}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Botões de Ação - melhorados */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    {selectedEvent.site_oficial && (
                      <Button 
                        asChild 
                        size="lg" 
                        className="bg-ms-primary-blue hover:bg-ms-primary-blue/90 rounded-full transition-all duration-300 hover:scale-105 flex-1 sm:flex-initial"
                      >
                        <a href={selectedEvent.site_oficial} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                          <Globe className="w-4 h-4 mr-2" />
                          Visitar Site Oficial
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    )}
                    {selectedEvent.organizador_telefone && (
                      <Button 
                        variant="outline" 
                        size="lg" 
                        asChild 
                        className="rounded-full border-2 transition-all duration-300 hover:scale-105 flex-1 sm:flex-initial"
                      >
                        <a href={`https://wa.me/55${selectedEvent.organizador_telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                          <Phone className="w-4 h-4 mr-2" />
                          WhatsApp
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventCalendar;
