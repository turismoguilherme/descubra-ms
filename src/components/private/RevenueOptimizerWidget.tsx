import React from 'react';
import { ViaJARCard } from '@/components/ui/ViaJARCard';
import { ViaJARMetricCard } from '@/components/ui/ViaJARMetricCard';
import { TrendingUp, DollarSign, Target } from 'lucide-react';

export const RevenueOptimizerWidget: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ViaJARMetricCard
        title="Receita Atual"
        value="R$ 125.4K"
        change={12.5}
        changeLabel="vs. mês anterior"
        icon={<DollarSign className="h-5 w-5" />}
        variant="gradient"
      />
      
      <ViaJARMetricCard
        title="Taxa de Conversão"
        value="3.2%"
        change={8.3}
        changeLabel="vs. mês anterior"
        icon={<Target className="h-5 w-5" />}
        variant="gradient"
      />
      
      <ViaJARMetricCard
        title="Ticket Médio"
        value="R$ 450"
        change={-2.1}
        changeLabel="vs. mês anterior"
        icon={<TrendingUp className="h-5 w-5" />}
        variant="gradient"
      />
    </div>
  );
};
