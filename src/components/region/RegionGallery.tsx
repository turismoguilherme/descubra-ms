import React, { useState } from 'react';
import { ZoomIn, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

interface RegionGalleryProps {
  region: TouristRegion2025;
  images: string[];
}

const RegionGallery: React.FC<RegionGalleryProps> = ({ region, images }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

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
          <h2 className="text-3xl md:text-4xl font-bold text-ms-primary-blue mb-4">
            Galeria de Fotos
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Imagens que capturam a essência da região {region.name}
          </p>
        </motion.div>
        
        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => openLightbox(index)}
              className={`
                relative group cursor-pointer overflow-hidden rounded-2xl
                ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}
              `}
            >
              <div className={`aspect-square ${index === 0 ? 'md:aspect-[4/3]' : ''}`}>
                <img
                  src={image}
                  alt={`${region.name} - Foto ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <ZoomIn className="w-5 h-5 text-gray-800" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Lightbox */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-[95vw] md:max-w-[90vw] h-[90vh] bg-black/95 border-none p-0">
            <DialogTitle className="sr-only">
              Galeria de fotos - {region.name}
            </DialogTitle>
            
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            
            {/* Image */}
            <div className="w-full h-full flex items-center justify-center p-8">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  src={images[currentIndex]}
                  alt={`${region.name} - Foto ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </AnimatePresence>
            </div>
            
            {/* Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-white w-6' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default RegionGallery;
