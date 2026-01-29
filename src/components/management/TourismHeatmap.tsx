import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';

interface TourismHeatmapProps {
  data?: unknown[];
  showSource?: boolean;
  showConfidence?: boolean;
}

export const TourismHeatmap: React.FC<TourismHeatmapProps> = ({ 
  data = [], 
  showSource = true,
  showConfidence = true 
}) => {
  const hasRealData = data && data.length > 0;

  return (
    <SectionWrapper 
      title="Mapa de Calor" 
      subtitle="Visualização de movimentação turística"
    >
      {hasRealData ? (
        <>
          {showSource && (
            <div className="mb-4 flex gap-2">
              <Badge variant="outline" className="bg-green-50">Dados Reais</Badge>
              <span className="text-sm text-muted-foreground">
                Fonte: CATs, GPS, Eventos • Atualizado recentemente
              </span>
            </div>
          )}
          
          <div className="bg-slate-100 rounded-lg h-96 flex items-center justify-center">
            <p className="text-muted-foreground">Mapa de calor em desenvolvimento</p>
          </div>
          
          {showConfidence && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                🟢 Alta confiança: Dados de check-ins em CATs<br/>
                🟡 Média confiança: Dados estimados com base em eventos<br/>
                🔴 Baixa confiança: Dados históricos ou inferidos
              </AlertDescription>
            </Alert>
          )}
        </>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Dados insuficientes para mapa de calor. Aguardando check-ins em CATs e dados de GPS.
          </AlertDescription>
        </Alert>
      )}
    </SectionWrapper>
  );
};

export default TourismHeatmap;
