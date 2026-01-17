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

const themeIcons: Record<string, string> = {
  onca: '🐆',
  tuiuiu: '🦩',
  jacare: '🐊',
  arara: '🦜',
  capivara: '🦫',
};

const AnimalStampGrid: React.FC<AnimalStampGridProps> = ({ progress }) => {
  const getCulturalPhrase = (theme: string, fragmentNumber: number): string => {
    const phrases = culturalPhrases[theme] || [];
    return phrases[fragmentNumber - 1] || 'Explore o Pantanal';
  };

  const themeIcon = themeIcons[progress.theme] || '🐆';

  return (
    <Card className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="bg-gradient-to-r from-ms-primary-blue/5 to-ms-discovery-teal/5 p-6 border-b border-gray-100">
        <div className="space-y-4">
          <CardTitle className="flex items-center justify-between text-ms-primary-blue">
            <span className="text-lg font-semibold">Progresso dos Carimbos</span>
            <div className="bg-ms-primary-blue/10 p-3 rounded-full">
              <span className="text-3xl">{themeIcon}</span>
            </div>
          </CardTitle>
          
          {/* Progress Bar - Redesign */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">Fragmentos Coletados</span>
              <span className="font-bold text-ms-primary-blue text-lg">
                {progress.collected_fragments}/{progress.total_fragments}
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={progress.completion_percentage} 
                className="h-4 bg-gray-200 rounded-full overflow-hidden"
              />
              <div 
                className="absolute inset-0 h-4 rounded-full bg-gradient-to-r from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green transition-all duration-500"
                style={{ width: `${progress.completion_percentage}%` }}
              ></div>
            </div>
            <p className="text-center text-sm font-semibold text-gray-600">
              <span className="text-ms-primary-blue">{progress.completion_percentage}%</span> Completo
            </p>
          </div>

          {/* Completion Message - Redesign */}
          {progress.completion_percentage === 100 && (
            <div className="p-6 bg-gradient-to-r from-ms-pantanal-green/10 to-green-50 rounded-xl border-2 border-ms-pantanal-green/30 text-center animate-in fade-in scale-in duration-500">
              <div className="text-5xl mb-3">🎉</div>
              <h4 className="font-bold text-ms-pantanal-green text-xl">
                Carimbo Completo!
              </h4>
              <p className="text-sm text-gray-600 mt-2">
                Você coletou todos os fragmentos deste roteiro!
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
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
