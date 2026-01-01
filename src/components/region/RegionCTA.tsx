import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Map } from 'lucide-react';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface RegionCTAProps {
  region: TouristRegion2025;
}

const RegionCTA: React.FC<RegionCTAProps> = ({ region }) => {
  return (
    <section 
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${region.color}15 0%, ${region.color}05 50%, ${region.color}15 100%)`
      }}
    >
      {/* Decorative Elements */}
      <div 
        className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: region.color }}
      />
      <div 
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: region.color }}
      />
      
      <div className="ms-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-playfair">
            Pronto para explorar {region.name}?
          </h2>
          <p className="text-gray-600 text-lg md:text-xl mb-10 leading-relaxed">
            Descubra todas as maravilhas que essa região incrível tem a oferecer. 
            Planeje sua viagem e viva experiências únicas em Mato Grosso do Sul.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/descubrams/destinos">
              <Button 
                size="lg" 
                className="text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                style={{ 
                  backgroundColor: region.color,
                  boxShadow: `0 10px 30px ${region.color}40`
                }}
              >
                Explorar Outras Regiões
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/mapa-ms">
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-6 text-lg rounded-full border-2 hover:bg-gray-900 hover:text-white transition-all"
              >
                <Map className="w-5 h-5 mr-2" />
                Ver Mapa Completo
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RegionCTA;
