import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { motion } from 'framer-motion';

interface RegionHeroProps {
  region: TouristRegion2025;
  highlights: string[];
}

const RegionHero: React.FC<RegionHeroProps> = ({ region, highlights }) => {
  const scrollToContent = () => {
    const contentSection = document.getElementById('region-content');
    if (contentSection) {
      contentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundColor: region.color,
        }}
      >
        {region.image && (
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            src={region.image}
            alt={region.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>
      
      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      
      {/* Color Accent Bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: region.color }}
      />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end pb-24 md:pb-32">
        <div className="ms-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link 
              to="/descubrams/destinos"
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors group"
            >
              <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Voltar para Regiões Turísticas
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            {highlights.slice(0, 5).map((highlight, index) => (
              <Badge 
                key={index} 
                className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 transition-colors"
              >
                {highlight}
              </Badge>
            ))}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Badge 
              className="mb-4 text-black font-semibold px-4 py-1"
              style={{ backgroundColor: region.color }}
            >
              Região Turística
            </Badge>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 font-playfair"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
          >
            {region.name}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex items-center text-white/90 text-lg md:text-xl"
          >
            <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{region.cities.length} cidades • Mato Grosso do Sul</span>
          </motion.div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 hover:text-white transition-colors cursor-pointer"
        aria-label="Rolar para conteúdo"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-10 h-10" />
        </motion.div>
      </motion.button>
      
      {/* Bottom Transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
    </div>
  );
};

export default RegionHero;
