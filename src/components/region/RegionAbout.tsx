import React from 'react';
import { MapPin, Mountain, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { motion } from 'framer-motion';

interface RegionAboutProps {
  region: TouristRegion2025;
  promotionalText: string;
  tourismTags?: string[];
}

const RegionAbout: React.FC<RegionAboutProps> = ({ region, promotionalText, tourismTags }) => {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="ms-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Description */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-playfair">
              Sobre a Região
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                {promotionalText}
              </p>
            </div>
            
            {/* Tourism Tags */}
            {tourismTags && tourismTags.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tipos de Turismo
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tourismTags.map((tag, index) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className="px-4 py-2 text-sm border-gray-300 hover:border-gray-400 transition-colors"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Statistics Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <div 
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              style={{ borderLeftColor: region.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${region.color}20` }}
                >
                  <MapPin className="w-6 h-6" style={{ color: region.color }} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{region.cities.length}</p>
                  <p className="text-gray-600">Cidades</p>
                </div>
              </div>
            </div>
            
            <div 
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              style={{ borderLeftColor: region.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${region.color}20` }}
                >
                  <Mountain className="w-6 h-6" style={{ color: region.color }} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{region.highlights.length}</p>
                  <p className="text-gray-600">Atrativos Principais</p>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-3">Explore a Região</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: region.color }} />
                  Paisagens naturais
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: region.color }} />
                  Cultura local
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: region.color }} />
                  Gastronomia regional
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: region.color }} />
                  Aventura e ecoturismo
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RegionAbout;
