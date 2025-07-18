
import React from 'react';
import { Plane } from 'lucide-react';

interface FlowTripLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const FlowTripLogo = ({ size = 'md', showText = true, className = '' }: FlowTripLogoProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg`}>
        <Plane className="h-1/2 w-1/2 text-white rotate-45" />
      </div>
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          FlowTrip
        </span>
      )}
    </div>
  );
};

export default FlowTripLogo;
