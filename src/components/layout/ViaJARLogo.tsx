import React from 'react';
import { cn } from '@/lib/utils';
import GuataLogoMark from '@/components/guata/GuataLogoMark';

interface ViaJARLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  /** "light" para fundos escuros, "dark" para fundos claros. */
  tone?: 'light' | 'dark';
}

const SIZES = {
  sm: { mark: 'h-8 w-8', text: 'text-base' },
  md: { mark: 'h-10 w-10', text: 'text-lg' },
  lg: { mark: 'h-12 w-12', text: 'text-xl' },
};

const ViaJARLogo: React.FC<ViaJARLogoProps> = ({ className, size = 'md', variant = 'full', tone = 'light' }) => (
  <div className={cn('flex items-center gap-2.5', className)} aria-label="Guatá Labs">
    <GuataLogoMark className={SIZES[size].mark} />
    {variant === 'full' && (
      <span className={cn('font-semibold leading-none tracking-tight', SIZES[size].text, tone === 'light' ? 'text-guata-cream' : 'text-guata-deep')}>
        Guatá<span className="text-guata-gold"> Labs</span>
      </span>
    )}
  </div>
);

export default ViaJARLogo;
