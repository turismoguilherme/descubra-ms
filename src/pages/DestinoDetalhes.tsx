import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import UniversalLayout from "@/components/layout/UniversalLayout";
import { 
  MapPin, 
  ArrowLeft, 
  Play, 
  Tag, 
  Globe, 
  Instagram, 
  Facebook,
  Phone,
  Mail,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Car,
  Star,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { usePageTracking } from "@/hooks/usePageTracking";

interface Destination {
  id: string;
  name: string;
  description: string;
  location: string;
  region: string;
  image_url: string;
}

interface DestinationDetails {
  id: string;
  promotional_text?: string | null;
  video_url?: string | null;
  video_type?: 'youtube' | 'upload' | null;
  map_latitude?: number | null;
  map_longitude?: number | null;
  tourism_tags?: string[] | null;
  image_gallery?: string[] | null;
  // Novos campos
  official_website?: string | null;
  social_links?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  } | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  highlights?: string[] | null;
  best_time_to_visit?: string | null;
  how_to_get_there?: string | null;
}

const DestinoDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [details, setDetails] = useState<DestinationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  usePageTracking({
    target_id: destination?.id,
    target_name: destination?.name,
  });

  useEffect(() => {
    const fetchDestination = async () => {
      if (!id) return;

      console.log('🏝️ DestinoDetalhes: Buscando destino com ID:', id);

      // Dados mock para demonstração
          const mockDestinations = [
            {
              id: "1",
              name: "Bonito",
              description: "Águas cristalinas e ecoturismo de classe mundial. Explore grutas, rios e cachoeiras em um dos destinos mais preservados do Brasil.",
          location: "Bonito",
              region: "Sudoeste",
              image_url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000"
            },
            {
              id: "2", 
              name: "Pantanal",
              description: "A maior planície alagável do mundo e sua biodiversidade única. Observe onças-pintadas, ariranhas e mais de 650 espécies de aves.",
          location: "Corumbá",
              region: "Pantanal",
              image_url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5"
            },
            {
              id: "3",
              name: "Corumbá", 
              description: "A capital do Pantanal, com rico histórico e cultura. Porto histórico às margens do Rio Paraguai, com forte influência cultural.",
          location: "Corumbá",
              region: "Pantanal",
              image_url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
            },
            {
              id: "4",
              name: "Campo Grande",
              description: "A capital do estado, com atrativos urbanos e culturais. Cidade planejada com amplas avenidas e rica gastronomia regional.",
          location: "Campo Grande", 
              region: "Centro",
              image_url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000"
        },
        {
          id: "5",
          name: "Ponta Porã",
          description: "Fronteira com o Paraguai, ideal para compras e cultura. Cidade gêmea de Pedro Juan Caballero, com comércio intenso.",
          location: "Ponta Porã",
          region: "Sul",
          image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
        },
        {
          id: "6",
          name: "Três Lagoas",
          description: "Praia de água doce e desenvolvimento econômico. Lagoas naturais e artificiais ideais para esportes náuticos.",
          location: "Três Lagoas",
          region: "Leste",
          image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
        }
      ];

      const mockDetails = {
        promotional_text: `Um destino único em Mato Grosso do Sul que oferece experiências inesquecíveis. Com paisagens deslumbrantes e uma rica cultura local, é o lugar perfeito para quem busca aventura, natureza e momentos memoráveis.`,
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              video_type: 'youtube' as const,
              map_latitude: -20.4697,
              map_longitude: -54.6201,
        tourism_tags: ["Ecoturismo", "Aventura", "Natureza", "Cultura"],
              image_gallery: [
          "https://images.unsplash.com/photo-1439066615861-d1af74d74000",
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e"
        ],
        official_website: "https://www.turismo.ms.gov.br",
        social_links: {
          instagram: "https://instagram.com/descubramsoficial",
          facebook: "https://facebook.com/descubramsoficial"
        },
        contact_phone: "(67) 3318-7600",
        contact_email: "turismo@ms.gov.br",
        highlights: ["Flutuação em rios cristalinos", "Cachoeiras paradisíacas", "Grutas e cavernas", "Observação de fauna"],
        best_time_to_visit: "De março a novembro, quando as águas estão mais cristalinas",
        how_to_get_there: "Via aérea pelo Aeroporto de Campo Grande (1h30 de carro) ou Aeroporto de Bonito"
      };

      // Primeiro verifica se é um ID mock simples
      const mockDestination = mockDestinations.find(d => d.id === id);
      if (mockDestination) {
        console.log('🏝️ DestinoDetalhes: Usando dados mock para:', mockDestination.name);
        setDestination(mockDestination);
        setDetails({
          id: mockDestination.id,
          ...mockDetails,
          promotional_text: `Descubra ${mockDestination.name}, ${mockDetails.promotional_text}`
        });
        setLoading(false);
        return;
      }

      // Se não for mock, tenta buscar no Supabase
      try {
        setLoading(true);
        
        const { data: destinationData, error: destError } = await supabase
          .from('destinations')
          .select('*')
          .eq('id', id)
          .single();

        if (destError) {
          console.error('Erro ao buscar destino:', destError);
          // Fallback para mock de Bonito
          const fallbackDestination = mockDestinations[0];
          setDestination(fallbackDestination);
          setDetails({
            id: fallbackDestination.id,
            ...mockDetails,
            promotional_text: `Descubra ${fallbackDestination.name}, ${mockDetails.promotional_text}`
          });
        } else {
          console.log('✅ DestinoDetalhes: Destino encontrado:', destinationData.name);
          setDestination(destinationData);
          
          const { data: detailsData, error: detailsError } = await supabase
            .from('destination_details')
            .select('*')
            .eq('destination_id', id)
            .single();

          if (detailsError) {
            console.warn('⚠️ DestinoDetalhes: Erro ao buscar detalhes:', detailsError);
            console.log('📋 DestinoDetalhes: Usando detalhes mock como fallback');
            // Usa detalhes mock se não encontrar no banco
            setDetails({
              id: destinationData.id,
              ...mockDetails
            });
          } else if (detailsData) {
            console.log('✅ DestinoDetalhes: Detalhes encontrados no banco');
            console.log('📹 DestinoDetalhes: video_url:', detailsData.video_url, '(tipo:', typeof detailsData.video_url, ')');
            console.log('🗺️ DestinoDetalhes: map_latitude:', detailsData.map_latitude, '(tipo:', typeof detailsData.map_latitude, ')');
            console.log('🗺️ DestinoDetalhes: map_longitude:', detailsData.map_longitude, '(tipo:', typeof detailsData.map_longitude, ')');
            console.log('🖼️ DestinoDetalhes: image_gallery:', detailsData.image_gallery?.length || 0, 'imagens');
            console.log('📋 DestinoDetalhes: Dados completos:', JSON.stringify(detailsData, null, 2));
            
            // Garantir que valores null sejam tratados corretamente
            const processedDetails = {
              ...detailsData,
              video_url: detailsData.video_url && detailsData.video_url.trim() ? detailsData.video_url.trim() : null,
              map_latitude: detailsData.map_latitude != null && !isNaN(Number(detailsData.map_latitude)) ? Number(detailsData.map_latitude) : null,
              map_longitude: detailsData.map_longitude != null && !isNaN(Number(detailsData.map_longitude)) ? Number(detailsData.map_longitude) : null,
              video_type: detailsData.video_type as 'youtube' | 'upload' | null,
              social_links: detailsData.social_links || {}
            };
            
            console.log('✅ DestinoDetalhes: Dados processados:', {
              video_url: processedDetails.video_url,
              video_type: processedDetails.video_type,
              map_latitude: processedDetails.map_latitude,
              map_longitude: processedDetails.map_longitude,
            });
            
            // Log específico para debug do vídeo
            if (!processedDetails.video_url && processedDetails.video_type === 'youtube') {
              console.warn('⚠️ DestinoDetalhes: video_url é null mas video_type é youtube!');
            }
            if (processedDetails.video_url) {
              console.log('✅ DestinoDetalhes: Vídeo encontrado:', processedDetails.video_url);
            }
            
            setDetails(processedDetails);
          } else {
            console.log('📋 DestinoDetalhes: Nenhum detalhe encontrado, usando mock');
            // Usa detalhes mock se não encontrar no banco
            setDetails({
              id: destinationData.id,
              ...mockDetails
            });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar destino:', error);
        // Fallback para mock
        const fallbackDestination = mockDestinations[0];
        setDestination(fallbackDestination);
        setDetails({
          id: fallbackDestination.id,
          ...mockDetails
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [id]);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  const allImages = details?.image_gallery && details.image_gallery.length > 0 
    ? details.image_gallery 
    : (destination?.image_url ? [destination.image_url] : []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const openLightbox = (index: number) => {
    setLightboxImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextLightboxImage = () => {
    setLightboxImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevLightboxImage = () => {
    setLightboxImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Navegação por teclado no lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setLightboxImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setLightboxImageIndex((prev) => (prev + 1) % allImages.length);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, allImages.length]);

  if (loading) {
    return (
      <UniversalLayout>
        <main className="flex-grow flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-ms-primary-blue/20"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-ms-primary-blue absolute top-0"></div>
            </div>
            <p className="mt-4 text-gray-600">Carregando destino...</p>
          </div>
        </main>
      </UniversalLayout>
    );
  }

  if (!destination) {
    return (
      <UniversalLayout>
        <main className="flex-grow flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Destino não encontrado</h1>
            <Link to="/descubramatogrossodosul/destinos" className="text-ms-primary-blue hover:underline">
              Voltar para destinos
            </Link>
          </div>
        </main>
      </UniversalLayout>
    );
  }

  return (
    <UniversalLayout>
      <main className="flex-grow">
        {/* Hero com Imagem */}
        <div className="relative h-[60vh] min-h-[400px]">
          <img
            src={(() => {
              const imgUrl = allImages[currentImageIndex] || destination.image_url;
              if (!imgUrl) return '';
              // Adicionar cache busting se for URL do Supabase Storage
              const timestamp = destination.updated_at ? new Date(destination.updated_at).getTime() : Date.now();
              return imgUrl.includes('supabase.co') ? `${imgUrl}?t=${timestamp}` : imgUrl;
            })()}
            alt={destination.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.warn('Erro ao carregar imagem do destino:', allImages[currentImageIndex] || destination.image_url);
              const placeholderSvg = `data:image/svg+xml,${encodeURIComponent(`<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                <rect width="800" height="600" fill="#e5e7eb"/>
                <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
                  Imagem não disponível
                </text>
              </svg>`)}`;
              (e.target as HTMLImageElement).src = placeholderSvg;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Navegação de imagens */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 backdrop-blur-sm text-white p-4 rounded-full hover:bg-white/50 transition-all shadow-lg cursor-pointer"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 backdrop-blur-sm text-white p-4 rounded-full hover:bg-white/50 transition-all shadow-lg cursor-pointer"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
              
              {/* Indicadores */}
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                    className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                      index === currentImageIndex ? 'bg-white scale-125 shadow-lg' : 'bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Ir para imagem ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Conteúdo do Hero */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="ms-container">
                <Link 
                  to="/descubramatogrossodosul/destinos"
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
                >
                <ArrowLeft size={18} className="mr-2" />
                  Voltar para Destinos
                </Link>
              
              {/* Tags */}
              {details?.tourism_tags && details.tourism_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {details.tourism_tags.map((tag, index) => (
                    <Badge key={index} className="bg-ms-secondary-yellow text-black">
                      {tag}
                    </Badge>
                  ))}
              </div>
              )}
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
                {destination.name}
              </h1>
              <p className="text-white/90 flex items-center text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                {destination.location}, {destination.region} - MS
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="bg-gray-50">
        <div className="ms-container py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Descrição - Apenas texto promocional */}
                {details?.promotional_text && (
                  <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-ms-primary-blue mb-4">
                      Sobre {destination.name}
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {details.promotional_text}
                    </p>
                  </div>
                )}

                {/* Destaques */}
                {details?.highlights && details.highlights.length > 0 && (
                  <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-ms-primary-blue mb-6 flex items-center">
                      <Star className="w-6 h-6 mr-2 text-ms-secondary-yellow" />
                      Principais Atrações
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {details.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-start gap-3 bg-ms-primary-blue/5 p-4 rounded-xl">
                          <div className="bg-ms-primary-blue text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                            {index + 1}
                          </div>
                          <span className="text-gray-700 font-medium">{highlight}</span>
                        </div>
                      ))}
                    </div>
                    </div>
                  )}

              {/* Vídeo */}
              {details?.video_url && (
                  <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-ms-primary-blue mb-6 flex items-center">
                      <Play className="w-6 h-6 mr-2" />
                      Vídeo Promocional
                    </h2>
                    <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                        <iframe
                          src={getYouTubeEmbedUrl(details.video_url)}
                          className="w-full h-full"
                          allowFullScreen
                          title={`Vídeo de ${destination.name}`}
                        />
                    </div>
                  </div>
              )}
              
              {/* Debug vídeo - remover depois */}
              {details?.video_url === null && details?.video_type === 'youtube' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                  ⚠️ Debug: video_url está null mas video_type é youtube. Verifique os dados salvos.
                </div>
              )}

                {/* Galeria de Fotos */}
                {allImages.length > 0 && (
                  <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-ms-primary-blue mb-6">
                      Galeria de Fotos
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {allImages.map((image, index) => {
                        // Melhorar qualidade da imagem - remover parâmetros de compressão se houver
                        const optimizedImageUrl = image.includes('supabase.co') 
                          ? image.split('?')[0] + '?width=800&quality=90'
                          : image;
                        
                        return (
                          <div
                            key={index}
                            onClick={() => openLightbox(index)}
                            className="relative group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all bg-gray-100"
                          >
                            <img
                              src={optimizedImageUrl}
                              alt={`${destination.name} - Foto ${index + 1}`}
                              className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              style={{
                                imageRendering: 'high-quality',
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white/95 rounded-full p-3 shadow-lg">
                                  <ChevronRight className="w-5 h-5 text-ms-primary-blue" />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
              )}

              {/* Lightbox Modal - Modal mais compacto e elegante */}
              <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent 
                  className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-transparent border-none shadow-none m-0"
                  hideOverlay={true}
                >
                  <DialogTitle className="sr-only">
                    Galeria de Fotos - {destination.name}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Visualizador de imagens da galeria. Use as setas ou teclas do teclado para navegar entre as imagens.
                  </DialogDescription>
                  
                  {/* Fundo transparente - overlay removido */}
                  
                  {/* Container principal */}
                  <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
                    {/* Botão Fechar removido - usando o X padrão do Dialog */}

                    {/* Imagem */}
                    <img
                      src={(() => {
                        const imgUrl = allImages[lightboxImageIndex];
                        // Melhorar qualidade - remover compressão para imagens do Supabase
                        if (imgUrl.includes('supabase.co')) {
                          return imgUrl.split('?')[0] + '?width=1920&quality=95';
                        }
                        return imgUrl;
                      })()}
                      alt={`${destination.name} - Foto ${lightboxImageIndex + 1}`}
                      className="max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                    />

                    {/* Navegação - Anterior */}
                    {allImages.length > 1 && (
                      <button
                        onClick={prevLightboxImage}
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-50 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full transition-all shadow-lg"
                        aria-label="Imagem anterior"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                    )}

                    {/* Navegação - Próxima */}
                    {allImages.length > 1 && (
                      <button
                        onClick={nextLightboxImage}
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-50 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full transition-all shadow-lg"
                        aria-label="Próxima imagem"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    )}

                    {/* Indicador de posição */}
                    {allImages.length > 1 && (
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white/90 text-gray-900 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                        {lightboxImageIndex + 1} / {allImages.length}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Links Oficiais */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-ms-primary-blue mb-4">
                    Links Oficiais
                  </h3>
                  <div className="space-y-3">
                    {details?.official_website && (
                      <a
                        href={details.official_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <Globe className="w-5 h-5 text-ms-primary-blue" />
                        <span className="text-gray-700">Site Oficial</span>
                        <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                      </a>
                    )}
                    {details?.social_links?.instagram && (
                      <a
                        href={details.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <Instagram className="w-5 h-5 text-pink-600" />
                        <span className="text-gray-700">Instagram</span>
                        <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                      </a>
                    )}
                    {details?.social_links?.facebook && (
                      <a
                        href={details.social_links.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700">Facebook</span>
                        <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                      </a>
                    )}
                    {/* YouTube removido das redes sociais para não confundir com video_url */}
                  </div>
                </div>

                {/* Contato */}
                {(details?.contact_phone || details?.contact_email) && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-ms-primary-blue mb-4">
                      Contato
                    </h3>
                    <div className="space-y-3">
                      {details.contact_phone && (
                        <a
                          href={`tel:${details.contact_phone}`}
                          className="flex items-center gap-3 text-gray-700"
                        >
                          <Phone className="w-5 h-5 text-ms-primary-blue" />
                          {details.contact_phone}
                        </a>
                      )}
                      {details.contact_email && (
                        <a
                          href={`mailto:${details.contact_email}`}
                          className="flex items-center gap-3 text-gray-700"
                        >
                          <Mail className="w-5 h-5 text-ms-primary-blue" />
                          {details.contact_email}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Melhor época */}
                {details?.best_time_to_visit && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-ms-primary-blue mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Melhor Época
                    </h3>
                    <p className="text-gray-600">
                      {details.best_time_to_visit}
                    </p>
                  </div>
                )}

                {/* Como chegar */}
                {details?.how_to_get_there && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-ms-primary-blue mb-3 flex items-center">
                      <Car className="w-5 h-5 mr-2" />
                      Como Chegar
                    </h3>
                    <p className="text-gray-600">
                      {details.how_to_get_there}
                    </p>
                    </div>
              )}

              {/* Mapa */}
              {details?.map_latitude && details?.map_longitude && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-ms-primary-blue mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Localização
                    </h3>
                    <div className="aspect-square rounded-xl overflow-hidden">
                      <iframe
                        src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d50000!2d${details.map_longitude}!3d${details.map_latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1spt-BR!2sbr!4v1`}
                        className="w-full h-full"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Mapa de ${destination.name}`}
                      />
                    </div>
                    <Button
                      className="w-full mt-4 bg-ms-primary-blue hover:bg-ms-primary-blue/90"
                      asChild
                    >
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${details.map_latitude},${details.map_longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Abrir no Google Maps
                      </a>
                    </Button>
                    </div>
                )}
                  </div>
            </div>
          </div>
        </div>
      </main>
    </UniversalLayout>
  );
};

export default DestinoDetalhes;
