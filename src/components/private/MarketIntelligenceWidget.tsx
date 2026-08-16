import React from 'react';
import { ViaJARCard } from '@/components/ui/ViaJARCard';
import { Brain, TrendingUp, Users } from 'lucide-react';

export const MarketIntelligenceWidget: React.FC = () => {
  return (
    <ViaJARCard>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Insights de Mercado</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-foreground">Tendência Positiva</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Aumento de 23% em buscas por ecoturismo na região
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-medium text-foreground">Público-Alvo</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Famílias com crianças (35-45 anos) representam 42% do público
            </p>
          </div>
        </div>
      </div>
    </ViaJARCard>
  );
};
