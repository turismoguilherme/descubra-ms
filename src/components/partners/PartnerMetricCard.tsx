import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PartnerMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: number; // Percentual de mudança
  chartData?: Array<{ date: string; value: number }>;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  className?: string;
}

export const PartnerMetricCard: React.FC<PartnerMetricCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  trend,
  chartData,
  variant = 'default',
  className
}) => {
  const variantStyles = {
    default: {
      card: 'bg-white border-gray-200',
      icon: 'text-ms-primary-blue',
      value: 'text-gray-900',
      gradient: 'from-blue-50 to-white'
    },
    primary: {
      card: 'bg-gradient-to-br from-ms-primary-blue/10 to-ms-primary-blue/5 border-ms-primary-blue/20',
      icon: 'text-ms-primary-blue',
      value: 'text-ms-primary-blue',
      gradient: 'from-ms-primary-blue/20 to-transparent'
    },
    success: {
      card: 'bg-gradient-to-br from-ms-pantanal-green/10 to-ms-pantanal-green/5 border-ms-pantanal-green/20',
      icon: 'text-ms-pantanal-green',
      value: 'text-ms-pantanal-green',
      gradient: 'from-ms-pantanal-green/20 to-transparent'
    },
    warning: {
      card: 'bg-gradient-to-br from-ms-cerrado-orange/10 to-ms-cerrado-orange/5 border-ms-cerrado-orange/20',
      icon: 'text-ms-cerrado-orange',
      value: 'text-ms-cerrado-orange',
      gradient: 'from-ms-cerrado-orange/20 to-transparent'
    },
    info: {
      card: 'bg-gradient-to-br from-ms-discovery-teal/10 to-ms-discovery-teal/5 border-ms-discovery-teal/20',
      icon: 'text-ms-discovery-teal',
      value: 'text-ms-discovery-teal',
      gradient: 'from-ms-discovery-teal/20 to-transparent'
    }
  };

  const styles = variantStyles[variant];
  const finalIconColor = iconColor || styles.icon;

  return (
    <Card className={cn(
      'overflow-hidden transition-all duration-200 hover:shadow-lg',
      styles.card,
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className={cn('text-3xl font-bold', styles.value)}>
                {value}
              </h3>
              {trend !== undefined && (
                <span className={cn(
                  'text-sm font-medium',
                  trend > 0 ? 'text-ms-pantanal-green' : trend < 0 ? 'text-red-500' : 'text-gray-500'
                )}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              )}
            </div>
          </div>
          <div className={cn('p-3 rounded-lg bg-gradient-to-br', styles.gradient)}>
            <Icon className={cn('w-6 h-6', finalIconColor)} />
          </div>
        </div>

        {chartData && chartData.length > 0 && (
          <div className="mt-4 h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${variant}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={finalIconColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={finalIconColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  stroke="#9ca3af"
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={finalIconColor} 
                  fill={`url(#gradient-${variant})`}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
