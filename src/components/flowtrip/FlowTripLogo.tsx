
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
    <div className={`flex items-center gap-4 ${className}`}>
      <div className={`${sizeClasses[size]} relative rounded-xl overflow-hidden flowtrip-shadow-elegant`}>
        {/* Gradiente corporativo navy-orange */}
        <div className="absolute inset-0 bg-gradient-to-br from-flowtrip-orange-vibrant via-flowtrip-navy-light to-flowtrip-teal-elegant" />
        
        {/* Círculo interno com efeito corporativo */}
        <div className="absolute inset-1 bg-gradient-to-br from-flowtrip-navy-primary to-flowtrip-navy-light rounded-lg flex items-center justify-center">
          <Plane className="h-1/2 w-1/2 text-white rotate-45 drop-shadow-xl" />
        </div>
        
        {/* Reflexo corporativo */}
        <div className="absolute top-1 left-1 right-1 h-1/3 bg-gradient-to-b from-white/25 to-transparent rounded-lg" />
      </div>
      
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={`font-bold flowtrip-text-gradient ${textSizeClasses[size]} leading-none tracking-tight`}>
            FlowTrip
          </span>
          <span className="text-xs text-flowtrip-text-tertiary font-semibold tracking-wider uppercase leading-relaxed">
            DESTINOS INTELIGENTES
          </span>
        </div>
      )}
    </div>
  );
};

export default FlowTripLogo;
