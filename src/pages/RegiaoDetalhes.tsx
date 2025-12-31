import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import UniversalLayout from "@/components/layout/UniversalLayout";
import { 
  MapPin, 
  ArrowLeft, 
  Star,
  Play,
  Globe,
  Instagram,
  Facebook,
  Youtube,
  Phone,
  Mail,
  Calendar,
  Car,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getRegionBySlug } from "@/data/touristRegions2025";
import { useTouristRegions } from "@/hooks/useTouristRegions";
import { supabase } from "@/integrations/supabase/client";
import { TouristRegion2025 } from "@/data/touristRegions2025";

interface RegionDetails {
  id: string;
  tourist_region_id: string;
  promotional_text?: string | null;
  video_url?: string | null;
  video_type?: 'youtube' | 'upload' | null;
  map_latitude?: number | null;
  map_longitude?: number | null;
  tourism_tags?: string[] | null;
  image_gallery?: string[] | null;
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

const RegiaoDetalhes = () => {
  const { slug } = useParams<{ slug: string }>();
  const { regions: touristRegions = [] } = useTouristRegions();
  const [regiao, setRegiao] = useState<TouristRegion2025 | null>(null);
  const [regionDbId, setRegionDbId] = useState<string | null>(null);
  const [details, setDetails] = useState<RegionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  
  useEffect(() => {
    const fetchRegion = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        // Primeiro tenta buscar do banco pelo slug
        const { data: dbRegion, error } = await supabase
          .from('tourist_regions')
          .select('id, slug, name, description, color, color_hover, cities, highlights, image_url')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (dbRegion && !error) {
          // Converter dados do banco para formato TouristRegion2025
          const regionData: TouristRegion2025 = {
            id: dbRegion.id,
            name: dbRegion.name,
            slug: dbRegion.slug,
            color: dbRegion.color,
            colorHover: dbRegion.color_hover || dbRegion.color,
            description: dbRegion.description,
            cities: Array.isArray(dbRegion.cities) ? dbRegion.cities : [],
            highlights: Array.isArray(dbRegion.highlights) ? dbRegion.highlights : [],
            image: dbRegion.image_url || '',
          };
          setRegiao(regionData);
          setRegionDbId(dbRegion.id);
          
          // Buscar detalhes da região
          const { data: detailsData } = await supabase
            .from('destination_details')
            .select('*')
            .eq('tourist_region_id', dbRegion.id)
            .single();
          
          if (detailsData) {
            setDetails(detailsData as RegionDetails);
          }
        } else {
          // Fallback para dados do arquivo estático
          const staticRegion = touristRegions.find(r => r.slug === slug) || getRegionBySlug(slug);
          if (staticRegion) {
            setRegiao(staticRegion);
            // Para dados estáticos, não temos ID do banco, então não buscamos detalhes
          }
        }
      } catch (error) {
        console.error('Erro ao buscar região:', error);
        // Fallback para dados estáticos
        const staticRegion = touristRegions.find(r => r.slug === slug) || getRegionBySlug(slug);
        if (staticRegion) {
          setRegiao(staticRegion);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRegion();
  }, [slug, touristRegions]);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  // Imagens: usar galeria se existir, senão usar imagem principal da região
  const allImages = details?.image_gallery && details.image_gallery.length > 0
    ? details.image_gallery
    : (regiao?.image ? [regiao.image] : []);

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
        prevLightboxImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextLightboxImage();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
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
            <p className="mt-4 text-gray-600">Carregando região...</p>
          </div>
        </main>
      </UniversalLayout>
    );
  }

  if (!regiao) {
    return (
      <UniversalLayout>
        <main className="flex-grow flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Região não encontrada</h1>
            <Link to="/descubrams/destinos" className="text-ms-primary-blue hover:underline">
              Voltar para Regiões Turísticas
            </Link>
          </div>
        </main>
      </UniversalLayout>
    );
  }

  // Texto promocional: usar promotional_text dos detalhes se existir, senão usar description da região
  const promotionalText = details?.promotional_text || regiao.description;
  
  // Highlights: usar highlights dos detalhes se existir, senão usar highlights da região
  const displayHighlights = details?.highlights && details.highlights.length > 0
    ? details.highlights
    : (regiao.highlights || []);

  return (
    <UniversalLayout>
      <main className="flex-grow">
        {/* Hero com Imagem */}
        <div className="relative h-[60vh] min-h-[400px]">
          <div 
            className="w-full h-full"
            style={{ backgroundColor: regiao.color }}
          >
            {allImages[currentImageIndex] && (
              <img
                src={allImages[currentImageIndex]}
                alt={regiao.name}
                className="w-full h-full object-cover opacity-80"
                onError={(e) => {
                  console.warn('Erro ao carregar imagem da região:', allImages[currentImageIndex]);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Navegação de imagens (se houver galeria) */}
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
                to="/descubrams/destinos"
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft size={18} className="mr-2" />
                Voltar para Regiões Turísticas
              </Link>
              
              {displayHighlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {displayHighlights.slice(0, 5).map((highlight, index) => (
                    <Badge key={index} className="bg-ms-secondary-yellow text-black">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              )}
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
                {regiao.name}
              </h1>
              <p className="text-white/90 flex items-center text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                {regiao.cities.join(', ')} - MS
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="bg-gray-50">
          <div className="ms-container py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna Principal */}
              <div className="lg:col-span-2 space-y-8">
                {/* Descrição/Promocional da Região */}
                {promotionalText && (
                  <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-ms-primary-blue mb-4">
                      Sobre a Região {regiao.name}
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                      {promotionalText}
                    </p>
                  </div>
                )}

                {/* Vídeo Promocional */}
                {details?.video_url && (
                  <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-ms-primary-blue mb-6 flex items-center">
                      <Play className="w-6 h-6 mr-2" />
                      Vídeo Promocional
                    </h2>
                    <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                      {details.video_type === 'youtube' ? (
                        <iframe
                          src={getYouTubeEmbedUrl(details.video_url)}
                          className="w-full h-full"
                          allowFullScreen
                          title={`Vídeo de ${regiao.name}`}
                        />
                      ) : (
                        <video
                          src={details.video_url}
                          controls
                          className="w-full h-full"
                        >
                          Seu navegador não suporta vídeos.
                        </video>
                      )}
                    </div>
                  </div>
                )}

                {/* Galeria de Fotos */}
                {details?.image_gallery && details.image_gallery.length > 0 && (
                  <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-ms-primary-blue mb-6">
                      Galeria de Fotos
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {details.image_gallery.map((image, index) => (
                        <div
                          key={index}
                          onClick={() => openLightbox(index)}
                          className="relative group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all bg-gray-100"
                        >
                          <img
                            src={image}
                            alt={`${regiao.name} - Foto ${index + 1}`}
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
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Links Oficiais */}
                {(details?.official_website || details?.social_links?.instagram || details?.social_links?.facebook || details?.social_links?.youtube) && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-ms-primary-blue mb-4">
                      Links Oficiais
                    </h3>
                    <div className="space-y-3">
                      {details.official_website && (
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
                      {details.social_links?.instagram && (
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
                      {details.social_links?.facebook && (
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
                      {details.social_links?.youtube && (
                        <a
                          href={details.social_links.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <Youtube className="w-5 h-5 text-red-600" />
                          <span className="text-gray-700">YouTube</span>
                          <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

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
                          className="flex items-center gap-3 text-gray-700 hover:text-ms-primary-blue transition-colors"
                        >
                          <Phone className="w-5 h-5 text-ms-primary-blue" />
                          {details.contact_phone}
                        </a>
                      )}
                      {details.contact_email && (
                        <a
                          href={`mailto:${details.contact_email}`}
                          className="flex items-center gap-3 text-gray-700 hover:text-ms-primary-blue transition-colors"
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
                    <p className="text-gray-600 whitespace-pre-line">
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
                    <p className="text-gray-600 whitespace-pre-line">
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
                    <div className="aspect-square rounded-xl overflow-hidden mb-4">
                      <iframe
                        src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d50000!2d${details.map_longitude}!3d${details.map_latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1spt-BR!2sbr!4v1`}
                        className="w-full h-full"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Mapa de ${regiao.name}`}
                      />
                    </div>
                    <Button
                      className="w-full bg-ms-primary-blue hover:bg-ms-primary-blue/90"
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

                {/* Botão para voltar */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <Link to="/descubrams/destinos">
                    <Button 
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Ver todas as Regiões Turísticas
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent 
            className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-transparent border-none shadow-none m-0"
            hideOverlay={true}
          >
            <DialogTitle className="sr-only">
              Galeria de Fotos - {regiao.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Visualizador de imagens da galeria. Use as setas ou teclas do teclado para navegar entre as imagens.
            </DialogDescription>
            
            <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
              <img
                src={allImages[lightboxImageIndex]}
                alt={`${regiao.name} - Foto ${lightboxImageIndex + 1}`}
                className="max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
              />

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevLightboxImage}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-50 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full transition-all shadow-lg"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextLightboxImage}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-50 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full transition-all shadow-lg"
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              {allImages.length > 0 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                  {lightboxImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </UniversalLayout>
  );
};

export default RegiaoDetalhes;
