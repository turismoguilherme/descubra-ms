import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { StampProgress as StampProgressType } from '@/types/passportDigital';
import { CheckCircle2, Circle } from 'lucide-react';

interface StampProgressProps {
  progress: StampProgressType;
}

const themeIcons: Record<string, string> = {
  onca: '🐆',
  tuiuiu: '🦅',
  jacare: '🐊',
  arara: '🦜',
};

const themeNames: Record<string, string> = {
  onca: 'Onça-Pintada',
  tuiuiu: 'Tuiuiú',
  jacare: 'Jacaré',
  arara: 'Arara-Azul',
};

const StampProgress: React.FC<StampProgressProps> = ({ progress }) => {
  const icon = themeIcons[progress.theme] || '🎨';
  const name = themeNames[progress.theme] || progress.theme;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          Carimbo: {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso do Carimbo</span>
            <span className="font-semibold">
              {progress.collected_fragments}/{progress.total_fragments} fragmentos
            </span>
          </div>
          <Progress value={progress.completion_percentage} className="h-3" />
          <div className="text-center text-sm font-medium">
            {progress.completion_percentage}% completo
          </div>
        </div>

        {/* Lista de Fragmentos */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Fragmentos Coletados:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {progress.fragments.map((fragment) => (
              <div
                key={fragment.checkpoint_id}
                className={`flex items-center gap-2 p-2 rounded-md border ${
                  fragment.collected
                    ? 'bg-green-50 border-green-200'
                    : 'bg-muted/30 border-muted'
                }`}
              >
                {fragment.collected ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    Fragmento {fragment.fragment_number}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fragment.checkpoint_name}
                  </div>
                </div>
                {fragment.collected && fragment.collected_at && (
                  <Badge variant="outline" className="text-xs">
                    {new Date(fragment.collected_at).toLocaleDateString('pt-BR')}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Preview do Carimbo */}
        {progress.completion_percentage === 100 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200 text-center">
            <div className="text-4xl mb-2">{icon}</div>
            <div className="font-semibold text-lg text-green-700">
              🎉 Carimbo Completo!
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Você coletou todos os fragmentos do carimbo {name}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StampProgress;

