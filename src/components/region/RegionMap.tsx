import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface RegionMapProps {
  region: TouristRegion2025;
  latitude?: number;
  longitude?: number;
}

const RegionMap: React.FC<RegionMapProps> = ({ region, latitude, longitude }) => {
  // Default coordinates for MS regions if not provided
  const defaultCoords: Record<string, { lat: number; lng: number }> = {
    'pantanal': { lat: -19.0, lng: -57.5 },
    'bonito-serra-bodoquena': { lat: -21.1, lng: -56.5 },
    'campo-grande-ipes': { lat: -20.45, lng: -54.6 },
    'caminhos-fronteira': { lat: -22.5, lng: -55.5 },
    'caminhos-natureza-cone-sul': { lat: -23.0, lng: -54.2 },
    'celeiro-ms': { lat: -22.2, lng: -54.8 },
    'costa-leste': { lat: -20.8, lng: -51.7 },
    'rota-cerrado-pantanal': { lat: -18.5, lng: -54.8 },
    'vale-das-aguas': { lat: -22.2, lng: -53.3 },
  };

  const coords = latitude && longitude 
    ? { lat: latitude, lng: longitude }
    : defaultCoords[region.slug] || { lat: -20.5, lng: -54.5 };

  const googleMapsUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d500000!2d${coords.lng}!3d${coords.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1spt-BR!2sbr!4v1234567890`;
  
  const openInGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(region.name + ', Mato Grosso do Sul')}`, '_blank');
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="ms-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-playfair">
            Localização
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Veja onde a região {region.name} está localizada no mapa
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Map Container */}
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-200">
            <div className="aspect-[16/9] md:aspect-[21/9]">
              <iframe
                src={googleMapsUrl}
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Mapa da região ${region.name}`}
              />
            </div>
            
            {/* Info Card Overlay */}
            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:max-w-sm">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-gray-100">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: region.color }}
                  >
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg">{region.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {region.cities.slice(0, 3).join(', ')}
                      {region.cities.length > 3 && ` e mais ${region.cities.length - 3} cidades`}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={openInGoogleMaps}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir no Google Maps
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RegionMap;
