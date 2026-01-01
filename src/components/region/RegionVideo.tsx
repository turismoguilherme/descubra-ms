import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { TouristRegion2025 } from '@/data/touristRegions2025';
import { motion } from 'framer-motion';

interface RegionVideoProps {
  region: TouristRegion2025;
  videoUrl: string;
  videoType: 'youtube' | 'upload';
}

const RegionVideo: React.FC<RegionVideoProps> = ({ region, videoUrl, videoType }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}?autoplay=1` : url;
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return videoId ? `https://img.youtube.com/vi/${videoId[1]}/maxresdefault.jpg` : '';
  };

  return (
    <section 
      className="py-16 md:py-24"
      style={{ backgroundColor: `${region.color}10` }}
    >
      <div className="ms-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-playfair">
            Vídeo Promocional
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Assista e se inspire com as belezas da região {region.name}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-5xl mx-auto"
        >
          <div 
            className="aspect-video rounded-3xl overflow-hidden shadow-2xl"
            style={{ boxShadow: `0 25px 60px ${region.color}30` }}
          >
            {!isPlaying && videoType === 'youtube' ? (
              <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsPlaying(true)}>
                <img
                  src={getYouTubeThumbnail(videoUrl)}
                  alt={`Vídeo de ${region.name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = region.image;
                  }}
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl"
                  >
                    <Play 
                      className="w-8 h-8 md:w-10 md:h-10 ml-1"
                      style={{ color: region.color }}
                      fill={region.color}
                    />
                  </motion.div>
                </div>
              </div>
            ) : videoType === 'youtube' ? (
              <iframe
                src={getYouTubeEmbedUrl(videoUrl)}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={`Vídeo de ${region.name}`}
              />
            ) : (
              <video
                src={videoUrl}
                controls
                className="w-full h-full"
                poster={region.image}
              >
                Seu navegador não suporta vídeos.
              </video>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RegionVideo;
