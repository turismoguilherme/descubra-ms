import React from 'react';
import { ViaJARCard } from './ViaJARCard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViaJARMetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass';
  className?: string;
}

export const ViaJARMetricCard: React.FC<ViaJARMetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  variant = 'default',
  className
}) => {
  const getTrendIcon = () => {
    if (change === undefined || change === 0) return <Minus className="h-4 w-4" />;
    return change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-muted-foreground';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <ViaJARCard variant={variant} className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      
      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-bold text-foreground">{value}</h3>
        
        {change !== undefined && (
          <div className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor())}>
            {getTrendIcon()}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      {changeLabel && (
        <p className="text-xs text-muted-foreground">{changeLabel}</p>
      )}
    </ViaJARCard>
  );
};
