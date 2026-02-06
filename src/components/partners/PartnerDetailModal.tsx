import React, { useState, useEffect } from 'react';
import { Partner } from '@/hooks/usePartners';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, MapPin, ExternalLink, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface PartnerDetailModalProps {
  partner: Partner | null;
  open: boolean;
  onClose: () => void;
}

export function PartnerDetailModal({ partner, open, onClose }: PartnerDetailModalProps) {
  if (!partner) return null;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Resetar estado do vídeo quando o modal é fechado ou reaberto
  useEffect(() => {
    if (!open) {
      setVideoPlaying(false);
      
    }
  }, [open]);

  const allImages = [
    partner.logo_url,
    ...(partner.gallery_images || [])
  ].filter(Boolean) as string[];

  const getYouTubeVideoId = (url: string): string | null => {

    if (!url || typeof url !== 'string') {
      return null;
    }

    // Padrões mais abrangentes para capturar diferentes formatos de URL do YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        
        return match[1];
      }
    }

    return null;
  };

  const getYouTubeEmbedUrl = (videoId: string, autoplay: boolean = false): string => {
    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=${autoplay ? 1 : 0}&controls=1&enablejsapi=1&origin=${window.location.origin}`;
    
    return embedUrl;
  };

  const getYouTubeThumbnailUrl = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const youtubeVideoId = partner.youtube_url ? getYouTubeVideoId(partner.youtube_url) : null;

  // Log quando videoPlaying muda (após youtubeVideoId ser definido)
  useEffect(() => {
    
  }, [videoPlaying, youtubeVideoId]);

  const openLightbox = (index: number) => {
    setLightboxImageIndex(index);
    setLightboxOpen(true);
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

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl [&>button]:hidden">
          <div className="relative max-h-[90vh] overflow-y-auto">
            {/* Header com vídeo/imagem - similar a eventos */}
            <div className="relative h-72 bg-gradient-to-br from-ms-primary-blue to-ms-discovery-teal flex-shrink-0">
              {youtubeVideoId ? (
                videoPlaying ? (
                  <iframe
                    src={getYouTubeEmbedUrl(youtubeVideoId, true)}
                    className="w-full h-full pointer-events-auto"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    title={`Vídeo de ${partner.name}`}
                    frameBorder="0"
                    onError={(e) => {
                      
                      console.error('Erro ao carregar vídeo do YouTube:', youtubeVideoId);
                    }}
                    onLoad={() => {
                      
                    }}
                  />
                ) : (
                  <div 
                    className="relative w-full h-full cursor-pointer group pointer-events-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      setVideoPlaying(true);
                      
                    }}
                    onMouseDown={(e) => {
                      
                    }}
                  >
                    <img
                      src={getYouTubeThumbnailUrl(youtubeVideoId)}
                      alt={`Thumbnail do vídeo de ${partner.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        
                        console.error('Erro ao carregar thumbnail do YouTube:', youtubeVideoId);
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform">
                        <Play className="w-12 h-12 text-white ml-1" />
                      </div>
                    </div>
                  </div>
                )
              ) : partner.logo_url ? (
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Globe className="w-24 h-24 text-white/30" />
                </div>
              )}

              {/* Overlay gradient - não bloqueia cliques */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

              {/* Título e endereço no overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                  {partner.name}
                </h2>
                {partner.address && (
                  <p className="text-white/90 flex items-center gap-2 drop-shadow">
                    <MapPin className="w-4 h-4" />
                    {partner.address}
                  </p>
                )}
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6">
              {/* Descrição */}
              {partner.description && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-lg">Sobre</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">{partner.description}</p>
                  </div>
                </div>
              )}

              {/* Galeria de Fotos - Grid como destinos */}
              {allImages.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-lg">Galeria de Fotos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {allImages.map((image, index) => {
                      
                      const optimizedImageUrl = image && typeof image === 'string' && image.includes('supabase.co') 
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
                            alt={`${partner.name} - Foto ${index + 1}`}
                            className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-300"
                            loading="lazy"
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

              {/* Informações de contato/localização */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partner.address && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-ms-primary-blue" />
                      Localização
                    </h3>
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <p className="text-gray-700 font-medium">{partner.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button
                  size="lg"
                  className="bg-ms-primary-blue hover:bg-ms-primary-blue/90 rounded-full flex-1"
                  onClick={() => {
                    
                    const newWindow = window.open(reservationUrl, '_blank');
                    
                  }}
                >
                  Reservar Agora
                </Button>
                {partner.website_url && (
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="rounded-full border-2"
                  >
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Visitar Site
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox Modal - igual a destinos */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent 
          className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-transparent border-none shadow-none m-0"
          hideOverlay={true}
        >
          <DialogTitle className="sr-only">
            Galeria de Fotos - {partner.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Visualizador de imagens da galeria. Use as setas ou teclas do teclado para navegar entre as imagens.
          </DialogDescription>
          
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
            {/* Imagem */}
            <img
              src={(() => {
                const imgUrl = allImages[lightboxImageIndex];
                
                if (imgUrl && typeof imgUrl === 'string' && imgUrl.includes('supabase.co')) {
                  return imgUrl.split('?')[0] + '?width=1920&quality=95';
                }
                return imgUrl;
              })()}
              alt={`${partner.name} - Foto ${lightboxImageIndex + 1}`}
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
    </>
  );
}

export default PartnerDetailModal;
