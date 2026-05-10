import React from 'react';
import { cn } from '@/lib/utils';
import { useGuataLabsContent } from '@/hooks/useGuataLabsContent';

interface ViaJARLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

const ViaJARLogo: React.FC<ViaJARLogoProps> = ({
  className,
  size = 'md',
  variant = 'full',
}) => {
  const { navbarLogoSrc } = useGuataLabsContent();
  const src = navbarLogoSrc();

  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  const imgClass = cn(
    sizeClasses[size],
    'w-auto object-contain rounded-md bg-white p-1 ring-1 ring-guata-gold/30 shadow-sm'
  );

  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center', className)}>
        <img src={src} alt="Guatá Labs" className={imgClass} />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img src={src} alt="Guatá Labs" className={imgClass} />
    </div>
  );
};

export default ViaJARLogo;
