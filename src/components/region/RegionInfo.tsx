import React from 'react';
import { Car, Calendar, Phone, Mail, Globe, ExternalLink } from 'lucide-react';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface RegionInfoProps {
  region: TouristRegion2025;
  howToGetThere?: string;
  bestTimeToVisit?: string;
  contactPhone?: string;
  contactEmail?: string;
  officialWebsite?: string;
}

const RegionInfo: React.FC<RegionInfoProps> = ({
  region,
  howToGetThere,
  bestTimeToVisit,
  contactPhone,
  contactEmail,
  officialWebsite,
}) => {
  const hasInfo = howToGetThere || bestTimeToVisit || contactPhone || contactEmail || officialWebsite;
  
  if (!hasInfo) return null;

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
            Informações Práticas
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tudo o que você precisa saber para visitar a região {region.name}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Como Chegar */}
          {howToGetThere && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-gray-50 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${region.color}20` }}
                >
                  <Car className="w-6 h-6" style={{ color: region.color }} />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Como Chegar</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{howToGetThere}</p>
            </motion.div>
          )}
          
          {/* Melhor Época */}
          {bestTimeToVisit && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-gray-50 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${region.color}20` }}
                >
                  <Calendar className="w-6 h-6" style={{ color: region.color }} />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Melhor Época</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{bestTimeToVisit}</p>
            </motion.div>
          )}
          
          {/* Contato */}
          {(contactPhone || contactEmail || officialWebsite) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-gray-50 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${region.color}20` }}
                >
                  <Phone className="w-6 h-6" style={{ color: region.color }} />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Contato</h3>
              </div>
              <div className="space-y-3">
                {contactPhone && (
                  <a 
                    href={`tel:${contactPhone}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {contactPhone}
                  </a>
                )}
                {contactEmail && (
                  <a 
                    href={`mailto:${contactEmail}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {contactEmail}
                  </a>
                )}
                {officialWebsite && (
                  <a 
                    href={officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Site Oficial
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RegionInfo;
