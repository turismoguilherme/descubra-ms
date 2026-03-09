import React from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

const GlowCard: React.FC<GlowCardProps> = ({ 
  children, 
  className = '',
  glowColor = 'rgba(20, 184, 166, 0.3)'
}) => {
  return (
    <div 
      className={cn(
        "relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl",
        "transition-all duration-500 ease-out",
        "hover:border-cyan-400/40 hover:-translate-y-1",
        "group cursor-pointer",
        className
      )}
      style={{
        '--glow-color': glowColor
      } as React.CSSProperties}
    >
      {children}
      
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none"
        style={{
          boxShadow: `0 0 30px -5px ${glowColor}`
        }}
      />
      
      {/* Inner glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none" />
    </div>
  );
};

export default GlowCard;