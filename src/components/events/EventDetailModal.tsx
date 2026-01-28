/**
 * Modal de Detalhes do Evento - Versão Profissional
 * 
 * FUNCIONALIDADE: Exibe detalhes completos de um evento com suporte inteligente para mídia
 * PRIORIDADE DE MÍDIA: 1) Vídeo YouTube 2) Logo do evento 3) Imagem 4) Gradiente com ícone
 */

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Globe,
  Phone,
  ExternalLink,
  Star,
  Mail,
  Share2,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { optimizeModalImage } from '@/utils/imageOptimization';

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

interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
  getTranslatedName?: (event: EventItem) => string;
  getTranslatedDescription?: (event: EventItem) => string;
  getTranslatedLocation?: (event: EventItem) => string;
}

// Mapeamentos de regiões
const regionColors: Record<string, string> = {
  'pantanal': 'from-blue-600 to-cyan-600',
  'bonito-serra-bodoquena': 'from-green-600 to-emerald-600',
  'vale-aguas': 'from-purple-600 to-indigo-600',
  'vale-apore': 'from-orange-600 to-red-600',
  'rota-norte': 'from-yellow-600 to-amber-600',
  'caminhos-fronteira': 'from-teal-600 to-cyan-600',
  'costa-leste': 'from-indigo-600 to-purple-600',
  'grande-dourados': 'from-lime-600 to-green-600',
  'descubra-ms': 'from-ms-primary-blue to-ms-discovery-teal'
};

const regionEmojis: Record<string, string> = {
  'pantanal': '🐊',
  'bonito-serra-bodoquena': '🏔️',
  'vale-aguas': '💧',
  'vale-apore': '🏞️',
  'rota-norte': '🧭',
  'caminho-ipes': '',
  'caminhos-fronteira': '🌎',
  'costa-leste': '🌊',
  'grande-dourados': '🌾',
  'descubra-ms': '🇧🇷'
};

const regionNames: Record<string, string> = {
  'pantanal': 'Pantanal',
  'bonito-serra-bodoquena': 'Bonito-Serra da Bodoquena',
  'vale-aguas': 'Vale das Águas',
  'vale-apore': 'Vale do Aporé',
  'rota-norte': 'Rota Norte',
  'caminhos-fronteira': 'Caminhos da Fronteira',
  'costa-leste': 'Costa Leste',
  'grande-dourados': 'Grande Dourados',
  'descubra-ms': 'Descubra MS'
};

const regionMappings: Record<string, string[]> = {
  'pantanal': ['corumbá', 'ladário', 'aquidauana', 'miranda', 'anastácio'],
  'bonito-serra-bodoquena': ['bonito', 'bodoquena', 'jardim', 'bela vista', 'caracol', 'guia lopes', 'nioaque', 'porto murtinho'],
  'vale-aguas': ['nova andradina', 'angélica', 'batayporã', 'ivinhema', 'jateí', 'novo horizonte do sul', 'taquarussu'],
  'vale-apore': ['cassilândia', 'chapadão do sul', 'inocência'],
  'rota-norte': ['coxim', 'alcinópolis', 'bandeirantes', 'camapuã', 'costa rica', 'figueirão', 'paraíso das águas', 'pedro gomes', 'rio verde de mato grosso', 'são gabriel do oeste', 'sonora'],
  'caminhos-fronteira': ['ponta porã', 'antônio joão', 'laguna carapã'],
  'costa-leste': ['três lagoas', 'água clara', 'aparecida do taboado', 'bataguassu', 'brasilândia', 'paranaíba', 'santa rita do pardo'],
  'grande-dourados': ['dourados', 'caarapó', 'deodápolis', 'douradina', 'fátima do sul', 'glória de dourados', 'itaporã', 'maracaju', 'rio brilhante', 'vicentina']
};

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  getTranslatedName = (e) => e.name,
  getTranslatedDescription = (e) => e.description,
  getTranslatedLocation = (e) => e.location
}) => {
  if (!event) return null;

  // Determinar região turística
  const getTouristRegionSlug = (): string => {
    if (event.tourist_region?.slug) {
      return event.tourist_region.slug;
    }
    
    const locationLower = (event.location || '').toLowerCase();
    for (const [region, cities] of Object.entries(regionMappings)) {
      if (cities.some(city => locationLower.includes(city))) {
        return region;
      }
    }
    return 'descubra-ms';
  };

  const touristRegion = getTouristRegionSlug();
  const touristRegionName = event.tourist_region?.name || regionNames[touristRegion] || regionNames['descubra-ms'];
  const gradientColor = regionColors[touristRegion] || regionColors['descubra-ms'];
  const emoji = regionEmojis[touristRegion] || regionEmojis['descubra-ms'];

  // Formatar data
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  // Extrair ID do YouTube
  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    return null;
  };

  // Compartilhar evento
  const handleShare = async () => {
    const shareData = {
      title: getTranslatedName(event),
      text: `Confira o evento: ${getTranslatedName(event)} em ${getTranslatedLocation(event)}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Renderizar mídia do hero
  const renderHeroMedia = () => {
    const embedUrl = event.video_url ? getYouTubeEmbedUrl(event.video_url) : null;

    // Caso 1: Vídeo YouTube disponível
    if (embedUrl) {
      return (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          title="Vídeo do evento"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      );
    }

    // Caso 2: Logo do evento disponível (sem vídeo) - prioridade sobre image_url
    if (event.logo_evento) {
      const optimizedUrl = optimizeModalImage(event.logo_evento);
      console.log('🖼️ [EventDetailModal] Renderizando logo no hero:', {
        eventId: event.id,
        eventName: event.name,
        logoOriginal: event.logo_evento,
        logoOtimizada: optimizedUrl,
        isSupabaseUrl: event.logo_evento.includes('supabase.co'),
        timestamp: new Date().toISOString()
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EventDetailModal.tsx:206',message:'Renderizando logo no hero do modal',data:{eventId:event.id,eventName:event.name,logoOriginal:event.logo_evento,logoOtimizada:optimizedUrl,isSupabaseUrl:event.logo_evento.includes('supabase.co')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      return (
        <img
          src={optimizedUrl}
          alt={getTranslatedName(event)}
          className="w-full h-full object-cover"
          onLoad={(e) => {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EventDetailModal.tsx:onLoad-hero',message:'Logo carregada no hero do modal',data:{src:e.currentTarget.src,complete:e.currentTarget.complete,naturalWidth:e.currentTarget.naturalWidth,naturalHeight:e.currentTarget.naturalHeight,eventId:event.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
            // #endregion
          }}
          onError={(e) => {
            console.error('❌ [EventDetailModal] Erro ao carregar logo no hero:', {
              eventId: event.id,
              eventName: event.name,
              url: optimizedUrl,
              originalUrl: event.logo_evento
            });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EventDetailModal.tsx:onError-hero',message:'Erro ao carregar logo no hero',data:{src:e.currentTarget.src,attemptedSrc:optimizedUrl,originalUrl:event.logo_evento,eventId:event.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
            // #endregion
            const target = e.target as HTMLImageElement;
            // Tentar sem otimização como fallback
            if (target.src !== event.logo_evento) {
              target.src = event.logo_evento;
            }
          }}
        />
      );
    }

    // Caso 3: Apenas imagem (fallback)
    if (event.image_url) {
      return (
        <img
          src={optimizeModalImage(event.image_url)}
          alt={getTranslatedName(event)}
          className="w-full h-full object-cover"
        />
      );
    }

    // Caso 4: Nenhuma mídia - gradiente com ícone
    return (
      <div className={`w-full h-full bg-gradient-to-br ${gradientColor} flex items-center justify-center`}>
        <div className="text-center">
          <Calendar className="w-20 h-20 text-white/40 mx-auto mb-4" />
          <p className="text-white/60 text-lg font-medium">{touristRegionName}</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0 overflow-hidden rounded-2xl shadow-2xl border-0 bg-white [&>button]:hidden">
        <div className="relative max-h-[95vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          {/* Botão fechar customizado */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero com mídia */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            {renderHeroMedia()}
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
            
            {/* Badge Em Destaque */}
            {event.is_sponsored && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-3 py-1.5 shadow-lg">
                  <Star className="w-3.5 h-3.5 mr-1.5 fill-white" />
                  <span className="font-semibold text-sm">Em Destaque</span>
                </Badge>
              </div>
            )}

            {/* Título no overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg leading-tight">
                {getTranslatedName(event)}
              </h2>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6 space-y-6">
            {/* Grid de informações principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Data e Horário */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 mb-3">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">Data e Horário</span>
                </div>
                <p className="text-gray-800 font-medium">{formatDate(event.start_date)}</p>
                {event.end_date && event.end_date !== event.start_date && (
                  <p className="text-gray-600 text-sm mt-1">até {formatDate(event.end_date)}</p>
                )}
                {event.start_time && (
                  <div className="flex items-center gap-2 mt-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {event.start_time}
                      {event.end_time && ` - ${event.end_time}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Localização */}
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center gap-2 text-green-700 mb-3">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">Localização</span>
                </div>
                <p className="text-gray-800 font-medium">{getTranslatedLocation(event)}</p>
              </div>
            </div>

            {/* Logo/Banner do Evento */}
            {event.logo_evento && (
              <div className="py-6">
                {(() => {
                  const optimizedUrl = optimizeModalImage(event.logo_evento);
                  console.log('🖼️ [EventDetailModal] Renderizando logo na seção:', {
                    eventId: event.id,
                    eventName: event.name,
                    logoOriginal: event.logo_evento,
                    logoOtimizada: optimizedUrl,
                    isSupabaseUrl: event.logo_evento.includes('supabase.co'),
                    timestamp: new Date().toISOString()
                  });
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EventDetailModal.tsx:312',message:'Renderizando logo na seção do modal',data:{eventId:event.id,eventName:event.name,logoOriginal:event.logo_evento,logoOtimizada:optimizedUrl,isSupabaseUrl:event.logo_evento.includes('supabase.co')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'K'})}).catch(()=>{});
                  // #endregion
                  return (
                    <img
                      src={optimizedUrl}
                      alt={`Logo do evento ${getTranslatedName(event)}`}
                      className="w-full h-auto object-contain rounded-xl"
                      onLoad={(e) => {
                        // #region agent log
                        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EventDetailModal.tsx:onLoad-section',message:'Logo carregada na seção do modal',data:{src:e.currentTarget.src,complete:e.currentTarget.complete,naturalWidth:e.currentTarget.naturalWidth,naturalHeight:e.currentTarget.naturalHeight,eventId:event.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'L'})}).catch(()=>{});
                        // #endregion
                      }}
                      onError={(e) => {
                        console.error('❌ [EventDetailModal] Erro ao carregar logo na seção:', {
                          eventId: event.id,
                          eventName: event.name,
                          url: optimizedUrl,
                          originalUrl: event.logo_evento
                        });
                        // #region agent log
                        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EventDetailModal.tsx:onError-section',message:'Erro ao carregar logo na seção',data:{src:e.currentTarget.src,attemptedSrc:optimizedUrl,originalUrl:event.logo_evento,eventId:event.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'M'})}).catch(()=>{});
                        // #endregion
                        const target = e.target as HTMLImageElement;
                        // Tentar sem otimização como fallback
                        if (target.src !== event.logo_evento) {
                          target.src = event.logo_evento;
                        }
                      }}
                    />
                  );
                })()}
              </div>
            )}

            {/* Descrição */}
            {getTranslatedDescription(event) && (
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">Sobre o Evento</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {getTranslatedDescription(event)}
                </p>
              </div>
            )}

            {/* Organizador */}
            {event.organizador_nome && (
              <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                <div className="flex items-center gap-2 text-purple-700 mb-3">
                  <User className="w-5 h-5" />
                  <span className="font-semibold">Organização</span>
                </div>
                <p className="text-gray-800 font-medium">{event.organizador_nome}</p>
                {event.organizador_email && (
                  <a 
                    href={`mailto:${event.organizador_email}`}
                    className="flex items-center gap-2 text-gray-600 text-sm mt-2 hover:text-purple-600 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {event.organizador_email}
                  </a>
                )}
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 justify-center">
              {event.site_oficial && (
                <Button
                  asChild
                  size="lg"
                  className="bg-ms-primary-blue hover:bg-ms-primary-blue/90 rounded-xl flex-1 sm:flex-initial max-w-[200px]"
                >
                  <a
                    href={event.site_oficial}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    Site Oficial
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}

              {event.organizador_telefone && (
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="rounded-xl border-2 border-green-500 text-green-600 hover:bg-green-50 flex-1 sm:flex-initial max-w-[200px]"
                >
                  <a
                    href={`https://wa.me/55${event.organizador_telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    WhatsApp
                  </a>
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                onClick={handleShare}
                className="rounded-xl border-2 flex-1 sm:flex-initial max-w-[200px]"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailModal;
