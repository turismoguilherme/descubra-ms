import React from 'react';
import { MapPin } from 'lucide-react';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { motion } from 'framer-motion';

interface RegionCitiesProps {
  region: TouristRegion2025;
}

const RegionCities: React.FC<RegionCitiesProps> = ({ region }) => {
  if (!region.cities || region.cities.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="ms-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-playfair">
            Cidades da Região
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Conheça os municípios que fazem parte da região {region.name}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {region.cities.map((city, index) => (
            <motion.div
              key={city}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group bg-gray-50 hover:bg-white rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-transparent hover:border-gray-200 cursor-pointer"
            >
              <div 
                className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${region.color}20` }}
              >
                <MapPin 
                  className="w-5 h-5 transition-colors"
                  style={{ color: region.color }}
                />
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                {city}
              </h3>
              <p className="text-xs text-gray-500 mt-1">MS</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RegionCities;
