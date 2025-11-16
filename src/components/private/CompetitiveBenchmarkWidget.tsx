import React from 'react';
import { ViaJARCard } from '@/components/ui/ViaJARCard';
import { Target, Award, AlertCircle } from 'lucide-react';

export const CompetitiveBenchmarkWidget: React.FC = () => {
  return (
    <ViaJARCard>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Análise Competitiva</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
            <Award className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Vantagem Competitiva</p>
              <p className="text-xs text-muted-foreground mt-1">
                Seu preço está 15% abaixo da média do mercado
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Atenção Necessária</p>
              <p className="text-xs text-muted-foreground mt-1">
                Concorrentes estão investindo em marketing digital
              </p>
            </div>
          </div>
        </div>
      </div>
    </ViaJARCard>
  );
};
