import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlassmorphismCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  image?: string;
  gradient?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

const GlassmorphismCard: React.FC<GlassmorphismCardProps> = ({
  title,
  description,
  icon: Icon,
  image,
  gradient = 'from-travel-tech-turquoise/20 to-travel-tech-ocean-blue/20',
  className,
  children,
  onClick,
  href
}) => {
  const CardWrapper = href ? 'a' : 'div';
  
  const cardContent = (
    <>
      {/* Background Image */}
      {image && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-travel-tech-dark-base/80 via-travel-tech-dark-base/40 to-transparent" />
        </div>
      )}

      {/* Glassmorphism Background */}
      <div className={cn(
        "absolute inset-0 rounded-2xl bg-gradient-to-br backdrop-blur-md border border-white/10",
        !image && gradient
      )} />

      {/* Neon Border Effect */}
      <div className="absolute inset-0 rounded-2xl border border-travel-tech-turquoise/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-neon-pulse" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6 text-white">
        {/* Icon */}
        {Icon && !image && (
          <div className="absolute top-6 right-6">
            <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/10">
              <Icon className="h-8 w-8 text-travel-tech-turquoise" />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold group-hover:translate-x-1 transition-transform duration-300">
            {title}
          </h3>
          {description && (
            <p className="text-white/80 text-sm leading-relaxed group-hover:text-white transition-colors duration-300">
              {description}
            </p>
          )}
        </div>

        {/* Custom Children Content */}
        {children && (
          <div className="mt-4 flex-1">
            {children}
          </div>
        )}

        {/* Hover Effect Indicator */}
        <div className="mt-auto pt-4">
          <div className="flex items-center text-sm text-travel-tech-turquoise opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
            <span>Explorar</span>
            <svg 
              className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Data Flow Animation Overlay */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-travel-tech-turquoise to-transparent animate-data-flow" />
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-travel-tech-ocean-blue to-transparent animate-data-flow-delayed" />
      </div>
    </>
  );

  return (
    <CardWrapper
      href={href}
      className={cn(
        "group relative h-[350px] rounded-2xl overflow-hidden cursor-pointer",
        "transform hover:-translate-y-2 transition-all duration-500",
        "hover:shadow-2xl hover:shadow-travel-tech-turquoise/20",
        className
      )}
      onClick={onClick}
    >
      {cardContent}

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .group {
            transform: none !important;
            transition: none !important;
          }
          .group:hover * {
            transform: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </CardWrapper>
  );
};

export default GlassmorphismCard;