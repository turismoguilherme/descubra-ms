import React, { useEffect, useRef } from 'react';
import { RouteCheckpoint } from '@/types/passport';
import { MapPin } from 'lucide-react';

interface RouteMapProps {
  checkpoints: RouteCheckpoint[];
  className?: string;
}

const RouteMap: React.FC<RouteMapProps> = ({ checkpoints, className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  // Mock map implementation (replace with actual map library)
  const renderMockMap = () => {
    return (
      <div className="relative bg-gradient-to-br from-blue-900 to-green-800 rounded-lg overflow-hidden h-64">
        {/* Mock map background */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-blue-600"></div>
        </div>
        
        {/* Mock roads */}
        <svg className="absolute inset-0 w-full h-full">
          <path
            d="M 50 200 Q 150 100 250 150"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
          />
        </svg>

        {/* Checkpoints */}
        {checkpoints.map((checkpoint, index) => (
          <div
            key={checkpoint.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${20 + (index * 25)}%`,
              top: `${30 + (index % 2) * 40}%`
            }}
          >
            <div className="relative">
              <div className="w-8 h-8 bg-ms-accent-orange rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-lg">
                {index + 1}
              </div>
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {checkpoint.name}
              </div>
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded px-3 py-2">
          <div className="flex items-center gap-2 text-white text-xs">
            <MapPin className="w-4 h-4 text-ms-accent-orange" />
            <span>Pontos de interesse</span>
          </div>
        </div>

        {/* Map controls placeholder */}
        <div className="absolute top-4 right-4 space-y-2">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded flex items-center justify-center text-white text-lg">
            +
          </div>
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded flex items-center justify-center text-white text-lg">
            -
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <div ref={mapRef}>
        {renderMockMap()}
      </div>
      <div className="mt-4 text-center">
        <p className="text-white/80 text-sm">
          Mapa interativo - {checkpoints.length} pontos de interesse
        </p>
      </div>
    </div>
  );
};

export default RouteMap;