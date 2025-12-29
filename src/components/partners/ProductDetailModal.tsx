import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Play, ChevronLeft, ChevronRight, Users, DollarSign, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PartnerPricing {
  id: string;
  service_name: string;
  pricing_type: 'fixed' | 'per_person' | 'per_night' | 'package';
  base_price: number;
  price_per_person?: number;
  price_per_night?: number;
  min_guests: number;
  max_guests?: number;
  description?: string;
  gallery_images?: string[];
  youtube_url?: string;
}

interface ProductDetailModalProps {
  product: PartnerPricing | null;
  open: boolean;
  onClose: () => void;
  onSelect: (productId: string) => void;
  isSelected?: boolean;
}

export function ProductDetailModal({ product, open, onClose, onSelect, isSelected = false }: ProductDetailModalProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Resetar estado do vídeo quando o modal é fechado
  useEffect(() => {
    if (!open) {
      setVideoPlaying(false);
    }
  }, [open]);

  if (!product) return null;

  const allImages = (product.gallery_images || []).filter(Boolean) as string[];

  // Funções para manipular vídeo do YouTube
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const getYouTubeEmbedUrl = (videoId: string, autoplay: boolean = false): string => {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=${autoplay ? 1 : 0}&controls=1&enablejsapi=1&origin=${window.location.origin}`;
  };

  const getYouTubeThumbnailUrl = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const youtubeVideoId = product.youtube_url ? getYouTubeVideoId(product.youtube_url) : null;

  const openLightbox = (index: number) => {
    setLightboxImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setLightboxImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleSelectProduct = () => {
    onSelect(product.id);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-ms-primary-blue">
              {product.service_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header com Vídeo ou Imagem Principal */}
            <div className="relative h-72 overflow-hidden rounded-lg bg-gradient-to-br from-ms-primary-blue/10 to-ms-discovery-teal/10">
              {youtubeVideoId && !videoPlaying ? (
                <div className="relative w-full h-full">
                  <img
                    src={getYouTubeThumbnailUrl(youtubeVideoId)}
                    alt={product.service_name}
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer"
                    onClick={() => setVideoPlaying(true)}
                  >
                    <div className="bg-red-600 rounded-full p-4 hover:scale-110 transition-transform">
                      <Play className="w-12 h-12 text-white fill-white" />
                    </div>
                  </div>
                </div>
              ) : youtubeVideoId && videoPlaying ? (
                <iframe
                  src={getYouTubeEmbedUrl(youtubeVideoId, true)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  frameBorder="0"
                />
              ) : allImages.length > 0 ? (
                <img
                  src={allImages[0]}
                  alt={product.service_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `data:image/svg+xml,${encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#e5e7eb"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">Imagem não disponível</text></svg>`)}`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <DollarSign className="w-20 h-20 text-ms-primary-blue/40" />
                </div>
              )}
              
              {/* Badge de Preço */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-ms-primary-blue px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                R$ {product.base_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Informações do Produto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-ms-pantanal-green" />
                    <span className="text-sm text-gray-600">
                      {product.min_guests} {product.min_guests === 1 ? 'pessoa' : 'pessoas'} mín.
                      {product.max_guests && ` • ${product.max_guests} máx.`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-ms-primary-blue" />
                    <span className="text-sm text-gray-600">
                      {product.pricing_type === 'fixed' && 'Preço fixo'}
                      {product.pricing_type === 'per_person' && 'Por pessoa'}
                      {product.pricing_type === 'per_night' && 'Por noite'}
                      {product.pricing_type === 'package' && 'Pacote'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Preço</h3>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-ms-primary-blue">
                    R$ {product.base_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  {product.pricing_type === 'per_person' && product.price_per_person && (
                    <p className="text-sm text-gray-600">
                      + R$ {product.price_per_person.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por pessoa adicional
                    </p>
                  )}
                  {product.pricing_type === 'per_night' && product.price_per_night && (
                    <p className="text-sm text-gray-600">
                      + R$ {product.price_per_night.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por noite adicional
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Descrição */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Galeria de Fotos */}
            {allImages.length > 1 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Galeria de Fotos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {allImages.slice(1).map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                      onClick={() => openLightbox(index + 1)}
                    >
                      <img
                        src={img}
                        alt={`${product.service_name} - Foto ${index + 2}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `data:image/svg+xml,${encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#e5e7eb"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">Imagem não disponível</text></svg>`)}`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botão de Seleção */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Fechar
              </Button>
              <Button
                onClick={handleSelectProduct}
                className={cn(
                  "flex-1 bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white",
                  isSelected && "ring-2 ring-ms-primary-blue ring-offset-2"
                )}
              >
                {isSelected ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Produto Selecionado
                  </>
                ) : (
                  <>
                    Selecionar e Reservar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox para Galeria */}
      {lightboxOpen && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 text-white hover:text-gray-300 z-10"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 text-white hover:text-gray-300 z-10"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}

          <div className="max-w-7xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={allImages[lightboxImageIndex]}
              alt={`${product.service_name} - Foto ${lightboxImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {lightboxImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}

