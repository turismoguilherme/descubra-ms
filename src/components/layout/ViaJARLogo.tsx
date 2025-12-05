import React from 'react';
import { cn } from '@/lib/utils';

interface ViaJARLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

const ViaJARLogo: React.FC<ViaJARLogoProps> = ({ 
  className, 
  size = 'md',
  variant = 'full' 
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14'
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center', className)}>
        <svg 
          viewBox="0 0 40 40" 
          className={cn(sizeClasses[size], 'w-auto')}
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(222, 47%, 11%)" />
              <stop offset="100%" stopColor="hsl(187, 85%, 43%)" />
            </linearGradient>
          </defs>
          {/* Modern geometric icon - stylized compass/travel */}
          <circle cx="20" cy="20" r="18" stroke="url(#logoGradient)" strokeWidth="2" fill="none" />
          <path 
            d="M20 8L26 20L20 32L14 20L20 8Z" 
            fill="url(#logoGradient)" 
            opacity="0.9"
          />
          <circle cx="20" cy="20" r="4" fill="hsl(187, 85%, 43%)" />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Icon */}
      <svg 
        viewBox="0 0 40 40" 
        className={cn(sizeClasses[size], 'w-auto')}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(222, 47%, 11%)" />
            <stop offset="100%" stopColor="hsl(187, 85%, 43%)" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" stroke="url(#logoGradientFull)" strokeWidth="2" fill="none" />
        <path 
          d="M20 8L26 20L20 32L14 20L20 8Z" 
          fill="url(#logoGradientFull)" 
          opacity="0.9"
        />
        <circle cx="20" cy="20" r="4" fill="hsl(187, 85%, 43%)" />
      </svg>
      
      {/* Text */}
      <span className={cn(textSizes[size], 'font-bold tracking-tight')}>
        <span className="text-viajar-slate">Viaj</span>
        <span className="text-viajar-cyan">AR</span>
        <span className="text-viajar-slate">Tur</span>
      </span>
    </div>
  );
};

export default ViaJARLogo;
