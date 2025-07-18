
import React from 'react';
import { Plane } from 'lucide-react';

interface FlowTripLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const FlowTripLogo = ({ size = 'md', showText = true, className = '' }: FlowTripLogoProps) => {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-20 w-20'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden flowtrip-shadow-elegant`}>
        {/* Gradiente circular azul-púrpura conforme especificado */}
        <div className="absolute inset-0 bg-gradient-to-br from-flowtrip-accent-orange via-flowtrip-primary-blue to-flowtrip-secondary-teal animate-pulse-slow" />
        
        {/* Círculo interno com efeito de profundidade */}
        <div className="absolute inset-1 bg-gradient-to-br from-flowtrip-primary-blue to-blue-800 rounded-full flex items-center justify-center">
          <Plane className="h-1/2 w-1/2 text-white rotate-45 drop-shadow-lg" />
        </div>
        
        {/* Reflexo superior */}
        <div className="absolute top-1 left-1 right-1 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
      </div>
      
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={`font-bold flowtrip-text-gradient ${textSizeClasses[size]} leading-none tracking-tight`}>
            FlowTrip
          </span>
          <span className="text-xs text-flowtrip-text-tertiary font-medium tracking-widest uppercase leading-relaxed">
            DESTINOS INTELIGENTES
          </span>
        </div>
      )}
    </div>
  );
};

export default FlowTripLogo;
