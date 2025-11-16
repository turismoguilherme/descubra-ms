import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ViaJARCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass';
}

export const ViaJARCard: React.FC<ViaJARCardProps> = ({ 
  children, 
  className,
  variant = 'default' 
}) => {
  const variantClasses = {
    default: 'bg-card border-border',
    gradient: 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20',
    glass: 'bg-background/80 backdrop-blur-sm border-border/50'
  };

  return (
    <Card className={cn(
      'rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-6',
      variantClasses[variant],
      className
    )}>
      {children}
    </Card>
  );
};
