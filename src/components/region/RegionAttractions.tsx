import React from 'react';
import { Star } from 'lucide-react';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { motion } from 'framer-motion';

interface RegionAttractionsProps {
  region: TouristRegion2025;
  highlights: string[];
}

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
          <h2 className="text-3xl md:text-4xl font-bold text-ms-primary-blue mb-4">
            Principais Atrativos
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubra as experiências incríveis que a região {region.name} oferece
          </p>
        </motion.div>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-ms-secondary-yellow" />
            <h3 className="text-2xl font-bold text-ms-primary-blue">
              Destaques da Região
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-3 bg-ms-primary-blue/5 p-4 rounded-xl">
                <div className="bg-ms-primary-blue text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  {index + 1}
                </div>
                <span className="text-gray-700 font-medium">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegionAttractions;
