import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UserStats } from '@/types/achievements';

interface StatsOverviewProps {
  stats: UserStats;
  className?: string;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, className = '' }) => {
  const statItems = [
    {
      icon: '🎯',
      label: 'Pontos Totais',
      value: stats.totalPoints,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: '📍',
      label: 'Carimbos',
      value: stats.totalStamps,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: '🗺️',
      label: 'Roteiros',
      value: stats.totalRoutes,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: '🌎',
      label: 'Regiões',
      value: `${stats.uniqueRegions}/10`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: '🏆',
      label: 'Conquistas',
      value: stats.achievements.length,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-5 gap-3 ${className}`}>
      {statItems.map((item, index) => (
        <Card key={index} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className={`w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center mx-auto mb-2`}>
              <span className="text-xl">{item.icon}</span>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold ${item.color}`}>
                {item.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {item.label}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;