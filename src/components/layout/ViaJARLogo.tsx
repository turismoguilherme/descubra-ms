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
          {/* Ícone de bússola/compasso teal melhorado */}
          <defs>
            <linearGradient id="logoGradientIcon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
          </defs>
          {/* Círculo externo */}
          <circle cx="20" cy="20" r="18" stroke="url(#logoGradientIcon)" strokeWidth="2.5" fill="none" />
          {/* Rosa dos ventos */}
          <path 
            d="M20 6L24 20L20 34L16 20L20 6Z" 
            fill="url(#logoGradientIcon)" 
            opacity="0.9"
          />
          {/* Centro da bússola */}
          <circle cx="20" cy="20" r="5" fill="#14b8a6" />
          <circle cx="20" cy="20" r="2.5" fill="white" />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Icon - Bússola teal */}
      <svg 
        viewBox="0 0 40 40" 
        className={cn(sizeClasses[size], 'w-auto')}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" stroke="url(#logoGradientFull)" strokeWidth="2.5" fill="none" />
        <path 
          d="M20 6L24 20L20 34L16 20L20 6Z" 
          fill="url(#logoGradientFull)" 
          opacity="0.9"
        />
        <circle cx="20" cy="20" r="5" fill="#14b8a6" />
        <circle cx="20" cy="20" r="2.5" fill="white" />
      </svg>
      
      {/* Text - Preto */}
      <span className={cn(textSizes[size], 'font-bold tracking-tight text-black')}>
        ViajARTur
      </span>
    </div>
  );
};

export default ViaJARLogo;
