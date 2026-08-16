import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from './card';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface DataCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  badge?: React.ReactNode;
  className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({
  icon: Icon,
  title,
  value,
  trend,
  badge,
  className
}) => {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex justify-between items-start mb-4">
        <Icon className="h-8 w-8 text-primary" />
        {badge}
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
      {trend && (
        <p className={cn(
          "text-sm mt-2",
          trend === 'up' && "text-green-600",
          trend === 'down' && "text-red-600",
          trend === 'neutral' && "text-muted-foreground"
        )}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trend === 'neutral' && '→'}
        </p>
      )}
    </Card>
  );
};
