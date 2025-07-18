
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
      <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden shadow-xl`}>
        {/* Gradiente circular inspirado na logo */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-blue-600 to-teal-500 animate-pulse-slow" />
        
        {/* Círculo interno com efeito de profundidade */}
        <div className="absolute inset-1 bg-gradient-to-br from-blue-700 to-blue-800 rounded-full flex items-center justify-center">
          <Plane className="h-1/2 w-1/2 text-white rotate-45 drop-shadow-lg" />
        </div>
        
        {/* Reflexo superior */}
        <div className="absolute top-1 left-1 right-1 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold bg-gradient-to-r from-blue-700 via-orange-500 to-teal-600 bg-clip-text text-transparent ${textSizeClasses[size]} leading-none`}>
            FlowTrip
          </span>
          <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">
            Destinos Inteligentes
          </span>
        </div>
      )}
    </div>
  );
};

export default FlowTripLogo;
