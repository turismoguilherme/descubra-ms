import React from 'react';
import { 
  Waves, 
  Mountain, 
  Camera, 
  Fish, 
  Binoculars, 
  TreePine,
  Compass,
  Utensils,
  Building,
  Music,
  ShoppingBag,
  Landmark
} from 'lucide-react';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { motion } from 'framer-motion';

interface RegionAttractionsProps {
  region: TouristRegion2025;
  highlights: string[];
}

const attractionIcons: Record<string, React.ElementType> = {
  'flutuação': Waves,
  'mergulho': Waves,
  'cachoeira': Mountain,
  'safari': Camera,
  'pesca': Fish,
  'observação': Binoculars,
  'fauna': Binoculars,
  'aves': Binoculars,
  'ecoturismo': TreePine,
  'aventura': Compass,
  'gastronomia': Utensils,
  'museu': Building,
  'cultura': Music,
  'compras': ShoppingBag,
  'histórico': Landmark,
  'default': Compass
};

const getIconForAttraction = (attraction: string): React.ElementType => {
  const lowerAttraction = attraction.toLowerCase();
  for (const [key, Icon] of Object.entries(attractionIcons)) {
    if (lowerAttraction.includes(key)) {
      return Icon;
    }
  }
  return attractionIcons.default;
};

const RegionAttractions: React.FC<RegionAttractionsProps> = ({ region, highlights }) => {
  if (!highlights || highlights.length === 0) return null;

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
            Principais Atrativos
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubra as experiências incríveis que a região {region.name} oferece
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((highlight, index) => {
            const Icon = getIconForAttraction(highlight);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div 
                  className="w-14 h-14 rounded-xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ 
                    backgroundColor: `${region.color}15`,
                    boxShadow: `0 4px 14px ${region.color}20`
                  }}
                >
                  <Icon 
                    className="w-7 h-7"
                    style={{ color: region.color }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {highlight}
                </h3>
                <p className="text-gray-500 text-sm">
                  Uma das experiências mais procuradas da região
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RegionAttractions;
