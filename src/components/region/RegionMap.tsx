import React from 'react';
import { MapPin } from 'lucide-react';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { motion } from 'framer-motion';

interface RegionMapProps {
  region: TouristRegion2025;
  mapImageUrl?: string | null;
}

const RegionMap: React.FC<RegionMapProps> = ({ region, mapImageUrl }) => {
  // Se não houver imagem do mapa, não renderiza nada
  if (!mapImageUrl) {
    return null;
  }

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
            Veja onde a região {region.name} está localizada
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Map Image Container */}
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-200">
            <div className="aspect-[16/9] md:aspect-[21/9] relative">
              <img
                src={mapImageUrl}
                alt={`Mapa da região ${region.name}`}
                className="w-full h-full object-contain bg-gray-50"
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
