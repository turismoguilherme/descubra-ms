
import React from 'react';
import { Plane } from 'lucide-react';

interface FlowTripLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const FlowTripLogoProfessional = ({ size = 'md', showText = true, className = '' }: FlowTripLogoProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative rounded-full bg-flowtrip-navy-primary flex items-center justify-center shadow-sm`}>
        <Plane className="h-1/2 w-1/2 text-white rotate-45" />
      </div>
      
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={`font-bold text-flowtrip-navy-primary ${textSizeClasses[size]} leading-none tracking-tight`}>
            FlowTrip
          </span>
          <span className="text-xs text-flowtrip-text-secondary font-medium tracking-wide uppercase leading-relaxed">
            DESTINOS INTELIGENTES
          </span>
        </div>
      )}
    </div>
  );
};

export default FlowTripLogoProfessional;
