import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, X, Clock, MapPin, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface RouteHeroSectionProps {
  routeName: string;
  description?: string;
  videoUrl?: string;
  imageUrl?: string;
  difficulty?: string;
  duration?: string;
  distance?: number;
  theme?: 'onca' | 'tuiuiu' | 'jacare' | 'arara' | 'capivara';
}

const themeConfig = {
  onca: {
    icon: '🐆',
    name: 'Onça-Pintada',
    gradient: 'from-amber-500 to-orange-700',
    bgGradient: 'from-amber-50 to-orange-100',
  },
  tuiuiu: {
    icon: '🦩',
    name: 'Tuiuiú',
    gradient: 'from-red-500 to-pink-700',
    bgGradient: 'from-red-50 to-pink-100',
  },
  jacare: {
    icon: '🐊',
    name: 'Jacaré',
    gradient: 'from-emerald-500 to-green-700',
    bgGradient: 'from-emerald-50 to-green-100',
  },
  arara: {
    icon: '🦜',
    name: 'Arara-Azul',
    gradient: 'from-blue-500 to-indigo-700',
    bgGradient: 'from-blue-50 to-indigo-100',
  },
  capivara: {
    icon: '🦫',
    name: 'Capivara',
    gradient: 'from-violet-500 to-purple-700',
    bgGradient: 'from-violet-50 to-purple-100',
  },
};

const RouteHeroSection: React.FC<RouteHeroSectionProps> = ({
  routeName,
  description,
  videoUrl,
  imageUrl,
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
      <Card className={`relative overflow-hidden border-2 bg-gradient-to-br ${config.bgGradient}`}>
        {/* Background Image with Overlay */}
        {imageUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        )}
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Side - Content */}
            <div className="flex-1 space-y-4">
              {/* Animal Theme Badge */}
              <div className="flex items-center gap-3">
                <div className="text-5xl">{config.icon}</div>
                <div>
                  <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0`}>
                    Tema: {config.name}
                  </Badge>
                </div>
              </div>

              {/* Route Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {routeName}
              </h1>

              {/* Description */}
              {description && (
                <p className="text-lg text-gray-700 leading-relaxed">
                  {description}
                </p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {difficulty && (
                  <Badge variant="secondary" className="text-sm">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {difficulty === 'facil' ? 'Fácil' : difficulty === 'medio' ? 'Médio' : 'Difícil'}
                  </Badge>
                )}
                {duration && (
                  <Badge variant="secondary" className="text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    {duration}
                  </Badge>
                )}
                {distance && (
                  <Badge variant="secondary" className="text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    {distance} km
                  </Badge>
                )}
              </div>
            </div>

            {/* Right Side - Video Thumbnail */}
            {videoUrl && (
              <div className="md:w-1/3">
                <div 
                  className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer group h-48 md:h-full bg-black/5"
                  onClick={() => setShowVideo(true)}
                >
                  {/* Video Thumbnail */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-2 mx-auto group-hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                      <p className="text-white text-sm font-medium">Ver Vídeo do Roteiro</p>
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
          <DialogContent className="max-w-4xl p-0">
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
    </>
  );
};

export default RouteHeroSection;
