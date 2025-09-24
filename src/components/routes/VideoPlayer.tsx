import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  url: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Extract video ID from different URL formats
  const getVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(url);

  if (!videoId) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center text-white">
        <p>Formato de vídeo não suportado</p>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0`;

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
        <iframe
          className="absolute inset-0 w-full h-full"
          src={embedUrl}
          title="Video promocional do roteiro"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      
      {/* Custom overlay for branding (optional) */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-black/60 backdrop-blur-sm rounded px-2 py-1">
          <span className="text-white text-xs">Mato Grosso do Sul</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;