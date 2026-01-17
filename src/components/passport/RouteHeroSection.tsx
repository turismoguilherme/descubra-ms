import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, MapPin, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface RouteHeroSectionProps {
  routeName: string;
  description?: string;
  videoUrl?: string;
  imageUrl?: string;
  mapImageUrl?: string;
  difficulty?: string;
  duration?: string;
  distance?: number;
  theme?: 'onca' | 'tuiuiu' | 'jacare' | 'arara' | 'capivara';
}

// Configuração dos temas com cores do Descubra MS
const themeConfig = {
  onca: {
    icon: '🐆',
    name: 'Onça-Pintada',
    gradient: 'from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green',
    bgGradient: 'from-blue-50 via-white to-green-50',
    badgeBg: 'bg-ms-secondary-yellow/20 border-ms-secondary-yellow/30 text-ms-primary-blue',
  },
  tuiuiu: {
    icon: '🦩',
    name: 'Tuiuiú',
    gradient: 'from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green',
    bgGradient: 'from-blue-50 via-white to-green-50',
    badgeBg: 'bg-ms-secondary-yellow/20 border-ms-secondary-yellow/30 text-ms-primary-blue',
  },
  jacare: {
    icon: '🐊',
    name: 'Jacaré',
    gradient: 'from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green',
    bgGradient: 'from-blue-50 via-white to-green-50',
    badgeBg: 'bg-ms-secondary-yellow/20 border-ms-secondary-yellow/30 text-ms-primary-blue',
  },
  arara: {
    icon: '🦜',
    name: 'Arara-Azul',
    gradient: 'from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green',
    bgGradient: 'from-blue-50 via-white to-green-50',
    badgeBg: 'bg-ms-secondary-yellow/20 border-ms-secondary-yellow/30 text-ms-primary-blue',
  },
  capivara: {
    icon: '🦫',
    name: 'Capivara',
    gradient: 'from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green',
    bgGradient: 'from-blue-50 via-white to-green-50',
    badgeBg: 'bg-ms-secondary-yellow/20 border-ms-secondary-yellow/30 text-ms-primary-blue',
  },
};

const RouteHeroSection: React.FC<RouteHeroSectionProps> = ({
  routeName,
  description,
  videoUrl,
  imageUrl,
  mapImageUrl,
  difficulty,
  duration,
  distance,
  theme = 'onca',
}) => {
  const [showVideo, setShowVideo] = useState(false);
  const config = themeConfig[theme];

  const getVideoEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('/').pop()
        : new URLSearchParams(new URL(url).search).get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  return (
    <>
      <Card className="relative rounded-2xl overflow-hidden shadow-xl border-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Background Image with Overlay */}
        {imageUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-ms-primary-blue/90 via-ms-discovery-teal/80 to-ms-pantanal-green/70"></div>
          </div>
        )}
        
        {/* Gradient Background when no image */}
        {!imageUrl && (
          <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient}`}></div>
        )}
        
        <div className="relative z-10 p-6 md:p-10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Side - Content */}
            <div className="flex-1 space-y-5">
              {/* Animal Theme Badge */}
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full shadow-lg">
                  <span className="text-5xl">{config.icon}</span>
                </div>
                <Badge className={`${config.badgeBg} border rounded-full px-4 py-2 font-bold`}>
                  Tema: {config.name}
                </Badge>
              </div>

              {/* Route Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
                {routeName}
              </h1>

              {/* Description */}
              {description && (
                <p className="text-lg text-white/90 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                  {description}
                </p>
              )}

              {/* Info Badges */}
              <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                {difficulty && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {difficulty === 'facil' ? 'Fácil' : difficulty === 'medio' ? 'Médio' : 'Difícil'}
                  </span>
                )}
                {duration && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    {duration}
                  </span>
                )}
                {distance && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    {distance} km
                  </span>
                )}
              </div>
            </div>

            {/* Right Side - Video Thumbnail */}
            {videoUrl && (
              <div className="md:w-1/3 animate-in fade-in slide-in-from-right-4 duration-700">
                <div 
                  className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer group h-48 md:h-full bg-black/20 backdrop-blur-sm"
                  onClick={() => setShowVideo(true)}
                >
                  {/* Video Thumbnail Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/30 to-black/50">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center mb-3 mx-auto group-hover:scale-110 group-hover:bg-white/40 transition-all duration-300 shadow-lg">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                      <p className="text-white text-sm font-semibold">Ver Vídeo do Roteiro</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Video Dialog */}
      {videoUrl && (
        <Dialog open={showVideo} onOpenChange={setShowVideo}>
          <DialogContent className="max-w-4xl p-0 rounded-2xl overflow-hidden">
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={getVideoEmbedUrl(videoUrl)}
                title={routeName}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Map Image Section */}
      {mapImageUrl && (
        <Card className="mt-6 rounded-2xl overflow-hidden shadow-lg border-0">
          <div className="p-4 bg-gradient-to-r from-ms-primary-blue/10 via-ms-discovery-teal/10 to-ms-pantanal-green/10">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-ms-primary-blue" />
              Mapa do Roteiro
            </h3>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img
                src={mapImageUrl}
                alt={`Mapa do roteiro ${routeName}`}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default RouteHeroSection;
