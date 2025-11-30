import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AnimalStampCard from './AnimalStampCard';
import type { StampProgress } from '@/types/passportDigital';

interface AnimalStampGridProps {
  progress: StampProgress;
}

const culturalPhrases: Record<string, string[]> = {
  onca: [
    'Símbolo da força do Pantanal',
    'Guardiã das matas e rios',
    'Majestosa caçadora',
    'Rainha do Pantanal',
    'Poder e elegância',
  ],
  tuiuiu: [
    'Ave símbolo do Pantanal',
    'Mensageiro dos céus',
    'Guardião das águas',
    'Elegância em voo',
    'Vida e renovação',
  ],
  jacare: [
    'Senhor dos rios pantaneiros',
    'Guardião ancestral',
    'Força das águas',
    'Caiman yacare do Pantanal',
    'Paz nas águas',
  ],
  arara: [
    'Beleza dos céus azuis',
    'Voz do Pantanal',
    'Cores da natureza',
    'Ave da longevidade',
    'Símbolo de liberdade',
  ],
  capivara: [
    'Tranquilidade pantaneira',
    'Vida em comunidade',
    'Paz nas margens',
    'Amiga das águas',
    'Harmonia natural',
  ],
};

const AnimalStampGrid: React.FC<AnimalStampGridProps> = ({ progress }) => {
  const getCulturalPhrase = (theme: string, fragmentNumber: number): string => {
    const phrases = culturalPhrases[theme] || [];
    return phrases[fragmentNumber - 1] || 'Explore o Pantanal';
  };

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <CardTitle className="flex items-center justify-between">
            <span>Progresso dos Carimbos</span>
            <span className="text-2xl">
              {progress.theme === 'onca' && '🐆'}
              {progress.theme === 'tuiuiu' && '🦩'}
              {progress.theme === 'jacare' && '🐊'}
              {progress.theme === 'arara' && '🦜'}
              {progress.theme === 'capivara' && '🦫'}
            </span>
          </CardTitle>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fragmentos Coletados</span>
              <span className="font-semibold">
                {progress.collected_fragments}/{progress.total_fragments}
              </span>
            </div>
            <Progress value={progress.completion_percentage} className="h-3" />
            <p className="text-center text-sm font-medium text-muted-foreground">
              {progress.completion_percentage}% Completo
            </p>
          </div>

          {/* Completion Message */}
          {progress.completion_percentage === 100 && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h4 className="font-bold text-green-700 text-lg">
                Carimbo Completo!
              </h4>
              <p className="text-sm text-green-600 mt-1">
                Você coletou todos os fragmentos deste roteiro
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Stamps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {progress.fragments.map((fragment) => (
            <AnimalStampCard
              key={fragment.checkpoint_id}
              animal={progress.theme as any}
              fragmentNumber={fragment.fragment_number}
              checkpointName={fragment.checkpoint_name}
              collected={fragment.collected}
              collectedAt={fragment.collected_at}
              culturalPhrase={getCulturalPhrase(progress.theme, fragment.fragment_number)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnimalStampGrid;
