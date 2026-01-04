import React, { useState } from 'react';
import { MapPin, Camera, Star, Play, Phone, Mail, Globe, Instagram, Facebook, Youtube, ExternalLink, Calendar, Car } from 'lucide-react';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface RegionCity {
  id: string;
  city_name: string;
  description?: string | null;
  image_gallery?: string[] | null;
  highlights?: string[] | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  official_website?: string | null;
  social_links?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  } | null;
  map_image_url?: string | null;
  video_url?: string | null;
  video_type?: 'youtube' | 'upload' | null;
  best_time_to_visit?: string | null;
  how_to_get_there?: string | null;
}

interface RegionCitiesExpandedProps {
  region: TouristRegion2025;
  cities: RegionCity[];
}

const RegionCitiesExpanded: React.FC<RegionCitiesExpandedProps> = ({ region, cities }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [lightboxCityName, setLightboxCityName] = useState<string>('');

  // Combinar cidades do banco com cidades da região (para cidades sem dados específicos)
  const allCityNames = region.cities || [];
  const citiesWithData = cities || [];
  const cityMap = new Map(citiesWithData.map(c => [c.city_name, c]));

  // Criar lista completa: cidades com dados + cidades apenas com nome
  const allCities = allCityNames.map(cityName => {
    const cityData = cityMap.get(cityName);
    return cityData || {
      id: cityName,
      city_name: cityName,
      description: null,
      image_gallery: null,
      highlights: null,
      contact_phone: null,
      contact_email: null,
      official_website: null,
      social_links: null,
      map_image_url: null,
      video_url: null,
      video_type: null,
      best_time_to_visit: null,
      how_to_get_there: null,
    };
  });

  const openLightbox = (cityName: string, imageIndex: number, gallery: string[]) => {
    setLightboxCityName(cityName);
    setLightboxImageIndex(imageIndex);
    setLightboxOpen(true);
  };

  const nextLightboxImage = (gallery: string[]) => {
    setLightboxImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevLightboxImage = (gallery: string[]) => {
    setLightboxImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const currentGallery = citiesWithData.find(c => c.city_name === lightboxCityName)?.image_gallery || [];

  // Função para converter URL do YouTube em embed
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    return null;
  };

  if (allCities.length === 0) return null;

  return (
    <>
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="ms-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-ms-primary-blue mb-4">
              Cidades da Região
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore as cidades que compõem esta região turística e descubra seus atrativos únicos
            </p>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <Accordion type="multiple" className="w-full">
              {allCities.map((city, index) => {
                const hasData = cityMap.has(city.city_name);
                const gallery = city.image_gallery || [];
                const highlights = city.highlights || [];
                const hasVideo = city.video_url && city.video_type;

                return (
                  <AccordionItem 
                    key={city.id || city.city_name} 
                    value={city.city_name}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-gray-50">
                      <div className="flex items-center gap-4 flex-1 text-left">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${region.color}20` }}
                        >
                          <MapPin
                            className="w-6 h-6"
                            style={{ color: region.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900">
                            {city.city_name}
                          </h3>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-6 pt-0">
                      <div className="space-y-8 pt-4">
                        {/* Descrição */}
                        {city.description && (
                          <div>
                            <h4 className="text-lg font-bold text-ms-primary-blue mb-3">
                              Sobre {city.city_name}
                            </h4>
                            <p className="text-gray-700 leading-relaxed">
                              {city.description}
                            </p>
                          </div>
                        )}

                        {/* Vídeo Promocional */}
                        {hasVideo && (
                          <div>
                            <h4 className="text-lg font-bold text-ms-primary-blue mb-4 flex items-center gap-2">
                              <Play className="w-5 h-5" />
                              Vídeo Promocional
                            </h4>
                            <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                              {city.video_type === 'youtube' && city.video_url ? (
                                <iframe
                                  src={getYouTubeEmbedUrl(city.video_url) || ''}
                                  className="w-full h-full"
                                  allowFullScreen
                                  title={`Vídeo promocional de ${city.city_name}`}
                                />
                              ) : city.video_url ? (
                                <video
                                  src={city.video_url}
                                  controls
                                  className="w-full h-full"
                                >
                                  Seu navegador não suporta vídeos.
                                </video>
                              ) : null}
                            </div>
                          </div>
                        )}

                        {/* Grid: Highlights e Informações Práticas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Highlights/Atrativos */}
                          {highlights.length > 0 && (
                            <div>
                              <h4 className="text-lg font-bold text-ms-primary-blue mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-ms-secondary-yellow" />
                                Principais Atrativos
                              </h4>
                              <div className="space-y-2">
                                {highlights.map((highlight, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-3 bg-ms-primary-blue/5 p-4 rounded-xl"
                                  >
                                    <div className="bg-ms-primary-blue text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                                      {idx + 1}
                                    </div>
                                    <span className="text-gray-700 font-medium">{highlight}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Informações Práticas: Como Chegar e Melhor Época */}
                          <div className="space-y-6">
                            {/* Como Chegar */}
                            {city.how_to_get_there && (
                              <div className="bg-gray-50 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-ms-primary-blue/10">
                                    <Car className="w-6 h-6 text-ms-primary-blue" />
                                  </div>
                                  <h4 className="font-semibold text-gray-900 text-lg">Como Chegar</h4>
                                </div>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                  {city.how_to_get_there}
                                </p>
                              </div>
                            )}

                            {/* Melhor Época */}
                            {city.best_time_to_visit && (
                              <div className="bg-gray-50 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-ms-primary-blue/10">
                                    <Calendar className="w-6 h-6 text-ms-primary-blue" />
                                  </div>
                                  <h4 className="font-semibold text-gray-900 text-lg">Melhor Época</h4>
                                </div>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                  {city.best_time_to_visit}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Galeria de Fotos */}
                        {gallery.length > 0 && (
                          <div>
                            <h4 className="text-lg font-bold text-ms-primary-blue mb-6 flex items-center gap-2">
                              <Camera className="w-5 h-5" />
                              Galeria de Fotos
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {gallery.map((image, imgIndex) => (
                                <div
                                  key={imgIndex}
                                  onClick={() => openLightbox(city.city_name, imgIndex, gallery)}
                                  className="relative group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all bg-gray-100 aspect-square"
                                >
                                  <img
                                    src={image}
                                    alt={`${city.city_name} - Foto ${imgIndex + 1}`}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
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

                        {/* Informações de Contato */}
                        {(city.contact_phone || city.contact_email || city.official_website || city.social_links) && (
                          <div className="pt-4 border-t border-gray-200">
                            <h4 className="text-lg font-bold text-ms-primary-blue mb-4">
                              Informações de Contato
                            </h4>
                            <div className="space-y-3">
                              {city.contact_phone && (
                                <a
                                  href={`tel:${city.contact_phone}`}
                                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 hover:text-ms-primary-blue"
                                >
                                  <Phone className="w-5 h-5 text-ms-primary-blue" />
                                  {city.contact_phone}
                                </a>
                              )}
                              {city.contact_email && (
                                <a
                                  href={`mailto:${city.contact_email}`}
                                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 hover:text-ms-primary-blue"
                                >
                                  <Mail className="w-5 h-5 text-ms-primary-blue" />
                                  {city.contact_email}
                                </a>
                              )}
                              {city.official_website && (
                                <a
                                  href={city.official_website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 hover:text-ms-primary-blue"
                                >
                                  <Globe className="w-5 h-5 text-ms-primary-blue" />
                                  <span>Site Oficial</span>
                                  <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                                </a>
                              )}
                              {city.social_links?.instagram && (
                                <a
                                  href={city.social_links.instagram}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 hover:text-pink-600"
                                >
                                  <Instagram className="w-5 h-5 text-pink-600" />
                                  <span>Instagram</span>
                                  <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                                </a>
                              )}
                              {city.social_links?.facebook && (
                                <a
                                  href={city.social_links.facebook}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 hover:text-blue-600"
                                >
                                  <Facebook className="w-5 h-5 text-blue-600" />
                                  <span>Facebook</span>
                                  <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                                </a>
                              )}
                              {city.social_links?.youtube && (
                                <a
                                  href={city.social_links.youtube}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 hover:text-red-600"
                                >
                                  <Youtube className="w-5 h-5 text-red-600" />
                                  <span>YouTube</span>
                                  <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Mensagem quando não há dados específicos */}
                        {!hasData && (
                          <div className="pt-4 text-center text-gray-400 text-sm italic">
                            Informações específicas desta cidade em breve
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-transparent border-none shadow-none m-0"
          hideOverlay={true}
        >
          <DialogTitle className="sr-only">
            Galeria de Fotos - {lightboxCityName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Visualizador de imagens da galeria. Use as setas ou teclas do teclado para navegar.
          </DialogDescription>

          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
            <img
              src={currentGallery[lightboxImageIndex]}
              alt={`${lightboxCityName} - Foto ${lightboxImageIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            />

            {currentGallery.length > 1 && (
              <>
                <button
                  onClick={() => prevLightboxImage(currentGallery)}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-50 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full transition-all shadow-lg"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => nextLightboxImage(currentGallery)}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-50 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full transition-all shadow-lg"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            {currentGallery.length > 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                {lightboxImageIndex + 1} / {currentGallery.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RegionCitiesExpanded;
